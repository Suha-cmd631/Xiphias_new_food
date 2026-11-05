import type { Metadata } from "next";
import { HubPage } from "@/components/market/hub-page";
import { HUB_META, hubMetadata, loadMarketCards } from "@/lib/market-data";

export const metadata: Metadata = hubMetadata("us");

export default async function UsHubPage() {
  const cards = await loadMarketCards("us");
  return <HubPage market="us" h1={HUB_META.us.h1} text={HUB_META.us.text} cards={cards} />;
}
