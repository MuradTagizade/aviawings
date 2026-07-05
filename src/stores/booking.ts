"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FlightOffer, FlightSearchParams } from "@/lib/flights/types";

interface BookingState {
  offer: FlightOffer | null;
  search: FlightSearchParams | null;
  setBooking: (offer: FlightOffer, search: FlightSearchParams) => void;
  clear: () => void;
}

/** Session-scoped so a selected offer survives the redirect to /booking. */
export const useBooking = create<BookingState>()(
  persist(
    (set) => ({
      offer: null,
      search: null,
      setBooking: (offer, search) => set({ offer, search }),
      clear: () => set({ offer: null, search: null }),
    }),
    {
      name: "aviawings-booking",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
