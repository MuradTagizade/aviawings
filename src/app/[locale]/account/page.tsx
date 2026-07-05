import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AccountClient } from "@/components/account/account-client";

export const metadata: Metadata = { robots: { index: false } };

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountClient />;
}
