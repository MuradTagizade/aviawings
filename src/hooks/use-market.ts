"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { MARKETS, marketForLocale, type Market } from "@/lib/market";
import { useMarketStore } from "@/stores/market";

/**
 * Resolves the active market: the `aw-market` cookie once hydrated,
 * otherwise inferred from the UI language (which matches what the
 * server rendered — no hydration mismatch).
 */
export function useMarket(): Market {
  const locale = useLocale();
  const stored = useMarketStore((s) => s.market);
  const hydrate = useMarketStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return MARKETS[stored ?? marketForLocale(locale)];
}
