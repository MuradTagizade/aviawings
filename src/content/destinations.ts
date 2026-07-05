type L = { tr: string; en: string };

export type PlaceCategory =
  | "landmark"
  | "museum"
  | "nature"
  | "food"
  | "shopping"
  | "nightlife"
  | "history";

export interface Place {
  name: L;
  desc: L;
  category: PlaceCategory;
  mapQuery: string;
}

export interface SeasonEvent {
  name: L;
  when: L;
  desc: L;
}

export interface Destination {
  slug: string;
  iata: string;
  city: L;
  country: L;
  tagline: L;
  heroImage: string;
  cardImage: string;
  gallery: string[];
  lat: number;
  lon: number;
  timezone: string;
  currencyCode: string;
  language: L;
  bestTime: L;
  /** [highC, lowC, rainyDays] per month, Jan..Dec — climate normals for far dates */
  climate: [number, number, number][];
  practical: {
    visa: L;
    plug: string;
    transport: L;
    tip: L;
  };
  places: Place[];
  events: SeasonEvent[];
}

const WIKI = "https://upload.wikimedia.org/wikipedia/commons/thumb";

export const DESTINATIONS: Destination[] = [
  {
    slug: "baku",
    iata: "GYD",
    city: { tr: "Bakü", en: "Baku" },
    country: { tr: "Azerbaycan", en: "Azerbaijan" },
    tagline: {
      tr: "Hazar'ın kıyısında rüzgârın ve ateşin şehri",
      en: "City of wind and fire on the Caspian shore",
    },
    heroImage: `${WIKI}/b/b4/Panorama_of_night_Baku%2C_Azerbaijan_IMG_9682.jpg/1600px-Panorama_of_night_Baku%2C_Azerbaijan_IMG_9682.jpg`,
    cardImage: `${WIKI}/b/b4/Panorama_of_night_Baku%2C_Azerbaijan_IMG_9682.jpg/800px-Panorama_of_night_Baku%2C_Azerbaijan_IMG_9682.jpg`,
    gallery: [
      `${WIKI}/6/61/Baku%2C_Azerbaiy%C3%A1n%2C_2016-09-26%2C_DD_211.jpg/1280px-Baku%2C_Azerbaiy%C3%A1n%2C_2016-09-26%2C_DD_211.jpg`,
    ],
    lat: 40.4093,
    lon: 49.8671,
    timezone: "GMT+4",
    currencyCode: "AZN",
    language: { tr: "Azerbaycanca", en: "Azerbaijani" },
    bestTime: { tr: "Nisan–Haziran, Eylül–Ekim", en: "April–June, September–October" },
    climate: [
      [7, 2, 6], [7, 2, 6], [11, 5, 5], [17, 10, 4], [23, 16, 3], [28, 21, 2],
      [31, 24, 1], [30, 23, 2], [26, 19, 3], [19, 13, 5], [13, 8, 6], [9, 4, 6],
    ],
    practical: {
      visa: {
        tr: "Türk vatandaşlarına 90 güne kadar vize gerekmez.",
        en: "Many nationalities can obtain an e-visa (ASAN Visa) in ~3 days.",
      },
      plug: "C / F · 220V",
      transport: {
        tr: "Metro çok uygun fiyatlı; BakuCard ile metro ve otobüs kullanılır. Bolt yaygın.",
        en: "The metro is very affordable; use a BakuCard for metro and buses. Bolt is widely used.",
      },
      tip: {
        tr: "Gün batımında Dağüstü Park'a çıkın — Alev Kuleleri ve körfez manzarası büyüleyici.",
        en: "Head to Highland Park at sunset — the Flame Towers and bay view are magical.",
      },
    },
    places: [
      {
        name: { tr: "İçerişehir (Eski Şehir)", en: "Icherisheher (Old City)" },
        desc: {
          tr: "UNESCO listesindeki surlarla çevrili tarihi çekirdek; dar sokaklar, kervansaraylar ve çay evleri.",
          en: "UNESCO-listed walled heart of Baku — narrow lanes, caravanserais and tea houses.",
        },
        category: "history",
        mapQuery: "Icherisheher Baku",
      },
      {
        name: { tr: "Kız Kulesi", en: "Maiden Tower" },
        desc: {
          tr: "12. yüzyıldan kalma gizemli kule; tepesinden Hazar manzarası eşsiz.",
          en: "Mysterious 12th-century tower with a sweeping Caspian view from the top.",
        },
        category: "landmark",
        mapQuery: "Maiden Tower Baku",
      },
      {
        name: { tr: "Haydar Aliyev Merkezi", en: "Heydar Aliyev Center" },
        desc: {
          tr: "Zaha Hadid imzalı akışkan mimarisiyle dünyaca ünlü kültür merkezi.",
          en: "World-famous cultural center with flowing architecture by Zaha Hadid.",
        },
        category: "landmark",
        mapQuery: "Heydar Aliyev Center Baku",
      },
      {
        name: { tr: "Bakü Bulvarı", en: "Baku Boulevard" },
        desc: {
          tr: "Hazar kıyısında kilometrelerce uzanan sahil parkı; akşam yürüyüşünün adresi.",
          en: "Kilometres of seaside promenade along the Caspian — perfect for an evening stroll.",
        },
        category: "nature",
        mapQuery: "Baku Boulevard",
      },
      {
        name: { tr: "Halı Müzesi", en: "Carpet Museum" },
        desc: {
          tr: "Rulo halı biçimindeki binasıyla Azerbaycan dokuma sanatının başyapıtları.",
          en: "Masterpieces of Azerbaijani weaving in a building shaped like a rolled carpet.",
        },
        category: "museum",
        mapQuery: "Azerbaijan Carpet Museum",
      },
      {
        name: { tr: "Nizami Caddesi", en: "Nizami Street" },
        desc: {
          tr: "Şehrin kalbindeki alışveriş caddesi; kafeler, mağazalar ve tarihi cepheler.",
          en: "The city's main shopping street — cafés, boutiques and historic façades.",
        },
        category: "shopping",
        mapQuery: "Nizami Street Baku",
      },
    ],
    events: [
      {
        name: { tr: "Novruz Bayramı", en: "Novruz Festival" },
        when: { tr: "Mart sonu", en: "Late March" },
        desc: {
          tr: "Baharın gelişini kutlayan ateşler, semeni ve sokak şenlikleri.",
          en: "Bonfires, semeni and street festivities welcoming spring.",
        },
      },
      {
        name: { tr: "F1 Azerbaycan GP", en: "F1 Azerbaijan Grand Prix" },
        when: { tr: "Eylül", en: "September" },
        desc: {
          tr: "Şehir sokaklarında koşulan nefes kesici Formula 1 yarışı.",
          en: "A breathtaking Formula 1 race through the city streets.",
        },
      },
      {
        name: { tr: "Caz Festivali", en: "Baku Jazz Festival" },
        when: { tr: "Ekim", en: "October" },
        desc: {
          tr: "Uluslararası sanatçılarla şehrin köklü caz geleneğinin buluşması.",
          en: "International artists meet the city's deep jazz tradition.",
        },
      },
    ],
  },
  {
    slug: "istanbul",
    iata: "IST",
    city: { tr: "İstanbul", en: "Istanbul" },
    country: { tr: "Türkiye", en: "Türkiye" },
    tagline: {
      tr: "İki kıtanın buluştuğu zamansız şehir",
      en: "The timeless city where two continents meet",
    },
    heroImage:
      "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1600&q=80",
    cardImage:
      "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1280&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1280&q=80",
    ],
    lat: 41.0082,
    lon: 28.9784,
    timezone: "GMT+3",
    currencyCode: "TRY",
    language: { tr: "Türkçe", en: "Turkish" },
    bestTime: { tr: "Nisan–Haziran, Eylül–Kasım", en: "April–June, September–November" },
    climate: [
      [9, 4, 12], [10, 4, 10], [12, 5, 9], [17, 9, 7], [22, 13, 5], [27, 18, 4],
      [29, 20, 2], [29, 21, 3], [25, 17, 5], [20, 13, 8], [15, 9, 10], [11, 6, 12],
    ],
    practical: {
      visa: {
        tr: "T.C. vatandaşları için vize gerekmez.",
        en: "Visa-free or e-visa for most nationalities — check evisa.gov.tr.",
      },
      plug: "C / F · 220V",
      transport: {
        tr: "İstanbulkart ile metro, tramvay, vapur ve otobüs. Vapurla Boğaz geçişi başlı başına bir deneyim.",
        en: "One Istanbulkart covers metro, tram, ferry and bus. A Bosphorus ferry ride is an experience in itself.",
      },
      tip: {
        tr: "Sultanahmet'i sabah erken gezin; öğleden sonra Karaköy–Galata hattında kahve molası verin.",
        en: "See Sultanahmet early in the morning; take an afternoon coffee break around Karaköy–Galata.",
      },
    },
    places: [
      {
        name: { tr: "Ayasofya", en: "Hagia Sophia" },
        desc: {
          tr: "1500 yıllık kubbesiyle Bizans ve Osmanlı'nın ortak mirası.",
          en: "Fifteen centuries of Byzantine and Ottoman legacy under one dome.",
        },
        category: "landmark",
        mapQuery: "Hagia Sophia Istanbul",
      },
      {
        name: { tr: "Sultanahmet Camii", en: "Blue Mosque" },
        desc: {
          tr: "Altı minaresi ve mavi İznik çinileriyle şehrin simgesi.",
          en: "Icon of the city with six minarets and blue Iznik tiles.",
        },
        category: "landmark",
        mapQuery: "Blue Mosque Istanbul",
      },
      {
        name: { tr: "Topkapı Sarayı", en: "Topkapi Palace" },
        desc: {
          tr: "Osmanlı padişahlarının 400 yıllık evi; hazine dairesi ve Boğaz manzaralı avlular.",
          en: "Home of Ottoman sultans for 400 years — treasury rooms and Bosphorus-view courtyards.",
        },
        category: "museum",
        mapQuery: "Topkapi Palace",
      },
      {
        name: { tr: "Galata Kulesi", en: "Galata Tower" },
        desc: {
          tr: "Şehrin en güzel 360° manzarası; çevresi kafe ve atölye dolu.",
          en: "The city's best 360° view, surrounded by cafés and artisan shops.",
        },
        category: "landmark",
        mapQuery: "Galata Tower",
      },
      {
        name: { tr: "Kapalıçarşı", en: "Grand Bazaar" },
        desc: {
          tr: "4.000 dükkânlı, dünyanın en eski kapalı çarşılarından; pazarlık serbest.",
          en: "One of the world's oldest covered markets with 4,000 shops — haggling welcome.",
        },
        category: "shopping",
        mapQuery: "Grand Bazaar Istanbul",
      },
      {
        name: { tr: "Boğaz Turu", en: "Bosphorus Cruise" },
        desc: {
          tr: "Yalılar, köprüler ve iki kıta arasında süzülen bir öğleden sonra.",
          en: "An afternoon gliding between two continents, past waterfront mansions.",
        },
        category: "nature",
        mapQuery: "Bosphorus cruise Eminonu",
      },
    ],
    events: [
      {
        name: { tr: "Lale Festivali", en: "Tulip Festival" },
        when: { tr: "Nisan", en: "April" },
        desc: {
          tr: "Emirgan Korusu ve parklar milyonlarca laleyle renklenir.",
          en: "Emirgan Grove and city parks bloom with millions of tulips.",
        },
      },
      {
        name: { tr: "İstanbul Müzik Festivali", en: "Istanbul Music Festival" },
        when: { tr: "Haziran", en: "June" },
        desc: {
          tr: "Tarihi mekânlarda klasik müzik konserleri.",
          en: "Classical concerts staged in historic venues.",
        },
      },
      {
        name: { tr: "İstanbul Bienali", en: "Istanbul Biennial" },
        when: { tr: "Eylül–Kasım (tek yıllar)", en: "Sep–Nov (odd years)" },
        desc: {
          tr: "Çağdaş sanatın şehre yayılan dev sergisi.",
          en: "A city-wide celebration of contemporary art.",
        },
      },
    ],
  },
  {
    slug: "ankara",
    iata: "ESB",
    city: { tr: "Ankara", en: "Ankara" },
    country: { tr: "Türkiye", en: "Türkiye" },
    tagline: {
      tr: "Cumhuriyetin kalbi, Anadolu'nun kavşağı",
      en: "Heart of the Republic, crossroads of Anatolia",
    },
    heroImage: `${WIKI}/9/96/An%C4%B1tkabir%2C_Ankara%2C_Turqu%C3%ADa%2C_2024-10-03%2C_DD_25.jpg/1600px-An%C4%B1tkabir%2C_Ankara%2C_Turqu%C3%ADa%2C_2024-10-03%2C_DD_25.jpg`,
    cardImage: `${WIKI}/9/96/An%C4%B1tkabir%2C_Ankara%2C_Turqu%C3%ADa%2C_2024-10-03%2C_DD_25.jpg/800px-An%C4%B1tkabir%2C_Ankara%2C_Turqu%C3%ADa%2C_2024-10-03%2C_DD_25.jpg`,
    gallery: [
      `${WIKI}/c/cc/An%C4%B1tkabir%2C_Ankara%2C_Turqu%C3%ADa%2C_2024-10-03%2C_DD_27.jpg/1280px-An%C4%B1tkabir%2C_Ankara%2C_Turqu%C3%ADa%2C_2024-10-03%2C_DD_27.jpg`,
    ],
    lat: 39.9334,
    lon: 32.8597,
    timezone: "GMT+3",
    currencyCode: "TRY",
    language: { tr: "Türkçe", en: "Turkish" },
    bestTime: { tr: "Mayıs–Haziran, Eylül", en: "May–June, September" },
    climate: [
      [4, -3, 10], [7, -2, 9], [12, 1, 9], [17, 5, 10], [23, 9, 10], [27, 12, 6],
      [31, 15, 2], [31, 15, 2], [26, 11, 4], [20, 7, 6], [13, 2, 8], [6, -1, 10],
    ],
    practical: {
      visa: {
        tr: "T.C. vatandaşları için vize gerekmez.",
        en: "Visa-free or e-visa for most nationalities — check evisa.gov.tr.",
      },
      plug: "C / F · 220V",
      transport: {
        tr: "Ankaray ve metro şehri boydan boya kat eder; başkent trafiğine dikkat.",
        en: "Ankaray and the metro cross the city end to end; mind rush-hour traffic.",
      },
      tip: {
        tr: "Hamamönü'nün restore edilmiş sokaklarında akşam çayı için mola verin.",
        en: "Pause for evening tea in the restored streets of Hamamönü.",
      },
    },
    places: [
      {
        name: { tr: "Anıtkabir", en: "Anıtkabir" },
        desc: {
          tr: "Atatürk'ün anıt mezarı; tören alanı ve müzesiyle ulusal hafızanın merkezi.",
          en: "Atatürk's mausoleum — ceremonial plaza and museum at the heart of national memory.",
        },
        category: "landmark",
        mapQuery: "Anitkabir Ankara",
      },
      {
        name: { tr: "Anadolu Medeniyetleri Müzesi", en: "Museum of Anatolian Civilizations" },
        desc: {
          tr: "Hitit ve Frig eserleriyle dünya çapında bir arkeoloji koleksiyonu.",
          en: "A world-class archaeology collection of Hittite and Phrygian treasures.",
        },
        category: "museum",
        mapQuery: "Museum of Anatolian Civilizations",
      },
      {
        name: { tr: "Ankara Kalesi", en: "Ankara Castle" },
        desc: {
          tr: "Eski şehrin tepesinden gün batımı manzarası; surlar içinde küçük atölyeler.",
          en: "Sunset views over the old town, with tiny workshops inside the walls.",
        },
        category: "history",
        mapQuery: "Ankara Castle",
      },
      {
        name: { tr: "Hamamönü", en: "Hamamönü" },
        desc: {
          tr: "Restore edilmiş Osmanlı evleri, el sanatları ve nostaljik kafeler.",
          en: "Restored Ottoman houses, crafts and nostalgic cafés.",
        },
        category: "food",
        mapQuery: "Hamamonu Ankara",
      },
      {
        name: { tr: "Gençlik Parkı", en: "Gençlik Park" },
        desc: {
          tr: "Şehir merkezinde göl kenarı yürüyüşleri ve aile dostu aktiviteler.",
          en: "Lakeside walks and family-friendly fun in the city centre.",
        },
        category: "nature",
        mapQuery: "Genclik Parki Ankara",
      },
      {
        name: { tr: "Tunalı Hilmi Caddesi", en: "Tunalı Hilmi Avenue" },
        desc: {
          tr: "Kafeler, butikler ve şehrin en canlı akşam atmosferi.",
          en: "Cafés, boutiques and the city's liveliest evening buzz.",
        },
        category: "nightlife",
        mapQuery: "Tunali Hilmi Caddesi",
      },
    ],
    events: [
      {
        name: { tr: "Cumhuriyet Bayramı", en: "Republic Day" },
        when: { tr: "29 Ekim", en: "October 29" },
        desc: {
          tr: "Başkentte törenler, konserler ve ışık gösterileri.",
          en: "Ceremonies, concerts and light shows across the capital.",
        },
      },
      {
        name: { tr: "Ankara Müzik Festivali", en: "Ankara Music Festival" },
        when: { tr: "Nisan–Mayıs", en: "April–May" },
        desc: {
          tr: "Uluslararası klasik müzik sahnesinin başkentteki buluşması.",
          en: "The international classical scene meets in the capital.",
        },
      },
      {
        name: { tr: "Uluslararası Film Festivali", en: "International Film Festival" },
        when: { tr: "Mart", en: "March" },
        desc: {
          tr: "Bağımsız sinemanın Ankara'daki köklü adresi.",
          en: "Ankara's long-running home for independent cinema.",
        },
      },
    ],
  },
  {
    slug: "izmir",
    iata: "ADB",
    city: { tr: "İzmir", en: "Izmir" },
    country: { tr: "Türkiye", en: "Türkiye" },
    tagline: {
      tr: "Ege'nin incisi, güneşin ve özgürlüğün şehri",
      en: "Pearl of the Aegean, city of sun and ease",
    },
    heroImage: `${WIKI}/f/f5/Izmir_Konak_Square_and_Clock_Tower%2C_2026.jpg/1600px-Izmir_Konak_Square_and_Clock_Tower%2C_2026.jpg`,
    cardImage: `${WIKI}/f/f5/Izmir_Konak_Square_and_Clock_Tower%2C_2026.jpg/800px-Izmir_Konak_Square_and_Clock_Tower%2C_2026.jpg`,
    gallery: [],
    lat: 38.4237,
    lon: 27.1428,
    timezone: "GMT+3",
    currencyCode: "TRY",
    language: { tr: "Türkçe", en: "Turkish" },
    bestTime: { tr: "Mayıs–Ekim", en: "May–October" },
    climate: [
      [12, 6, 11], [13, 6, 10], [17, 8, 8], [21, 11, 6], [26, 15, 4], [31, 20, 2],
      [34, 23, 0], [34, 23, 1], [29, 19, 2], [24, 15, 5], [18, 11, 8], [14, 8, 12],
    ],
    practical: {
      visa: {
        tr: "T.C. vatandaşları için vize gerekmez.",
        en: "Visa-free or e-visa for most nationalities — check evisa.gov.tr.",
      },
      plug: "C / F · 220V",
      transport: {
        tr: "İzban ve metro pratik; Karşıyaka–Konak vapuru şehrin klasiği.",
        en: "İzban rail and the metro are handy; the Karşıyaka–Konak ferry is a city classic.",
      },
      tip: {
        tr: "Efes'e günübirlik gidin — sabah erken çıkarsanız kalabalıktan önce gezersiniz.",
        en: "Day-trip to Ephesus — leave early to beat the crowds.",
      },
    },
    places: [
      {
        name: { tr: "Saat Kulesi & Konak Meydanı", en: "Clock Tower & Konak Square" },
        desc: {
          tr: "1901'den beri şehrin simgesi; güvercinler ve deniz esintisi eşliğinde.",
          en: "The city's symbol since 1901, with pigeons and a sea breeze.",
        },
        category: "landmark",
        mapQuery: "Izmir Clock Tower",
      },
      {
        name: { tr: "Kemeraltı Çarşısı", en: "Kemeraltı Bazaar" },
        desc: {
          tr: "Labirent gibi tarihî çarşı; kahveciler, sandviççiler ve zanaatkârlar.",
          en: "A labyrinthine historic bazaar of coffee roasters, food stalls and artisans.",
        },
        category: "shopping",
        mapQuery: "Kemeralti Izmir",
      },
      {
        name: { tr: "Kordon", en: "Kordon Promenade" },
        desc: {
          tr: "Gün batımında çimlerde oturup körfezi izlemek bir İzmir ritüelidir.",
          en: "Watching the bay from the waterfront lawns at sunset is an Izmir ritual.",
        },
        category: "nature",
        mapQuery: "Kordon Izmir",
      },
      {
        name: { tr: "Efes Antik Kenti", en: "Ephesus" },
        desc: {
          tr: "Celsus Kütüphanesi ve antik tiyatrosuyla dünyanın en iyi korunmuş antik kentlerinden.",
          en: "One of the best-preserved ancient cities, home to the Library of Celsus.",
        },
        category: "history",
        mapQuery: "Ephesus",
      },
      {
        name: { tr: "Asansör", en: "Historical Elevator" },
        desc: {
          tr: "1907 tarihli asansörün terasından körfezin en romantik manzarası.",
          en: "The bay's most romantic view from the terrace of a 1907 elevator.",
        },
        category: "landmark",
        mapQuery: "Asansor Izmir",
      },
      {
        name: { tr: "Alsancak", en: "Alsancak" },
        desc: {
          tr: "Cumbalı evler arasında barlar, üçüncü nesil kahveciler ve gece hayatı.",
          en: "Bars, specialty coffee and nightlife among bay-windowed houses.",
        },
        category: "nightlife",
        mapQuery: "Alsancak Izmir",
      },
    ],
    events: [
      {
        name: { tr: "İzmir Enternasyonal Fuarı", en: "Izmir International Fair" },
        when: { tr: "Eylül", en: "September" },
        desc: {
          tr: "Türkiye'nin en köklü fuarı; konserler ve sergilerle.",
          en: "Türkiye's oldest fair, with concerts and exhibitions.",
        },
      },
      {
        name: { tr: "İzmir Avrupa Caz Festivali", en: "Izmir European Jazz Festival" },
        when: { tr: "Mart", en: "March" },
        desc: {
          tr: "Avrupa caz sahnesinden konuklarla şehir sahneleri canlanır.",
          en: "European jazz takes over the city's stages.",
        },
      },
      {
        name: { tr: "Bağbozumu (Urla)", en: "Grape Harvest (Urla)" },
        when: { tr: "Ağustos–Eylül", en: "August–September" },
        desc: {
          tr: "Urla bağ rotasında hasat şenlikleri ve tadımlar.",
          en: "Harvest festivities and tastings along the Urla vineyard route.",
        },
      },
    ],
  },
  {
    slug: "antalya",
    iata: "AYT",
    city: { tr: "Antalya", en: "Antalya" },
    country: { tr: "Türkiye", en: "Türkiye" },
    tagline: {
      tr: "Turkuaz kıyıların ve antik kentlerin başkenti",
      en: "Capital of turquoise coasts and ancient cities",
    },
    heroImage: `${WIKI}/a/af/Konyaalt%C4%B1_Beach_and_cliffs.jpg/1600px-Konyaalt%C4%B1_Beach_and_cliffs.jpg`,
    cardImage: `${WIKI}/a/af/Konyaalt%C4%B1_Beach_and_cliffs.jpg/800px-Konyaalt%C4%B1_Beach_and_cliffs.jpg`,
    gallery: [
      `${WIKI}/a/a0/J22_333_Antalya%2C_Hafenviertel.jpg/1280px-J22_333_Antalya%2C_Hafenviertel.jpg`,
    ],
    lat: 36.8969,
    lon: 30.7133,
    timezone: "GMT+3",
    currencyCode: "TRY",
    language: { tr: "Türkçe", en: "Turkish" },
    bestTime: { tr: "Nisan–Haziran, Eylül–Kasım", en: "April–June, September–November" },
    climate: [
      [15, 6, 12], [16, 7, 10], [18, 8, 8], [22, 11, 6], [26, 15, 4], [32, 20, 1],
      [35, 23, 0], [35, 23, 0], [31, 19, 1], [27, 15, 5], [21, 10, 9], [16, 7, 12],
    ],
    practical: {
      visa: {
        tr: "T.C. vatandaşları için vize gerekmez.",
        en: "Visa-free or e-visa for most nationalities — check evisa.gov.tr.",
      },
      plug: "C / F · 220V",
      transport: {
        tr: "AntalyaKart ile tramvay ve otobüs; Kaleiçi yürüyerek gezilir.",
        en: "Tram and bus with AntalyaKart; explore Kaleiçi on foot.",
      },
      tip: {
        tr: "Ekim'de bile deniz sıcaktır — sezonu uzatın, kalabalıktan kaçının.",
        en: "The sea stays warm into October — stretch the season, skip the crowds.",
      },
    },
    places: [
      {
        name: { tr: "Kaleiçi", en: "Kaleiçi Old Town" },
        desc: {
          tr: "Osmanlı evleri, butik oteller ve yat limanıyla tarihi çekirdek.",
          en: "The historic core of Ottoman houses, boutique hotels and a yacht marina.",
        },
        category: "history",
        mapQuery: "Kaleici Antalya",
      },
      {
        name: { tr: "Düden Şelalesi", en: "Düden Waterfalls" },
        desc: {
          tr: "Denize dökülen şelale; tekne turuyla altından geçebilirsiniz.",
          en: "A waterfall plunging into the sea — boat tours pass right beneath it.",
        },
        category: "nature",
        mapQuery: "Duden Waterfalls",
      },
      {
        name: { tr: "Aspendos", en: "Aspendos" },
        desc: {
          tr: "2.000 yıllık, hâlâ konser verilen muhteşem Roma tiyatrosu.",
          en: "A magnificent 2,000-year-old Roman theatre that still hosts concerts.",
        },
        category: "history",
        mapQuery: "Aspendos Theatre",
      },
      {
        name: { tr: "Konyaaltı Plajı", en: "Konyaaltı Beach" },
        desc: {
          tr: "Toros Dağları manzaralı kilometrelerce mavi bayraklı sahil.",
          en: "Kilometres of Blue Flag beach backed by the Taurus Mountains.",
        },
        category: "nature",
        mapQuery: "Konyaalti Beach",
      },
      {
        name: { tr: "Antalya Müzesi", en: "Antalya Museum" },
        desc: {
          tr: "Perge'den çıkan heykellerle Akdeniz arkeolojisinin en zenginlerinden.",
          en: "One of the Mediterranean's richest collections, with sculptures from Perge.",
        },
        category: "museum",
        mapQuery: "Antalya Museum",
      },
      {
        name: { tr: "Hadrian Kapısı", en: "Hadrian's Gate" },
        desc: {
          tr: "MS 130'dan kalma üç kemerli mermer kapı; Kaleiçi'nin zarif girişi.",
          en: "A triple-arched marble gate from 130 AD — the elegant entrance to Kaleiçi.",
        },
        category: "landmark",
        mapQuery: "Hadrian's Gate Antalya",
      },
    ],
    events: [
      {
        name: { tr: "Aspendos Opera ve Bale Festivali", en: "Aspendos Opera & Ballet Festival" },
        when: { tr: "Eylül", en: "September" },
        desc: {
          tr: "Antik tiyatroda yıldızların altında opera.",
          en: "Opera under the stars in the ancient theatre.",
        },
      },
      {
        name: { tr: "Altın Portakal Film Festivali", en: "Golden Orange Film Festival" },
        when: { tr: "Ekim", en: "October" },
        desc: {
          tr: "Türk sinemasının en prestijli ödülleri.",
          en: "The most prestigious awards in Turkish cinema.",
        },
      },
      {
        name: { tr: "Portakal Çiçeği Karnavalı", en: "Orange Blossom Carnival" },
        when: { tr: "Nisan", en: "April" },
        desc: {
          tr: "Bahar kokulu sokak yürüyüşleri ve konserler.",
          en: "Spring-scented street parades and concerts.",
        },
      },
    ],
  },
  {
    slug: "ganja",
    iata: "GNJ",
    city: { tr: "Gence", en: "Ganja" },
    country: { tr: "Azerbaycan", en: "Azerbaijan" },
    tagline: {
      tr: "Nizami'nin şehri, Azerbaycan'ın kadim ikincisi",
      en: "City of Nizami, Azerbaijan's ancient second city",
    },
    heroImage: `${WIKI}/f/f3/City_of_Ganja_Azerbaijan.jpg/1600px-City_of_Ganja_Azerbaijan.jpg`,
    cardImage: `${WIKI}/f/f3/City_of_Ganja_Azerbaijan.jpg/800px-City_of_Ganja_Azerbaijan.jpg`,
    gallery: [],
    lat: 40.6828,
    lon: 46.3606,
    timezone: "GMT+4",
    currencyCode: "AZN",
    language: { tr: "Azerbaycanca", en: "Azerbaijani" },
    bestTime: { tr: "Mayıs–Haziran, Eylül–Ekim", en: "May–June, September–October" },
    climate: [
      [6, -1, 5], [8, 0, 5], [13, 4, 7], [19, 9, 8], [24, 14, 8], [29, 18, 5],
      [32, 21, 3], [32, 21, 3], [27, 16, 4], [20, 11, 6], [13, 5, 5], [8, 1, 5],
    ],
    practical: {
      visa: {
        tr: "Türk vatandaşlarına 90 güne kadar vize gerekmez.",
        en: "Many nationalities can obtain an e-visa (ASAN Visa) in ~3 days.",
      },
      plug: "C / F · 220V",
      transport: {
        tr: "Şehir merkezi yürünebilir; taksiler uygun fiyatlı.",
        en: "The centre is walkable; taxis are inexpensive.",
      },
      tip: {
        tr: "Göygöl'e yarım günlük gezi planlayın — dağların arasındaki göl masalsıdır.",
        en: "Plan a half-day trip to Lake Göygöl — a fairytale lake in the mountains.",
      },
    },
    places: [
      {
        name: { tr: "Nizami Türbesi", en: "Nizami Mausoleum" },
        desc: {
          tr: "Büyük şair Nizami Gencevi'nin anıt mezarı.",
          en: "Monumental tomb of the great poet Nizami Ganjavi.",
        },
        category: "landmark",
        mapQuery: "Nizami Mausoleum Ganja",
      },
      {
        name: { tr: "Şah Abbas Camii", en: "Shah Abbas Mosque" },
        desc: {
          tr: "17. yüzyıl kervansaray meydanının kalbindeki tuğla cami.",
          en: "A 17th-century brick mosque at the heart of the caravanserai square.",
        },
        category: "history",
        mapQuery: "Shah Abbas Mosque Ganja",
      },
      {
        name: { tr: "Şişe Ev", en: "Bottle House" },
        desc: {
          tr: "48.000 cam şişeyle inşa edilmiş sıra dışı ev.",
          en: "An extraordinary house built from 48,000 glass bottles.",
        },
        category: "landmark",
        mapQuery: "Bottle House Ganja",
      },
      {
        name: { tr: "Göygöl", en: "Lake Göygöl" },
        desc: {
          tr: "1139 depremiyle oluşan, çam ormanlarıyla çevrili doğa harikası göl.",
          en: "A stunning lake formed by the 1139 earthquake, ringed by pine forests.",
        },
        category: "nature",
        mapQuery: "Lake Goygol",
      },
      {
        name: { tr: "Cavad Han Caddesi", en: "Javad Khan Street" },
        desc: {
          tr: "Restore edilmiş tarihi cadde; kafeler ve akşam yürüyüşleri.",
          en: "A restored historic street of cafés and evening strolls.",
        },
        category: "food",
        mapQuery: "Javad Khan Street Ganja",
      },
      {
        name: { tr: "Gence Kapıları", en: "Ganja Gates" },
        desc: {
          tr: "Ortaçağ şehrinin efsanevi demir kapılarının mirası.",
          en: "Legacy of the medieval city's legendary iron gates.",
        },
        category: "history",
        mapQuery: "Ganja Gates",
      },
    ],
    events: [
      {
        name: { tr: "Novruz Bayramı", en: "Novruz Festival" },
        when: { tr: "Mart sonu", en: "Late March" },
        desc: {
          tr: "Baharı karşılayan ateşler ve halk oyunları.",
          en: "Bonfires and folk dances welcoming spring.",
        },
      },
      {
        name: { tr: "Nar Bayramı (Göyçay yakınında)", en: "Pomegranate Festival (near Goychay)" },
        when: { tr: "Ekim–Kasım", en: "October–November" },
        desc: {
          tr: "Azerbaycan'ın simge meyvesine adanmış hasat şenliği.",
          en: "A harvest festival devoted to Azerbaijan's signature fruit.",
        },
      },
      {
        name: { tr: "Gence Şehir Günü", en: "Ganja City Day" },
        when: { tr: "Eylül", en: "September" },
        desc: {
          tr: "Konserler ve sokak etkinlikleriyle şehir kutlaması.",
          en: "A citywide celebration of concerts and street events.",
        },
      },
    ],
  },
];

export function findDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export function findDestinationByIata(iata: string): Destination | undefined {
  const code = iata.toUpperCase();
  return DESTINATIONS.find(
    (d) => d.iata === code || (code === "SAW" && d.slug === "istanbul")
  );
}
