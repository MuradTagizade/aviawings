"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { MoveRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { findAirport } from "@/lib/airports";
import { addDays, formatDateISO } from "@/lib/utils";
import { SectionHeader } from "@/components/fade-in";

const ROUTES: { from: string; to: string; image: string }[] = [
  {
    from: "IST",
    to: "GYD",
    image: "/img/destinations/baku-hero.jpg",
  },
  {
    from: "GYD",
    to: "IST",
    image:
      "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80",
  },
  {
    from: "IST",
    to: "LHR",
    image:
      "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80",
  },
  {
    from: "GYD",
    to: "DXB",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  },
  {
    from: "ESB",
    to: "GYD",
    image: "/img/destinations/baku-maiden-tower.jpg",
  },
  {
    from: "IST",
    to: "CDG",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  },
];

export function PopularRoutes() {
  const t = useTranslations("home");
  const locale = useLocale() as "tr" | "en";

  const depart = formatDateISO(addDays(new Date(), 14));
  const ret = formatDateISO(addDays(new Date(), 21));

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <SectionHeader title={t("popularRoutes")} subtitle={t("popularRoutesSub")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROUTES.map((r, i) => {
          const from = findAirport(r.from)!;
          const to = findAirport(r.to)!;
          return (
            <motion.div
              key={`${r.from}-${r.to}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/flights?from=${r.from}&to=${r.to}&depart=${depart}&return=${ret}&adults=1&children=0&infants=0&cabin=economy`}
                className="group relative block h-44 overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 hover:shadow-lift"
              >
                <Image
                  src={r.image}
                  alt={`${from.city[locale]} → ${to.city[locale]}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <p className="flex items-center gap-2 font-display text-xl text-white">
                      {from.city[locale]}
                      <MoveRight className="h-4 w-4 text-gold transition-transform duration-300 group-hover:translate-x-1" />
                      {to.city[locale]}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-widest text-white/70">
                      {r.from} — {r.to}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
