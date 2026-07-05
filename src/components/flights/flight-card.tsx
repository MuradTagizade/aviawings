"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, ChevronDown, Luggage, RotateCcw } from "lucide-react";
import type { FlightItinerary, FlightOffer } from "@/lib/flights/types";
import { findAirport } from "@/lib/airports";
import { convert, formatMoney } from "@/lib/currency";
import { usePreferences } from "@/stores/preferences";
import { cn, formatDuration } from "@/lib/utils";

function timeOf(iso: string) {
  return iso.slice(11, 16);
}

function cityOf(iata: string, locale: "tr" | "en") {
  return findAirport(iata)?.city[locale] ?? iata;
}

/** Deterministic soft color per airline code for the monogram */
function airlineHue(code: string) {
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function AirlineMark({ code }: { code: string }) {
  const hue = airlineHue(code);
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 42% 46%), hsl(${(hue + 40) % 360} 46% 34%))`,
      }}
      aria-hidden
    >
      {code}
    </span>
  );
}

function ItineraryRow({
  itinerary,
  label,
}: {
  itinerary: FlightItinerary;
  label?: string;
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("results");
  const tc = useTranslations("common");
  const first = itinerary.segments[0];
  const last = itinerary.segments[itinerary.segments.length - 1];

  return (
    <div className="flex items-center gap-4">
      <AirlineMark code={first.airlineCode} />
      <div className="grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
        <div className="text-left">
          <p className="text-lg font-semibold tabular-nums text-ink">
            {timeOf(first.departureTime)}
          </p>
          <p className="text-xs text-ink-faint">{first.origin}</p>
        </div>

        <div className="px-1 text-center">
          {label && (
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
              {label}
            </p>
          )}
          <p className="text-[11px] text-ink-faint">
            {formatDuration(itinerary.durationMinutes, locale)}
          </p>
          <div className="relative my-1 h-px w-full min-w-16 bg-ink/15 sm:min-w-28">
            {itinerary.stops > 0 && (
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
            )}
            <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 border-r border-t border-ink/40" />
          </div>
          <p
            className={cn(
              "text-[11px] font-medium",
              itinerary.stops === 0 ? "text-leaf" : "text-ink-soft"
            )}
          >
            {itinerary.stops === 0 ? tc("direct") : tc("stops", { count: itinerary.stops })}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-ink">
            {timeOf(last.arrivalTime)}
          </p>
          <p className="text-xs text-ink-faint">{last.destination}</p>
        </div>
      </div>
      <span className="hidden w-28 truncate text-right text-xs text-ink-faint lg:block">
        {first.airlineName}
      </span>
      {itinerary.stops > 0 && (
        <span className="sr-only">
          {t("layoverIn", {
            city: cityOf(itinerary.segments[0].destination, locale),
            duration: "",
          })}
        </span>
      )}
    </div>
  );
}

export function FlightCard({
  offer,
  onSelect,
  index,
}: {
  offer: FlightOffer;
  onSelect: (offer: FlightOffer) => void;
  index: number;
}) {
  const t = useTranslations("results");
  const locale = useLocale() as "tr" | "en";
  const { currency } = usePreferences();
  const [expanded, setExpanded] = useState(false);

  const price = convert(offer.price.total, offer.price.currency, currency);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-ink/5 bg-surface shadow-soft transition-shadow hover:shadow-card"
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-4">
          <ItineraryRow
            itinerary={offer.itineraries[0]}
            label={offer.itineraries.length > 1 ? t("outbound") : undefined}
          />
          {offer.itineraries[1] && (
            <>
              <div className="h-px w-full bg-ink/5" />
              <ItineraryRow itinerary={offer.itineraries[1]} label={t("inbound")} />
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-ink/5 pt-4 sm:w-44 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div className="text-left sm:text-right">
            {offer.seatsLeft !== undefined && (
              <p className="mb-0.5 text-[11px] font-medium text-coral">
                {t("seatsLeft", { count: offer.seatsLeft })}
              </p>
            )}
            <p className="font-display text-2xl text-ink">
              {formatMoney(price, currency, locale)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex h-10 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-ink-soft transition-colors hover:bg-sand"
              aria-expanded={expanded}
            >
              {t("details")}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
              />
            </button>
            <button
              onClick={() => onSelect(offer)}
              className="h-10 rounded-full bg-ink px-5 text-[13px] font-semibold text-cream transition-all hover:bg-ink/90 hover:shadow-lift active:scale-[0.97]"
            >
              {t("select")}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-ink/5 bg-sand/40 p-5">
              {offer.itineraries.map((it, ii) => (
                <div key={ii} className="space-y-3">
                  {offer.itineraries.length > 1 && (
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-deep">
                      {ii === 0 ? t("outbound") : t("inbound")}
                    </p>
                  )}
                  {it.segments.map((s, si) => (
                    <div key={si}>
                      <div className="flex items-center gap-3 text-sm">
                        <AirlineMark code={s.airlineCode} />
                        <div className="flex-1">
                          <p className="font-medium text-ink">
                            {cityOf(s.origin, locale)} ({s.origin}) {timeOf(s.departureTime)}
                            {" → "}
                            {cityOf(s.destination, locale)} ({s.destination}){" "}
                            {timeOf(s.arrivalTime)}
                          </p>
                          <p className="text-xs text-ink-faint">
                            {s.airlineName} · {s.flightNumber}
                            {s.aircraft ? ` · ${s.aircraft}` : ""} ·{" "}
                            {formatDuration(s.durationMinutes, locale)}
                          </p>
                        </div>
                      </div>
                      {si < it.segments.length - 1 && (
                        <p className="ml-13 mt-2 rounded-lg bg-gold-soft/60 px-3 py-1.5 text-xs text-gold-deep">
                          {t("layoverIn", {
                            city: cityOf(s.destination, locale),
                            duration: formatDuration(
                              Math.round(
                                (new Date(it.segments[si + 1].departureTime).getTime() -
                                  new Date(s.arrivalTime).getTime()) /
                                  60000
                              ),
                              locale
                            ),
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 border-t border-ink/5 pt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft shadow-soft">
                  <Briefcase className="h-3.5 w-3.5 text-gold-deep" />
                  {t("cabinBaggage", { kg: offer.baggage.cabinKg })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft shadow-soft">
                  <Luggage className="h-3.5 w-3.5 text-gold-deep" />
                  {offer.baggage.checkedKg > 0
                    ? t("baggage", { kg: offer.baggage.checkedKg })
                    : t("noCheckedBag")}
                </span>
                {offer.refundable && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1.5 text-xs font-medium text-leaf">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t("refundable")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
