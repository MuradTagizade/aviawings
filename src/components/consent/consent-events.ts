"use client";

/** Cross-component signal to reopen the consent preferences dialog. */
export const CONSENT_OPEN_EVENT = "aviawings:open-consent";

export function openConsentPreferences() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
