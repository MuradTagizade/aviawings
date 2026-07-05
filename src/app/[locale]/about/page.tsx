import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Compass, Globe2, Rocket, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = { title: "About" };

const CONTENT = {
  tr: {
    title: "Yolculuk, aramadan önce başlar.",
    intro:
      "Aviawings; Azerbaycan, Türkiye ve çevre bölgeler için tasarlanmış yeni nesil bir seyahat platformudur. Sadece bilet satmıyoruz — gideceğiniz şehrin havasını, etkinliklerini ve saklı köşelerini de yanınızda getiriyoruz.",
    values: [
      { icon: Compass, title: "Keşif odaklı", text: "Bilet arama deneyimini bir seyahat rehberiyle birleştiriyoruz." },
      { icon: ShieldCheck, title: "Güven", text: "Şeffaf fiyat, güvenli altyapı, gizliliğe saygı." },
      { icon: Globe2, title: "Bölgeden dünyaya", text: "Bakü ve İstanbul'dan başlayıp dünyaya açılan bir rota haritası." },
      { icon: Rocket, title: "Sürekli gelişim", text: "Oteller, eSIM ve daha fazlası yol haritamızda." },
    ],
  },
  en: {
    title: "The journey begins before the search.",
    intro:
      "Aviawings is a new-generation travel platform built for Azerbaijan, Türkiye and the surrounding region. We don't just sell tickets — we bring your destination's weather, events and hidden corners along with them.",
    values: [
      { icon: Compass, title: "Discovery first", text: "We blend flight search with a genuine travel guide." },
      { icon: ShieldCheck, title: "Trust", text: "Transparent pricing, secure infrastructure, respect for privacy." },
      { icon: Globe2, title: "Regional roots, global reach", text: "A route map that starts in Baku and Istanbul and opens to the world." },
      { icon: Rocket, title: "Always evolving", text: "Hotels, eSIM and more are on our roadmap." },
    ],
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale as "tr" | "en"] ?? CONTENT.en;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:px-6">
      <FadeIn>
        <h1 className="max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">
          {c.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{c.intro}</p>
      </FadeIn>
      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {c.values.map(({ icon: Icon, title, text }, i) => (
          <FadeIn key={title} delay={(i % 2) * 0.08}>
            <div className="h-full rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft">
                <Icon className="h-5 w-5 text-gold-deep" />
              </span>
              <h2 className="font-semibold text-ink">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
