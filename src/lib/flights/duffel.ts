import type {
  FlightItinerary,
  FlightOffer,
  FlightProvider,
  FlightSearchParams,
} from "./types";

/**
 * Duffel API client (test or live token).
 * Docs: https://duffel.com/docs — free instant test mode at app.duffel.com/join.
 * Duffel is a full consolidator: the same API later supports real ticketing
 * (offer → order), which is our V2 path.
 */

const BASE = "https://api.duffel.com";

function parseIsoDuration(iso: string | null): number {
  // e.g. PT2H30M or P1DT2H
  if (!iso) return 0;
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (
    (parseInt(m[1] ?? "0") || 0) * 1440 +
    (parseInt(m[2] ?? "0") || 0) * 60 +
    (parseInt(m[3] ?? "0") || 0)
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapSlice(slice: any): FlightItinerary {
  const segments = (slice.segments ?? []).map((s: any) => ({
    origin: s.origin?.iata_code ?? "",
    destination: s.destination?.iata_code ?? "",
    departureTime: s.departing_at ?? "",
    arrivalTime: s.arriving_at ?? "",
    durationMinutes: parseIsoDuration(s.duration),
    airlineCode:
      s.marketing_carrier?.iata_code ?? s.operating_carrier?.iata_code ?? "??",
    airlineName:
      s.marketing_carrier?.name ?? s.operating_carrier?.name ?? "Unknown",
    flightNumber: `${s.marketing_carrier?.iata_code ?? ""}${s.marketing_carrier_flight_number ?? ""}`,
    aircraft: s.aircraft?.name,
  }));
  return {
    segments,
    durationMinutes: parseIsoDuration(slice.duration),
    stops: Math.max(segments.length - 1, 0),
  };
}

function mapOffer(raw: any, cabin: "economy" | "business"): FlightOffer {
  const firstBags =
    raw.slices?.[0]?.segments?.[0]?.passengers?.[0]?.baggages ?? [];
  const checked = firstBags.find((b: any) => b.type === "checked");
  const carryOn = firstBags.find((b: any) => b.type === "carry_on");

  return {
    id: `DUF-${raw.id}`,
    itineraries: (raw.slices ?? []).map(mapSlice),
    price: {
      total: parseFloat(raw.total_amount ?? "0"),
      currency: (raw.total_currency ?? "USD") as FlightOffer["price"]["currency"],
    },
    cabin,
    baggage: {
      cabinKg: carryOn?.quantity ? 8 : 0,
      checkedKg: checked?.quantity ? checked.quantity * 23 : 0,
    },
    refundable:
      raw.conditions?.refund_before_departure?.allowed === true,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const duffelProvider: FlightProvider = {
  async search(params: FlightSearchParams) {
    const slices: { origin: string; destination: string; departure_date: string }[] = [
      {
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departDate,
      },
    ];
    if (params.returnDate) {
      slices.push({
        origin: params.destination,
        destination: params.origin,
        departure_date: params.returnDate,
      });
    }

    const passengers = [
      ...Array.from({ length: params.adults }, () => ({ type: "adult" as const })),
      ...Array.from({ length: params.children }, () => ({ age: 8 })),
      ...Array.from({ length: params.infants }, () => ({ age: 1 })),
    ];

    const res = await fetch(`${BASE}/air/offer_requests?return_offers=true`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          slices,
          passengers,
          cabin_class: params.cabin === "business" ? "business" : "economy",
          max_connections: 1,
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Duffel search failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    const offers: FlightOffer[] = (data.data?.offers ?? [])
      .slice(0, 30)
      .map((raw: unknown) => mapOffer(raw, params.cabin));
    offers.sort((a, b) => a.price.total - b.price.total);
    return { offers, source: "duffel" as const };
  },
};

export function isDuffelConfigured(): boolean {
  return Boolean(process.env.DUFFEL_ACCESS_TOKEN);
}
