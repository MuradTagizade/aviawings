"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { MARKET_CODES, MARKETS, marketName, type MarketCode } from "@/lib/market";
import { useMarket } from "@/hooks/use-market";
import { useMarketStore } from "@/stores/market";
import { usePreferences } from "@/stores/preferences";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

/**
 * Skyscanner-style market (country) picker. Switching market re-points
 * market content (routes, contacts, future offers), sets that market's
 * default currency, and — when the current language isn't offered
 * there — jumps to the market's default language.
 */
export function MarketSwitcher() {
  const locale = useLocale();
  const market = useMarket();
  const setMarket = useMarketStore((s) => s.setMarket);
  const setCurrency = usePreferences((s) => s.setCurrency);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  function switchTo(code: MarketCode) {
    setOpen(false);
    if (code === market.code) return;
    const next = MARKETS[code];
    setMarket(code);
    setCurrency(next.currency);
    if (!(next.languages as string[]).includes(locale)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace({ pathname, params: params as any } as any, {
        locale: next.defaultLocale,
      });
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-full border border-ink/10 px-3 text-xs font-semibold tracking-wide transition-colors",
          open ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
        )}
      >
        <span aria-hidden>{market.flag}</span>
        {market.code === "GLOBAL" ? "🌐" : market.code}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-50 mt-2 max-h-[60vh] w-52 overflow-y-auto rounded-2xl border border-ink/10 bg-surface p-1.5 shadow-lift"
          >
            {MARKET_CODES.map((code) => (
              <li key={code}>
                <button
                  role="option"
                  aria-selected={code === market.code}
                  onClick={() => switchTo(code)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    code === market.code
                      ? "bg-sand font-semibold text-ink"
                      : "text-ink-soft hover:bg-sand/60 hover:text-ink"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{MARKETS[code].flag}</span>
                    {marketName(code, locale)}
                  </span>
                  {code === market.code && (
                    <Check className="h-4 w-4 text-gold-deep" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
