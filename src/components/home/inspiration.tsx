"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DESTINATIONS } from "@/content/destinations";
import { SectionHeader } from "@/components/fade-in";

export function Inspiration() {
  const t = useTranslations("home");
  const td = useTranslations("destinations");
  const locale = useLocale() as "tr" | "en";

  return (
    <section className="bg-sand/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t("inspiration")} subtitle={t("inspirationSub")} />
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {DESTINATIONS.map((d, i) => (
          <motion.div
            key={d.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="snap-start"
          >
            <Link
              href={`/destinations/${d.slug}`}
              className="group relative block h-[420px] w-[300px] shrink-0 overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 hover:shadow-lift sm:w-[320px]"
            >
              <Image
                src={d.cardImage}
                alt={d.city[locale]}
                fill
                sizes="320px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-gold">
                  {d.country[locale]}
                </p>
                <h3 className="mt-1 font-display text-3xl text-white">
                  {d.city[locale]}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/80">
                  {d.tagline[locale]}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-all group-hover:gap-2.5">
                  {td("explore")}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
