"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CURRENCIES } from "@/lib/currency";
import { usePreferences } from "@/stores/preferences";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

export function CurrencySwitcher() {
  const { currency, setCurrency } = usePreferences();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-sand hover:text-ink"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currency}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute right-0 top-11 z-50 w-28 overflow-hidden rounded-xl border border-ink/8 bg-surface py-1 shadow-lift"
          >
            {CURRENCIES.map((c) => (
              <li key={c}>
                <button
                  role="option"
                  aria-selected={c === currency}
                  onClick={() => {
                    setCurrency(c);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-sand",
                    c === currency ? "font-semibold text-gold-deep" : "text-ink-soft"
                  )}
                >
                  {c}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
