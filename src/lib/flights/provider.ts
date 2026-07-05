import { amadeusProvider, isAmadeusConfigured } from "./amadeus";
import { mockProvider } from "./mock";
import type { FlightSearchParams, FlightSearchResult } from "./types";

/**
 * Provider selection with graceful fallback:
 *   1. Amadeus test API when keys are configured
 *   2. Deterministic mock engine otherwise, or whenever Amadeus
 *      errors / returns an empty result (its test data is sparse).
 *
 * A future consolidator integration only needs to implement
 * FlightProvider and be added here.
 */
export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult> {
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
