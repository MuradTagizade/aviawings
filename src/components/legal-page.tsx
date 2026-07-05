import { getTranslations } from "next-intl/server";

export async function LegalShell({
  locale,
  title,
  children,
}: {
  locale: string;
  title: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const date = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "long",
  }).format(new Date("2026-07-05"));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
      <h1 className="font-display text-4xl text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-faint">{t("lastUpdated", { date })}</p>
      <div className="prose-avia mt-8">{children}</div>
    </div>
  );
}
