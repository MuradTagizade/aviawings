import type { Locale } from "@/i18n/routing";
import type { Currency } from "@/lib/currency";

/**
 * Markets separate WHERE the user shops from WHAT language they read
 * (Skyscanner model). The market is auto-detected from geo-IP on first
 * visit (see src/proxy.ts), stored in the `aw-market` cookie, and drives
 * market-specific content: popular routes, contact/social channels,
 * default currency, visa defaults — and any future market-only offers.
 *
 * Each market offers its local language plus English and Russian.
 */
export type MarketCode =
  | "AZ"
  | "TR"
  | "GE"
  | "TM"
  | "KZ"
  | "UZ"
  | "KG"
  | "GLOBAL";

export interface Market {
  code: MarketCode;
  /** ISO country code for flags/visa defaults; empty for GLOBAL */
  countryCode: string;
  flag: string;
  languages: Locale[];
  defaultLocale: Locale;
  currency: Currency;
}

export const MARKETS: Record<MarketCode, Market> = {
  AZ: { code: "AZ", countryCode: "AZ", flag: "🇦🇿", languages: ["az", "en", "ru"], defaultLocale: "az", currency: "AZN" },
  TR: { code: "TR", countryCode: "TR", flag: "🇹🇷", languages: ["tr", "en", "ru"], defaultLocale: "tr", currency: "TRY" },
  GE: { code: "GE", countryCode: "GE", flag: "🇬🇪", languages: ["ka", "en", "ru"], defaultLocale: "ka", currency: "GEL" },
  TM: { code: "TM", countryCode: "TM", flag: "🇹🇲", languages: ["tk", "en", "ru"], defaultLocale: "tk", currency: "USD" },
  KZ: { code: "KZ", countryCode: "KZ", flag: "🇰🇿", languages: ["kk", "en", "ru"], defaultLocale: "kk", currency: "KZT" },
  UZ: { code: "UZ", countryCode: "UZ", flag: "🇺🇿", languages: ["uz", "en", "ru"], defaultLocale: "uz", currency: "UZS" },
  KG: { code: "KG", countryCode: "KG", flag: "🇰🇬", languages: ["ky", "en", "ru"], defaultLocale: "ky", currency: "KGS" },
  GLOBAL: { code: "GLOBAL", countryCode: "", flag: "🌍", languages: ["en", "ru"], defaultLocale: "en", currency: "USD" },
};

export const MARKET_CODES = Object.keys(MARKETS) as MarketCode[];

export const MARKET_COOKIE = "aw-market";
export const MARKET_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isMarketCode(v: string | undefined | null): v is MarketCode {
  return !!v && v in MARKETS;
}

/** Geo-IP country (e.g. Vercel's x-vercel-ip-country) → market. */
export function marketForCountry(country: string): MarketCode {
  const c = country.toUpperCase();
  return isMarketCode(c) && c !== "GLOBAL" ? (c as MarketCode) : "GLOBAL";
}

/** Fallback when no market cookie exists yet: infer from the UI language. */
export function marketForLocale(locale: string): MarketCode {
  const map: Record<string, MarketCode> = {
    az: "AZ",
    tr: "TR",
    ka: "GE",
    tk: "TM",
    kk: "KZ",
    uz: "UZ",
    ky: "KG",
  };
  return map[locale] ?? "GLOBAL";
}

/** Localized market name; GLOBAL has a fixed label per language. */
export function marketName(code: MarketCode, locale: string): string {
  if (code === "GLOBAL") {
    const names: Record<string, string> = {
      az: "Qlobal",
      tr: "Global",
      ru: "Глобальный",
      ka: "გლობალური",
      tk: "Global",
      kk: "Жаһандық",
      uz: "Global",
      ky: "Глобалдык",
    };
    return names[locale] ?? "Global";
  }
  try {
    return (
      new Intl.DisplayNames([locale], { type: "region" }).of(
        MARKETS[code].countryCode
      ) ?? code
    );
  } catch {
    return code;
  }
}
