"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Thermometer,
} from "lucide-react";
import type { Destination } from "@/content/destinations";
import { addDays, formatDateISO } from "@/lib/utils";

function iconFor(code: number | null) {
  if (code === null) return CloudSun;
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code <= 48) return Cloud;
  if (code <= 57) return CloudDrizzle;
  if (code <= 67 || (code >= 80 && code <= 82)) return CloudRain;
  if (code <= 77 || (code >= 85 && code <= 86)) return CloudSnow;
  return CloudRain;
}

interface ForecastDay {
  date: string;
  high: number | null;
  low: number | null;
  rain: number | null;
  code: number | null;
}

export function WeatherPanel({ destination }: { destination: Destination }) {
  const t = useTranslations("destinations.weather");
  const locale = useLocale() as "tr" | "en";
  const sp = useSearchParams();

  const depart = sp.get("depart");
  const ret = sp.get("return");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxForecast = addDays(today, 15);

  const departDate = depart ? new Date(`${depart}T00:00:00`) : null;
  const withinForecast =
    departDate !== null && departDate >= today && departDate <= maxForecast;

  const start = withinForecast ? depart! : formatDateISO(today);
  const endDate = withinForecast
    ? ret && new Date(`${ret}T00:00:00`) <= maxForecast
      ? new Date(`${ret}T00:00:00`)
      : addDays(departDate!, 4)
    : addDays(today, 5);
  const end = formatDateISO(endDate > maxForecast ? maxForecast : endDate);

  const useForecast = withinForecast || !departDate;

  const query = useQuery<{ days: ForecastDay[] }>({
    queryKey: ["weather", destination.slug, start, end],
    enabled: useForecast,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const res = await fetch(
        `/api/weather?lat=${destination.lat}&lon=${destination.lon}&start=${start}&end=${end}`
      );
      if (!res.ok) throw new Error("weather_failed");
      return res.json();
    },
  });

  const dayFmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    weekday: "short",
    day: "numeric",
  });
  const monthFmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    month: "long",
  });

  /* Far-future dates → climate normals from curated data */
  if (!useForecast && departDate) {
    const m = departDate.getMonth();
    const [high, low, rainDays] = destination.climate[m];
    return (
      <div>
        <p className="mb-4 text-sm text-ink-soft">
          {t("typical", { month: monthFmt.format(departDate) })}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-surface p-4 text-center shadow-soft">
            <Thermometer className="mx-auto h-5 w-5 text-coral" />
            <p className="mt-2 font-display text-2xl text-ink">{high}°</p>
            <p className="text-xs text-ink-faint">{t("high")}</p>
          </div>
          <div className="rounded-xl bg-surface p-4 text-center shadow-soft">
            <Thermometer className="mx-auto h-5 w-5 text-sky" />
            <p className="mt-2 font-display text-2xl text-ink">{low}°</p>
            <p className="text-xs text-ink-faint">{t("low")}</p>
          </div>
          <div className="rounded-xl bg-surface p-4 text-center shadow-soft">
            <Droplets className="mx-auto h-5 w-5 text-sky" />
            <p className="mt-2 font-display text-2xl text-ink">{rainDays}</p>
            <p className="text-xs text-ink-faint">
              {locale === "tr" ? "yağışlı gün/ay" : "rainy days/mo"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-faint">{t("note")}</p>
      </div>
    );
  }

  return (
    <div>
      {depart && (
        <p className="mb-4 text-sm text-ink-soft">{t("forDates")}</p>
      )}
      {query.isLoading && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-32 w-24 shrink-0 rounded-xl" />
          ))}
        </div>
      )}
      {query.data && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {query.data.days.map((d) => {
            const Icon = iconFor(d.code);
            return (
              <div
                key={d.date}
                className="w-24 shrink-0 rounded-xl bg-surface p-3.5 text-center shadow-soft"
              >
                <p className="text-[11px] font-medium capitalize text-ink-faint">
                  {dayFmt.format(new Date(`${d.date}T00:00:00`))}
                </p>
                <Icon className="mx-auto my-2 h-6 w-6 text-gold-deep" />
                <p className="text-sm font-semibold text-ink">
                  {d.high !== null ? Math.round(d.high) : "–"}°
                </p>
                <p className="text-xs text-ink-faint">
                  {d.low !== null ? Math.round(d.low) : "–"}°
                </p>
                {d.rain !== null && d.rain > 20 && (
                  <p className="mt-1 flex items-center justify-center gap-0.5 text-[10px] text-sky">
                    <Droplets className="h-3 w-3" />
                    {d.rain}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      {query.isError && (
        <p className="text-sm text-ink-faint">{t("note")}</p>
      )}
      <p className="mt-3 text-xs text-ink-faint">{t("note")}</p>
    </div>
  );
}
