"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Plane } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center">
      <motion.div
        initial={{ rotate: -8, y: 8 }}
        animate={{ rotate: 8, y: -8 }}
        transition={{ repeat: Infinity, repeatType: "mirror", duration: 2.4, ease: "easeInOut" }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gold-soft"
      >
        <Plane className="h-9 w-9 text-gold-deep" />
      </motion.div>
      <p className="mt-8 font-display text-7xl text-ink/15">404</p>
      <h1 className="mt-2 font-display text-3xl text-ink">{t("title")}</h1>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-ink-soft">{t("text")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-semibold text-cream transition-all hover:bg-ink/90 hover:shadow-lift"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
