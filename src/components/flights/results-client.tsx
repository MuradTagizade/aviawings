"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Compass, Info, SlidersHorizontal, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import type { FlightOffer, FlightSearchParams, FlightSearchResult } from "@/lib/flights/types";
import { findAirport } from "@/lib/airports";
import { findDestinationByIata } from "@/content/destinations";
import { convert, formatMoney } from "@/lib/currency";
import { usePreferences } from "@/stores/preferences";
import { useBooking } from "@/stores/booking";
import { trackEvent } from "@/lib/analytics";
import { SearchWidget } from "@/components/search/search-widget";
import { FlightCard } from "./flight-card";
import { addDays, cn, formatDateISO } from "@/lib/utils";

type SortKey = "best" | "cheapest" | "fastest";
type StopFilter = "any" | "direct" | "max1";

interface Filters {
  stops: StopFilter;
  airlines: Set<string>;
  times: Set<"morning" | "afternoon" | "evening" | "night">;
  maxPrice: number | null;
}

const TIME_BUCKETS = {
  morning: [5, 12],
  afternoon: [12, 17],
  evening: [17, 22],
  night: [22, 29], // wraps past midnight
} as const;

function departHour(offer: FlightOffer) {
  return parseInt(offer.itineraries[0].segments[0].departureTime.slice(11, 13));
}

function inTimeBucket(hour: number, bucket: keyof typeof TIME_BUCKETS) {
  const [a, b] = TIME_BUCKETS[bucket];
  const h = hour < 5 ? hour + 24 : hour;
  return h >= a && h < b;
}

