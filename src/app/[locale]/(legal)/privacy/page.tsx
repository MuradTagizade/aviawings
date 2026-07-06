import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/components/legal-page";
import { contentLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Privacy" };

const CONTENT = {
  tr: {
    title: "Gizlilik Politikası",
    body: (
      <>
        <p>
          Aviawings olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu politika,
          6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel
          Veri Koruma Tüzüğü (GDPR) kapsamında hangi verileri neden topladığımızı ve
          nasıl koruduğumuzu açıklar.
        </p>
        <h2>Topladığımız veriler</h2>
        <ul>
          <li>Hesap bilgileri: ad, e-posta adresi, telefon (üyelik ve rezervasyon için)</li>
          <li>Rezervasyon bilgileri: yolcu adları, doğum tarihi, kimlik/pasaport numarası (biletleme zorunluluğu)</li>
          <li>Kullanım verileri: arama geçmişi, tercih edilen rotalar (deneyimi iyileştirmek için)</li>
          <li>Çerezler: onayınıza bağlı analitik ve pazarlama çerezleri</li>
        </ul>
        <h2>Verilerin kullanımı</h2>
        <p>
          Verileriniz yalnızca rezervasyon işlemlerinin gerçekleştirilmesi, yasal
          yükümlülüklerin yerine getirilmesi, hizmetin iyileştirilmesi ve — açık
          onayınız varsa — pazarlama iletişimi için kullanılır. Verileriniz hiçbir
          koşulda üçüncü taraflara satılmaz.
        </p>
        <h2>Veri paylaşımı</h2>
        <p>
          Biletleme için gerekli yolcu bilgileri yalnızca ilgili havayolu ve lisanslı
          acente iş ortaklarımızla paylaşılır. Analitik ve reklam hizmetleri (Google,
          Meta) yalnızca çerez onayınız kapsamında veri işler.
        </p>
        <h2>Haklarınız</h2>
        <p>
          KVKK ve GDPR kapsamında verilerinize erişme, düzeltme, silme ve işlemeye
          itiraz etme hakkına sahipsiniz. Talepleriniz için{" "}
          <a href="mailto:privacy@aviawings.com">privacy@aviawings.com</a> adresine
          yazabilirsiniz.
        </p>
        <h2>Veri güvenliği</h2>
        <p>
          Tüm veri aktarımı TLS ile şifrelenir; veriler erişim kontrolü ve satır
          düzeyinde güvenlik (RLS) uygulanan altyapıda saklanır.
        </p>
      </>
    ),
  },
  en: {
    title: "Privacy Policy",
    body: (
      <>
        <p>
          At Aviawings we take the security of your personal data seriously. This policy
          explains what we collect, why, and how we protect it under the EU General Data
          Protection Regulation (GDPR) and Türkiye&apos;s KVKK.
        </p>
        <h2>Data we collect</h2>
        <ul>
          <li>Account details: name, email, phone (for membership and bookings)</li>
          <li>Booking details: passenger names, date of birth, ID/passport number (required for ticketing)</li>
          <li>Usage data: search history, preferred routes (to improve your experience)</li>
          <li>Cookies: analytics and marketing cookies, subject to your consent</li>
        </ul>
        <h2>How we use data</h2>
        <p>
          Your data is used solely to process bookings, meet legal obligations, improve
          the service and — with your explicit consent — for marketing communication.
          We never sell your data to third parties.
        </p>
        <h2>Data sharing</h2>
        <p>
          Passenger details required for ticketing are shared only with the relevant
          airline and our licensed agency partners. Analytics and advertising services
          (Google, Meta) process data only within the scope of your cookie consent.
        </p>
        <h2>Your rights</h2>
        <p>
          Under GDPR and KVKK you have the right to access, rectify, erase and object
          to the processing of your data. Contact us at{" "}
          <a href="mailto:privacy@aviawings.com">privacy@aviawings.com</a>.
        </p>
        <h2>Security</h2>
        <p>
          All data in transit is encrypted with TLS; data at rest is protected with
          access controls and row-level security (RLS).
        </p>
      </>
    ),
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[contentLocale(locale)];
  return (
    <LegalShell locale={locale} title={c.title}>
      {c.body}
    </LegalShell>
  );
}
