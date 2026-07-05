"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import createGlobe from "cobe";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, Globe2, MapPin, Sparkles, Wand2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HIDDEN_GEMS, type HiddenGem } from "@/content/hidden-gems";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface WikiInfo {
  title: string;
  extract: string;
  thumbnail?: string;
  url?: string;
}

/** cobe example formula: geographic coords → globe rotation angles */
function locationToAngles(lat: number, lon: number): [number, number] {
  return [Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
}

export function GlobeDiscovery() {
  const t = useTranslations("discover");
  const locale = useLocale() as "tr" | "en";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Rotation state lives in refs so onRender (60fps) avoids React re-renders
  const focusRef = useRef<[number, number] | null>(null);
  const currentRef = useRef<[number, number]>([0.3, 0.3]);
  const autoSpinRef = useRef(true);
  const markerRef = useRef<{ location: [number, number]; size: number }[]>([]);

  const [gem, setGem] = useState<HiddenGem | null>(null);
  const [wiki, setWiki] = useState<WikiInfo | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");
  const lastIndexRef = useRef<number>(-1);

  const countryName = useMemo(() => {
    if (!gem) return "";
    try {
      return (
        new Intl.DisplayNames([locale === "tr" ? "tr" : "en"], { type: "region" }).of(
          gem.countryCode
        ) ?? gem.countryCode
      );
    } catch {
      return gem.countryCode;
    }
  }, [gem, locale]);

  /* ——— Globe ——— */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let width = canvas.offsetWidth;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: currentRef.current[0],
      theta: currentRef.current[1],
      dark: 1,
      diffuse: 1.2,
      mapSamples: 18000,
      mapBrightness: 5.5,
      baseColor: [0.16, 0.16, 0.24],
      markerColor: [0.79, 0.66, 0.43],
      glowColor: [0.82, 0.75, 0.6],
      markers: [],
    });

    // cobe v2 has no onRender — drive the rotation with our own rAF loop
    let raf = 0;
    const tick = () => {
      if (focusRef.current) {
        // Ease toward the selected place
        const [tp, tt] = focusRef.current;
        const [cp, ct] = currentRef.current;
        const np = cp + (tp - cp) * 0.07;
        const nt = ct + (tt - ct) * 0.07;
        currentRef.current = [np, nt];
        if (Math.abs(tp - np) < 0.005 && Math.abs(tt - nt) < 0.005) {
          focusRef.current = null;
        }
      } else if (autoSpinRef.current) {
        currentRef.current = [currentRef.current[0] + 0.0025, currentRef.current[1]];
      }
      globe.update({
        phi: currentRef.current[0],
        theta: currentRef.current[1],
        markers: markerRef.current,
        width: width * 2,
        height: width * 2,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, []);

  /* ——— Spin ——— */
  async function spin() {
    if (phase === "spinning") return;
    setPhase("spinning");
    setWiki(null);
    setAiNote(null);

    // pick a random gem, never the same twice in a row
    let idx = Math.floor(Math.random() * HIDDEN_GEMS.length);
    if (idx === lastIndexRef.current) idx = (idx + 7) % HIDDEN_GEMS.length;
    lastIndexRef.current = idx;
    const next = HIDDEN_GEMS[idx];
    setGem(next);
    trackEvent("globe_spin", { place: next.name });

    // dramatic spin: several extra revolutions before easing onto the target
    autoSpinRef.current = false;
    const [tp, tt] = locationToAngles(next.lat, next.lon);
    focusRef.current = [tp + Math.PI * 6, tt];
    // normalize so easing distance stays sane
    currentRef.current = [currentRef.current[0] % (Math.PI * 2), currentRef.current[1]];
    markerRef.current = [{ location: [next.lat, next.lon], size: 0.09 }];

    // fetch wiki while the globe travels
    const wikiPromise = fetch(
      `/api/wiki?q=${encodeURIComponent(next.wikiQuery)}&lang=${locale}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const [info] = await Promise.all([
      wikiPromise,
      new Promise((r) => setTimeout(r, 2200)),
    ]);
    setWiki(info);
    setPhase("revealed");

    // best-effort AI one-liner (skips silently when AI is unavailable)
    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "chat",
        locale,
        messages: [
          {
            role: "user",
            content:
              locale === "tr"
                ? `${next.name} (${next.countryCode}) hakkında beni oraya gitmeye ikna edecek 2 kısa, büyüleyici cümle yaz. Selamlama olmadan direkt başla.`
                : `Write 2 short, enchanting sentences that would convince me to visit ${next.name} (${next.countryCode}). Start directly, no greeting.`,
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
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setAiNote(acc);
        }
      })
      .catch(() => {});
  }

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

        {/* ——— Globe ——— */}
        <div className="order-1 mx-auto w-full max-w-[420px] lg:order-2">
          <div
            className={cn(
              "relative aspect-square w-full transition-transform duration-300",
              phase === "spinning" && "scale-[1.02]"
            )}
          >
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-grab"
              style={{ contain: "layout paint size" }}
              onClick={spin}
              aria-label={t("spin")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
