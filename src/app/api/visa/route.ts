import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupVisa } from "@/lib/visa";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const paramsSchema = z.object({
  passport: z.string().length(2).toUpperCase(),
  destination: z.string().length(2).toUpperCase(),
});

export async function GET(req: Request) {
  const { allowed } = rateLimit(`visa:${clientIp(req)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = paramsSchema.safeParse({
    passport: url.searchParams.get("passport") ?? "",
    destination: url.searchParams.get("destination") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  const result = lookupVisa(parsed.data.passport, parsed.data.destination);
  if (!result) {
    return NextResponse.json({ error: "unknown_country" }, { status: 404 });
  }
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
