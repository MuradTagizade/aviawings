import { DESTINATIONS } from "./destinations";

type L = { tr: string; en: string };

export interface InspirationItem {
  id: string;
  city: L;
  country: L;
  tagline: L;
  image: string;
  /** Set when a full destination guide exists — card links to the guide */
  slug?: string;
  /** English destination text handed to the AI planner otherwise */
  query: string;
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

/**
 * 56-item global inspiration pool. Every image URL below has been
 * downloaded and visually verified against its city (project rule —
 * do the same when adding new ones; Unsplash search can mislabel).
 */
export const INSPIRATION_POOL: InspirationItem[] = [
  // ——— Cities with full guides ———
  ...DESTINATIONS.map((d) => ({
    id: d.slug,
    city: d.city,
    country: d.country,
    tagline: d.tagline,
    image: d.cardImage,
    slug: d.slug,
    query: d.city.en,
  })),

  // ——— Caucasus & around ———
  { id: "tbilisi", city: { tr: "Tiflis", en: "Tbilisi" }, country: { tr: "Gürcistan", en: "Georgia" }, tagline: { tr: "Kükürt hamamları ve asma balkonların şehri", en: "City of sulfur baths and hanging balconies" }, image: u("photo-1603350576276-24747f7bbf40"), query: "Tbilisi" },
  { id: "batumi", city: { tr: "Batum", en: "Batumi" }, country: { tr: "Gürcistan", en: "Georgia" }, tagline: { tr: "Karadeniz'in palmiyeli sahil şeridi", en: "Palm-lined boulevard on the Black Sea" }, image: u("photo-1577386308421-da4e279fa68a"), query: "Batumi" },
  { id: "moscow", city: { tr: "Moskova", en: "Moscow" }, country: { tr: "Rusya", en: "Russia" }, tagline: { tr: "Kızıl Meydan'dan Bolşoy'a ihtişam", en: "Grandeur from Red Square to the Bolshoi" }, image: u("photo-1565163694213-fe1d5aa2d358"), query: "Moscow" },
  { id: "st-petersburg", city: { tr: "St. Petersburg", en: "St. Petersburg" }, country: { tr: "Rusya", en: "Russia" }, tagline: { tr: "Beyaz geceler ve saray müzeleri", en: "White nights and palace museums" }, image: u("photo-1690831327125-470fa97acdc5"), query: "Saint Petersburg" },

  // ——— Central Asia ———
  { id: "almaty", city: { tr: "Almatı", en: "Almaty" }, country: { tr: "Kazakistan", en: "Kazakhstan" }, tagline: { tr: "Tanrı Dağları'nın eteğinde yeşil bir metropol", en: "A leafy metropolis beneath the Tian Shan" }, image: u("photo-1655444099262-c56de96c448d"), query: "Almaty" },
  { id: "astana", city: { tr: "Astana", en: "Astana" }, country: { tr: "Kazakistan", en: "Kazakhstan" }, tagline: { tr: "Bozkırın fütürist başkenti", en: "The steppe's futuristic capital" }, image: u("photo-1609779311020-db3879ad033a"), query: "Astana" },
  { id: "tashkent", city: { tr: "Taşkent", en: "Tashkent" }, country: { tr: "Özbekistan", en: "Uzbekistan" }, tagline: { tr: "Sovyet genişliği ile İpek Yolu mirası bir arada", en: "Soviet-era avenues meet Silk Road heritage" }, image: u("photo-1622021109028-8ba1d5374161"), query: "Tashkent" },
  { id: "samarkand", city: { tr: "Semerkant", en: "Samarkand" }, country: { tr: "Özbekistan", en: "Uzbekistan" }, tagline: { tr: "Registan'ın turkuaz kubbeleri", en: "The turquoise domes of the Registan" }, image: u("photo-1719144065955-89a4dadaba41"), query: "Samarkand" },
  { id: "bukhara", city: { tr: "Buhara", en: "Bukhara" }, country: { tr: "Özbekistan", en: "Uzbekistan" }, tagline: { tr: "İpek Yolu'nun açık hava müzesi", en: "The Silk Road's open-air museum" }, image: u("photo-1601963251218-816ff32e2baf"), query: "Bukhara" },
  { id: "bishkek", city: { tr: "Bişkek", en: "Bishkek" }, country: { tr: "Kırgızistan", en: "Kyrgyzstan" }, tagline: { tr: "Ala-Too'nun gölgesinde sakin bir başkent", en: "A laid-back capital in the shadow of Ala-Too" }, image: u("photo-1740686077650-6c20f67e6920"), query: "Bishkek" },
  { id: "issyk-kul", city: { tr: "Issık Göl", en: "Issyk-Kul" }, country: { tr: "Kırgızistan", en: "Kyrgyzstan" }, tagline: { tr: "Tanrı Dağları'nın turkuaz gölleri", en: "Turquoise lakes of the celestial mountains" }, image: u("photo-1583665470170-92eb0972a9ce"), query: "Issyk-Kul" },
  { id: "ashgabat", city: { tr: "Aşkabat", en: "Ashgabat" }, country: { tr: "Türkmenistan", en: "Turkmenistan" }, tagline: { tr: "Beyaz mermer bulvarların şehri", en: "City of white-marble boulevards" }, image: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Ashgabat_night_scene.jpg", query: "Ashgabat" },

  // ——— Middle East & Gulf ———
  { id: "dubai", city: { tr: "Dubai", en: "Dubai" }, country: { tr: "BAE", en: "UAE" }, tagline: { tr: "Çölün üzerinde yükselen gelecek", en: "The future rising out of the desert" }, image: u("photo-1512453979798-5ea266f8880c"), query: "Dubai" },
  { id: "abu-dhabi", city: { tr: "Abu Dabi", en: "Abu Dhabi" }, country: { tr: "BAE", en: "UAE" }, tagline: { tr: "Şeyh Zayed Camii'nin bembeyaz zarafeti", en: "The gleaming grace of the Grand Mosque" }, image: u("photo-1512970648279-ff3398568f77"), query: "Abu Dhabi" },
  { id: "doha", city: { tr: "Doha", en: "Doha" }, country: { tr: "Katar", en: "Qatar" }, tagline: { tr: "Körfez'in kültür ve gökdelen vitrini", en: "The Gulf's showcase of culture and skyline" }, image: u("photo-1685113872064-de4180a0ea93"), query: "Doha" },

  // ——— Europe ———
  { id: "rome", city: { tr: "Roma", en: "Rome" }, country: { tr: "İtalya", en: "Italy" }, tagline: { tr: "Sonsuz şehirde her taş bir hikâye", en: "In the Eternal City, every stone tells a story" }, image: u("photo-1552832230-c0197dd311b5"), query: "Rome" },
  { id: "venice", city: { tr: "Venedik", en: "Venice" }, country: { tr: "İtalya", en: "Italy" }, tagline: { tr: "Kanallar üzerinde süzülen bir rüya", en: "A dream drifting on canals" }, image: u("photo-1566984991763-91b985a3f9c2"), query: "Venice" },
  { id: "milan", city: { tr: "Milano", en: "Milan" }, country: { tr: "İtalya", en: "Italy" }, tagline: { tr: "Moda, tasarım ve Duomo", en: "Fashion, design and the Duomo" }, image: u("photo-1567760855784-589f09ed5dc6"), query: "Milan" },
  { id: "barcelona", city: { tr: "Barselona", en: "Barcelona" }, country: { tr: "İspanya", en: "Spain" }, tagline: { tr: "Gaudí'nin renkli Akdeniz sahnesi", en: "Gaudí's colorful Mediterranean stage" }, image: u("photo-1690403021832-4934d206cb5f"), query: "Barcelona" },
  { id: "madrid", city: { tr: "Madrid", en: "Madrid" }, country: { tr: "İspanya", en: "Spain" }, tagline: { tr: "Gran Vía'da hayat gece yarısı başlar", en: "On Gran Vía, life begins at midnight" }, image: u("photo-1543783207-ec64e4d95325"), query: "Madrid" },
  { id: "amsterdam", city: { tr: "Amsterdam", en: "Amsterdam" }, country: { tr: "Hollanda", en: "Netherlands" }, tagline: { tr: "Kanallar, bisikletler ve müzeler", en: "Canals, bicycles and world-class museums" }, image: u("photo-1536880756060-98a6a140f0a7"), query: "Amsterdam" },
  { id: "berlin", city: { tr: "Berlin", en: "Berlin" }, country: { tr: "Almanya", en: "Germany" }, tagline: { tr: "Tarih ve alternatif kültürün başkenti", en: "Capital of history and counterculture" }, image: u("photo-1597932552386-ad91621e4c8a"), query: "Berlin" },
  { id: "munich", city: { tr: "Münih", en: "Munich" }, country: { tr: "Almanya", en: "Germany" }, tagline: { tr: "Bavyera'nın bira bahçeli zarafeti", en: "Bavarian elegance with beer gardens" }, image: u("photo-1655644068192-4acc0fb73c84"), query: "Munich" },
  { id: "vienna", city: { tr: "Viyana", en: "Vienna" }, country: { tr: "Avusturya", en: "Austria" }, tagline: { tr: "Vals, kahvehane ve saraylar", en: "Waltzes, coffeehouses and palaces" }, image: u("photo-1757621850427-a234c0318e01"), query: "Vienna" },
  { id: "prague", city: { tr: "Prag", en: "Prague" }, country: { tr: "Çekya", en: "Czechia" }, tagline: { tr: "Yüz kulenin masalsı şehri", en: "The fairy-tale city of a hundred spires" }, image: u("photo-1659606446308-762bae0f3615"), query: "Prague" },
  { id: "budapest", city: { tr: "Budapeşte", en: "Budapest" }, country: { tr: "Macaristan", en: "Hungary" }, tagline: { tr: "Tuna'nın incisi, termal hamamların şehri", en: "Pearl of the Danube, city of thermal baths" }, image: u("photo-1500078974918-738828bc0422"), query: "Budapest" },
  { id: "athens", city: { tr: "Atina", en: "Athens" }, country: { tr: "Yunanistan", en: "Greece" }, tagline: { tr: "Akropolis'in gölgesinde antik yaşam", en: "Ancient life in the Acropolis' shadow" }, image: u("photo-1603565816030-6b389eeb23cb"), query: "Athens" },
  { id: "santorini", city: { tr: "Santorini", en: "Santorini" }, country: { tr: "Yunanistan", en: "Greece" }, tagline: { tr: "Mavi kubbeler ve Ege gün batımları", en: "Blue domes and Aegean sunsets" }, image: u("photo-1533441865127-f4806aaa12cc"), query: "Santorini" },
  { id: "lisbon", city: { tr: "Lizbon", en: "Lisbon" }, country: { tr: "Portekiz", en: "Portugal" }, tagline: { tr: "Sarı tramvaylar ve fado ezgileri", en: "Yellow trams and the sound of fado" }, image: u("photo-1585208798174-6cedd86e019a"), query: "Lisbon" },
  { id: "london", city: { tr: "Londra", en: "London" }, country: { tr: "Birleşik Krallık", en: "United Kingdom" }, tagline: { tr: "Köprüler, saraylar ve dünya mutfağı", en: "Bridges, palaces and world cuisine" }, image: u("photo-1533929736458-ca588d08c8be"), query: "London" },
  { id: "paris", city: { tr: "Paris", en: "Paris" }, country: { tr: "Fransa", en: "France" }, tagline: { tr: "Işıklar şehrinde her köşe bir kartpostal", en: "Every corner of the City of Light is a postcard" }, image: u("photo-1502602898657-3e91760cbb34"), query: "Paris" },

  // ——— Americas ———
  { id: "new-york", city: { tr: "New York", en: "New York" }, country: { tr: "ABD", en: "USA" }, tagline: { tr: "Hiç uyumayan şehir", en: "The city that never sleeps" }, image: u("photo-1496588152823-86ff7695e68f"), query: "New York" },
  { id: "los-angeles", city: { tr: "Los Angeles", en: "Los Angeles" }, country: { tr: "ABD", en: "USA" }, tagline: { tr: "Palmiyeler, plajlar ve Hollywood", en: "Palms, beaches and Hollywood" }, image: u("flagged/photo-1575555201693-7cd442b8023f"), query: "Los Angeles" },
  { id: "miami", city: { tr: "Miami", en: "Miami" }, country: { tr: "ABD", en: "USA" }, tagline: { tr: "Art deco sahilinde Latin ritimleri", en: "Latin rhythms on an art-deco shore" }, image: u("photo-1580650897134-f1de6c0f28b4"), query: "Miami" },
  { id: "rio", city: { tr: "Rio de Janeiro", en: "Rio de Janeiro" }, country: { tr: "Brezilya", en: "Brazil" }, tagline: { tr: "Samba, sahil ve Kurtarıcı İsa", en: "Samba, beaches and Christ the Redeemer" }, image: u("photo-1518639192441-8fce0a366e2e"), query: "Rio de Janeiro" },

  // ——— Asia & Pacific ———
  { id: "tokyo", city: { tr: "Tokyo", en: "Tokyo" }, country: { tr: "Japonya", en: "Japan" }, tagline: { tr: "Neon ışıklarla gelenek yan yana", en: "Neon lights beside ancient tradition" }, image: u("photo-1547448526-5e9d57fa28f7"), query: "Tokyo" },
  { id: "kyoto", city: { tr: "Kyoto", en: "Kyoto" }, country: { tr: "Japonya", en: "Japan" }, tagline: { tr: "Tapınaklar, çay evleri ve kiraz çiçekleri", en: "Temples, teahouses and cherry blossoms" }, image: u("photo-1512692723619-8b3e68365c9c"), query: "Kyoto" },
  { id: "seoul", city: { tr: "Seul", en: "Seoul" }, country: { tr: "Güney Kore", en: "South Korea" }, tagline: { tr: "K-kültürün ışıl ışıl kalbi", en: "The dazzling heart of K-culture" }, image: u("photo-1538485399081-7191377e8241"), query: "Seoul" },
  { id: "beijing", city: { tr: "Pekin", en: "Beijing" }, country: { tr: "Çin", en: "China" }, tagline: { tr: "Çin Seddi'nden Yasak Şehir'e", en: "From the Great Wall to the Forbidden City" }, image: u("photo-1508804185872-d7badad00f7d"), query: "Beijing" },
  { id: "shanghai", city: { tr: "Şanghay", en: "Shanghai" }, country: { tr: "Çin", en: "China" }, tagline: { tr: "Bund'dan yükselen fütürist silüet", en: "A futurist skyline rising over the Bund" }, image: u("photo-1614221330834-9399e5631af3"), query: "Shanghai" },
  { id: "bangkok", city: { tr: "Bangkok", en: "Bangkok" }, country: { tr: "Tayland", en: "Thailand" }, tagline: { tr: "Altın tapınaklar ve sokak lezzetleri", en: "Golden temples and street-food heaven" }, image: u("photo-1714672709462-de21a12a1339"), query: "Bangkok" },
  { id: "phuket", city: { tr: "Phuket", en: "Phuket" }, country: { tr: "Tayland", en: "Thailand" }, tagline: { tr: "Zümrüt koylar ve kireçtaşı kayalıklar", en: "Emerald bays and limestone cliffs" }, image: u("photo-1589394815804-964ed0be2eb5"), query: "Phuket" },
  { id: "bali", city: { tr: "Bali", en: "Bali" }, country: { tr: "Endonezya", en: "Indonesia" }, tagline: { tr: "Pirinç terasları ve tapınak adası", en: "Island of rice terraces and temples" }, image: u("photo-1555400038-63f5ba517a47"), query: "Bali" },
  { id: "singapore", city: { tr: "Singapur", en: "Singapore" }, country: { tr: "Singapur", en: "Singapore" }, tagline: { tr: "Bahçeler içinde bir gelecek şehri", en: "A city of the future set in gardens" }, image: u("photo-1525625293386-3f8f99389edd"), query: "Singapore" },
  { id: "kuala-lumpur", city: { tr: "Kuala Lumpur", en: "Kuala Lumpur" }, country: { tr: "Malezya", en: "Malaysia" }, tagline: { tr: "İkiz kulelerin altında kültür mozaiği", en: "A cultural mosaic beneath the Twin Towers" }, image: u("photo-1597148543182-830ef7bbb904"), query: "Kuala Lumpur" },
  { id: "maldives", city: { tr: "Maldivler", en: "Maldives" }, country: { tr: "Maldivler", en: "Maldives" }, tagline: { tr: "Su üstü villalar, camgöbeği lagünler", en: "Overwater villas and glass-clear lagoons" }, image: u("photo-1698726654908-834d3a5330d8"), query: "Maldives" },

  // ——— Africa ———
  { id: "cairo", city: { tr: "Kahire", en: "Cairo" }, country: { tr: "Mısır", en: "Egypt" }, tagline: { tr: "Piramitlerin bekçisi, Nil'in şehri", en: "Keeper of the pyramids, city of the Nile" }, image: u("photo-1539768942893-daf53e448371"), query: "Cairo" },
  { id: "sharm", city: { tr: "Şarm El-Şeyh", en: "Sharm El Sheikh" }, country: { tr: "Mısır", en: "Egypt" }, tagline: { tr: "Kızıldeniz'in mercan bahçeleri", en: "Coral gardens of the Red Sea" }, image: u("photo-1748667866987-fcbf24ff832f"), query: "Sharm El Sheikh" },
  { id: "marrakech", city: { tr: "Marakeş", en: "Marrakech" }, country: { tr: "Fas", en: "Morocco" }, tagline: { tr: "Medinanın baharat kokulu labirenti", en: "The medina's spice-scented labyrinth" }, image: u("photo-1570135460237-510ca82c6781"), query: "Marrakech" },
  { id: "cape-town", city: { tr: "Cape Town", en: "Cape Town" }, country: { tr: "Güney Afrika", en: "South Africa" }, tagline: { tr: "Masa Dağı'nın eteğinde iki okyanus", en: "Two oceans at the foot of Table Mountain" }, image: u("photo-1626894169601-482d26b23f35"), query: "Cape Town" },
];

/** Rotation window: the featured set reshuffles every 4 hours. */
export const ROTATION_WINDOW_MS = 4 * 60 * 60 * 1000;

/** How many cards the home page shows per window. */
export const INSPIRATION_COUNT = 10;

/** Deterministic PRNG so the server-rendered pick is stable within a window. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded shuffle of the whole pool → first N become this window's picks. */
export function pickInspiration(
  seed: number,
  count = INSPIRATION_COUNT
): InspirationItem[] {
  const rand = mulberry32(seed);
  const arr = [...INSPIRATION_POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
