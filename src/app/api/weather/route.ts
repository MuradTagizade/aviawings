import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const paramsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** Proxies Open-Meteo (free, no key) so the browser only talks to our origin. */
export async function GET(req: Request) {
  const { allowed } = rateLimit(`weather:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = paramsSchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
    start: url.searchParams.get("start"),
    end: url.searchParams.get("end"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }
  const { lat, lon, start, end } = parsed.data;

  const qs = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
    timezone: "auto",
    start_date: start,
    end_date: end,
  });

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const data = await res.json();
    return NextResponse.json(
      {
        days: (data.daily?.time ?? []).map((date: string, i: number) => ({
          date,
          high: data.daily.temperature_2m_max?.[i] ?? null,
          low: data.daily.temperature_2m_min?.[i] ?? null,
          rain: data.daily.precipitation_probability_max?.[i] ?? null,
          code: data.daily.weather_code?.[i] ?? null,
        })),
      },
      { headers: { "Cache-Control": "public, max-age=1800" } }
    );
  } catch (err) {
    console.error("[api/weather]", err);
    return NextResponse.json({ error: "weather_failed" }, { status: 502 });
  }
}
