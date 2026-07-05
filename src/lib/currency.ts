export const CURRENCIES = ["AZN", "TRY", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Approximate static rates (1 USD = X). Replace with a live FX feed
// before real payments go live — display purposes only for now.
const RATES_PER_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  TRY: 44.5,
  AZN: 1.7,
};

const SYMBOLS: Record<Currency, string> = {
  AZN: "₼",
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export function convert(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  const usd = amount / RATES_PER_USD[from];
  return usd * RATES_PER_USD[to];
}

export function formatMoney(
  amount: number,
  currency: Currency,
  locale: string
): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${formatted} ${SYMBOLS[currency]}`;
}
