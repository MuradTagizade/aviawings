"use client";

/**
 * Consent-aware analytics loader.
 * GA4 + Meta Pixel are only injected AFTER the visitor grants the matching
 * consent category (Google Consent Mode v2). No consent → no third-party
 * scripts, no third-party cookies.
 */

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  /** epoch ms when the choice was made */
  ts: number;
}

export const CONSENT_COOKIE = "aw_consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      push?: unknown;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return null;
  }
}

export function writeConsent(state: Omit<ConsentState, "ts">) {
  const value: ConsentState = { ...state, ts: Date.now() };
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify(value)
  )}; path=/; max-age=${oneYear}; SameSite=Lax; Secure`;
  applyConsent(value);
}

function ensureGtagStub() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
}

/** Called once on app mount — Consent Mode v2 defaults to denied. */
export function initConsentDefaults() {
  ensureGtagStub();
  window.gtag!("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
  const existing = readConsent();
  if (existing) applyConsent(existing);
}

let gaLoaded = false;
let pixelLoaded = false;

function loadGa() {
  if (gaLoaded || !GA_ID) return;
  gaLoaded = true;
  ensureGtagStub();
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.gtag!("js", new Date());
  window.gtag!("config", GA_ID, { anonymize_ip: true });
}

function loadPixel() {
  if (pixelLoaded || !PIXEL_ID) return;
  pixelLoaded = true;
  const fbq: NonNullable<Window["fbq"]> = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue!.push(args);
    }
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

export function applyConsent(state: ConsentState) {
  ensureGtagStub();
  window.gtag!("consent", "update", {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
  });
  if (state.analytics) loadGa();
  if (state.marketing) loadPixel();
}

/** GA4 e-commerce style event — safe to call anytime (no-op without consent). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
