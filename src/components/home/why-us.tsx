"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { BadgeDollarSign, Compass, HeartHandshake, ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/fade-in";

const ITEMS = [
  { icon: BadgeDollarSign, title: "why1Title", text: "why1Text" },
  { icon: Compass, title: "why2Title", text: "why2Text" },
  { icon: ShieldCheck, title: "why3Title", text: "why3Text" },
  { icon: HeartHandshake, title: "why4Title", text: "why4Text" },
] as const;

export function WhyUs() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <SectionHeader title={t("whyTitle")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft transition-colors duration-300 group-hover:bg-gold">
              <Icon className="h-5 w-5 text-gold-deep transition-colors duration-300 group-hover:text-white" />
            </span>
            <h3 className="text-[15px] font-semibold text-ink">{t(title)}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t(text)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
