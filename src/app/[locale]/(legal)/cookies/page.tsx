import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/components/legal-page";

export const metadata: Metadata = { title: "Cookies" };

const CONTENT = {
  tr: {
    title: "Çerez Politikası",
    body: (
      <>
        <p>
          Aviawings, deneyiminizi iyileştirmek ve size uygun içerik sunmak için
          çerezler kullanır. İlk ziyaretinizde tercihlerinizi sorarız; sayfa altındaki
          &quot;Çerez tercihleri&quot; bağlantısından istediğiniz zaman
          değiştirebilirsiniz.
        </p>
        <h2>Çerez kategorileri</h2>
        <h3>Zorunlu çerezler</h3>
        <p>
          Oturum yönetimi, dil/para birimi tercihi ve güvenlik için gereklidir.
          Kapatılamazlar; kişisel profilleme yapmazlar.
        </p>
        <h3>Analitik çerezler (Google Analytics 4)</h3>
        <p>
          Siteyi nasıl kullandığınızı anonimleştirilmiş biçimde anlamamızı sağlar.
          Yalnızca onay verirseniz yüklenir.
        </p>
        <h3>Pazarlama çerezleri (Google Ads, Meta Pixel)</h3>
        <p>
          Size uygun kampanyaların gösterilmesini ve reklam performansının ölçülmesini
          sağlar. Yalnızca onay verirseniz yüklenir; onayınız Google Consent Mode v2
          standardıyla iletilir.
        </p>
        <h2>Onayın geri alınması</h2>
        <p>
          Onayınızı dilediğiniz an sayfa altındaki &quot;Çerez tercihleri&quot;
          bağlantısından geri alabilirsiniz. Onay geri alındığında ilgili çerezler
          yüklenmez ve mevcutları tarayıcınızdan silebilirsiniz.
        </p>
      </>
    ),
  },
  en: {
    title: "Cookie Policy",
    body: (
      <>
        <p>
          Aviawings uses cookies to improve your experience and show you relevant
          content. We ask for your preferences on your first visit; you can change them
          at any time via the &quot;Cookie preferences&quot; link in the footer.
        </p>
        <h2>Cookie categories</h2>
        <h3>Necessary cookies</h3>
        <p>
          Required for session management, language/currency preferences and security.
          They cannot be disabled and do not profile you.
        </p>
        <h3>Analytics cookies (Google Analytics 4)</h3>
        <p>
          Help us understand how the site is used, in anonymized form. Loaded only if
          you consent.
        </p>
        <h3>Marketing cookies (Google Ads, Meta Pixel)</h3>
        <p>
          Enable relevant offers and measurement of ad performance. Loaded only if you
          consent; your choice is signalled using the Google Consent Mode v2 standard.
        </p>
        <h2>Withdrawing consent</h2>
        <p>
          You can withdraw consent at any time via the &quot;Cookie preferences&quot;
          link in the footer. Once withdrawn, the related cookies are no longer loaded
          and you may clear existing ones from your browser.
        </p>
      </>
    ),
  },
};

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale as "tr" | "en"] ?? CONTENT.en;
  return (
    <LegalShell locale={locale} title={c.title}>
      {c.body}
    </LegalShell>
  );
}
