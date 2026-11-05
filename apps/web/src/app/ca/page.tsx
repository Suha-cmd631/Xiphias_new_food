import type { Metadata } from "next";
import { HubPage } from "@/components/market/hub-page";
import { HUB_META, hubMetadata } from "@/lib/market-data";

export const metadata: Metadata = hubMetadata("ca");

// Canada: no ordering yet, so this page shows no prices and never calls the price list.
export default function CaHubPage() {
  return <HubPage market="ca" h1={HUB_META.ca.h1} text={HUB_META.ca.text} />;
}
