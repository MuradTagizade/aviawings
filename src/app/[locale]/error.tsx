"use client";

import { useTranslations } from "next-intl";
import { CloudLightning } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-coral-soft">
        <CloudLightning className="h-9 w-9 text-coral" />
      </span>
      <h1 className="mt-8 font-display text-3xl text-ink">{t("title")}</h1>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-ink-soft">{t("text")}</p>
      <button
        onClick={reset}
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-semibold text-cream transition-all hover:bg-ink/90"
      >
        {t("cta")}
      </button>
    </div>
  );
}
