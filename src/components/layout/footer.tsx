"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { openConsentPreferences } from "@/components/consent/consent-events";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/5 bg-sand/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-ink-faint">
              {t("note")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-faint">
              {t("explore")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-ink-soft transition-colors hover:text-ink">
                  {tn("flights")}
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-ink-soft transition-colors hover:text-ink">
                  {tn("destinations")}
                </Link>
              </li>
              <li>
                <Link href="/planner" className="text-ink-soft transition-colors hover:text-ink">
                  {tn("planner")}
                </Link>
              </li>
              <li>
                <Link href="/visa" className="text-ink-soft transition-colors hover:text-ink">
                  {tn("visa")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-faint">
              {t("company")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-ink-soft transition-colors hover:text-ink">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-ink-soft transition-colors hover:text-ink">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-faint">
              {t("legal")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-ink-soft transition-colors hover:text-ink">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-ink-soft transition-colors hover:text-ink">
                  {t("cookies")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-ink-soft transition-colors hover:text-ink">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <button
                  onClick={openConsentPreferences}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {t("cookieSettings")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink/5 pt-8 text-xs text-ink-faint sm:flex-row">
          <p>
            © {year} Aviawings. {t("rights")}
          </p>
          <p className="font-display italic text-gold-deep">✈ {tc("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