export function ResultsClient() {
  const t = useTranslations("results");
  const tf = useTranslations("results.filters");
  const locale = useLocale() as "tr" | "en";
  const router = useRouter();
  const sp = useSearchParams();
  const { currency } = usePreferences();
  const setBooking = useBooking((s) => s.setBooking);

  const search: FlightSearchParams | null = useMemo(() => {
    const from = sp.get("from");
    const to = sp.get("to");
    const depart = sp.get("depart");
    if (!from || !to || !depart) return null;
    return {
      origin: from,
      destination: to,
      departDate: depart,
      returnDate: sp.get("return") ?? undefined,
      adults: parseInt(sp.get("adults") ?? "1") || 1,
      children: parseInt(sp.get("children") ?? "0") || 0,
      infants: parseInt(sp.get("infants") ?? "0") || 0,
      cabin: (sp.get("cabin") === "business" ? "business" : "economy") as
        | "economy"
        | "business",
    };
  }, [sp]);

  const query = useQuery<FlightSearchResult>({
    queryKey: ["flights", sp.toString()],
    enabled: !!search,
    queryFn: async () => {
      const qs = new URLSearchParams({
        from: search!.origin,
        to: search!.destination,
        depart: search!.departDate,
        adults: String(search!.adults),
        children: String(search!.children),
        infants: String(search!.infants),
        cabin: search!.cabin,
      });
      if (search!.returnDate) qs.set("return", search!.returnDate);
      const res = await fetch(`/api/flights/search?${qs}`);
      if (!res.ok) throw new Error("search_failed");
      return res.json();
    },
  });

  const [sort, setSort] = useState<SortKey>("best");
  const [filters, setFilters] = useState<Filters>({
    stops: "any",
    airlines: new Set(),
    times: new Set(),
    maxPrice: null,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const offers = useMemo(() => query.data?.offers ?? [], [query.data]);

  const airlines = useMemo(() => {
    const map = new Map<string, string>();
    offers.forEach((o) =>
      o.itineraries.forEach((it) =>
        it.segments.forEach((s) => map.set(s.airlineCode, s.airlineName))
      )
    );
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [offers]);

  const priceBounds = useMemo(() => {
    if (offers.length === 0) return null;
    const prices = offers.map((o) =>
      convert(o.price.total, o.price.currency, currency)
    );
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [offers, currency]);

  const filtered = useMemo(() => {
    let list = offers.filter((o) => {
      const maxStops = Math.max(...o.itineraries.map((i) => i.stops));
      if (filters.stops === "direct" && maxStops > 0) return false;
      if (filters.stops === "max1" && maxStops > 1) return false;
      if (
        filters.airlines.size > 0 &&
        !o.itineraries.some((it) =>
          it.segments.some((s) => filters.airlines.has(s.airlineCode))
        )
      )
        return false;
      if (filters.times.size > 0) {
        const h = departHour(o);
        if (![...filters.times].some((b) => inTimeBucket(h, b))) return false;
      }
      if (filters.maxPrice !== null) {
        const p = convert(o.price.total, o.price.currency, currency);
        if (p > filters.maxPrice) return false;
      }
      return true;
    });

    const duration = (o: FlightOffer) =>
      o.itineraries.reduce((acc, it) => acc + it.durationMinutes, 0);

    if (sort === "cheapest") {
      list = [...list].sort((a, b) => a.price.total - b.price.total);
    } else if (sort === "fastest") {
      list = [...list].sort((a, b) => duration(a) - duration(b));
    } else {
      const prices = list.map((o) => o.price.total);
      const durs = list.map(duration);
      const pMin = Math.min(...prices), pMax = Math.max(...prices);
      const dMin = Math.min(...durs), dMax = Math.max(...durs);
      const score = (o: FlightOffer) => {
        const p = pMax > pMin ? (o.price.total - pMin) / (pMax - pMin) : 0;
        const d = dMax > dMin ? (duration(o) - dMin) / (dMax - dMin) : 0;
        return p * 0.65 + d * 0.35;
      };
      list = [...list].sort((a, b) => score(a) - score(b));
    }
    return list;
  }, [offers, filters, sort, currency]);

  function selectOffer(offer: FlightOffer) {
    if (!search) return;
    trackEvent("select_item", { item_id: offer.id, price: offer.price.total });
    setBooking(offer, search);
    router.push("/booking");
  }

  function clearFilters() {
    setFilters({ stops: "any", airlines: new Set(), times: new Set(), maxPrice: null });
  }

  if (!search) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <SearchWidget />
      </div>
    );
  }

  const fromCity = findAirport(search.origin)?.city[locale] ?? search.origin;
  const toCity = findAirport(search.destination)?.city[locale] ?? search.destination;
  const destGuide = findDestinationByIata(search.destination);

  // ±3 day flexible strip
  const baseDate = new Date(`${search.departDate}T00:00:00`);
  const flexDays = [-3, -2, -1, 0, 1, 2, 3].map((off) => addDays(baseDate, off));
  const dayFmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
  });

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
          {tf("stops")}
        </h3>
        <div className="space-y-1.5">
          {([
            ["any", tf("any")],
            ["direct", tf("directOnly")],
            ["max1", tf("maxOneStop")],
          ] as [StopFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilters((f) => ({ ...f, stops: key }))}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                filters.stops === key
                  ? "bg-gold-soft font-medium text-gold-deep"
                  : "text-ink-soft hover:bg-sand"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {airlines.length > 1 && (
        <div>
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
            {tf("airlines")}
          </h3>
          <div className="space-y-1">
            {airlines.map(([code, name]) => {
              const active = filters.airlines.has(code);
              return (
                <label
                  key={code}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-sand"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      setFilters((f) => {
                        const next = new Set(f.airlines);
                        if (active) next.delete(code);
                        else next.add(code);
                        return { ...f, airlines: next };
                      })
                    }
                    className="h-4 w-4 accent-[#c9a96e]"
                  />
                  <span className="truncate">{name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
          {tf("departureTime")}
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {(["morning", "afternoon", "evening", "night"] as const).map((b) => {
            const active = filters.times.has(b);
            return (
              <button
                key={b}
                onClick={() =>
                  setFilters((f) => {
                    const next = new Set(f.times);
                    if (active) next.delete(b);
                    else next.add(b);
                    return { ...f, times: next };
                  })
                }
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                  active
                    ? "border-gold bg-gold-soft text-gold-deep"
                    : "border-ink/10 text-ink-soft hover:border-ink/25"
                )}
              >
                {tf(b)}
              </button>
            );
          })}
        </div>
      </div>

      {priceBounds && priceBounds.max > priceBounds.min && (
        <div>
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
            {tf("priceRange")}
          </h3>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={filters.maxPrice ?? priceBounds.max}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxPrice: parseInt(e.target.value) }))
            }
            className="w-full accent-[#c9a96e]"
          />
          <p className="mt-1 text-xs text-ink-soft">
            ≤ {formatMoney(filters.maxPrice ?? priceBounds.max, currency, locale)}
          </p>
        </div>
      )}

      <button
        onClick={clearFilters}
        className="text-[13px] font-medium text-ink-faint underline underline-offset-4 hover:text-ink"
      >
        {tf("clear")}
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mb-6">
        <SearchWidget compact initial={{
          origin: search.origin,
          destination: search.destination,
          departDate: search.departDate,
          returnDate: search.returnDate,
          adults: search.adults,
          children: search.children,
          infants: search.infants,
          cabin: search.cabin,
        }} />
      </div>

      {/* Flexible dates strip */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {flexDays.map((d) => {
          const iso = formatDateISO(d);
          const active = iso === search.departDate;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (d < today) return null;
          const qs = new URLSearchParams(sp.toString());
          qs.set("depart", iso);
          if (search.returnDate) {
            const shift =
              (d.getTime() - baseDate.getTime()) / 86_400_000;
            qs.set(
              "return",
              formatDateISO(addDays(new Date(`${search.returnDate}T00:00:00`), shift))
            );
          }
          return (
            <Link
              key={iso}
              href={`/flights?${qs.toString()}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-all",
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/10 bg-white text-ink-soft hover:border-ink/30"
              )}
            >
              {dayFmt.format(d)}
            </Link>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">
            {fromCity} → {toCity}
          </h1>
          {!query.isLoading && (
            <p className="text-sm text-ink-faint">
              {t("resultsCount", { count: filtered.length })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex rounded-full bg-sand p-1">
            {(["best", "cheapest", "fastest"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all",
                  sort === k ? "bg-white text-ink shadow-soft" : "text-ink-soft"
                )}
              >
                {t(`sort.${k}`)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 text-[13px] font-medium text-ink-soft lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {tf("title")}
          </button>
        </div>
      </div>

      {query.data?.source === "mock" && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-sky/15 bg-sky-soft px-4 py-3 text-[13px] text-sky">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {t("demoNotice")}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink/5 bg-white p-5 shadow-soft">
            {filterPanel}
          </div>
        </aside>

        <div className="space-y-3.5">
          {query.isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-ink/5 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2.5">
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                  </div>
                  <div className="skeleton h-8 w-24 rounded-full" />
                </div>
              </div>
            ))}

          {query.isError && (
            <div className="rounded-2xl border border-coral/20 bg-coral-soft p-8 text-center">
              <p className="font-medium text-coral">{t("noResults")}</p>
              <button
                onClick={() => query.refetch()}
                className="mt-3 text-sm underline underline-offset-4"
              >
                {t("noResultsSub")}
              </button>
            </div>
          )}

          {!query.isLoading && !query.isError && filtered.length === 0 && (
            <div className="rounded-2xl border border-ink/5 bg-white p-10 text-center shadow-soft">
              <p className="font-display text-xl text-ink">{t("noResults")}</p>
              <p className="mt-1 text-sm text-ink-soft">{t("noResultsSub")}</p>
            </div>
          )}

          {filtered.map((offer, i) => (
            <FlightCard key={offer.id} offer={offer} index={i} onSelect={selectOffer} />
          ))}

          {destGuide && !query.isLoading && (
            <Link
              href={`/destinations/${destGuide.slug}?depart=${search.departDate}${search.returnDate ? `&return=${search.returnDate}` : ""}`}
              className="group flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold-soft/40 p-5 transition-all hover:shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft">
                <Compass className="h-5 w-5 text-gold-deep" />
              </span>
              <span className="text-sm font-medium text-ink group-hover:underline">
                {t("exploreDestination", { city: toCity })}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile filters bottom sheet */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-auto rounded-t-3xl bg-white p-6 pb-10 lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl text-ink">{tf("title")}</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-full p-2 text-ink-soft hover:bg-sand"
                  aria-label={tf("apply")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-cream"
              >
                {tf("apply")}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
