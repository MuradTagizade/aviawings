import { amadeusProvider, isAmadeusConfigured } from "./amadeus";
import { duffelProvider, isDuffelConfigured } from "./duffel";
import { mockProvider } from "./mock";
import type { FlightSearchParams, FlightSearchResult } from "./types";

/**
 * Provider selection with graceful fallback:
 *   1. Duffel when DUFFEL_ACCESS_TOKEN is set (test or live token —
 *      Duffel is a consolidator, so this is also the V2 ticketing path)
 *   2. Amadeus test API when keys are configured
 *      (NOTE: Amadeus Self-Service shuts down on 2026-07-17 — kept only
 *      for existing keys until then)
 *   3. Deterministic mock engine otherwise, or whenever a live provider
 *      errors / returns an empty result.
 *
 * A future consolidator integration only needs to implement
 * FlightProvider and be added here.
 */
export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult> {
  if (isDuffelConfigured()) {
    try {
      const result = await duffelProvider.search(params);
      if (result.offers.length > 0) return result;
    } catch (err) {
      console.error("[flights] Duffel failed, falling back:", err);
    }
  }
  if (isAmadeusConfigured()) {
    try {
      const result = await amadeusProvider.search(params);
      if (result.offers.length > 0) return result;
    } catch (err) {
      console.error("[flights] Amadeus failed, falling back to mock:", err);
    }
  }
  return mockProvider.search(params);
}
