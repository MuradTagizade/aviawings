import type { FlightSearchParams } from "@/lib/flights/types";

/**
 * Affiliate (metasearch) mode: we don't sell tickets — "Select" sends the
 * traveller to a partner site with our affiliate marker; they pay there and
 * we earn a commission. The internal booking flow is kept behind this flag
 * for a possible future switch back to direct ticketing (Duffel V2).
 */
export const SALES_MODE =
  process.env.NEXT_PUBLIC_SALES_MODE === "internal" ? "internal" : "affiliate";

/** Travelpayouts marker (aviasales.com etc.). Empty → links still work, unattributed. */
const TP_MARKER = process.env.NEXT_PUBLIC_TP_MARKER ?? "";

function ddmm(iso: string): string {
  // "2026-07-15" → "1507"
  return `${iso.slice(8, 10)}${iso.slice(5, 7)}`;
}

/**
 * Aviasales search deep link (Travelpayouts network), e.g.
 * https://www.aviasales.com/search/GYD1507IST22071?marker=12345
 * Path: origin + DDMM + destination [+ return DDMM] + passengers
 * (adults, then children/infants digits when present), "b" for business.
 * Verify against the Travelpayouts link builder before going live.
 */
export function aviasalesLink(search: FlightSearchParams): string {
  const pax =
    `${search.adults}` +
    (search.children || search.infants ? `${search.children}` : "") +
    (search.infants ? `${search.infants}` : "");
  const cls = search.cabin === "business" ? "b" : "";
  const path =
    search.origin +
    ddmm(search.departDate) +
    search.destination +
    (search.returnDate ? ddmm(search.returnDate) : "") +
    cls +
    pax;
  const url = new URL(`https://www.aviasales.com/search/${path}`);
  if (TP_MARKER) url.searchParams.set("marker", TP_MARKER);
  return url.toString();
}

/** The partner link "Select" opens in affiliate mode. */
export function affiliateLink(search: FlightSearchParams): string {
  return aviasalesLink(search);
}
