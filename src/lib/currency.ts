import { intlLocale } from "@/lib/locale";

export const CURRENCIES = [
  "AZN",
  "TRY",
  "USD",
  "EUR",
  "GEL",
  "KZT",
  "UZS",
  "KGS",
] as const;
export type Currency = (typeof CURRENCIES)[number];

// Approximate static rates (1 USD = X). Replace with a live FX feed
// before real payments go live — display purposes only for now.
// Includes non-display currencies that providers may quote in (e.g. Duffel → GBP).
const RATES_PER_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  TRY: 44.5,
  AZN: 1.7,
  GBP: 0.79,
  CHF: 0.88,
  GEL: 2.7,
  KZT: 520,
  UZS: 12800,
  KGS: 87,
};

const SYMBOLS: Record<Currency, string> = {
  AZN: "₼",
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GEL: "₾",
  KZT: "₸",
  UZS: "soʻm",
  KGS: "сом",
};

export function convert(
  amount: number,
  from: string,
  to: Currency
): number {
  if (from === to) return amount;
  // Unknown source currency → treat as USD rather than producing NaN
  const fromRate = RATES_PER_USD[from] ?? 1;
  const usd = amount / fromRate;
  return usd * RATES_PER_USD[to];
}

export function formatMoney(
  amount: number,
  currency: Currency,
  locale: string
): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat(intlLocale(locale), {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${formatted} ${SYMBOLS[currency]}`;
}
