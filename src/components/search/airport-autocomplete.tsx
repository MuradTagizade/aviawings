"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import { searchAirports, type Airport } from "@/lib/airports";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

export function AirportAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  kind,
}: {
  value: Airport | null;
  onChange: (a: Airport | null) => void;
  placeholder: string;
  label: string;
  kind: "origin" | "destination";
}) {
  const locale = useLocale() as "tr" | "en";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const results = searchAirports(query, locale);

  useEffect(() => setHighlighted(0), [query]);

  function select(a: Airport) {
    onChange(a);
    setQuery("");
    setOpen(false);
  }

  const Icon = kind === "origin" ? PlaneTakeoff : PlaneLanding;

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      <div
        className={cn(
          "flex h-14 cursor-text items-center gap-3 rounded-xl border bg-white px-4 transition-colors",
          open ? "border-gold ring-2 ring-gold/20" : "border-ink/10 hover:border-ink/25"
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Icon className="h-4.5 w-4.5 shrink-0 text-gold-deep" />
        {open || !value ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlighted((h) => Math.min(h + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlighted((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter" && results[highlighted]) {
                e.preventDefault();
                select(results[highlighted]);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder={value ? value.city[locale] : placeholder}
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
            aria-label={label}
            autoComplete="off"
          />
        ) : (
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-[15px] font-medium text-ink">
              {value.city[locale]}
            </span>
            <span className="rounded bg-sand px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-ink-soft">
              {value.iata}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute z-50 mt-2 max-h-80 w-full min-w-72 overflow-auto rounded-2xl border border-ink/8 bg-white py-2 shadow-lift"
            role="listbox"
          >
            {results.map((a, i) => (
              <li key={a.iata}>
                <button
                  role="option"
                  aria-selected={i === highlighted}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => select(a)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === highlighted && "bg-sand/80"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-soft text-[11px] font-bold text-sky">
                    {a.iata}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {a.city[locale]}
                    </span>
                    <span className="block truncate text-xs text-ink-faint">
                      {a.name[locale]} · {a.country[locale]}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
