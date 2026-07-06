# Aviawings — Proje Hafıza Dosyası (compact.md)

> Bu dosya, projenin tüm geçmişini ve kritik kararlarını özetler.
> **Yeni bir konuşma penceresinde çalışmaya başlamadan önce bu dosyayı oku.**
> Son güncelleme: 6 Temmuz 2026

## 1. Proje Kimliği

- **Ne:** Premium uçak bileti + akıllı seyahat platformu (avia sales benzeri). "10k dolarlık ajans işi" hissi, sade ama animasyonlu, AI yapımı gibi durmayan tasarım.
- **İsim:** Aviawings (geçici — iyi alan adı bulununca değişecek; `Logo` bileşeni + mesaj dosyalarından değişir)
- **Sahip:** Murad Tagizade (trendgo.az@gmail.com, Türkçe iletişim kurar, Azerbaycan bağlantılı)
- **Pazar:** Önce Azerbaycan + Türkiye, sonra bölge/dünya. Dil: TR (varsayılan) + EN; ileride AZ/RU eklenecek.
- **Repo:** https://github.com/MuradTagizade/aviawings (private yapıldı) · **Yayın:** Vercel (GitHub entegrasyonu, her push otomatik deploy)
- **Belgeler:** `docs/PRD.md` (vizyon + V2/V3 yol haritası), `README.md` (kurulum + deploy adımları)

## 2. Teknoloji Yığını

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 (token tabanlı) · Framer Motion (`motion`) · next-intl v4 (`/tr`, `/en` URL ön ekli) · TanStack Query · zustand · react-hook-form + zod · Supabase (auth+DB, RLS) · maplibre-gl · Node 24

**Tasarım sistemi:** Açık premium tema — krem `#FAF8F5` zemin, mürekkep `#1A1A2E`, altın `#C9A96E` vurgu. Fraunces (display serif) + Inter. Tüm renkler `globals.css` `@theme` token'ları; **dark mod** `.dark` sınıfıyla tüm token'ları değiştirir (yeni renk eklerken iki tema değeri de tanımlanmalı). `bg-white` YOK — `bg-surface` kullanılır (açıkta beyaz, koyuda `#1c1c2f`). Foto üstü gradyanlar `from-black/...` (ink KULLANMA — dark modda ters döner). Bilerek koyu kalan paneller `bg-[#16162a]` sabit.

## 3. Özellikler (hepsi tamamlandı, canlıda)

