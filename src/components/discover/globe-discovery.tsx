"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type MapLibreGL from "maplibre-gl";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, Globe2, MapPin, Sparkles, Wand2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Map, MapControls, MapMarker } from "@/components/ui/map";
import { HIDDEN_GEMS, type HiddenGem } from "@/content/hidden-gems";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface WikiInfo {
  title: string;
  extract: string;
  thumbnail?: string;
  url?: string;
}

export function GlobeDiscovery() {
  const t = useTranslations("discover");
  const locale = useLocale();

  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const idleSpinRef = useRef(true);
  const aiAbortRef = useRef<AbortController | null>(null);
  const lastIndexRef = useRef<number>(-1);

  const [gem, setGem] = useState<HiddenGem | null>(null);
  const [wiki, setWiki] = useState<WikiInfo | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");

  const countryName = useMemo(() => {
    if (!gem) return "";
    try {
      return (
        new Intl.DisplayNames([locale], { type: "region" }).of(
          gem.countryCode
        ) ?? gem.countryCode
      );
    } catch {
      return gem.countryCode;
    }
  }, [gem, locale]);

  /* Gentle idle rotation until the user interacts or spins */
  useEffect(() => {
    const interval = setInterval(() => {
      const map = mapRef.current;
      if (!map || !idleSpinRef.current || map.isMoving()) return;
      const c = map.getCenter();
      map.jumpTo({ center: [c.lng + 0.25, c.lat] });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  /* ——— Spin ——— */
  async function spin() {
    if (phase === "spinning") return;
    const map = mapRef.current;
    setPhase("spinning");
    setWiki(null);
    setAiNote(null);
    aiAbortRef.current?.abort();

    // pick a random gem, never the same twice in a row
    let idx = Math.floor(Math.random() * HIDDEN_GEMS.length);
    if (idx === lastIndexRef.current) idx = (idx + 7) % HIDDEN_GEMS.length;
    lastIndexRef.current = idx;
    const next = HIDDEN_GEMS[idx];
    setGem(next);
    trackEvent("globe_spin", { place: next.name });

    idleSpinRef.current = false;
    map?.flyTo({
      center: [next.lon, next.lat],
      zoom: 4.5,
      duration: 2600,
      curve: 1.6,
      essential: true,
    });

    // fetch wiki while the globe travels
    const wikiPromise = fetch(
      `/api/wiki?q=${encodeURIComponent(next.wikiQuery)}&lang=${locale}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const [info] = await Promise.all([
      wikiPromise,
      new Promise((r) => setTimeout(r, 2400)),
    ]);
    setWiki(info);
    setPhase("revealed");

    // best-effort streaming AI teaser — aborted if the user spins again
    const controller = new AbortController();
    aiAbortRef.current = controller;
    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        mode: "chat",
        locale,
        messages: [
          {
            role: "user",
            content:
              {
                tr: `${next.name} (${next.countryCode}) hakkında beni oraya gitmeye ikna edecek 2 kısa, büyüleyici cümle yaz. Selamlama olmadan direkt başla.`,
                az: `${next.name} (${next.countryCode}) haqqında məni oraya getməyə inandıracaq 2 qısa, valehedici cümlə yaz. Salamlaşma olmadan birbaşa başla.`,
                ru: `Напиши 2 коротких, чарующих предложения о ${next.name} (${next.countryCode}), которые убедят меня туда поехать. Начни сразу, без приветствия.`,
              }[locale] ??
              `Write 2 short, enchanting sentences that would convince me to visit ${next.name} (${next.countryCode}). Start directly, no greeting.`,
          },
        ],
      }),
    })
      .then(async (r) => {
        if (!r.ok || !r.body) return;
        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done || controller.signal.aborted) break;
          acc += decoder.decode(value, { stream: true });
          setAiNote(acc);
        }
      })
      .catch(() => {});
  }

  useEffect(() => () => aiAbortRef.current?.abort(), []);

  const displayName = wiki?.title ?? gem?.name ?? "";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#16162a] px-6 py-12 sm:px-10">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(ellipse, #c9a96e 0%, transparent 65%)" }}
      />

      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        {/* ——— Copy + result card ——— */}
        <div className="order-2 lg:order-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <Globe2 className="h-4 w-4" />
            {t("hiddenGem")}
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#f2efe9] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/60">
            {t("subtitle")}
          </p>

          <button
            onClick={spin}
            disabled={phase === "spinning"}
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-[15px] font-semibold text-white transition-all hover:bg-gold-deep hover:shadow-lift disabled:opacity-60"
          >
            <motion.span
              animate={phase === "spinning" ? { rotate: 360 } : { rotate: 0 }}
              transition={
                phase === "spinning"
                  ? { repeat: Infinity, duration: 1, ease: "linear" }
                  : {}
              }
            >
              <Globe2 className="h-4.5 w-4.5" />
            </motion.span>
            {phase === "idle" ? t("spin") : phase === "spinning" ? t("spinning") : t("spinAgain")}
          </button>

          {/* ——— Result ——— */}
          <AnimatePresence mode="wait">
            {phase === "revealed" && gem && (
              <motion.div
                key={gem.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 overflow-hidden rounded-2xl bg-white/[0.06] backdrop-blur-sm"
              >
                {wiki?.thumbnail && (
                  <div className="relative h-44 w-full">
                    <Image
                      src={wiki.thumbnail}
                      alt={displayName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16162a] to-transparent" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                    {countryName}
                  </p>
                  <h3 className="mt-0.5 font-display text-2xl text-[#f2efe9]">
                    {displayName}
                  </h3>
                  {wiki?.extract && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">
                      {wiki.extract}
                    </p>
                  )}
                  {aiNote && (
                    <p className="mt-3 border-l-2 border-gold/60 pl-3 text-sm italic leading-relaxed text-gold/90">
                      <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                      {aiNote}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/planner?destination=${encodeURIComponent(gem.name)}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold px-4 text-[12px] font-semibold text-white transition-all hover:bg-gold-deep"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      {t("planTrip")}
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(`${gem.name}, ${countryName}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 px-4 text-[12px] font-medium text-white/80 transition-colors hover:border-gold hover:text-gold"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {t("viewOnMap")}
                    </a>
                    {wiki?.url && (
                      <a
                        href={wiki.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-white/50 transition-colors hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t("wikipedia")}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ——— Interactive globe (MapLibre) ——— */}
        <div className="order-1 mx-auto w-full max-w-[480px] lg:order-2">
          <div
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-full border border-white/10 shadow-lift transition-transform duration-300",
              phase === "spinning" && "scale-[1.02]"
            )}
            onPointerDown={() => {
              idleSpinRef.current = false;
            }}
          >
            <Map
              ref={mapRef}
              projection={{ type: "globe" }}
              center={[35, 25]}
              zoom={1.1}
              minZoom={0.8}
              maxZoom={10}
              scrollZoom={false}
              attributionControl={false}
            >
              <MapControls className="right-[18%] top-[8%]" />
              {gem && (
                <MapMarker longitude={gem.lon} latitude={gem.lat} onClick={spin}>
                  <span className="relative flex h-5 w-5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                    <span className="relative inline-flex h-5 w-5 rounded-full border-2 border-white bg-gold shadow-lg" />
                  </span>
                </MapMarker>
              )}
            </Map>
          </div>
        </div>
      </div>
    </section>
  );
}
