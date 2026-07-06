"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Phone, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { openConsentPreferences } from "@/components/consent/consent-events";
import { regionalContact, socialUrl } from "@/lib/regional";
import { useMarket } from "@/hooks/use-market";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const year = new Date().getFullYear();
  const contact = regionalContact(useMarket().code);

  const socials = [
    { icon: InstagramIcon, href: socialUrl.instagram(contact), label: "Instagram" },
    { icon: FacebookIcon, href: socialUrl.facebook(contact), label: "Facebook" },
    { icon: Send, href: socialUrl.telegram(contact), label: "Telegram" },
    { icon: MessageCircle, href: socialUrl.whatsapp(contact), label: "WhatsApp" },
  ];

  return (
    <footer className="border-t border-ink/5 bg-sand/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-ink-faint">
              {t("note")}
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink-soft transition-colors hover:border-gold hover:text-gold-deep"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            {contact.phone && (
              <a
                href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                <Phone className="h-4 w-4 text-gold-deep" />
                {contact.phone}
              </a>
            )}
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
