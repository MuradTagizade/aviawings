import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DESTINATIONS } from "@/content/destinations";
import { FadeIn } from "@/components/fade-in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.destinations" });
  return { title: t("title"), description: t("description") };
}

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "destinations" });
  const loc = locale as "tr" | "en";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">{t("title")}</h1>
        <p className="mt-3 max-w-xl text-[15px] text-ink-soft">{t("subtitle")}</p>
      </FadeIn>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((d, i) => (
          <FadeIn key={d.slug} delay={(i % 3) * 0.07}>
            <Link
              href={`/destinations/${d.slug}`}
              className="group relative block h-[380px] overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 hover:shadow-lift"
            >
              <Image
                src={d.cardImage}
                alt={d.city[loc]}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-gold">
                  {d.country[loc]}
                </p>
                <h2 className="mt-1 font-display text-3xl text-white">{d.city[loc]}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm text-white/80">{d.tagline[loc]}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-all group-hover:gap-2.5">
                  {t("explore")}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
