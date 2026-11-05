"use client";
import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { readConsent } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";

/**
 * Google Analytics 4 — loaded ONLY when both are true:
 *   1. NEXT_PUBLIC_GA_ID is set (e.g. G-XXXXXXXXXX), and
 *   2. the visitor pressed "Accept all" in the cookie banner (cookie xsf_cookie_consent=all).
 * Before that nothing is requested from Google, no cookie is written and no event is queued. The component listens
 * for the banner's choice, so analytics starts (or stops) without a page reload.
 *
 * Consent Mode v2: every signal defaults to "denied"; "Accept all" grants analytics_storage only. The advertising
 * signals stay denied because no ad tags run on the site — grant them here if Google Ads is linked later.
 *
 * Mount once, inside <Providers> in app/layout.tsx:  <Analytics />
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __xsfGaReady?: boolean;
  }
}

/** Sets up the gtag queue the first time it is needed. Returns false (and does nothing) without an ID or without consent. */
function ensureGtag(): boolean {
  if (!GA_ID || typeof window === "undefined" || readConsent() !== "all") return false;
  if (!window.__xsfGaReady) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
    window.dataLayer = window.dataLayer ?? [];
    // gtag.js only understands the `arguments` object, not an array — keep this a classic function.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false });
    window.__xsfGaReady = true;
  }
  return true;
}

/** Send a GA4 event, e.g. track("add_to_cart", { currency, value, items }). Silently does nothing without consent or without an ID. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (ensureGtag()) window.gtag!("event", event, params);
}

// Last path reported, so a re-render (or React's development double-run of effects) never counts one view twice.
let lastPageView: string | null = null;

function PageViews({ on }: { on: boolean }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    if (!on) return;
    const path = pathname + (search ? `?${search}` : "");
    if (path === lastPageView) return;
    lastPageView = path;
    track("page_view", { page_path: path, page_location: window.location.origin + path });
  }, [on, pathname, search]);
  return null;
}

export function Analytics() {
  const consent = useConsent();
  const on = !!GA_ID && consent === "all";
  useEffect(() => {
    if (!GA_ID) return;
    if (on) {
      ensureGtag();
    } else if (window.__xsfGaReady) {
      // Choice changed to "Essential only" after analytics had started: withdraw the signal and stop sending.
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
      window.__xsfGaReady = false;
    }
  }, [on]);
  if (!on) return null;
  return (
    <>
      <Script id="xsf-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID!)}`} strategy="afterInteractive" />
      <Suspense fallback={null}>
        <PageViews on={on} />
      </Suspense>
    </>
  );
}