1. **Uçuş arama:** Ana sayfa hero + arama widget'ı (havalimanı autocomplete — `src/lib/airports.ts` 28 havalimanı, çift aylı takvim, yolcu/kabin seçici). Sonuç sayfası: filtreler (aktarma/havayolu/saat/fiyat), sıralama (en iyi/ucuz/hızlı), ±3 gün esnek tarih şeridi, skeleton yükleme, mobil bottom-sheet.
2. **Uçuş veri adaptörü** (`src/lib/flights/`): `FlightProvider` arayüzü → sıra: **Duffel → Amadeus (eski anahtarlar) → deterministik mock**. Mock'ta UI'da "demo veri" rozeti çıkar. Yeni aracı kurum = 1 dosya + `provider.ts`'e ekleme.
3. **Rezervasyon:** 3 adım (yolcular zod validasyonlu → özet → **demo ödeme**, kart girişi bilinçli devre dışı) → animasyonlu onay. Girişli kullanıcıda Supabase `bookings`'e kayıt.
4. **Destinasyon rehberleri:** 6 şehir (Bakü, İstanbul, Ankara, İzmir, Antalya, Gence) — `src/content/destinations.ts`. Open-Meteo canlı hava durumu (16+ gün ötesi için gömülü iklim ortalamaları), gezilecek yerler, etkinlikler, pratik bilgiler, favori butonu.
5. **Keşif küresi** (destinations sayfası tepesi): MapLibre **globe projeksiyonu** — gerçek dünya haritası, tema takipli Carto altlıkları (etiketsiz), boşta kendi dönüyor, "çevir" → sinematik flyTo ile **53 saklı cennetten** (`src/content/hidden-gems.ts`) rastgele birine iner, nabız atan altın marker + kart: yerelleştirilmiş Wikipedia bilgi/foto + akan AI anlatımı + planlayıcıya geçiş.
6. **AI Seyahat Planlayıcı** (`/planner`): "Avia Atlas" kıdemli seyahat tasarımcısı skill'i (`src/lib/ai/prompts.ts` — katı JSON şema sözleşmesi). 7 adımlı quiz: **serbest destinasyon** (dünyada her yer) → ay → stil → tempo → kiminle → bütçe → gün (2-10). Plan ekranı: Wikipedia foto+özet her durakta, Google Maps durak pinleri + **günlük rota linkleri** + gömülü şehir haritası, günlük bütçe tahmini, valiz listesi, 5 yerel ifade, ipuçları, bağlamlı streaming sohbet, **PDF indir** (print akışı) + **HTML indir** (bağımsız markalı dosya — `src/lib/plan-export.ts`).
7. **Vize sorgusu** (`/visa`): passport-index açık verisi (`src/data/visa-matrix.json`, 199×199). İki mod: tekli sorgu (bayraklı ülke seçiciler, renk kodlu sonuç) + **"Nereye vizesiz gidebilirim?"** (gruplu tıklanabilir çipler). Ülke adları `Intl.DisplayNames` ile otomatik yerelleşir. Destinasyon sayfalarındaki vize kartı buraya link verir.
8. **Üyelik (Supabase):** Google + e-posta girişi, hesap sayfası (yolculuklar/favoriler/fiyat alarmları/profil). Şema + RLS: `supabase/migrations/0001_init.sql`. Env yoksa tüm üyelik UI'ı zarifçe gizlenir.
9. **Çerez onayı + reklam:** Google **Consent Mode v2**, kategori bazlı banner; GA4 + Meta Pixel yalnız onay sonrası yüklenir (`src/lib/analytics.ts`). GA4 e-ticaret olayları hazır: search, select_item, begin_checkout, purchase, ai_plan_requested, plan_export, globe_spin.
10. **Dark mod:** Header'da güneş/ay düğmesi, sistem tercihi + localStorage (`aw-theme`), FOUC önleyici inline script layout'ta.
11. **PWA/mobil:** manifest + 192/512 ikonlar + apple-touch-icon (altın kanat/lacivert), safe-area destekleri, bottom-sheet'ler. Gelecekte iOS/Android app planlanıyor — API route'lar yeniden kullanılacak.
12. **SEO/güvenlik:** hreflang'li sitemap, robots, JSON-LD, OG. CSP + HSTS + X-Frame-Options; prod'da `unsafe-eval` yok; `poweredByHeader:false`; tüm API'lerde IP rate limit + zod; anahtarlar yalnız server-side.

## 4. API Route'ları

| Route | İş |
|---|---|
| `/api/flights/search` | Duffel→Amadeus→mock zinciri |
| `/api/ai/chat` | OpenRouter proxy — `mode:"plan"` (JSON plan) / `mode:"chat"` (streaming metin) |
| `/api/wiki` | Wikipedia özet+foto; TR için **langlink takibi** (Hagia Sophia→Ayasofya) |
| `/api/weather` | Open-Meteo proxy |
| `/api/visa` + `/api/visa/map` | Vize matrisi sorguları |
| `/auth/callback` | Supabase OAuth code exchange |

## 5. Anahtarlar / Env (.env.local — gitignore'da, repoya girmez)

- `OPENROUTER_API_KEY` = **girili ve test edildi** (model: `google/gemini-2.5-flash`). Kullanıcıya harcama limiti önerildi.
- `DUFFEL_ACCESS_TOKEN` = **girili ve test edildi** (test modu; gerçek havayolları dönüyor, fiyatlar GBP → kur dönüşümü halledildi)
- Supabase, GA4, Meta Pixel = **henüz boş** (kullanıcı hesap açınca girecek).
- **Vercel production env'leri girildi (6 Tem 2026):** OPENROUTER_API_KEY, OPENROUTER_MODEL,
  DUFFEL_ACCESS_TOKEN, NEXT_PUBLIC_SITE_URL=https://aviawings.vercel.app — AI planlayıcı
  canlıda AKTİF (503 "çok yakında" sorunu buydu). Proje `vercel link` ile bağlı
  (hesap: trendgoaz-5717), env eklemek için: `npx vercel env add <NAME> production`.

## 6. Kritik Kararlar ve Nedenleri

