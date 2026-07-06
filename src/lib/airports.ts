import { contentLocale, intlLocale } from "@/lib/locale";

export interface Airport {
  iata: string;
  city: { tr: string; en: string };
  name: { tr: string; en: string };
  country: { tr: string; en: string };
  countryCode: string;
  lat: number;
  lon: number;
  /** Higher = shown first in autocomplete */
  priority: number;
}

export const AIRPORTS: Airport[] = [
  // ——— Azerbaijan ———
  { iata: "GYD", city: { tr: "Bakü", en: "Baku" }, name: { tr: "Haydar Aliyev Uluslararası", en: "Heydar Aliyev International" }, country: { tr: "Azerbaycan", en: "Azerbaijan" }, countryCode: "AZ", lat: 40.4675, lon: 50.0467, priority: 10 },
  { iata: "GNJ", city: { tr: "Gence", en: "Ganja" }, name: { tr: "Gence Uluslararası", en: "Ganja International" }, country: { tr: "Azerbaycan", en: "Azerbaijan" }, countryCode: "AZ", lat: 40.7377, lon: 46.3176, priority: 8 },
  { iata: "NAJ", city: { tr: "Nahçıvan", en: "Nakhchivan" }, name: { tr: "Nahçıvan Uluslararası", en: "Nakhchivan International" }, country: { tr: "Azerbaycan", en: "Azerbaijan" }, countryCode: "AZ", lat: 39.1888, lon: 45.4584, priority: 7 },
  // ——— Türkiye ———
  { iata: "IST", city: { tr: "İstanbul", en: "Istanbul" }, name: { tr: "İstanbul Havalimanı", en: "Istanbul Airport" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 41.2753, lon: 28.7519, priority: 10 },
  { iata: "SAW", city: { tr: "İstanbul", en: "Istanbul" }, name: { tr: "Sabiha Gökçen", en: "Sabiha Gökçen" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 40.8986, lon: 29.3092, priority: 9 },
  { iata: "ESB", city: { tr: "Ankara", en: "Ankara" }, name: { tr: "Esenboğa Havalimanı", en: "Esenboğa Airport" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 40.1281, lon: 32.9951, priority: 8 },
  { iata: "ADB", city: { tr: "İzmir", en: "Izmir" }, name: { tr: "Adnan Menderes", en: "Adnan Menderes" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 38.2924, lon: 27.157, priority: 8 },
  { iata: "AYT", city: { tr: "Antalya", en: "Antalya" }, name: { tr: "Antalya Havalimanı", en: "Antalya Airport" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 36.8987, lon: 30.8005, priority: 8 },
  { iata: "TZX", city: { tr: "Trabzon", en: "Trabzon" }, name: { tr: "Trabzon Havalimanı", en: "Trabzon Airport" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 40.9951, lon: 39.7897, priority: 6 },
  { iata: "ADA", city: { tr: "Adana", en: "Adana" }, name: { tr: "Şakirpaşa Havalimanı", en: "Şakirpaşa Airport" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 36.9822, lon: 35.2804, priority: 5 },
  { iata: "BJV", city: { tr: "Bodrum", en: "Bodrum" }, name: { tr: "Milas-Bodrum", en: "Milas-Bodrum" }, country: { tr: "Türkiye", en: "Türkiye" }, countryCode: "TR", lat: 37.2506, lon: 27.664, priority: 5 },
  // ——— Region & popular international ———
  { iata: "TBS", city: { tr: "Tiflis", en: "Tbilisi" }, name: { tr: "Tiflis Uluslararası", en: "Tbilisi International" }, country: { tr: "Gürcistan", en: "Georgia" }, countryCode: "GE", lat: 41.6692, lon: 44.9547, priority: 6 },
  { iata: "DXB", city: { tr: "Dubai", en: "Dubai" }, name: { tr: "Dubai Uluslararası", en: "Dubai International" }, country: { tr: "BAE", en: "UAE" }, countryCode: "AE", lat: 25.2532, lon: 55.3657, priority: 7 },
  { iata: "DOH", city: { tr: "Doha", en: "Doha" }, name: { tr: "Hamad Uluslararası", en: "Hamad International" }, country: { tr: "Katar", en: "Qatar" }, countryCode: "QA", lat: 25.2731, lon: 51.6081, priority: 5 },
  { iata: "LHR", city: { tr: "Londra", en: "London" }, name: { tr: "Heathrow", en: "Heathrow" }, country: { tr: "Birleşik Krallık", en: "United Kingdom" }, countryCode: "GB", lat: 51.47, lon: -0.4543, priority: 7 },
  { iata: "CDG", city: { tr: "Paris", en: "Paris" }, name: { tr: "Charles de Gaulle", en: "Charles de Gaulle" }, country: { tr: "Fransa", en: "France" }, countryCode: "FR", lat: 49.0097, lon: 2.5479, priority: 7 },
  { iata: "FRA", city: { tr: "Frankfurt", en: "Frankfurt" }, name: { tr: "Frankfurt Havalimanı", en: "Frankfurt Airport" }, country: { tr: "Almanya", en: "Germany" }, countryCode: "DE", lat: 50.0379, lon: 8.5622, priority: 6 },
  { iata: "BER", city: { tr: "Berlin", en: "Berlin" }, name: { tr: "Brandenburg", en: "Brandenburg" }, country: { tr: "Almanya", en: "Germany" }, countryCode: "DE", lat: 52.3667, lon: 13.5033, priority: 6 },
  { iata: "AMS", city: { tr: "Amsterdam", en: "Amsterdam" }, name: { tr: "Schiphol", en: "Schiphol" }, country: { tr: "Hollanda", en: "Netherlands" }, countryCode: "NL", lat: 52.3105, lon: 4.7683, priority: 5 },
  { iata: "VIE", city: { tr: "Viyana", en: "Vienna" }, name: { tr: "Viyana Uluslararası", en: "Vienna International" }, country: { tr: "Avusturya", en: "Austria" }, countryCode: "AT", lat: 48.1103, lon: 16.5697, priority: 5 },
  { iata: "FCO", city: { tr: "Roma", en: "Rome" }, name: { tr: "Fiumicino", en: "Fiumicino" }, country: { tr: "İtalya", en: "Italy" }, countryCode: "IT", lat: 41.8003, lon: 12.2389, priority: 5 },
  { iata: "BCN", city: { tr: "Barselona", en: "Barcelona" }, name: { tr: "El Prat", en: "El Prat" }, country: { tr: "İspanya", en: "Spain" }, countryCode: "ES", lat: 41.2974, lon: 2.0833, priority: 5 },
  { iata: "JFK", city: { tr: "New York", en: "New York" }, name: { tr: "John F. Kennedy", en: "John F. Kennedy" }, country: { tr: "ABD", en: "USA" }, countryCode: "US", lat: 40.6413, lon: -73.7781, priority: 5 },
  { iata: "SVO", city: { tr: "Moskova", en: "Moscow" }, name: { tr: "Şeremetyevo", en: "Sheremetyevo" }, country: { tr: "Rusya", en: "Russia" }, countryCode: "RU", lat: 55.9736, lon: 37.4125, priority: 4 },
  { iata: "ALA", city: { tr: "Almatı", en: "Almaty" }, name: { tr: "Almatı Uluslararası", en: "Almaty International" }, country: { tr: "Kazakistan", en: "Kazakhstan" }, countryCode: "KZ", lat: 43.3521, lon: 77.0405, priority: 4 },
  { iata: "TAS", city: { tr: "Taşkent", en: "Tashkent" }, name: { tr: "İslam Karimov", en: "Islam Karimov" }, country: { tr: "Özbekistan", en: "Uzbekistan" }, countryCode: "UZ", lat: 41.2579, lon: 69.2812, priority: 4 },
  { iata: "NQZ", city: { tr: "Astana", en: "Astana" }, name: { tr: "Nursultan Nazarbayev", en: "Nursultan Nazarbayev" }, country: { tr: "Kazakistan", en: "Kazakhstan" }, countryCode: "KZ", lat: 51.0272, lon: 71.4669, priority: 4 },
  { iata: "FRU", city: { tr: "Bişkek", en: "Bishkek" }, name: { tr: "Manas Uluslararası", en: "Manas International" }, country: { tr: "Kırgızistan", en: "Kyrgyzstan" }, countryCode: "KG", lat: 43.0613, lon: 74.4776, priority: 4 },
  { iata: "ASB", city: { tr: "Aşkabat", en: "Ashgabat" }, name: { tr: "Aşkabat Uluslararası", en: "Ashgabat International" }, country: { tr: "Türkmenistan", en: "Turkmenistan" }, countryCode: "TM", lat: 37.9868, lon: 58.361, priority: 4 },
  { iata: "BUS", city: { tr: "Batum", en: "Batumi" }, name: { tr: "Batum Uluslararası", en: "Batumi International" }, country: { tr: "Gürcistan", en: "Georgia" }, countryCode: "GE", lat: 41.6103, lon: 41.5997, priority: 3 },
  { iata: "IKA", city: { tr: "Tahran", en: "Tehran" }, name: { tr: "İmam Humeyni", en: "Imam Khomeini" }, country: { tr: "İran", en: "Iran" }, countryCode: "IR", lat: 35.4161, lon: 51.1522, priority: 3 },
  { iata: "TLV", city: { tr: "Tel Aviv", en: "Tel Aviv" }, name: { tr: "Ben Gurion", en: "Ben Gurion" }, country: { tr: "İsrail", en: "Israel" }, countryCode: "IL", lat: 32.0114, lon: 34.8867, priority: 3 },
];

export function findAirport(iata: string): Airport | undefined {
  return AIRPORTS.find((a) => a.iata === iata.toUpperCase());
}

export function searchAirports(query: string, locale: string): Airport[] {
  const loc = contentLocale(locale);
  const tag = intlLocale(locale);
  const q = query.toLocaleLowerCase(tag).trim();
  if (!q) {
    return [...AIRPORTS].sort((a, b) => b.priority - a.priority).slice(0, 8);
  }
  const scored = AIRPORTS.map((a) => {
    const city = a.city[loc].toLocaleLowerCase(tag);
    const name = a.name[loc].toLocaleLowerCase(tag);
    const country = a.country[loc].toLocaleLowerCase(tag);
    const iata = a.iata.toLowerCase();
    let score = 0;
    if (iata === q) score = 100;
    else if (city.startsWith(q)) score = 80;
    else if (iata.startsWith(q)) score = 70;
    else if (city.includes(q)) score = 50;
    else if (name.includes(q) || country.includes(q)) score = 30;
    return { a, score };
  })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score || y.a.priority - x.a.priority);
  return scored.slice(0, 8).map((s) => s.a);
}

/** Great-circle distance in km — used by the mock provider for realistic pricing */
export function distanceKm(a: Airport, b: Airport): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
