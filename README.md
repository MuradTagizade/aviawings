# ✈️ Aviawings

Premium uçak bileti ve akıllı seyahat platformu — Azerbaycan & Türkiye odaklı.
Next.js 16 · TypeScript · Tailwind v4 · Supabase · OpenRouter (Gemini 2.5 Flash)

Ürün detayları için: [docs/PRD.md](docs/PRD.md)

## Hızlı başlangıç

```bash
npm install
cp .env.example .env.local   # anahtarları doldurun (hepsi opsiyonel)
npm run dev                  # http://localhost:3000
```

Hiçbir API anahtarı olmadan da site tamamen çalışır:
- Uçuş araması gerçekçi **demo verilerle** döner ("demo veri" rozeti gösterilir)
- AI planlayıcı zarif bir "yakında" ekranı gösterir
- Üyelik özellikleri gizlenir

## Entegrasyonlar

| Servis | Env değişkeni | Nereden |
|---|---|---|
| Amadeus test API (uçuşlar) | `AMADEUS_CLIENT_ID/SECRET` | [developers.amadeus.com](https://developers.amadeus.com) — ücretsiz |
| OpenRouter (AI) | `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Supabase (auth + DB) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [supabase.com](https://supabase.com) — ücretsiz proje |
| GA4 / Meta Pixel | `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Reklam hesapları açılınca |

### Supabase kurulumu
1. Yeni proje oluşturun, URL + anon key'i `.env.local`'e girin
2. SQL Editor'da [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) dosyasını çalıştırın
3. Google girişi için: Authentication → Providers → Google'ı açın;
   redirect URL olarak `https://<siteniz>/auth/callback` ekleyin

## Vercel'e yayınlama

1. Projeyi GitHub'a push'layın:
   ```bash
   git remote add origin https://github.com/<kullanici>/aviawings.git
   git push -u origin main
   ```
2. [vercel.com/new](https://vercel.com/new) → repoyu import edin (framework otomatik algılanır)
3. Environment Variables bölümüne `.env.local` içeriğini ekleyin
4. `NEXT_PUBLIC_SITE_URL` değerini gerçek alan adınızla güncelleyin
5. Deploy — sitemap, güvenlik başlıkları ve SSG sayfalar otomatik gelir

## Mimari özet

```
src/
├── app/[locale]/        # tr | en sayfaları (App Router)
├── app/api/             # flights/search · weather · ai/chat (server-only anahtarlar)
├── components/          # search / flights / booking / destination / planner / consent ...
├── lib/flights/         # FlightProvider adaptörü: amadeus.ts | mock.ts
├── content/             # Destinasyon rehberi içeriği (çok dilli, tip güvenli)
├── messages/            # tr.json · en.json (yeni dil = yeni dosya)
└── stores/              # zustand: tercihler, rezervasyon
supabase/migrations/     # Şema + RLS politikaları
```

Aracı kurum API'si bağlanacağı zaman tek yapılacak:
`src/lib/flights/` altına `FlightProvider` arayüzünü uygulayan yeni bir dosya ekleyip
`provider.ts`'te sıraya almak.
