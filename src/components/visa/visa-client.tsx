"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  FileText,
  Globe2,
  StampIcon,
  TicketCheck,
} from "lucide-react";
import type { VisaResult, VisaStatus } from "@/lib/visa";
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

function CountrySelect({
  label,
  value,
  onChange,
  countries,
  names,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  countries: { code: string; name: string }[];
  names: Intl.DisplayNames | null;
  placeholder: string;
}) {
  void names;
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
              {c.name}
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

export function VisaClient({ countryCodes }: { countryCodes: string[] }) {
  const t = useTranslations("visa");
  const locale = useLocale() as "tr" | "en";
  const sp = useSearchParams();

  const [passport, setPassport] = useState(
    () => sp.get("passport")?.toUpperCase() ?? (locale === "tr" ? "TR" : "")
  );
  const [destination, setDestination] = useState(
    () => sp.get("destination")?.toUpperCase() ?? ""
  );

  const { countries, displayNames } = useMemo(() => {
    let dn: Intl.DisplayNames | null = null;
    try {
      dn = new Intl.DisplayNames([locale === "tr" ? "tr" : "en"], { type: "region" });
    } catch {
      // very old browsers — fall back to ISO codes
    }
    const collator = new Intl.Collator(locale === "tr" ? "tr" : "en");
    const list = countryCodes
      .map((code) => ({ code, name: dn?.of(code) ?? code }))
      .sort((a, b) => collator.compare(a.name, b.name));
    return { countries: list, displayNames: dn };
  }, [countryCodes, locale]);

  const ready = passport !== "" && destination !== "";

  const query = useQuery<VisaResult>({
    queryKey: ["visa", passport, destination],
    enabled: ready,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`/api/visa?passport=${passport}&destination=${destination}`);
      if (!res.ok) throw new Error("visa_failed");
      return res.json();
    },
  });

  const result = query.data;
  const style = result ? STATUS_STYLE[result.status] : null;
  const StatusIcon = style?.icon ?? BadgeCheck;

  const statusText = result
    ? result.status === "visa_free" && result.days
      ? t("status.visa_free_days", { days: result.days })
      : t(`status.${result.status}`)
    : "";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft">
          <StampIcon className="h-5 w-5 text-gold-deep" />
        </span>
        <h1 className="mt-4 text-center font-display text-4xl text-ink">{t("title")}</h1>
        <p className="mx-auto mt-2 max-w-md text-center text-[15px] text-ink-soft">
          {t("subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-10 rounded-2xl border border-ink/5 bg-surface p-6 shadow-card sm:p-8"
      >
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
          <CountrySelect
            label={t("passport")}
            value={passport}
            onChange={setPassport}
            countries={countries}
            names={displayNames}
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
            names={displayNames}
            placeholder={t("selectCountry")}
          />
        </div>

        <AnimatePresence mode="wait">
          {ready && (
            <motion.div
              key={`${passport}-${destination}-${query.status}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {query.isLoading && (
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

              {query.isError && (
                <p className="rounded-xl bg-coral-soft p-4 text-sm text-coral">
                  {t("disclaimer")}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-relaxed text-ink-faint">
        {t("disclaimer")}
      </p>
    </div>
  );
}
