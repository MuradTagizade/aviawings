"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { formatDateISO } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { intlLocale } from "@/lib/locale";

interface DateRange {
  depart: Date | null;
  ret: Date | null;
}

function monthMatrix(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  // Monday-first grid
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function sameDay(a: Date | null, b: Date | null) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DatePicker({
  range,
  onChange,
  roundTrip,
  departLabel,
  returnLabel,
  placeholder,
}: {
  range: DateRange;
  onChange: (r: DateRange) => void;
  roundTrip: boolean;
  departLabel: string;
  returnLabel: string;
  placeholder: string;
}) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<"depart" | "ret">("depart");
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [viewDate, setViewDate] = useState(() => new Date());
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const fmt = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
  const monthFmt = new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
  });
  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 1); // a Monday
    const wf = new Intl.DateTimeFormat(intlLocale(locale), {
      weekday: "short",
    });
    return Array.from({ length: 7 }, (_, i) =>
      wf.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i))
    );
  }, [locale]);

  function pick(day: Date) {
    if (day < today) return;
    if (!roundTrip) {
      onChange({ depart: day, ret: null });
      setOpen(false);
      return;
    }
    if (picking === "depart" || (range.depart && day < range.depart)) {
      onChange({ depart: day, ret: null });
      setPicking("ret");
    } else {
      onChange({ ...range, ret: day });
      setOpen(false);
      setPicking("depart");
    }
  }

  function renderMonth(offset: number) {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth() + offset;
    const shown = new Date(y, m, 1);
    const cells = monthMatrix(shown.getFullYear(), shown.getMonth());
    return (
      <div className="w-full sm:w-72">
        <p className="mb-3 text-center text-sm font-semibold capitalize text-ink">
          {monthFmt.format(shown)}
        </p>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {weekdays.map((w) => (
            <span key={w} className="pb-1 text-[11px] font-medium uppercase text-ink-faint">
              {w}
            </span>
          ))}
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const disabled = day < today;
            const isStart = sameDay(day, range.depart);
            const isEnd = sameDay(day, range.ret);
            const inRange =
              range.depart && range.ret && day > range.depart && day < range.ret;
            return (
              <button
                key={day.toISOString()}
                disabled={disabled}
                onClick={() => pick(day)}
                className={cn(
                  "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  disabled && "text-ink-faint/40",
                  !disabled && !isStart && !isEnd && "hover:bg-gold-soft",
                  (isStart || isEnd) && "bg-ink font-semibold text-cream",
                  inRange && "bg-gold-soft/70 rounded-none",
                  sameDay(day, today) && !isStart && !isEnd && "font-bold text-gold-deep"
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
            {departLabel}
          </label>
          <button
            type="button"
            onClick={() => {
              setPicking("depart");
              setOpen((v) => !v);
            }}
            className={cn(
              "flex h-14 w-full items-center gap-2.5 rounded-xl border bg-surface px-3.5 text-left transition-colors",
              open && picking === "depart"
                ? "border-gold ring-2 ring-gold/20"
                : "border-ink/10 hover:border-ink/25"
            )}
          >
            <CalendarDays className="h-4.5 w-4.5 shrink-0 text-gold-deep" />
            <span
              className={cn(
                "truncate text-[15px]",
                range.depart ? "font-medium text-ink" : "text-ink-faint"
              )}
            >
              {range.depart ? fmt.format(range.depart) : placeholder}
            </span>
          </button>
        </div>
        {roundTrip && (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              {returnLabel}
            </label>
            <button
              type="button"
              onClick={() => {
                setPicking("ret");
                setOpen((v) => !v);
              }}
              className={cn(
                "flex h-14 w-full items-center gap-2.5 rounded-xl border bg-surface px-3.5 text-left transition-colors",
                open && picking === "ret"
                  ? "border-gold ring-2 ring-gold/20"
                  : "border-ink/10 hover:border-ink/25"
              )}
            >
              <CalendarDays className="h-4.5 w-4.5 shrink-0 text-gold-deep" />
              <span
                className={cn(
                  "truncate text-[15px]",
                  range.ret ? "font-medium text-ink" : "text-ink-faint"
                )}
              >
                {range.ret ? fmt.format(range.ret) : placeholder}
              </span>
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute left-1/2 z-50 mt-2 w-[calc(100vw-2rem)] max-w-[640px] -translate-x-1/2 rounded-2xl border border-ink/8 bg-surface p-5 shadow-lift sm:left-0 sm:w-auto sm:translate-x-0"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="rounded-full p-2 text-ink-soft transition-colors hover:bg-sand"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="rounded-full p-2 text-ink-soft transition-colors hover:bg-sand"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row">
              {renderMonth(0)}
              <div className="hidden sm:block">{renderMonth(1)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { DateRange };
export { formatDateISO };
