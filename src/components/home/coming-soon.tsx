"use client";

import { useTranslations } from "next-intl";
import { BedDouble, Smartphone } from "lucide-react";
import { FadeIn, SectionHeader } from "@/components/fade-in";

/** Feature-flagged teaser — hidden entirely when the flag is off. */
const SHOW_TEASER = process.env.NEXT_PUBLIC_SHOW_COMING_SOON !== "false";

export function ComingSoon() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  if (!SHOW_TEASER) return null;

  const items = [
    { icon: BedDouble, title: t("soonHotels"), text: t("soonHotelsText") },
    { icon: Smartphone, title: t("soonEsim"), text: t("soonEsimText") },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <SectionHeader title={t("soonTitle")} />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, text }, i) => (
          <FadeIn key={title} delay={i * 0.08}>
            <div className="flex items-start gap-5 rounded-2xl border border-dashed border-gold/40 bg-gold-soft/30 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft">
                <Icon className="h-5 w-5 text-gold-deep" />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                  <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {tc("comingSoon")}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
