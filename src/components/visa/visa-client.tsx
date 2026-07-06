"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useMarket } from "@/hooks/use-market";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  FileText,
  Globe2,
  StampIcon,
  TicketCheck,
} from "lucide-react";
import type { VisaMapEntry, VisaResult, VisaStatus } from "@/lib/visa";
import { cn } from "@/lib/utils";

function flagEmoji(iso2: string) {
  return iso2
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

const STATUS_STYLE: Record<
  VisaStatus,
  { icon: typeof BadgeCheck; wrap: string; iconWrap: string }
> = {
  visa_free: { icon: BadgeCheck, wrap: "border-leaf/25 bg-leaf-soft", iconWrap: "bg-leaf text-white" },
  self: { icon: BadgeCheck, wrap: "border-leaf/25 bg-leaf-soft", iconWrap: "bg-leaf text-white" },
  visa_on_arrival: { icon: TicketCheck, wrap: "border-gold/30 bg-gold-soft/60", iconWrap: "bg-gold text-white" },
  eta: { icon: FileText, wrap: "border-gold/30 bg-gold-soft/60", iconWrap: "bg-gold text-white" },
  e_visa: { icon: FileText, wrap: "border-gold/30 bg-gold-soft/60", iconWrap: "bg-gold text-white" },
  visa_required: { icon: StampIcon, wrap: "border-coral/25 bg-coral-soft", iconWrap: "bg-coral text-white" },
  no_admission: { icon: CircleAlert, wrap: "border-ink/15 bg-sand", iconWrap: "bg-ink text-cream" },
};

interface CountryOption {
  code: string;
  name: string;
}

function CountrySelect({
  label,
  value,
  onChange,
  countries,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  countries: CountryOption[];
  placeholder: string;
}) {
  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
          {value ? flagEmoji(value) : <Globe2 className="h-4.5 w-4.5 text-gold-deep" />}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-14 w-full appearance-none rounded-xl border border-ink/10 bg-surface pl-12 pr-10 text-[15px] transition-colors",
            "hover:border-ink/25 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20",
            value ? "text-ink" : "text-ink-faint"
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {flagEmoji(c.code)} {c.name}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/* ——— "Where can I go" grouped chips ——— */

function MapGroups({
  entries,
  nameOf,
  onPick,
}: {
  entries: VisaMapEntry[];
  nameOf: (code: string) => string;
  onPick: (code: string) => void;
}) {
  const t = useTranslations("visa");
  const locale = useLocale();
  const collator = new Intl.Collator(locale);

  const groups: {
    key: "visa_free" | "visa_on_arrival" | "e_visa";
    statuses: VisaStatus[];
    chip: string;
    dot: string;
  }[] = [
    { key: "visa_free", statuses: ["visa_free"], chip: "bg-leaf-soft text-leaf hover:bg-leaf hover:text-white", dot: "bg-leaf" },
    { key: "visa_on_arrival", statuses: ["visa_on_arrival"], chip: "bg-gold-soft text-gold-deep hover:bg-gold hover:text-white", dot: "bg-gold" },
    { key: "e_visa", statuses: ["e_visa", "eta"], chip: "bg-sky-soft text-sky hover:bg-sky hover:text-white", dot: "bg-sky" },
  ];

  const requiredCount = entries.filter(
    (e) => e.status === "visa_required" || e.status === "no_admission"
  ).length;

  return (
    <div className="mt-8 space-y-8">
      {groups.map(({ key, statuses, chip, dot }) => {
        const list = entries
          .filter((e) => statuses.includes(e.status))
          .sort((a, b) => collator.compare(nameOf(a.code), nameOf(b.code)));
        if (list.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
              <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
              {t(`groups.${key}`, { count: list.length })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {list.map((e, i) => (
                <motion.button
                  key={e.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.008, 0.35), duration: 0.25 }}
                  onClick={() => onPick(e.code)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                    chip
                  )}
                >
                  <span aria-hidden>{flagEmoji(e.code)}</span>
                  {nameOf(e.code)}
                  {e.days !== undefined && (
                    <span className="opacity-70">· {t("daysShort", { days: e.days })}</span>
                  )}
                </motion.button>
              ))}
            </div>
          </section>
        );
      })}
      {requiredCount > 0 && (
        <p className="text-sm text-ink-faint">
          {t("groups.visa_required", { count: requiredCount })}
        </p>
      )}
    </div>
  );
}

