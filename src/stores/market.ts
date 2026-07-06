"use client";

import { create } from "zustand";
import {
  MARKET_COOKIE,
  MARKET_COOKIE_MAX_AGE,
  isMarketCode,
  type MarketCode,
} from "@/lib/market";

function readMarketCookie(): MarketCode | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`${MARKET_COOKIE}=([^;]+)`));
  return m && isMarketCode(m[1]) ? m[1] : null;
}

interface MarketState {
  /** null until the cookie has been read on the client */
  market: MarketCode | null;
  hydrate: () => void;
  setMarket: (m: MarketCode) => void;
}

/**
 * Client mirror of the `aw-market` cookie (set by geo-IP middleware on the
 * first visit, or by the user via the market switcher). Consumers should
 * fall back to `marketForLocale(locale)` while `market` is still null so
 * server-rendered HTML stays consistent.
 */
export const useMarketStore = create<MarketState>()((set) => ({
  market: null,
  hydrate: () => {
    const m = readMarketCookie();
    if (m) set({ market: m });
  },
  setMarket: (market) => {
    document.cookie = `${MARKET_COOKIE}=${market}; path=/; max-age=${MARKET_COOKIE_MAX_AGE}; samesite=lax`;
    set({ market });
  },
}));
