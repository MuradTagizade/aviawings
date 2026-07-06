import type { MetadataRoute } from "next";
import { DESTINATIONS } from "@/content/destinations";
import { routing } from "@/i18n/routing";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const LOCALES = routing.locales;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/destinations",
    "/planner",
    "/visa",
    "/about",
    "/contact",
    "/privacy",
    "/cookies",
    "/terms",
  ];
  const destPaths = DESTINATIONS.map((d) => `/destinations/${d.slug}`);

  return [...staticPaths, ...destPaths].flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path.startsWith("/destinations") ? 0.8 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE}/${l}${path}`])
        ),
      },
    }))
  );
}
