# Aviawings — Ürün Gereksinim Dokümanı (PRD)

> Sürüm: 1.0 · Temmuz 2026 · Durum: V1 geliştirmesi tamamlandı (ön izleme)

## 1. Vizyon

Aviawings, Azerbaycan ve Türkiye pazarından başlayarak bölgeye, ardından dünyaya açılan
premium bir uçak bileti ve akıllı seyahat platformudur. Rakiplerinden farkı: bilet
aramayı **destinasyon keşfiyle** (hava durumu, etkinlikler, gezilecek yerler) ve
**yapay zekâ destekli kişisel planlamayla** birleştirmesidir.

**Hedef kitle:** AZ/TR arasında seyahat eden profesyoneller ve aileler; bölgeden
Avrupa/Körfez'e uçan gezginler; "nereye gitsem?" diyen ilham arayıcılar.

## 2. Marka ve Tasarım İlkeleri

- **İsim:** Aviawings (geçici — alan adı bulununca değişebilir; kod tabanında tek
  noktadan değiştirilebilir şekilde `Logo` bileşeni ve mesaj dosyalarında tutulur)
- **His:** Açık, ferah, premium. "10 bin dolarlık ajans işi" — sade ama özenli.
- **Palet:** Krem `#FAF8F5` zemin · Mürekkep `#1A1A2E` metin · Altın `#C9A96E` vurgu ·
  Gökyüzü mavisi `#35639B` ikincil
- **Tipografi:** Fraunces (display serif, başlıklar) + Inter (metin) — latin-ext ile
  Türkçe/Azerice karakter desteği
- **Animasyon:** Framer Motion; yumuşak fade/slide, mikro etkileşimler, `prefers-reduced-motion` desteği
- **Görsellik:** Gerçek şehir fotoğrafları (Unsplash + Wikimedia Commons); tüm görsel
  URL'leri derleme öncesi doğrulanmıştır

## 3. V1 Özellikleri (tamamlandı)

