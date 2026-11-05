import "server-only";
import type { Metadata } from "next";
import type { ProductCard, ProductDetail } from "@xsf/contracts";
import { ApiError } from "@/lib/api/server";
import { apiGetForRegion } from "@/lib/api/region";
import { MARKETS, type MarketCode } from "@/lib/market";
import type { Topic } from "@/lib/market-topics";
import { SITE } from "@/lib/site";

/** The topic's product(s), priced for the market's region regardless of the visitor's own region. A product missing from the catalogue is skipped. */
export async function loadTopicProducts(market: MarketCode, topic: Topic): Promise<ProductDetail[]> {
  const region = MARKETS[market].region;
  const found = await Promise.all(
    topic.productSlugs.map((slug) =>
      apiGetForRegion<ProductDetail>(region, `/catalog/products/${slug}`).catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }),
    ),
  );
  return found.filter((p): p is ProductDetail => p !== null);
}

/** Catalogue cards for the market's region, keyed by product slug (hub page "from" prices). */
export async function loadMarketCards(market: MarketCode): Promise<Map<string, ProductCard>> {
  const list = await apiGetForRegion<{ items: ProductCard[] }>(MARKETS[market].region, "/catalog/products", { perPage: 48 });
  return new Map(list.items.map((p) => [p.slug, p]));
}

const languages = (us: string, ca: string, global: string) => ({ [MARKETS.us.hreflang]: us, [MARKETS.ca.hreflang]: ca, "x-default": global });

export function topicMetadata(market: MarketCode, topic: Topic): Metadata {
  const m = topic.meta[market];
  const path = `/${market}/${topic.slug}`;
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: path, languages: languages(`/us/${topic.slug}`, `/ca/${topic.slug}`, topic.globalHref) },
    openGraph: { type: "website", siteName: SITE.name, title: m.title, description: m.description, url: path, images: [topic.image] },
  };
}

export const HUB_META: Record<MarketCode, { title: string; description: string; h1: string; text: string }> = {
  us: {
    title: "Xiphias Superfoods USA: Tea, Rice, Makhana & Spices",
    description: "Shop silver needle white tea, black rice, makhana, Gir cow ghee, masala chai and Malabar pepper in US dollars. Shipped from Bengaluru, India.",
    h1: "Xiphias Superfoods for the United States",
    text: "Seven pantry staples from our range, each with a plain-English guide, US measurements and the live price in US dollars.",
  },
  ca: {
    title: "Xiphias Superfoods Canada: Tea, Rice, Makhana & Spices",
    description: "Silver needle white tea, black rice, makhana, Gir cow ghee and masala chai. We do not deliver to Canada yet: leave your email and we will tell you when.",
    h1: "Xiphias Superfoods for Canada",
    text: "Seven pantry staples from our range, each with a plain-English guide. Ordering from Canada is not open yet.",
  },
};

export function hubMetadata(market: MarketCode): Metadata {
  const m = HUB_META[market];
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: `/${market}`, languages: languages("/us", "/ca", "/shop") },
    openGraph: { type: "website", siteName: SITE.name, title: m.title, description: m.description, url: `/${market}`, images: ["/img/white.webp"] },
  };
}
