"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { SearchWidget } from "@/components/search/search-widget";

const HERO_IMG =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2200&q=80";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative">
      {/* Backdrop */}
      <div className="absolute inset-0 h-[560px] overflow-hidden sm:h-[600px]">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-full"
        >
          <Image
            src={HERO_IMG}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        {/* Soft cream veil so the light theme stays airy */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-cream/55 to-cream" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[42px] leading-[1.05] text-ink sm:text-6xl"
          >
            {t("heroTitle")}
            <br />
            <span className="italic text-gold-deep">{t("heroTitleAccent")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-lg text-base text-ink-soft sm:text-lg"
          >
            {t("heroSubtitle")}
          </motion.p>
        </div>

        <div className="mt-10 pb-6">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
