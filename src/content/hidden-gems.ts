/**
 * Curated "hidden gems": under-the-radar places worth crossing the world for.
 * wikiQuery = canonical English Wikipedia title (localized at runtime via
 * /api/wiki langlinks). Coordinates drive the discovery globe.
 */

export interface HiddenGem {
  /** English display fallback */
  name: string;
  countryCode: string;
  lat: number;
  lon: number;
  wikiQuery: string;
}

export const HIDDEN_GEMS: HiddenGem[] = [
  // — Caucasus & Türkiye —
  { name: "Sheki", countryCode: "AZ", lat: 41.19, lon: 47.17, wikiQuery: "Shaki, Azerbaijan" },
  { name: "Khinalug", countryCode: "AZ", lat: 41.18, lon: 48.13, wikiQuery: "Khinalug" },
  { name: "Mardin", countryCode: "TR", lat: 37.31, lon: 40.74, wikiQuery: "Mardin" },
  { name: "Amasya", countryCode: "TR", lat: 40.65, lon: 35.83, wikiQuery: "Amasya" },
  { name: "Sumela Monastery", countryCode: "TR", lat: 40.69, lon: 39.66, wikiQuery: "Sumela Monastery" },
  { name: "Safranbolu", countryCode: "TR", lat: 41.25, lon: 32.69, wikiQuery: "Safranbolu" },
  { name: "Ushguli", countryCode: "GE", lat: 42.92, lon: 43.01, wikiQuery: "Ushguli" },
  { name: "Stepantsminda", countryCode: "GE", lat: 42.66, lon: 44.62, wikiQuery: "Stepantsminda" },
  { name: "Vardzia", countryCode: "GE", lat: 41.38, lon: 43.28, wikiQuery: "Vardzia" },
  // — Balkans & Europe —
  { name: "Meteora", countryCode: "GR", lat: 39.71, lon: 21.63, wikiQuery: "Meteora" },
  { name: "Gjirokastër", countryCode: "AL", lat: 40.08, lon: 20.14, wikiQuery: "Gjirokastër" },
  { name: "Berat", countryCode: "AL", lat: 40.7, lon: 19.95, wikiQuery: "Berat" },
  { name: "Kotor", countryCode: "ME", lat: 42.42, lon: 18.77, wikiQuery: "Kotor" },
  { name: "Ohrid", countryCode: "MK", lat: 41.12, lon: 20.8, wikiQuery: "Ohrid" },
  { name: "Matera", countryCode: "IT", lat: 40.67, lon: 16.6, wikiQuery: "Matera" },
  { name: "Civita di Bagnoregio", countryCode: "IT", lat: 42.63, lon: 12.09, wikiQuery: "Civita di Bagnoregio" },
  { name: "Procida", countryCode: "IT", lat: 40.76, lon: 14.02, wikiQuery: "Procida" },
  { name: "Alberobello", countryCode: "IT", lat: 40.78, lon: 17.24, wikiQuery: "Alberobello" },
  { name: "Ronda", countryCode: "ES", lat: 36.75, lon: -5.17, wikiQuery: "Ronda" },
  { name: "Albarracín", countryCode: "ES", lat: 40.41, lon: -1.44, wikiQuery: "Albarracín" },
  { name: "Setenil de las Bodegas", countryCode: "ES", lat: 36.86, lon: -5.18, wikiQuery: "Setenil de las Bodegas" },
  { name: "Monsanto", countryCode: "PT", lat: 40.03, lon: -7.11, wikiQuery: "Monsanto (Idanha-a-Nova)" },
  { name: "Colmar", countryCode: "FR", lat: 48.08, lon: 7.36, wikiQuery: "Colmar" },
  { name: "Hallstatt", countryCode: "AT", lat: 47.56, lon: 13.65, wikiQuery: "Hallstatt" },
  { name: "Český Krumlov", countryCode: "CZ", lat: 48.81, lon: 14.32, wikiQuery: "Český Krumlov" },
  { name: "Sighișoara", countryCode: "RO", lat: 46.22, lon: 24.79, wikiQuery: "Sighișoara" },
  { name: "Lake Bled", countryCode: "SI", lat: 46.37, lon: 14.11, wikiQuery: "Lake Bled" },
  { name: "Gásadalur", countryCode: "FO", lat: 62.11, lon: -7.43, wikiQuery: "Gásadalur" },
  { name: "Reine", countryCode: "NO", lat: 67.93, lon: 13.09, wikiQuery: "Reine" },
  // — Africa & Middle East —
  { name: "Chefchaouen", countryCode: "MA", lat: 35.17, lon: -5.27, wikiQuery: "Chefchaouen" },
  { name: "Aït Benhaddou", countryCode: "MA", lat: 31.05, lon: -7.13, wikiQuery: "Aït Benhaddou" },
  { name: "Siwa Oasis", countryCode: "EG", lat: 29.2, lon: 25.52, wikiQuery: "Siwa Oasis" },
  { name: "Lalibela", countryCode: "ET", lat: 12.03, lon: 39.04, wikiQuery: "Lalibela" },
  { name: "Djenné", countryCode: "ML", lat: 13.91, lon: -4.55, wikiQuery: "Djenné" },
  { name: "Tsingy de Bemaraha", countryCode: "MG", lat: -18.86, lon: 44.75, wikiQuery: "Tsingy de Bemaraha National Park" },
  { name: "Socotra", countryCode: "YE", lat: 12.51, lon: 53.92, wikiQuery: "Socotra" },
  { name: "Wadi Rum", countryCode: "JO", lat: 29.58, lon: 35.42, wikiQuery: "Wadi Rum" },
  { name: "Yazd", countryCode: "IR", lat: 31.89, lon: 54.37, wikiQuery: "Yazd" },
  // — Asia —
  { name: "Registan", countryCode: "UZ", lat: 39.65, lon: 66.98, wikiQuery: "Registan" },
  { name: "Olkhon Island", countryCode: "RU", lat: 53.15, lon: 107.38, wikiQuery: "Olkhon Island" },
  { name: "Zhangye Danxia", countryCode: "CN", lat: 38.96, lon: 100.45, wikiQuery: "Zhangye National Geopark" },
  { name: "Wulingyuan", countryCode: "CN", lat: 29.35, lon: 110.55, wikiQuery: "Wulingyuan" },
  { name: "Shirakawa-gō", countryCode: "JP", lat: 36.27, lon: 136.9, wikiQuery: "Shirakawa-gō and Gokayama" },
  { name: "Takachiho Gorge", countryCode: "JP", lat: 32.71, lon: 131.31, wikiQuery: "Takachiho Gorge" },
  { name: "Jiufen", countryCode: "TW", lat: 25.11, lon: 121.84, wikiQuery: "Jiufen" },
  { name: "Bagan", countryCode: "MM", lat: 21.17, lon: 94.86, wikiQuery: "Bagan" },
  { name: "Luang Prabang", countryCode: "LA", lat: 19.89, lon: 102.14, wikiQuery: "Luang Prabang" },
  { name: "Raja Ampat", countryCode: "ID", lat: -0.5, lon: 130.5, wikiQuery: "Raja Ampat Islands" },
  // — Americas —
  { name: "Huacachina", countryCode: "PE", lat: -14.09, lon: -75.77, wikiQuery: "Huacachina" },
  { name: "Kuélap", countryCode: "PE", lat: -6.42, lon: -77.92, wikiQuery: "Kuélap" },
  { name: "Salar de Uyuni", countryCode: "BO", lat: -20.13, lon: -67.49, wikiQuery: "Salar de Uyuni" },
  { name: "Guatapé", countryCode: "CO", lat: 6.23, lon: -75.16, wikiQuery: "Guatapé" },
  { name: "Lençóis Maranhenses", countryCode: "BR", lat: -2.53, lon: -43.12, wikiQuery: "Lençóis Maranhenses National Park" },
  { name: "Antelope Canyon", countryCode: "US", lat: 36.86, lon: -111.37, wikiQuery: "Antelope Canyon" },
];
