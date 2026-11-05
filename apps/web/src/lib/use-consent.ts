"use client";
import { useSyncExternalStore } from "react";
import { readConsent, subscribeConsent, type Consent } from "@/lib/consent";

/** Current cookie choice: "all", "essential", or null while the visitor has not answered the banner (and during SSR). */
export const useConsent = (): Consent | null => useSyncExternalStore(subscribeConsent, readConsent, () => null);
