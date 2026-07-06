import type { MarketCode } from "@/lib/market";

/**
 * Contact & social presence per MARKET (not language): a visitor in the
 * Kazakhstan market sees the Kazakhstan office/socials whatever language
 * they read in. The GLOBAL market maps to the Baku HQ presence.
 *
 * TODO: replace the placeholder phone numbers and handles with the real
 * ones as each market account is opened — this file is the single source.
 */
export interface RegionalContact {
  /** ISO country code of the market (drives the flag shown in the UI) */
  countryCode: string;
  /** Display phone; empty string hides the phone row */
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  telegram: string;
  whatsapp: string;
  /** Support hours in local terms, tr/en pair (contentLocale fallback) */
  hours: { tr: string; en: string };
}

const HQ: RegionalContact = {
  countryCode: "AZ",
  phone: "+994 12 000 00 00",
  email: "support@aviawings.com",
  instagram: "aviawings",
  facebook: "aviawings",
  telegram: "aviawings",
  whatsapp: "+994500000000",
  hours: { tr: "Her gün 09:00 – 22:00 (GMT+4)", en: "Every day 09:00 – 22:00 (GMT+4)" },
};

export const REGIONAL_CONTACTS: Record<MarketCode, RegionalContact> = {
  AZ: HQ,
  GLOBAL: HQ,
  TR: {
    countryCode: "TR",
    phone: "+90 212 000 00 00",
    email: "destek@aviawings.com",
    instagram: "aviawings.tr",
    facebook: "aviawings.tr",
    telegram: "aviawings_tr",
    whatsapp: "+905000000000",
    hours: { tr: "Her gün 09:00 – 22:00 (GMT+3)", en: "Every day 09:00 – 22:00 (GMT+3)" },
  },
  GE: {
    countryCode: "GE",
    phone: "+995 32 000 00 00",
    email: "support@aviawings.com",
    instagram: "aviawings.ge",
    facebook: "aviawings.ge",
    telegram: "aviawings_ge",
    whatsapp: "+995500000000",
    hours: { tr: "Her gün 09:00 – 22:00 (GMT+4)", en: "Every day 09:00 – 22:00 (GMT+4)" },
  },
  TM: {
    countryCode: "TM",
    phone: "+993 12 00 00 00",
    email: "support@aviawings.com",
    instagram: "aviawings.tm",
    facebook: "aviawings.tm",
    telegram: "aviawings_tm",
    whatsapp: "+99361000000",
    hours: { tr: "Her gün 09:00 – 22:00 (GMT+5)", en: "Every day 09:00 – 22:00 (GMT+5)" },
  },
  KZ: {
    countryCode: "KZ",
    phone: "+7 727 000 00 00",
    email: "support@aviawings.com",
    instagram: "aviawings.kz",
    facebook: "aviawings.kz",
    telegram: "aviawings_kz",
    whatsapp: "+77070000000",
    hours: { tr: "Her gün 09:00 – 22:00 (GMT+5)", en: "Every day 09:00 – 22:00 (GMT+5)" },
  },
  UZ: {
    countryCode: "UZ",
    phone: "+998 71 000 00 00",
    email: "support@aviawings.com",
    instagram: "aviawings.uz",
    facebook: "aviawings.uz",
    telegram: "aviawings_uz",
    whatsapp: "+998900000000",
    hours: { tr: "Her gün 09:00 – 22:00 (GMT+5)", en: "Every day 09:00 – 22:00 (GMT+5)" },
  },
  KG: {
    countryCode: "KG",
    phone: "+996 312 00 00 00",
    email: "support@aviawings.com",
    instagram: "aviawings.kg",
    facebook: "aviawings.kg",
    telegram: "aviawings_kg",
    whatsapp: "+996500000000",
    hours: { tr: "Her gün 09:00 – 22:00 (GMT+6)", en: "Every day 09:00 – 22:00 (GMT+6)" },
  },
};

export function regionalContact(market: MarketCode): RegionalContact {
  return REGIONAL_CONTACTS[market] ?? HQ;
}

export const socialUrl = {
  instagram: (c: RegionalContact) => `https://instagram.com/${c.instagram}`,
  facebook: (c: RegionalContact) => `https://facebook.com/${c.facebook}`,
  telegram: (c: RegionalContact) => `https://t.me/${c.telegram}`,
  whatsapp: (c: RegionalContact) => `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`,
};
