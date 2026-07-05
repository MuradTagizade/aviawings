"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Cookie, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  initConsentDefaults,
  readConsent,
  writeConsent,
} from "@/lib/analytics";
import { CONSENT_OPEN_EVENT } from "./consent-events";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-gold" : "bg-ink/15",
        disabled && "opacity-60"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export function CookieBanner() {
  const t = useTranslations("consent");
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    initConsentDefaults();
    const existing = readConsent();
    if (!existing) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    function reopen() {
      const existing = readConsent();
      if (existing) {
        setAnalytics(existing.analytics);
        setMarketing(existing.marketing);
      }
      setCustomizing(true);
      setVisible(true);
    }
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  function decide(a: boolean, m: boolean) {
    writeConsent({ analytics: a, marketing: m });
    setVisible(false);
    setCustomizing(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="safe-bottom fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md"
          role="dialog"
          aria-label={t("title")}
        >
          <div className="overflow-hidden rounded-2xl border border-ink/8 bg-surface shadow-lift">
            <div className="p-5 sm:p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-soft">
                    <Cookie className="h-4.5 w-4.5 text-gold-deep" />
                  </span>
                  <h2 className="font-display text-lg text-ink">{t("title")}</h2>
                </div>
                {customizing && (
                  <button
                    onClick={() => setVisible(false)}
                    className="rounded-full p-1 text-ink-faint hover:bg-sand"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-[13px] leading-relaxed text-ink-soft">
                {t("text")}{" "}
                <Link href="/cookies" className="underline decoration-gold underline-offset-2">
                  {t("policy")}
                </Link>
              </p>

              <AnimatePresence>
                {customizing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 border-t border-ink/5 pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-ink">{t("necessary")}</p>
                          <p className="text-xs text-ink-faint">{t("necessaryText")}</p>
                        </div>
                        <Toggle checked disabled label={t("necessary")} />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-ink">{t("analytics")}</p>
                          <p className="text-xs text-ink-faint">{t("analyticsText")}</p>
                        </div>
                        <Toggle checked={analytics} onChange={setAnalytics} label={t("analytics")} />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-ink">{t("marketing")}</p>
                          <p className="text-xs text-ink-faint">{t("marketingText")}</p>
                        </div>
                        <Toggle checked={marketing} onChange={setMarketing} label={t("marketing")} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {customizing ? (
                  <Button size="sm" variant="gold" onClick={() => decide(analytics, marketing)}>
                    {t("save")}
                  </Button>
                ) : (
                  <>
                    <Button size="sm" onClick={() => decide(true, true)}>
                      {t("acceptAll")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => decide(false, false)}>
                      {t("rejectAll")}
                    </Button>
                    <button
                      onClick={() => setCustomizing(true)}
                      className="ml-auto text-[13px] font-medium text-ink-soft underline decoration-ink/20 underline-offset-4 hover:text-ink"
                    >
                      {t("customize")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