- **Amadeus ÖLDÜ:** Self-Service portal 17 Tem 2026'da kapanıyor, yeni kayıt alınmıyor (kullanıcı kayıt olamadı, web'den doğrulandı). Bu yüzden **Duffel** seçildi — aynı zamanda gerçek bir konsolidatör: **V2'de gerçek biletleme (offer→order) + ödeme Duffel üzerinden yapılacak** (öncelikli aday).
- **Görsel disiplini:** Tüm görseller tek tek curl + gözle doğrulandı (bir "Bakü" görseli Malezya çıkmıştı!). Wikimedia görselleri Next optimizer'da engellendiği için **`public/img/destinations/`'a indirildi** — yeni şehir eklerken aynı yöntem: indir, gözle doğrula, public'e koy. Wiki thumbnail'ları `<Image unoptimized>` ile gösterilir.
- **Kur:** Statik yaklaşık kurlar (`src/lib/currency.ts`, GBP/CHF dahil); bilinmeyen kod USD varsayılır. V2'de canlı FX beslemesi.
- **Vize verisi:** Statik JSON — **birkaç ayda bir güncellenmeli** (kaynak: github.com/ilyankou/passport-index-dataset, iso2 matrix CSV). Gelecek: ücretli API (Sherpa) VEYA iVisa/VisaHQ affiliate (gelir kanalı) — karar verilmedi.
- **PDF:** jsPDF değil, print-to-PDF akışı (Türkçe font sorunu yok, hafif).
- **postcss güvenlik açığı** package.json `overrides` ile kapatıldı (`next > postcss ^8.5.10`) — `npm audit` 0 olmalı.
- **Stacking context tuzağı:** `backdrop-blur` kullanan elemanların popover'ları alta düşer — kapsayıcıya `relative z-20` ver (arama widget'ında yaşandı).
- **eSIM/Oteller:** UI'dan tamamen kaldırıldı (kullanıcı istedi) — V2/V3'te dönecek (PRD'de).
- Carto altlıkları ücretsiz CDN — trafik büyüyünce (~75k görüntüleme/ay üstü) anahtarlı stile geçilmeli.

## 7. Çalışma Kuralları (bu projede öğrenilen)

- Her fazdan sonra: `npx eslint src` + `npx next build` + `npx next start -p <port>` ile curl duman testi → commit (Co-Authored-By: Claude Fable 5) → push (Vercel otomatik alır).
- React lint katı: effect içinde sync setState yasak, render'da ref erişimi yasak, render içinde bileşen tanımı yasak, "use" ile başlamayan fake hook adları kullan.
- Yeni metinler HEM `src/messages/tr.json` HEM `en.json`'a eklenir; yerelleşecek her şey mesaj dosyasından gelir.
- Yeni dış kaynak eklerken `next.config.ts` CSP'sine host eklemeyi unutma (img-src/connect-src/frame-src/worker-src).
- Kullanıcıya Türkçe yanıt verilir; teknik terimler İngilizce kalabilir.
- Global skills: `~/.claude/skills/` altına ui-ux-pro-max ailesi kuruldu (kullanıcı istedi).

## 7.5 İŞ MODELİ DEĞİŞTİ: AFFILIATE (5 Tem 2026)

Bilet SATILMAYACAK — metasearch/affiliate modeli: "Seç" butonu yolcuyu marker'lı
partner linkine yönlendirir (yeni sekme), ödeme partnerde olur, komisyon kazanılır.
- `src/lib/affiliate.ts`: `NEXT_PUBLIC_SALES_MODE` (affiliate|internal, varsayılan
  affiliate) + `NEXT_PUBLIC_TP_MARKER` (Travelpayouts marker'ı — KULLANICI KAYIT OLUP
  GİRECEK). Aviasales deep-link formatı Travelpayouts link builder'ı ile DOĞRULANMALI.
- Affiliate modda /booking kapalı (eski akış `internal` moduyla geri gelir — Duffel V2
  ihtimali için silinmedi). Footer notu 9 dilde affiliate açıklamasına çevrildi;
  results bildirimi "fiyatlar yaklaşık, kesin fiyat partner sitede" oldu.
- Sonuç fiyatları hâlâ Duffel-test/mock'tan geliyor → partner fiyatıyla birebir değil;
  ileride Travelpayouts Data API'ye geçilebilir.
- Sağlayıcı önerileri kullanıcıya iletildi: Travelpayouts (bireysel kabul, ana ağ),
  Kiwi.com, Trip.com, Booking (oteller için) vb.

## 7.6 UI/Metin Güncellemeleri (6 Tem 2026)

- **Slogan değişti:** "Zarafetle uç" → "Ucuza uç" (hero + footer tagline `common.tagline`),
  9 dilde çevrildi — affiliate/ucuz fiyat konumlandırmasına uygun.
- **"Nereye gitsem?" bölümü yenilendi:** Yatay kaydırma şeridi yerine 3D yelpaze kart
  destesi — yeni genel amaçlı bileşen `src/components/ui/card-stack.tsx`. Sürükle/tıkla/
  klavye/nokta+ok navigasyonu, otomatik ilerleme (hover'da durur, reduced-motion'da
  kapanır). Kart genişliği konteyner ölçümünden türetilir (mobil uyumlu). Kartların
  rehber/planlayıcı linkleri korundu.
- **Popüler rotalar mobilde gizlendi** (`hidden sm:block`) — mobil ana sayfa hero'dan
  direkt kart destesine geçiyor.
- 2 lint hatası düzeltildi: `visa-client.tsx` effect içi sync setState → türetilmiş
  state; ana sayfa ISR `Date.now()` kullanımı için eslint-disable + açıklama.
- **Not:** Bir push'ta Vercel otomatik deploy tetiklenmedi, `npx vercel deploy --prod
  --yes` ile manuel deploy edildi; sonraki push'ta otomatik çalıştı — tekrarlarsa
  GitHub entegrasyonunu kontrol et.

## 8. Sonraki Muhtemel Adımlar

1. Supabase projesi açılınca: env'leri gir (yerel + Vercel), migration'ı SQL Editor'da çalıştır, Google provider'ı aç (redirect: `https://<site>/auth/callback`)
2. GA4 + Meta Pixel ID'leri gelince env'e ekle (kod hazır, sadece ID bekliyor)
3. `NEXT_PUBLIC_SITE_URL`'i gerçek Vercel adresiyle güncelle + redeploy
4. V2: Duffel gerçek biletleme (offer→order) + ödeme, fiyat alarmı e-postaları (Supabase Edge Functions), oteller
5. V3: eSIM, canlı kur, mobil uygulama. ~~AZ/RU dilleri~~ → **TAMAMLANDI, sonra genişletildi
   (5 Tem 2026): 9 dil** — az/tr/en/ru/ka(Gürcüce)/tk(Türkmence)/kk(Kazakça)/uz(Özbekçe)/ky(Kırgızca).
   - UI mesajları 9 dilde tam (`src/messages/*.json`; yeni 5 dil AI çevirisi — native review önerilir)
   - Dil seçici dropdown'a dönüştü (`locale-switcher.tsx`, native adlar `LOCALE_NAMES`)
   - Editoryal içerik TR/EN; `contentLocale()`: Türk dilleri→tr, ka/ru→en fallback
   - **Pazar kişiselleştirme:** popüler rotalar dile göre o pazardan kalkıyor
     (`src/content/popular-routes.ts`), footer+contact sosyal medya/telefon dile göre
     (`src/lib/regional.ts` — telefonlar/hesaplar PLACEHOLDER, gerçekleri girilmeli)
   - **İlham havuzu:** 56 global destinasyon, 4 saatte bir deterministik 10'lu rotasyon
     (`src/content/inspiration-pool.ts`, ana sayfa `revalidate=14400` ISR). Rehberi olmayan
     kartlar AI planner'a gider. Tüm görseller tek tek vizüel doğrulandı.
   - Yeni havalimanları: NQZ, FRU, ASB, BUS. AI planner/chat 9 dilde yanıt veriyor;
     Wikipedia özetleri langlink ile yerelleşiyor.
   - Tema init script'i `public/theme-init.js`'e taşındı (`<script async src>`) — React 19
     "script tag while rendering" konsol hatası çözüldü.
   - **MARKET SİSTEMİ (Skyscanner modeli, 5 Tem 2026):** pazar ≠ dil ≠ para birimi.
     8 market: AZ/TR/GE/TM/KZ/UZ/KG/GLOBAL (`src/lib/market.ts` — tek kaynak).
     Geo-IP tespiti middleware'de (`src/proxy.ts`, Vercel `x-vercel-ip-country`) →
     `aw-market` cookie (1 yıl) → kök ziyarette pazarın diline yönlendirme
     (Accept-Language ∩ pazar dilleri, yoksa pazar varsayılanı). Header'da bayraklı
     MarketSwitcher; pazar değişince para birimi otomatik, dil pazar dışıysa varsayılana
     atlar. Dil seçici sadece pazarın dillerini gösterir (yerel+EN+RU). Pazar bazlı
     içerik: rotalar (`ROUTES_BY_MARKET`), iletişim/sosyal (`REGIONAL_CONTACTS`,
     market-keyed), vize varsayılan pasaportu. Yeni para birimleri: GEL/KZT/UZS/KGS
     (statik kur, canlı feed TODO). İleride ülkeye özel satış = market koduna bağlanacak.
     Client'ta market: `useMarket()` hook (SSR fallback dilden türer, cookie sonra düzeltir).
6. Vize verisini periyodik güncelle; ileride iVisa affiliate butonu (sonuç kartına tek buton)
7. Alan adı alınınca marka adı değişimi (Logo + mesajlar + manifest + PRD)
