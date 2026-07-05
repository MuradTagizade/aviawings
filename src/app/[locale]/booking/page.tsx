import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BookingClient } from "@/components/booking/booking-client";

export const metadata: Metadata = { robots: { index: false } };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BookingClient />;
}
