"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowLeftRight, Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { findAirport, type Airport } from "@/lib/airports";
import { trackEvent } from "@/lib/analytics";
import { formatDateISO } from "@/lib/utils";
import { AirportAutocomplete } from "./airport-autocomplete";
import { DatePicker, type DateRange } from "./date-picker";
import { PaxSelector, type PaxState } from "./pax-selector";
import { cn } from "@/lib/utils";

interface InitialSearch {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: "economy" | "business";
}

export function SearchWidget({
  compact = false,
  initial,
}: {
  compact?: boolean;
  initial?: InitialSearch;
}) {
  const t = useTranslations("searchWidget");
  const router = useRouter();

  const [tripType, setTripType] = useState<"round" | "oneway">(
    initial && initial.departDate && !initial.returnDate ? "oneway" : "round"
  );
  const [origin, setOrigin] = useState<Airport | null>(
    initial?.origin ? findAirport(initial.origin) ?? null : null
  );
  const [destination, setDestination] = useState<Airport | null>(
    initial?.destination ? findAirport(initial.destination) ?? null : null
  );
  const [range, setRange] = useState<DateRange>({
    depart: initial?.departDate ? new Date(`${initial.departDate}T00:00:00`) : null,
    ret: initial?.returnDate ? new Date(`${initial.returnDate}T00:00:00`) : null,
  });
  const [pax, setPax] = useState<PaxState>({
    adults: initial?.adults ?? 1,
    children: initial?.children ?? 0,
    infants: initial?.infants ?? 0,
    cabin: initial?.cabin ?? "economy",
  });
  const [error, setError] = useState<string | null>(null);

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function submit() {
    if (!origin || !destination || !range.depart || (tripType === "round" && !range.ret)) {
      setError(t("errors.missingFields"));
      return;
    }
    if (origin.iata === destination.iata) {
      setError(t("errors.sameAirport"));
      return;
    }
    setError(null);

    const params = new URLSearchParams({
      from: origin.iata,
      to: destination.iata,
      depart: formatDateISO(range.depart),
      adults: String(pax.adults),
      children: String(pax.children),
      infants: String(pax.infants),
      cabin: pax.cabin,
    });
    if (tripType === "round" && range.ret) {
      params.set("return", formatDateISO(range.ret));
    }

    trackEvent("search", {
      origin: origin.iata,
      destination: destination.iata,
      depart: formatDateISO(range.depart),
    });

    router.push(`/flights?${params.toString()}`);
  }

  return (
    <motion.div
      initial={compact ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: compact ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        // z-20: backdrop-blur creates a stacking context, so the widget itself
        // must sit above later sections or its popovers get painted underneath
        "relative z-20 rounded-2xl border border-ink/5 bg-surface/95 shadow-lift backdrop-blur-sm",
        compact ? "p-4" : "p-5 sm:p-7"
      )}
    >
      {/* Trip type */}
      <div className="mb-4 inline-flex rounded-full bg-sand p-1">
        {(["round", "oneway"] as const).map((tt) => (
          <button
            key={tt}
            type="button"
            onClick={() => setTripType(tt)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-all",
              tripType === tt ? "bg-surface text-ink shadow-soft" : "text-ink-soft"
            )}
          >
            {tt === "round" ? t("roundTrip") : t("oneWay")}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_1.2fr_1fr_auto] lg:items-end">
        <AirportAutocomplete
          value={origin}
          onChange={setOrigin}
          label={t("from")}
          placeholder={t("fromPlaceholder")}
          kind="origin"
        />

        <button
          type="button"
          onClick={swap}
          aria-label={t("swap")}
          className="mx-auto mb-2 hidden h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink-soft transition-all hover:rotate-180 hover:border-gold hover:text-gold-deep lg:flex"
          style={{ transitionDuration: "400ms" }}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <AirportAutocomplete
          value={destination}
          onChange={setDestination}
          label={t("to")}
          placeholder={t("toPlaceholder")}
          kind="destination"
        />

        <DatePicker
          range={range}
          onChange={setRange}
          roundTrip={tripType === "round"}
          departLabel={t("departDate")}
          returnLabel={t("returnDate")}
          placeholder={t("selectDate")}
        />

        <PaxSelector pax={pax} onChange={setPax} label={t("passengersCabin")} />

        <button
          type="button"
          onClick={submit}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-[15px] font-semibold text-white shadow-soft transition-all hover:bg-gold-deep hover:shadow-lift active:scale-[0.98] lg:w-auto"
        >
          <Search className="h-4.5 w-4.5" />
          <span className="lg:hidden xl:inline">{t("searchFlights")}</span>
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-coral"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
