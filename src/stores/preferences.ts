"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/lib/currency";

interface PreferencesState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: "AZN",
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "aviawings-preferences" }
  )
);
