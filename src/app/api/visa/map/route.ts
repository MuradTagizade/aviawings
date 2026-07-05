import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupPassportMap } from "@/lib/visa";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const paramsSchema = z.object({
  passport: z.string().length(2).toUpperCase(),
});

export async function GET(req: Request) {
  const { allowed } = rateLimit(`visa-map:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = paramsSchema.safeParse({
    passport: url.searchParams.get("passport") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  const destinations = lookupPassportMap(parsed.data.passport);
  if (!destinations) {
    return NextResponse.json({ error: "unknown_country" }, { status: 404 });
  }
  return NextResponse.json(
    { destinations },
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );
}
