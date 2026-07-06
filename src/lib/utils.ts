import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number, locale: string) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const units: Record<string, [string, string]> = {
    tr: ["sa", "dk"],
    az: ["s", "dəq"],
    ru: ["ч", "м"],
    ka: ["სთ", "წთ"],
    tk: ["sag", "min"],
    kk: ["сағ", "мин"],
    uz: ["soat", "daq"],
    ky: ["саат", "мүн"],
  };
  const [hu, mu] = units[locale] ?? ["h", "m"];
  if (h === 0) return `${m}${mu}`;
  if (m === 0) return `${h}${hu}`;
  return `${h}${hu} ${m}${mu}`;
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
