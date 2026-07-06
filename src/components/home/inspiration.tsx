"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { InspirationItem } from "@/content/inspiration-pool";
import { SectionHeader } from "@/components/fade-in";
import { contentLocale } from "@/lib/locale";
import { CardStack } from "@/components/ui/card-stack";
import { cn } from "@/lib/utils";

export function Inspiration({ items }: { items: InspirationItem[] }) {
  const t = useTranslations("home");
  const td = useTranslations("destinations");
  const locale = contentLocale(useLocale());

  // The fan geometry needs pixel numbers, so measure the container and size
  // cards from it (0 = not yet measured; render after the observer fires to
  // keep server and first client render identical).
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const compact = width > 0 && width < 640;
  const cardWidth = compact
    ? Math.min(280, Math.max(200, Math.round(width * 0.62)))
    : 340;
  const cardHeight = Math.round(cardWidth * 1.32);

  return (
    <section className="overflow-hidden bg-sand/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t("inspiration")} subtitle={t("inspirationSub")} />
        <div ref={stageRef} className="min-h-[440px]">
          {width > 0 && (
            <CardStack
              items={items}
              maxVisible={compact ? 5 : 7}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              overlap={compact ? 0.82 : 0.62}
              spreadDeg={compact ? 18 : 30}
              autoAdvance
              intervalMs={3600}
              prevLabel={t("inspirationPrev")}
              nextLabel={t("inspirationNext")}
              getItemLabel={(d) => d.city[locale]}
              renderCard={(d, { active }) => (
                <Link
                  href={
                    d.slug
                      ? `/destinations/${d.slug}`
                      : `/planner?destination=${encodeURIComponent(d.query)}`
                  }
                  tabIndex={active ? 0 : -1}
                  draggable={false}
                  onClick={(e) => {
                    // inactive cards focus on click (handled by the stack)
                    if (!active) e.preventDefault();
                  }}
                  className="group relative block h-full w-full"
                >
                  <Image
                    src={d.image}
                    alt={d.city[locale]}
                    fill
                    sizes="(max-width: 640px) 70vw, 340px"
                    draggable={false}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-xs font-medium uppercase tracking-widest text-gold">
                      {d.country[locale]}
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-white sm:text-3xl">
                      {d.city[locale]}
                    </h3>
                    <div
                      className={cn(
                        "transition-opacity duration-300",
                        active ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <p className="mt-2 line-clamp-2 text-sm text-white/80">
                        {d.tagline[locale]}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-all group-hover:gap-2.5">
                        {d.slug ? td("explore") : t("plannerBannerCta")}
                        {d.slug ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            />
          )}
        </div>
      </div>
    </section>
  );
}
