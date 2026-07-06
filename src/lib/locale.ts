import type { Locale } from "@/i18n/routing";

/** Native language names, shown in the locale switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  az: "Azərbaycanca",
  tr: "Türkçe",
  en: "English",
  ru: "Русский",
  ka: "ქართული",
  tk: "Türkmençe",
  kk: "Қазақша",
  uz: "Oʻzbekcha",
  ky: "Кыргызча",
};

/** BCP-47 tags for Intl formatters (dates, numbers, collation) per UI locale. */
const INTL_LOCALES: Record<Locale, string> = {
  az: "az-AZ",
  tr: "tr-TR",
  en: "en-US",
  ru: "ru-RU",
  ka: "ka-GE",
  tk: "tk-TM",
  kk: "kk-KZ",
  uz: "uz-UZ",
  ky: "ky-KG",
};

export function intlLocale(locale: string): string {
  return INTL_LOCALES[locale as Locale] ?? "en-US";
}

/** Open Graph locale tags per UI locale. */
export const OG_LOCALES: Record<Locale, string> = {
  az: "az_AZ",
  tr: "tr_TR",
  en: "en_US",
  ru: "ru_RU",
  ka: "ka_GE",
  tk: "tk_TM",
  kk: "kk_KZ",
  uz: "uz_UZ",
  ky: "ky_KG",
};

export type ContentLocale = "tr" | "en";

/**
 * Editorial content (destination guides, airports, legal pages) is authored
 * in Turkish and English only. Turkic-language locales fall back to Turkish
 * (mutually intelligible); the rest fall back to English.
 */
export function contentLocale(locale: string): ContentLocale {
  return ["tr", "az", "tk", "uz", "kk", "ky"].includes(locale) ? "tr" : "en";
}
