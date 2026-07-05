import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/flights/provider";
import { searchParamsSchema } from "@/lib/flights/types";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const { allowed } = rateLimit(`flights:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = searchParamsSchema.safeParse({
    origin: url.searchParams.get("from") ?? "",
    destination: url.searchParams.get("to") ?? "",
    departDate: url.searchParams.get("depart") ?? "",
    returnDate: url.searchParams.get("return") ?? undefined,
    adults: url.searchParams.get("adults") ?? undefined,
    children: url.searchParams.get("children") ?? undefined,
    infants: url.searchParams.get("infants") ?? undefined,
    cabin: url.searchParams.get("cabin") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_params", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await searchFlights(parsed.data);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, max-age=120" },
    });
  } catch (err) {
    console.error("[api/flights/search]", err);
    return NextResponse.json({ error: "search_failed" }, { status: 500 });
  }
}
