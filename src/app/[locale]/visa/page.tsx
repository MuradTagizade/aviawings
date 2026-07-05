import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VISA_COUNTRIES } from "@/lib/visa";
import { VisaClient } from "@/components/visa/visa-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.visa" });
  return { title: t("title"), description: t("description") };
}

export default async function VisaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <VisaClient countryCodes={VISA_COUNTRIES} />
    </Suspense>
  );
}
