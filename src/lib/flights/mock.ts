import { findAirport, distanceKm } from "@/lib/airports";
import type {
  FlightItinerary,
  FlightOffer,
  FlightProvider,
  FlightSearchParams,
  FlightSegment,
} from "./types";

/**
 * Demo flight engine. Generates realistic, deterministic offers for any
 * route/date combination so the product is fully browsable before the
 * consolidator APIs are connected. Same search → same results.
 */

interface Carrier {
  code: string;
  name: string;
  /** price positioning: 1 = budget, 1.35 = full service */
  factor: number;
  aircraft: string[];
}

const CARRIERS: Carrier[] = [
  { code: "J2", name: "AZAL Azerbaijan Airlines", factor: 1.15, aircraft: ["Airbus A320neo", "Boeing 787-8"] },
  { code: "TK", name: "Turkish Airlines", factor: 1.3, aircraft: ["Airbus A321neo", "Boeing 737-800", "Airbus A350-900"] },
  { code: "PC", name: "Pegasus Airlines", factor: 0.85, aircraft: ["Airbus A320neo", "Boeing 737-800"] },
  { code: "VF", name: "AJet", factor: 0.9, aircraft: ["Boeing 737-800", "Airbus A321"] },
  { code: "W6", name: "Wizz Air", factor: 0.8, aircraft: ["Airbus A321neo"] },
  { code: "FZ", name: "flydubai", factor: 1.05, aircraft: ["Boeing 737 MAX 8"] },
  { code: "QR", name: "Qatar Airways", factor: 1.4, aircraft: ["Airbus A350-1000", "Boeing 777-300ER"] },
  { code: "LH", name: "Lufthansa", factor: 1.35, aircraft: ["Airbus A320neo", "Airbus A340-300"] },
];

/** Deterministic PRNG seeded from a string (mulberry32) */
function seeded(seedStr: string): () => number {
  let h = 1779033703;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toLocalIso(date: string, minutesFromMidnight: number): string {
  const h = Math.floor(minutesFromMidnight / 60) % 24;
  const m = minutesFromMidnight % 60;
  const dayOffset = Math.floor(minutesFromMidnight / 1440);
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + dayOffset);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function buildItinerary(
  origin: string,
  destination: string,
  date: string,
  carrier: Carrier,
  rand: () => number,
  flightMinutes: number,
  withStop: boolean
): FlightItinerary {
  const departMin = 300 + Math.floor(rand() * 1140); // 05:00 – 23:59
  const flightNo = () => `${carrier.code}${100 + Math.floor(rand() * 900)}`;
  const aircraft = carrier.aircraft[Math.floor(rand() * carrier.aircraft.length)];

  if (!withStop) {
    const seg: FlightSegment = {
      origin,
      destination,
      departureTime: toLocalIso(date, departMin),
      arrivalTime: toLocalIso(date, departMin + flightMinutes),
      durationMinutes: flightMinutes,
      airlineCode: carrier.code,
      airlineName: carrier.name,
      flightNumber: flightNo(),
      aircraft,
    };
    return { segments: [seg], durationMinutes: flightMinutes, stops: 0 };
  }

  // One-stop via the carrier's hub
  const hubs: Record<string, string> = {
    J2: "GYD", TK: "IST", PC: "SAW", VF: "ESB", W6: "VIE", FZ: "DXB", QR: "DOH", LH: "FRA",
  };
  let hub = hubs[carrier.code] ?? "IST";
  if (hub === origin || hub === destination) hub = hub === "IST" ? "ESB" : "IST";
  const leg1 = Math.round(flightMinutes * (0.45 + rand() * 0.2));
  const layover = 60 + Math.floor(rand() * 150);
  const leg2 = Math.round(flightMinutes * (0.55 + rand() * 0.25));
  const segs: FlightSegment[] = [
    {
      origin,
      destination: hub,
      departureTime: toLocalIso(date, departMin),
      arrivalTime: toLocalIso(date, departMin + leg1),
      durationMinutes: leg1,
      airlineCode: carrier.code,
      airlineName: carrier.name,
      flightNumber: flightNo(),
      aircraft,
    },
    {
      origin: hub,
      destination,
      departureTime: toLocalIso(date, departMin + leg1 + layover),
      arrivalTime: toLocalIso(date, departMin + leg1 + layover + leg2),
      durationMinutes: leg2,
      airlineCode: carrier.code,
      airlineName: carrier.name,
      flightNumber: flightNo(),
      aircraft,
    },
  ];
  return {
    segments: segs,
    durationMinutes: leg1 + layover + leg2,
    stops: 1,
  };
}

export const mockProvider: FlightProvider = {
  async search(params: FlightSearchParams) {
    const from = findAirport(params.origin);
    const to = findAirport(params.destination);
    if (!from || !to) return { offers: [], source: "mock" as const };

    const km = distanceKm(from, to);
    const flightMinutes = Math.round(40 + km / 12.5); // taxi + ~750km/h
    const basePrice = 45 + km * 0.085; // USD economy base

    const rand = seeded(
      `${params.origin}-${params.destination}-${params.departDate}-${params.returnDate ?? ""}-${params.cabin}`
    );

    const offerCount = 9 + Math.floor(rand() * 6);
    const offers: FlightOffer[] = [];

    for (let i = 0; i < offerCount; i++) {
      const carrier = CARRIERS[Math.floor(rand() * CARRIERS.length)];
      // Short routes are mostly direct; long ones mix in connections
      const withStop = km > 1200 ? rand() < 0.45 : rand() < 0.15;

      const itineraries: FlightItinerary[] = [
        buildItinerary(params.origin, params.destination, params.departDate, carrier, rand, flightMinutes, withStop),
      ];
      if (params.returnDate) {
        const returnStop = km > 1200 ? rand() < 0.45 : rand() < 0.15;
        itineraries.push(
          buildItinerary(params.destination, params.origin, params.returnDate, carrier, rand, flightMinutes, returnStop)
        );
      }

      const cabinFactor = params.cabin === "business" ? 3.1 : 1;
      const legFactor = params.returnDate ? 1.85 : 1;
      const stopDiscount = withStop ? 0.82 : 1;
      const noise = 0.85 + rand() * 0.45;
      const paxFactor =
        params.adults + params.children * 0.75 + params.infants * 0.1;

      const total = Math.round(
        basePrice * carrier.factor * cabinFactor * legFactor * stopDiscount * noise * paxFactor
      );

      offers.push({
        id: `MOCK-${params.origin}${params.destination}-${params.departDate}-${i}`,
        itineraries,
        price: { total, currency: "USD" },
        cabin: params.cabin,
        seatsLeft: rand() < 0.3 ? 1 + Math.floor(rand() * 5) : undefined,
        baggage: {
          cabinKg: 8,
          checkedKg: carrier.factor < 1 ? (rand() < 0.5 ? 0 : 20) : params.cabin === "business" ? 32 : 23,
        },
        refundable: carrier.factor >= 1.15 && rand() < 0.5,
      });
    }

    offers.sort((a, b) => a.price.total - b.price.total);
    return { offers, source: "mock" as const };
  },
};
