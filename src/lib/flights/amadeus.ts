import type {
  FlightItinerary,
  FlightOffer,
  FlightProvider,
  FlightSearchParams,
} from "./types";

/**
 * Amadeus Self-Service (test environment) client.
 * Docs: https://developers.amadeus.com — free tier, limited route coverage.
 * Keys live only on the server (.env.local).
 */

const BASE = "https://test.api.amadeus.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }
  const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID ?? "",
      client_secret: process.env.AMADEUS_CLIENT_SECRET ?? "",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

function parseIsoDuration(iso: string): number {
  // PT2H30M → 150
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? "0") || 0) * 60 + (parseInt(m[2] ?? "0") || 0);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapOffer(raw: any, carriers: Record<string, string>, cabin: "economy" | "business"): FlightOffer {
  const itineraries: FlightItinerary[] = raw.itineraries.map((it: any) => {
    const segments = it.segments.map((s: any) => ({
      origin: s.departure.iataCode,
      destination: s.arrival.iataCode,
      departureTime: s.departure.at,
      arrivalTime: s.arrival.at,
      durationMinutes: parseIsoDuration(s.duration ?? "PT0M"),
      airlineCode: s.carrierCode,
      airlineName: carriers[s.carrierCode] ?? s.carrierCode,
      flightNumber: `${s.carrierCode}${s.number}`,
      aircraft: s.aircraft?.code,
    }));
    return {
      segments,
      durationMinutes: parseIsoDuration(it.duration ?? "PT0M"),
      stops: segments.length - 1,
    };
  });

  const checkedBags =
    raw.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags;

  return {
    id: `AMA-${raw.id}`,
    itineraries,
    price: {
      total: parseFloat(raw.price.grandTotal ?? raw.price.total),
      currency: (raw.price.currency ?? "USD") as FlightOffer["price"]["currency"],
    },
    cabin,
    seatsLeft:
      typeof raw.numberOfBookableSeats === "number" && raw.numberOfBookableSeats <= 5
        ? raw.numberOfBookableSeats
        : undefined,
    baggage: {
      cabinKg: 8,
      checkedKg: checkedBags?.weight ?? (checkedBags?.quantity ? checkedBags.quantity * 23 : 0),
    },
    refundable: false,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const amadeusProvider: FlightProvider = {
  async search(params: FlightSearchParams) {
    const token = await getToken();
    const qs = new URLSearchParams({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departDate,
      adults: String(params.adults),
      travelClass: params.cabin === "business" ? "BUSINESS" : "ECONOMY",
      currencyCode: "USD",
      max: "20",
    });
    if (params.returnDate) qs.set("returnDate", params.returnDate);
    if (params.children > 0) qs.set("children", String(params.children));
    if (params.infants > 0) qs.set("infants", String(params.infants));

    const res = await fetch(`${BASE}/v2/shopping/flight-offers?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Amadeus search failed: ${res.status}`);
    const data = await res.json();
    const carriers: Record<string, string> = data.dictionaries?.carriers ?? {};

    const offers: FlightOffer[] = (data.data ?? []).map((raw: unknown) =>
      mapOffer(raw, carriers, params.cabin)
    );
    offers.sort((a, b) => a.price.total - b.price.total);
    return { offers, source: "amadeus" as const };
  },
};

export function isAmadeusConfigured(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}
