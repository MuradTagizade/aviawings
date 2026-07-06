import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { OG_LOCALES } from "@/lib/locale";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/consent/cookie-banner";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Edge-to-edge on notched phones; components pad with safe-area insets
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#121220" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    title: {
      default: t("title"),
      template: "%s — Aviawings",
    },
    description: t("description"),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      siteName: "Aviawings",
      type: "website",
      locale: OG_LOCALES[locale as Locale] ?? "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* async + src → React 19 hoists this as a resource (no client-render
            script warning); applies the saved theme before hydration. */}
        <script async src="/theme-init.js" />
      </head>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <Providers>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
