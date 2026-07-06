"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardStackItem {
  id: string | number;
}

export interface CardStackProps<T extends CardStackItem> {
  items: T[];
  renderCard: (item: T, state: { active: boolean }) => React.ReactNode;
  /** Accessible name for each dot / card (e.g. the city name) */
  getItemLabel?: (item: T) => string;
  initialIndex?: number;
  /** How many cards are visible around the active one (odd number) */
  maxVisible?: number;
  cardWidth?: number;
  cardHeight?: number;
  /** 0..0.9 — higher means neighbouring cards overlap more */
  overlap?: number;
  /** Total fan angle in degrees across the visible arc */
  spreadDeg?: number;
  perspectivePx?: number;
  depthPx?: number;
  tiltXDeg?: number;
  activeLiftPx?: number;
  activeScale?: number;
  inactiveScale?: number;
  loop?: boolean;
  autoAdvance?: boolean;
  intervalMs?: number;
  showDots?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
}

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

/** Signed distance from the active card to card i — shortest way around when looping. */
function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active;
  if (!loop || len <= 1) return raw;
  const alt = raw > 0 ? raw - len : raw + len;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export function CardStack<T extends CardStackItem>({
  items,
  renderCard,
  getItemLabel,
  initialIndex = 0,
  maxVisible = 7,
  cardWidth = 340,
  cardHeight = 450,
  overlap = 0.62,
  spreadDeg = 30,
  perspectivePx = 1100,
  depthPx = 120,
  tiltXDeg = 10,
  activeLiftPx = 18,
  activeScale = 1.04,
  inactiveScale = 0.94,
  loop = true,
  autoAdvance = false,
  intervalMs = 3200,
  showDots = true,
  prevLabel = "Previous",
  nextLabel = "Next",
  className,
}: CardStackProps<T>) {
  const reduceMotion = useReducedMotion();
  const len = items.length;

  // rawActive may drift outside [0, len) while looping; wrap at render so no
  // corrective effect is needed when items change.
  const [rawActive, setRawActive] = React.useState(initialIndex);
  const [hovering, setHovering] = React.useState(false);
  const active = wrapIndex(rawActive, len);

  // Set while a swipe is in flight so the click fired on release doesn't
  // trigger navigation inside the card.
  const draggedRef = React.useRef(false);

  const maxOffset = Math.max(1, Math.floor(maxVisible / 2));
  const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)));
  const stepDeg = spreadDeg / maxOffset;

  const prev = React.useCallback(() => {
    setRawActive((a) => {
      const cur = wrapIndex(a, len);
      return !loop && cur === 0 ? a : cur - 1;
    });
  }, [len, loop]);

  const next = React.useCallback(() => {
    setRawActive((a) => {
      const cur = wrapIndex(a, len);
      return !loop && cur === len - 1 ? a : cur + 1;
    });
  }, [len, loop]);

  React.useEffect(() => {
    if (!autoAdvance || reduceMotion || len <= 1 || hovering) return;
    const id = window.setInterval(next, Math.max(1200, intervalMs));
    return () => window.clearInterval(id);
  }, [autoAdvance, reduceMotion, len, hovering, intervalMs, next]);

  if (!len) return null;

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Stage */}
      <div
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            prev();
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            next();
          }
        }}
        className="relative w-full rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        style={{ height: cardHeight + activeLiftPx + 44 }}
      >
        {/* Soft floor shadow under the fan */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-24 w-3/4 rounded-full bg-ink/10 blur-3xl"
        />

        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ perspective: `${perspectivePx}px` }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const off = signedOffset(i, active, len, loop);
              const abs = Math.abs(off);
              if (abs > maxOffset) return null;

              const isActive = off === 0;
              const x = off * cardSpacing;
              const y = abs * 10 + (isActive ? -activeLiftPx : 0);
              const rotateZ = off * stepDeg;
              const rotateX = isActive ? 0 : tiltXDeg;
              const scale = isActive ? activeScale : inactiveScale;

              const dragProps =
                isActive && !reduceMotion
                  ? {
                      drag: "x" as const,
                      dragConstraints: { left: 0, right: 0 },
                      dragElastic: 0.18,
                      onDragStart: () => {
                        draggedRef.current = true;
                      },
                      onDragEnd: (_event: unknown, info: PanInfo) => {
                        const travel = info.offset.x;
                        const speed = info.velocity.x;
                        const threshold = Math.min(160, cardWidth * 0.22);
                        if (travel > threshold || speed > 650) prev();
                        else if (travel < -threshold || speed < -650) next();
                        // click dispatches before this macrotask runs
                        window.setTimeout(() => {
                          draggedRef.current = false;
                        }, 0);
                      },
                    }
                  : {};

              return (
                <motion.div
                  key={item.id}
                  className={cn(
                    "absolute bottom-0 select-none overflow-hidden rounded-2xl border border-ink/10 will-change-transform",
                    isActive
                      ? "cursor-grab shadow-lift active:cursor-grabbing"
                      : "cursor-pointer shadow-card"
                  )}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    zIndex: 100 - abs,
                    transformStyle: "preserve-3d",
                  }}
                  initial={
                    reduceMotion ? false : { opacity: 0, x, y: y + 40, rotateZ, scale }
                  }
                  animate={{ opacity: 1 - abs * 0.08, x, y, rotateZ, rotateX, scale }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  onClick={() => setRawActive(i)}
                  onClickCapture={(e) => {
                    if (draggedRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  {...dragProps}
                >
                  <div
                    className="h-full w-full"
                    style={{
                      transform: `translateZ(${-abs * depthPx}px)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {renderCard(item, { active: isActive })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls — above the dipping corners of the fanned side cards */}
      <div className="relative z-[110] mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label={prevLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink-soft transition-colors hover:border-gold hover:text-gold-deep"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {showDots && (
          <div className="flex items-center gap-2">
            {items.map((it, idx) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setRawActive(idx)}
                aria-label={getItemLabel?.(it) ?? String(it.id)}
                aria-current={idx === active}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === active
                    ? "w-6 bg-gold"
                    : "w-2 bg-ink/20 hover:bg-ink/40"
                )}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={next}
          aria-label={nextLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink-soft transition-colors hover:border-gold hover:text-gold-deep"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
