import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const paramsSchema = z.object({
  q: z.string().min(2).max(120),
  lang: z.enum(["az", "tr", "en", "ru", "ka", "tk", "kk", "uz", "ky"]).default("en"),
});

interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: string;
  url?: string;
}

async function fetchSummary(lang: string, title: string): Promise<WikiSummary | null> {
  const res = await fetch(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`,
    {
      headers: { "User-Agent": "Aviawings/1.0 (travel guide enrichment)" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type === "disambiguation") return null;
  return {
    title: data.title,
    extract: data.extract ?? "",
    thumbnail: data.thumbnail?.source,
    url: data.content_urls?.desktop?.page,
  };
}

/** English article title → its counterpart in the target language via Wikipedia langlinks */
async function langlinkTitle(enTitle: string, target: string): Promise<string | null> {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(enTitle)}&prop=langlinks&lllang=${target}&format=json&redirects=1`,
    {
      headers: { "User-Agent": "Aviawings/1.0 (travel guide enrichment)" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages ?? {};
  for (const key of Object.keys(pages)) {
    const ll = pages[key]?.langlinks?.[0]?.["*"];
    if (ll) return ll;
  }
  return null;
}

async function searchTitle(lang: string, q: string): Promise<string | null> {
  const res = await fetch(
    `https://${lang}.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(q)}&limit=1`,
    {
      headers: { "User-Agent": "Aviawings/1.0 (travel guide enrichment)" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.pages?.[0]?.title ?? null;
}

/**
 * Wikipedia enrichment proxy: given an (English) topic query, returns a
 * localized summary + image when available, falling back to English.
 */
export async function GET(req: Request) {
  const { allowed } = rateLimit(`wiki:${clientIp(req)}`, {
    limit: 120,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = paramsSchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    lang: url.searchParams.get("lang") ?? "en",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }
  const { q, lang } = parsed.data;

  try {
    // 1. Direct English summary (queries are canonical English titles)
    let summary = await fetchSummary("en", q);
    // 2. Search fallback when the exact title misses
    if (!summary) {
      const found = await searchTitle("en", q);
      if (found) summary = await fetchSummary("en", found);
    }
    if (!summary) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // 3. Prefer a localized extract when the user browses in another
    //    language — follow the langlink (e.g. "Hagia Sophia" → "Ayasofya")
    if (lang !== "en") {
      const localTitle = await langlinkTitle(summary.title, lang);
      if (localTitle) {
        const localized = await fetchSummary(lang, localTitle);
        if (localized?.extract) {
          summary = {
            ...localized,
            thumbnail: localized.thumbnail ?? summary.thumbnail,
            url: localized.url ?? summary.url,
          };
        }
      }
    }

    return NextResponse.json(summary, {
      headers: { "Cache-Control": "public, max-age=604800" },
    });
  } catch (err) {
    console.error("[api/wiki]", err);
    return NextResponse.json({ error: "wiki_failed" }, { status: 502 });
  }
}
