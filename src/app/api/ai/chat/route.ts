import { NextResponse } from "next/server";
import { z } from "zod";
import {
  chatSystemPrompt,
  plannerSystemPrompt,
  plannerUserPrompt,
} from "@/lib/ai/prompts";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const planBody = z.object({
  mode: z.literal("plan"),
  locale: z.enum(["tr", "en"]),
  answers: z.object({
    destination: z.string().min(2).max(80),
    when: z.string().max(30).default("flexible"),
    style: z.string().max(60),
    pace: z.string().max(60),
    company: z.string().max(60),
    budget: z.string().max(60),
    days: z.number().int().min(2).max(10),
  }),
});

const chatBody = z.object({
  mode: z.literal("chat"),
  locale: z.enum(["tr", "en"]),
  planContext: z.string().max(4000).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

const bodySchema = z.discriminatedUnion("mode", [planBody, chatBody]);

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { allowed } = rateLimit(`ai:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const body = parsed.data;

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    "X-Title": "Aviawings",
  };

  /* ——— Itinerary generation: single JSON response ——— */
  if (body.mode === "plan") {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: plannerSystemPrompt(body.locale) },
            { role: "user", content: plannerUserPrompt(body.answers, body.locale) },
          ],
          temperature: 0.8,
          max_tokens: 8000,
        }),
      });
      if (!res.ok) {
        console.error("[api/ai] OpenRouter plan error", res.status, await res.text());
        return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
      }
      const data = await res.json();
      const content: string = data.choices?.[0]?.message?.content ?? "";
      const plan = extractJson(content);
      return NextResponse.json({ plan });
    } catch (err) {
      console.error("[api/ai] plan parse failed", err);
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }
  }

  /* ——— Chat: stream plain text chunks ——— */
  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        { role: "system", content: chatSystemPrompt(body.locale, body.planContext) },
        ...body.messages,
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    console.error("[api/ai] OpenRouter chat error", upstream.status);
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string = json.choices?.[0]?.delta?.content ?? "";
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore malformed keep-alive lines
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
