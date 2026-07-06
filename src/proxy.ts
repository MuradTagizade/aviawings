import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import {
  MARKET_COOKIE,
  MARKET_COOKIE_MAX_AGE,
  MARKETS,
  isMarketCode,
  marketForCountry,
  type Market,
} from "./lib/market";

const intl = createMiddleware(routing);

function marketCookie(code: string) {
  return `${MARKET_COOKIE}=${code}; Path=/; Max-Age=${MARKET_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** First Accept-Language entry the market offers, else the market default. */
function pickLocale(req: NextRequest, market: Market): string {
  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if ((market.languages as string[]).includes(code)) return code;
  }
  return market.defaultLocale;
}

export default function proxy(req: NextRequest) {
  const stored = req.cookies.get(MARKET_COOKIE)?.value;
  const hasMarket = isMarketCode(stored) ? stored : undefined;
  const country = req.headers.get("x-vercel-ip-country") ?? "";

  // Root visits without an explicit language choice: resolve the market
  // (stored cookie, else geo-IP — Vercel sets x-vercel-ip-country) and
  // steer to one of that market's languages.
  if (req.nextUrl.pathname === "/" && !req.cookies.get("NEXT_LOCALE")) {
    const market = MARKETS[hasMarket ?? marketForCountry(country)];
    const url = req.nextUrl.clone();
    url.pathname = `/${pickLocale(req, market)}`;
    const res = NextResponse.redirect(url, 307);
    if (!hasMarket) res.headers.append("Set-Cookie", marketCookie(market.code));
    return res;
  }

  const res = intl(req);

  // Deep links on a first visit: still record the detected market.
  if (!hasMarket) {
    res.headers.append("Set-Cookie", marketCookie(marketForCountry(country)));
  }
  return res;
}

export const config = {
  // Skip API routes, Next internals and static files
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