export function VisaClient({ countryCodes }: { countryCodes: string[] }) {
  const t = useTranslations("visa");
  const locale = useLocale();
  const market = useMarket();
  const sp = useSearchParams();

  const [mode, setMode] = useState<"check" | "map">(
    sp.get("mode") === "map" ? "map" : "check"
  );
  const [passport, setPassport] = useState(
    () => sp.get("passport")?.toUpperCase() ?? market.countryCode
  );
  const [destination, setDestination] = useState(
    () => sp.get("destination")?.toUpperCase() ?? ""
  );

  // Market resolves from a cookie after mount — fill the passport default
  // in once known, unless the user (or the URL) already picked one.
  useEffect(() => {
    if (!sp.get("passport")) {
      setPassport((p) => p || market.countryCode);
    }
  }, [market.countryCode, sp]);

  const { countries, nameOf } = useMemo(() => {
    let dn: Intl.DisplayNames | null = null;
    try {
      dn = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      // very old browsers — fall back to ISO codes
    }
    const lookup = (code: string) => dn?.of(code) ?? code;
    const collator = new Intl.Collator(locale);
    const list = countryCodes
      .map((code) => ({ code, name: lookup(code) }))
      .sort((a, b) => collator.compare(a.name, b.name));
    return { countries: list, nameOf: lookup };
  }, [countryCodes, locale]);

  const checkReady = passport !== "" && destination !== "";

  const checkQuery = useQuery<VisaResult>({
    queryKey: ["visa", passport, destination],
    enabled: mode === "check" && checkReady,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`/api/visa?passport=${passport}&destination=${destination}`);
      if (!res.ok) throw new Error("visa_failed");
      return res.json();
    },
  });

  const mapQuery = useQuery<{ destinations: VisaMapEntry[] }>({
    queryKey: ["visa-map", passport],
    enabled: mode === "map" && passport !== "",
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`/api/visa/map?passport=${passport}`);
      if (!res.ok) throw new Error("visa_map_failed");
      return res.json();
    },
  });

  const result = checkQuery.data;
  const style = result ? STATUS_STYLE[result.status] : null;
  const StatusIcon = style?.icon ?? BadgeCheck;
  const statusText = result
    ? result.status === "visa_free" && result.days
      ? t("status.visa_free_days", { days: result.days })
      : t(`status.${result.status}`)
    : "";

  return (
    <div
      className={cn(
        "mx-auto px-4 pb-24 pt-28 sm:px-6",
        mode === "map" ? "max-w-4xl" : "max-w-2xl"
      )}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft">
          <StampIcon className="h-5 w-5 text-gold-deep" />
        </span>
        <h1 className="mt-4 text-center font-display text-4xl text-ink">{t("title")}</h1>
        <p className="mx-auto mt-2 max-w-md text-center text-[15px] text-ink-soft">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Mode switch */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full bg-sand p-1">
          {(["check", "map"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-medium transition-all sm:px-5",
                mode === m ? "bg-surface text-ink shadow-soft" : "text-ink-soft"
              )}
            >
              {m === "check" ? t("modeCheck") : t("modeMap")}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 rounded-2xl border border-ink/5 bg-surface p-6 shadow-card sm:p-8"
      >
        {mode === "check" ? (
          <>
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
              <CountrySelect
                label={t("passport")}
                value={passport}
                onChange={setPassport}
                countries={countries}
                placeholder={t("selectCountry")}
              />
              <span className="hidden pb-4 text-ink-faint sm:block">
                <ArrowRight className="h-5 w-5" />
              </span>
              <CountrySelect
                label={t("destination")}
                value={destination}
                onChange={setDestination}
                countries={countries}
                placeholder={t("selectCountry")}
              />
            </div>

            <AnimatePresence mode="wait">
              {checkReady && (
                <motion.div
                  key={`${passport}-${destination}-${checkQuery.status}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  {checkQuery.isLoading && (
                    <div className="flex items-center gap-3 rounded-xl bg-sand p-5">
                      <div className="skeleton h-10 w-10 rounded-full" />
                      <div className="skeleton h-4 w-48 rounded" />
                    </div>
                  )}

                  {result && style && (
                    <div className={cn("rounded-xl border p-5", style.wrap)}>
                      <div className="flex items-start gap-4">
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                            style.iconWrap
                          )}
                        >
                          <StatusIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[17px] font-semibold text-ink">{statusText}</p>
                          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                            {t(`desc.${result.status}`)}
                          </p>
                          <p className="mt-3 text-xs text-ink-faint">
                            {t("updated", { date: result.updated })} · {t("source")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {checkQuery.isError && (
                    <p className="rounded-xl bg-coral-soft p-4 text-sm text-coral">
                      {t("disclaimer")}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            <div className="sm:max-w-sm">
              <CountrySelect
                label={t("passport")}
                value={passport}
                onChange={setPassport}
                countries={countries}
                placeholder={t("selectCountry")}
              />
            </div>

            {passport && (
              <p className="mt-6 font-display text-xl text-ink">
                {t("mapTitle", { country: nameOf(passport) })}
              </p>
            )}

            {mapQuery.isLoading && (
              <div className="mt-6 flex flex-wrap gap-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 w-28 rounded-full" />
                ))}
              </div>
            )}

            {mapQuery.data && (
              <MapGroups
                entries={mapQuery.data.destinations}
                nameOf={nameOf}
                onPick={(code) => {
                  setDestination(code);
                  setMode("check");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </>
        )}
      </motion.div>

      <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-relaxed text-ink-faint">
        {t("disclaimer")}
      </p>
    </div>
  );
}
