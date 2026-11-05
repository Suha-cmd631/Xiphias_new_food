/**
 * Cookie-consent state shared by the cookie banner, analytics and anything that must stay out of the banner's way.
 * The banner stores the choice in the `xsf_cookie_consent` cookie ("all" | "essential") and announces changes with a
 * window event, so listeners react without a page reload.
 */
export type Consent = "all" | "essential";
export const CONSENT_COOKIE = "xsf_cookie_consent";
export const CONSENT_EVENT = "xsf:consent";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )xsf_cookie_consent=(\w+)/);
  return m?.[1] === "all" || m?.[1] === "essential" ? m[1] : null;
}

export function writeConsent(v: Consent) {
  document.cookie = `${CONSENT_COOKIE}=${v}; Max-Age=31536000; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }));
}

/** For useSyncExternalStore: re-read the cookie whenever the banner announces a choice. */
export function subscribeConsent(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}
