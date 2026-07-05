import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Banknote,
  CalendarHeart,
  Clock4,
  Languages,
  Lightbulb,
  MapPin,
  Plug,
  Sparkles,
  StampIcon,
  TramFront,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DESTINATIONS, findDestination, type PlaceCategory } from "@/content/destinations";
import { WeatherPanel } from "@/components/destination/weather-panel";
import { FavoriteButton } from "@/components/destination/favorite-button";
import { FadeIn } from "@/components/fade-in";
import { addDays, formatDateISO } from "@/lib/utils";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const d = findDestination(slug);
  if (!d) return {};
  const loc = locale as "tr" | "en";
  return {
    title: `${d.city[loc]} — ${d.country[loc]}`,
    description: d.tagline[loc],
    openGraph: { images: [d.cardImage] },
  };
}

const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  landmark: "bg-gold-soft text-gold-deep",
  museum: "bg-sky-soft text-sky",
  nature: "bg-leaf-soft text-leaf",
  food: "bg-coral-soft text-coral",
  shopping: "bg-sand text-ink-soft",
  nightlife: "bg-ink/10 text-ink",
  history: "bg-gold-soft text-gold-deep",
};

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const d = findDestination(slug);
  if (!d) notFound();

  const loc = locale as "tr" | "en";
  const t = await getTranslations({ locale, namespace: "destinations" });

  const depart = formatDateISO(addDays(new Date(), 14));
  const ret = formatDateISO(addDays(new Date(), 21));
  const flightsHref = `/flights?from=${d.iata === "IST" || d.iata === "ESB" || d.iata === "ADB" || d.iata === "AYT" ? "GYD" : "IST"}&to=${d.iata}&depart=${depart}&return=${ret}&adults=1&children=0&infants=0&cabin=economy`;

  return (
    <article className="pb-24">
      {/* ——— Hero ——— */}
      <div className="relative h-[54vh] min-h-[380px] overflow-hidden">
        <Image
          src={d.heroImage}
          alt={d.city[loc]}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-7xl items-end justify-between px-4 pb-10 sm:px-6 lg:px-8">
            <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
              {d.country[loc]}
            </p>
            <h1 className="mt-1 font-display text-5xl text-white sm:text-6xl">
              {d.city[loc]}
            </h1>
            <p className="mt-2 max-w-lg text-[15px] text-white/85">{d.tagline[loc]}</p>
            </div>
            <FavoriteButton slug={d.slug} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ——— Quick facts ——— */}
        <FadeIn className="-mt-8 relative z-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/5 bg-ink/5 shadow-card sm:grid-cols-4">
            {[
              { icon: CalendarHeart, label: t("bestTime"), value: d.bestTime[loc] },
              { icon: Banknote, label: t("currency"), value: d.currencyCode },
              { icon: Clock4, label: t("timezone"), value: d.timezone },
              { icon: Languages, label: t("language"), value: d.language[loc] },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white p-5">
                <Icon className="h-4.5 w-4.5 text-gold-deep" />
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ——— Weather ——— */}
        <FadeIn className="mt-14">
          <h2 className="mb-5 font-display text-2xl text-ink sm:text-3xl">
            {t("weather.title")}
          </h2>
          <div className="rounded-2xl bg-sand/60 p-6">
            <Suspense>
              <WeatherPanel destination={d} />
            </Suspense>
          </div>
        </FadeIn>

        {/* ——— Places ——— */}
        <div className="mt-14">
          <FadeIn>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {t("places.title")}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{t("places.subtitle")}</p>
          </FadeIn>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {d.places.map((p, i) => (
              <FadeIn key={p.mapQuery} delay={(i % 3) * 0.06}>
                <div className="group flex h-full flex-col rounded-2xl border border-ink/5 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_COLORS[p.category]}`}
                    >
                      {t(`places.categories.${p.category}`)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(p.mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-faint transition-colors hover:text-gold-deep"
                      aria-label={t("places.viewOnMap")}
                    >
                      <MapPin className="h-4 w-4" />
                    </a>
                  </div>
                  <h3 className="font-semibold text-ink">{p.name[loc]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {p.desc[loc]}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* ——— Gallery ——— */}
        {d.gallery.length > 0 && (
          <FadeIn className="mt-14">
            <div className={`grid gap-4 ${d.gallery.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {d.gallery.map((src) => (
                <div key={src} className="relative h-72 overflow-hidden rounded-2xl shadow-card">
                  <Image
                    src={src}
                    alt={d.city[loc]}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* ——— Events ——— */}
        <div className="mt-14">
          <FadeIn>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {t("events.title")}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{t("events.subtitle")}</p>
          </FadeIn>
          <div className="mt-6 space-y-3">
            {d.events.map((e, i) => (
              <FadeIn key={e.name.en} delay={i * 0.06}>
                <div className="flex items-start gap-5 rounded-2xl border border-ink/5 bg-white p-5 shadow-soft">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gold-soft text-center">
                    <span className="px-1 text-[10px] font-bold uppercase leading-tight tracking-wide text-gold-deep">
                      {e.when[loc]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{e.name[loc]}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{e.desc[loc]}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* ——— Practical ——— */}
        <div className="mt-14">
          <FadeIn>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {t("practical.title")}
            </h2>
          </FadeIn>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: StampIcon, label: t("practical.visa"), value: d.practical.visa[loc] },
              { icon: Plug, label: t("practical.plug"), value: d.practical.plug },
              { icon: TramFront, label: t("practical.transport"), value: d.practical.transport[loc] },
              { icon: Lightbulb, label: t("practical.tip"), value: d.practical.tip[loc] },
            ].map(({ icon: Icon, label, value }, i) => (
              <FadeIn key={label} delay={(i % 2) * 0.06}>
                <div className="flex h-full items-start gap-4 rounded-2xl bg-sand/60 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-soft">
                    <Icon className="h-4.5 w-4.5 text-gold-deep" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{label}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{value}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* ——— CTAs ——— */}
        <FadeIn className="mt-16">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-ink px-6 py-12 text-center">
            <h2 className="max-w-md font-display text-2xl text-cream sm:text-3xl">
              {t("flightsTo", { city: d.city[loc] })}
            </h2>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link
                href={flightsHref}
                className="inline-flex h-12 items-center rounded-full bg-gold px-7 text-[15px] font-semibold text-white transition-all hover:bg-gold-deep hover:shadow-lift"
              >
                {t("searchFlights")}
              </Link>
              <Link
                href={`/planner?destination=${d.slug}`}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-cream/25 px-7 text-[15px] font-medium text-cream transition-all hover:border-gold hover:text-gold"
              >
                <Sparkles className="h-4 w-4" />
                {t("planWithAi")}
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </article>
  );
}
