import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { PopularRoutes } from "@/components/home/popular-routes";
import { Inspiration } from "@/components/home/inspiration";
import { PlannerBanner } from "@/components/home/planner-banner";
import { WhyUs } from "@/components/home/why-us";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return { title: t("title"), description: t("description") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Aviawings",
        url: base,
        logo: `${base}/icon.svg`,
      },
      {
        "@type": "WebSite",
        name: "Aviawings",
        url: base,
        inLanguage: ["tr", "en"],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <PopularRoutes />
      <Inspiration />
      <PlannerBanner />
      <WhyUs />
    </>
  );
}
