"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Sparkles, Wand2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/fade-in";

export function PlannerBanner() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center sm:px-12 sm:py-20">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, #c9a96e 0%, transparent 65%)",
            }}
          />
          {/* Dotted flight path */}
          <svg
            aria-hidden
            viewBox="0 0 600 120"
            className="pointer-events-none absolute inset-x-0 top-6 mx-auto w-[600px] max-w-full opacity-25"
          >
            <path
              d="M20 100 Q 300 -40 580 90"
              fill="none"
              stroke="#c9a96e"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
          </svg>

          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.15 }}
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15"
          >
            <Sparkles className="h-6 w-6 text-gold" />
          </motion.span>

          <h2 className="mx-auto max-w-xl font-display text-3xl text-cream sm:text-4xl">
            {t("plannerBannerTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-cream/70">
            {t("plannerBannerText")}
          </p>
          <Link
            href="/planner"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-[15px] font-semibold text-white transition-all hover:bg-gold-deep hover:shadow-lift"
          >
            <Wand2 className="h-4 w-4" />
            {t("plannerBannerCta")}
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
