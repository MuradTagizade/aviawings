import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalShell } from "@/components/legal-page";
import { contentLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Terms" };

const CONTENT = {
  tr: {
    title: "Kullanım Şartları",
    body: (
      <>
        <p>
          Bu şartlar, Aviawings platformunun kullanımını düzenler. Siteyi kullanarak bu
          şartları kabul etmiş sayılırsınız.
        </p>
        <h2>Hizmetin kapsamı</h2>
        <p>
          Aviawings bir seyahat teknolojisi platformudur. Uçuş arama ve karşılaştırma
          hizmeti sunar; biletleme, lisanslı acente iş ortaklarımız aracılığıyla
          gerçekleştirilir. Şu an platform ön izleme aşamasındadır ve gösterilen bazı
          veriler örnek niteliğindedir; &quot;demo&quot; olarak işaretlenen işlemler
          gerçek bilet oluşturmaz.
        </p>
        <h2>Fiyatlar</h2>
        <p>
          Fiyatlar anlık müsaitliğe göre değişebilir. Farklı para birimlerindeki
          gösterimler yaklaşık kur ile hesaplanır; ödeme anındaki fiyat esastır.
        </p>
        <h2>Kullanıcı yükümlülükleri</h2>
        <ul>
          <li>Rezervasyonda doğru ve güncel yolcu bilgisi vermek</li>
          <li>Hesap güvenliğini (şifre) korumak</li>
          <li>Platformu hukuka aykırı amaçlarla kullanmamak</li>
        </ul>
        <h2>Yapay zekâ içerikleri</h2>
        <p>
          AI seyahat planlayıcısının önerileri bilgilendirme amaçlıdır; açılış saatleri,
          etkinlikler ve koşullar değişebilir. Seyahat kararlarınızı vermeden önce
          güncel bilgileri doğrulayın.
        </p>
        <h2>Sorumluluğun sınırlandırılması</h2>
        <p>
          Aviawings, havayolu kaynaklı gecikme, iptal ve program değişikliklerinden
          sorumlu tutulamaz. Yürürlükteki tüketici mevzuatından doğan haklarınız
          saklıdır.
        </p>
      </>
    ),
  },
  en: {
    title: "Terms of Service",
    body: (
      <>
        <p>
          These terms govern your use of the Aviawings platform. By using the site you
          agree to them.
        </p>
        <h2>Scope of service</h2>
        <p>
          Aviawings is a travel technology platform providing flight search and
          comparison. Ticketing is fulfilled through our licensed agency partners. The
          platform is currently in preview; some displayed data is sample data, and
          transactions marked &quot;demo&quot; do not issue real tickets.
        </p>
        <h2>Prices</h2>
        <p>
          Prices change with real-time availability. Amounts shown in other currencies
          use approximate exchange rates; the price at the moment of payment prevails.
        </p>
        <h2>Your responsibilities</h2>
        <ul>
          <li>Provide accurate, up-to-date passenger details</li>
          <li>Keep your account credentials secure</li>
          <li>Do not use the platform for unlawful purposes</li>
        </ul>
        <h2>AI-generated content</h2>
        <p>
          Suggestions from the AI travel planner are for inspiration; opening hours,
          events and conditions may change. Verify current information before making
          travel decisions.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          Aviawings is not liable for airline-caused delays, cancellations or schedule
          changes. Your statutory consumer rights remain unaffected.
        </p>
      </>
    ),
  },
};

export default async function TermsPage({
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
