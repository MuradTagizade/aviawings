"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Users } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

export interface PaxState {
  adults: number;
  children: number;
  infants: number;
  cabin: "economy" | "business";
}

function Counter({
  value,
  min,
  max,
  onChange,
  label,
  sublabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-faint">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-gold hover:text-gold-deep disabled:opacity-30"
          aria-label={`${label} -`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-gold hover:text-gold-deep disabled:opacity-30"
          aria-label={`${label} +`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function PaxSelector({
  pax,
  onChange,
  label,
}: {
  pax: PaxState;
  onChange: (p: PaxState) => void;
  label: string;
}) {
  const t = useTranslations("searchWidget");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const totalPax = pax.adults + pax.children + pax.infants;

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-14 w-full items-center gap-2.5 rounded-xl border bg-surface px-3.5 text-left transition-colors",
          open ? "border-gold ring-2 ring-gold/20" : "border-ink/10 hover:border-ink/25"
        )}
      >
        <Users className="h-4.5 w-4.5 shrink-0 text-gold-deep" />
        <span className="truncate text-[15px] font-medium text-ink">
          {tc("passengers", { count: totalPax })} ·{" "}
          {pax.cabin === "economy" ? t("economy") : t("business")}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-ink/8 bg-surface p-5 shadow-lift"
          >
            <Counter
              label={t("adults")}
              sublabel={t("adultsAge")}
              value={pax.adults}
              min={1}
              max={9}
              onChange={(adults) =>
                onChange({ ...pax, adults, infants: Math.min(pax.infants, adults) })
              }
            />
            <Counter
              label={t("children")}
              sublabel={t("childrenAge")}
              value={pax.children}
              min={0}
              max={8}
              onChange={(children) => onChange({ ...pax, children })}
            />
            <Counter
              label={t("infants")}
              sublabel={t("infantsAge")}
              value={pax.infants}
              min={0}
              max={pax.adults}
              onChange={(infants) => onChange({ ...pax, infants })}
            />
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink/5 pt-4">
              {(["economy", "business"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ ...pax, cabin: c })}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                    pax.cabin === c
                      ? "border-gold bg-gold-soft text-gold-deep"
                      : "border-ink/10 text-ink-soft hover:border-ink/25"
                  )}
                >
                  {c === "economy" ? t("economy") : t("business")}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
