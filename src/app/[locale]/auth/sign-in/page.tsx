import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AuthClient } from "@/components/auth/auth-client";

export const metadata: Metadata = { robots: { index: false } };

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthClient mode="sign-in" />;
}
