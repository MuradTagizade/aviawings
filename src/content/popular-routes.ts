import type { MarketCode } from "@/lib/market";

/**
 * Card images per destination airport. Local files and Unsplash/Wikimedia
 * URLs here are all visually verified (project rule — verify any new one).
 */
const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const CITY_IMAGES: Record<string, string> = {
  GYD: "/img/destinations/baku-hero.jpg",
  GNJ: "/img/destinations/ganja-hero.jpg",
  IST: u("photo-1527838832700-5059252407fa"),
  SAW: u("photo-1527838832700-5059252407fa"),
  ESB: "/img/destinations/ankara-hero.jpg",
  ADB: "/img/destinations/izmir-hero.jpg",
  AYT: "/img/destinations/antalya-hero.jpg",
  TBS: u("photo-1603350576276-24747f7bbf40"),
  BUS: u("photo-1577386308421-da4e279fa68a"),
  DXB: u("photo-1512453979798-5ea266f8880c"),
  DOH: u("photo-1685113872064-de4180a0ea93"),
  LHR: u("photo-1533929736458-ca588d08c8be"),
  CDG: u("photo-1502602898657-3e91760cbb34"),
  BER: u("photo-1597932552386-ad91621e4c8a"),
  AMS: u("photo-1536880756060-98a6a140f0a7"),
  FCO: u("photo-1552832230-c0197dd311b5"),
  BCN: u("photo-1690403021832-4934d206cb5f"),
  JFK: u("photo-1496588152823-86ff7695e68f"),
  SVO: u("photo-1565163694213-fe1d5aa2d358"),
  ALA: u("photo-1655444099262-c56de96c448d"),
  NQZ: u("photo-1609779311020-db3879ad033a"),
  TAS: u("photo-1622021109028-8ba1d5374161"),
  FRU: u("photo-1740686077650-6c20f67e6920"),
  ASB: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Ashgabat_night_scene.jpg",
};

export type Route = { from: string; to: string };

/**
 * The six most-flown routes from each market — visitors see routes
 * departing their own region regardless of UI language; the GLOBAL
 * market gets a worldwide mix.
 */
export const ROUTES_BY_MARKET: Record<MarketCode, Route[]> = {
  AZ: [
    { from: "GYD", to: "IST" },
    { from: "GYD", to: "AYT" },
    { from: "GYD", to: "DXB" },
    { from: "GYD", to: "SAW" },
    { from: "GYD", to: "TBS" },
    { from: "GYD", to: "SVO" },
  ],
  TR: [
    { from: "IST", to: "GYD" },
    { from: "IST", to: "LHR" },
    { from: "IST", to: "CDG" },
    { from: "IST", to: "BER" },
    { from: "IST", to: "DXB" },
    { from: "IST", to: "JFK" },
  ],
  GLOBAL: [
    { from: "GYD", to: "IST" },
    { from: "IST", to: "LHR" },
    { from: "DXB", to: "LHR" },
    { from: "CDG", to: "FCO" },
    { from: "LHR", to: "JFK" },
    { from: "IST", to: "DXB" },
  ],
  GE: [
    { from: "TBS", to: "IST" },
    { from: "TBS", to: "SAW" },
    { from: "TBS", to: "DXB" },
    { from: "TBS", to: "GYD" },
    { from: "TBS", to: "BER" },
    { from: "TBS", to: "CDG" },
  ],
  TM: [
    { from: "ASB", to: "IST" },
    { from: "ASB", to: "DXB" },
    { from: "ASB", to: "SVO" },
    { from: "ASB", to: "ALA" },
    { from: "ASB", to: "GYD" },
    { from: "ASB", to: "FRU" },
  ],
  KZ: [
    { from: "ALA", to: "IST" },
    { from: "ALA", to: "DXB" },
    { from: "ALA", to: "SVO" },
    { from: "ALA", to: "TAS" },
    { from: "ALA", to: "FRU" },
    { from: "ALA", to: "AYT" },
  ],
  UZ: [
    { from: "TAS", to: "IST" },
    { from: "TAS", to: "DXB" },
    { from: "TAS", to: "SVO" },
    { from: "TAS", to: "ALA" },
    { from: "TAS", to: "JFK" },
    { from: "TAS", to: "AYT" },
  ],
  KG: [
    { from: "FRU", to: "IST" },
    { from: "FRU", to: "SVO" },
    { from: "FRU", to: "DXB" },
    { from: "FRU", to: "ALA" },
    { from: "FRU", to: "TAS" },
    { from: "FRU", to: "AYT" },
  ],
};

export function routesForMarket(market: MarketCode): Route[] {
  return ROUTES_BY_MARKET[market] ?? ROUTES_BY_MARKET.GLOBAL;
}
