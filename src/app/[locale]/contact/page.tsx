import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Mail, MessageCircle, Clock3 } from "lucide-react";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = { title: "Contact" };

const CONTENT = {
  tr: {
    title: "İletişim",
    intro: "Sorularınız için buradayız. Genellikle birkaç saat içinde yanıt veririz.",
    cards: [
      { icon: Mail, title: "E-posta", text: "destek@aviawings.com", href: "mailto:destek@aviawings.com" },
      { icon: MessageCircle, title: "Sosyal medya", text: "@aviawings", href: undefined },
      { icon: Clock3, title: "Destek saatleri", text: "Her gün 09:00 – 22:00 (GMT+4)", href: undefined },
    ],
  },
  en: {
    title: "Contact",
    intro: "We're here for your questions and usually reply within a few hours.",
    cards: [
      { icon: Mail, title: "Email", text: "support@aviawings.com", href: "mailto:support@aviawings.com" },
      { icon: MessageCircle, title: "Social", text: "@aviawings", href: undefined },
      { icon: Clock3, title: "Support hours", text: "Every day 09:00 – 22:00 (GMT+4)", href: undefined },
    ],
  },
};

export default async function ContactPage({
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
        <h1 className="font-display text-4xl text-ink sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-xl text-[15px] text-ink-soft">{c.intro}</p>
      </FadeIn>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {c.cards.map(({ icon: Icon, title, text, href }, i) => (
          <FadeIn key={title} delay={i * 0.08}>
            <div className="h-full rounded-2xl border border-ink/5 bg-white p-6 shadow-soft">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft">
                <Icon className="h-5 w-5 text-gold-deep" />
              </span>
              <h2 className="font-semibold text-ink">{title}</h2>
              {href ? (
                <a
                  href={href}
                  className="mt-1 block text-sm text-gold-deep underline underline-offset-4"
                >
                  {text}
                </a>
              ) : (
                <p className="mt-1 text-sm text-ink-soft">{text}</p>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