| # | Özellik | Notlar |
|---|---|---|
| 1 | Uçuş arama widget'ı | Autocomplete (TR/AZ öncelikli 28 havalimanı), çift takvim, yolcu/kabin seçici |
| 2 | Arama sonuçları | Filtre (aktarma/havayolu/saat/fiyat), sıralama (en iyi/ucuz/hızlı), ±3 gün esnek tarih şeridi, skeleton yükleme |
| 3 | Uçuş verisi adaptörü | `FlightProvider` arayüzü: Duffel → Amadeus → deterministik mock sıralı fallback; mock'ta `demo veri` rozeti gösterilir. ⚠️ Amadeus Self-Service 17 Tem 2026'da kapanıyor; **Duffel** hem test hem V2 gerçek biletleme yolu olarak seçildi |
| 4 | Rezervasyon akışı | 3 adım: yolcular (zod validasyonu) → özet → demo ödeme → animasyonlu onay; girişli kullanıcıda Supabase'e kayıt |
| 5 | Destinasyon rehberleri | 6 şehir (Bakü, İstanbul, Ankara, İzmir, Antalya, Gence): hava durumu (Open-Meteo; >16 gün için iklim ortalaması), gezilecek yerler, etkinlikler, pratik bilgiler |
| 6 | AI Seyahat Planlayıcı | 6 soruluk görsel quiz → Gemini 2.5 Flash (OpenRouter) → gün gün plan kartları → bağlamlı sohbet (streaming); anahtar yoksa zarif "yakında" durumu |
| 7 | Üyelik (Supabase) | Google + e-posta girişi, profil, favoriler, fiyat alarmı kaydı, rezervasyon geçmişi; RLS ile satır düzeyi izolasyon |
| 8 | Çerez onayı + reklam altyapısı | Google Consent Mode v2; kategori bazlı onay; GA4 + Meta Pixel yalnızca onay sonrası yüklenir; footer'dan tercih değişikliği |
| 9 | i18n | TR (varsayılan) + EN; URL tabanlı (`/tr`, `/en`); yeni dil = 1 JSON dosyası |
| 10 | Güvenlik | CSP, HSTS, X-Frame-Options; API anahtarları yalnız server-side; IP bazlı rate limiting; zod validasyonu; AI prompt sınırlama |
| 11 | SEO | Sitemap (hreflang'li), robots, OG meta, JSON-LD, SSG destinasyon sayfaları |
| 12 | Mobil | Mobile-first; bottom-sheet filtreler, tam ekran menü, dokunma hedefleri |

## 4. Yol Haritası

### V2 — Canlı satış
- Aracı kurum (konsolidatör) API entegrasyonu → `FlightProvider` arayüzüne yeni adaptör.
  Öncelikli aday: **Duffel** (offer → order akışıyla gerçek biletleme + ödeme; test adaptörü v1'de hazır)
- Gerçek ödeme (Stripe / yerel PSP) + 3-D Secure
- Fiyat alarmı e-posta bildirimleri (Supabase Edge Functions + cron)
- Bilet PDF'i ve e-posta gönderimi
- Oteller (arama + rezervasyon)

### V3 — Genişleme
- eSIM satışı (Airalo/benzeri API)
- Ek diller (AZ, RU, AR) — `src/messages/` + `routing.ts`'e ekleme yeterli
- Çok pazarlı fiyatlandırma, canlı döviz kuru beslemesi
- Mobil uygulama (React Native / Expo — mevcut API'ler yeniden kullanılır)

## 5. Teknik Mimari

- **Next.js 16 (App Router) + TypeScript + Tailwind v4** — Vercel'de barındırma
- **API route'ları** backend görevi görür: `/api/flights/search`, `/api/weather`, `/api/ai/chat`
- **Adaptör sözleşmesi:** `src/lib/flights/types.ts` → `FlightProvider.search(params): FlightSearchResult`
- **Supabase:** auth + Postgres; şema `supabase/migrations/0001_init.sql` (RLS politikaları dahil)
- **Statik içerik:** destinasyon rehberleri `src/content/destinations.ts` (tip güvenli, çok dilli)
- Kur dönüşümü şimdilik sabit yaklaşık oranlarla (`src/lib/currency.ts`) — V2'de canlı besleme

## 6. Analitik Olay Şeması (GA4 e-ticaret uyumlu)

| Olay | Tetiklenme |
|---|---|
| `search` | Uçuş araması yapıldığında |
| `select_item` | Sonuçta uçuş seçildiğinde |
| `begin_checkout` | Özet → ödeme adımına geçişte |
| `purchase` | (Demo) ödeme tamamlandığında |
| `ai_plan_requested` | AI plan istendiğinde |

Reklam dönüşümleri bu olaylar üzerinden Google Ads / Meta'ya bağlanır (onay şartıyla).

## 7. Güvenlik ve Uyumluluk

- KVKK + GDPR uyumlu gizlilik/çerez politikaları (`/privacy`, `/cookies`)
- Consent Mode v2: onay yoksa üçüncü taraf script yüklenmez
- Kişisel veri içeren tablolar RLS ile korunur; anon anahtar yalnız RLS arkasında
- Demo ödeme ekranında kart girişi devre dışıdır; canlı ödeme öncesi PCI-DSS kapsamı PSP'ye devredilir
- Görsel lisansları: Wikimedia Commons görselleri için sayfa altına atıf eklenmesi V2'de önerilir

## 8. Açık Konular

- [ ] Nihai marka adı ve alan adı
- [ ] Aracı kurum seçimi ve sözleşme (API dokümantasyonu gelince adaptör yazılacak)
- [ ] Kurumsal e-posta adresleri (destek@, privacy@)
- [ ] Google Ads / Meta Business hesaplarının açılması (ID'ler .env'e girilecek)
