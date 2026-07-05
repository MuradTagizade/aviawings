import { z } from "zod";

export const searchParamsSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  children: z.coerce.number().int().min(0).max(8).default(0),
  infants: z.coerce.number().int().min(0).max(4).default(0),
  cabin: z.enum(["economy", "business"]).default("economy"),
});

export type FlightSearchParams = z.infer<typeof searchParamsSchema>;

export interface FlightSegment {
  origin: string; // IATA
  destination: string; // IATA
  departureTime: string; // ISO datetime (local)
  arrivalTime: string; // ISO datetime (local)
  durationMinutes: number;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  aircraft?: string;
}

export interface FlightItinerary {
  segments: FlightSegment[];
  durationMinutes: number; // total incl. layovers
  stops: number;
}

export interface FlightOffer {
  id: string;
  itineraries: FlightItinerary[]; // [outbound] or [outbound, return]
  price: {
    total: number;
    /** ISO currency code as quoted by the provider (e.g. USD, GBP) */
    currency: string;
  };
  cabin: "economy" | "business";
  seatsLeft?: number;
  baggage: { cabinKg: number; checkedKg: number };
  refundable: boolean;
}

export interface FlightSearchResult {
  offers: FlightOffer[];
  /** 'duffel'/'amadeus' = live API, 'mock' = demo engine */
  source: "duffel" | "amadeus" | "mock";
}

export interface FlightProvider {
  search(params: FlightSearchParams): Promise<FlightSearchResult>;
}
