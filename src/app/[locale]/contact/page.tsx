import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/fade-in";
import { ContactCards } from "@/components/contact-cards";
import { contentLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Contact" };

const CONTENT = {
  tr: {
    title: "İletişim",
    intro: "Sorularınız için buradayız. Genellikle birkaç saat içinde yanıt veririz.",
    email: "E-posta",
    phone: "Telefon",
    social: "Sosyal medya",
    hours: "Destek saatleri",
  },
  en: {
    title: "Contact",
    intro: "We're here for your questions and usually reply within a few hours.",
    email: "Email",
    phone: "Phone",
    social: "Social",
    hours: "Support hours",
  },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[contentLocale(locale)];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:px-6">
      <FadeIn>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-xl text-[15px] text-ink-soft">{c.intro}</p>
      </FadeIn>
      <ContactCards
        labels={{ email: c.email, phone: c.phone, social: c.social, hours: c.hours }}
      />
    </div>
  );
}
