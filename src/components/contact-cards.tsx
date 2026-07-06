"use client";

import { useLocale } from "next-intl";
import { Mail, MessageCircle, Phone, Clock3 } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { contentLocale } from "@/lib/locale";
import { regionalContact, socialUrl } from "@/lib/regional";
import { useMarket } from "@/hooks/use-market";

export interface ContactLabels {
  email: string;
  phone: string;
  social: string;
  hours: string;
}

/** Contact cards for the active market (client — market lives in a cookie). */
export function ContactCards({ labels }: { labels: ContactLabels }) {
  const loc = contentLocale(useLocale());
  const market = useMarket();
  const r = regionalContact(market.code);

  const cards = [
    { icon: Mail, title: labels.email, text: r.email, href: `mailto:${r.email}` },
    r.phone
      ? {
          icon: Phone,
          title: labels.phone,
          text: r.phone,
          href: `tel:${r.phone.replace(/[^+\d]/g, "")}`,
        }
      : null,
    {
      icon: MessageCircle,
      title: labels.social,
      text: `@${r.instagram}`,
      href: socialUrl.instagram(r),
    },
    { icon: Clock3, title: labels.hours, text: r.hours[loc], href: undefined },
  ].filter(Boolean) as {
    icon: typeof Mail;
    title: string;
    text: string;
    href?: string;
  }[];

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ icon: Icon, title, text, href }, i) => (
        <FadeIn key={title} delay={i * 0.08}>
          <div className="h-full rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft">
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
  );
}
