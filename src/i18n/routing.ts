import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["az", "tr", "en", "ru", "ka", "tk", "kk", "uz", "ky"],
  defaultLocale: "tr",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
