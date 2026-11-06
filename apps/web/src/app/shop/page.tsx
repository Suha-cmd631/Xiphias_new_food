import type { Metadata } from "next";
import { brandTitle } from "@/lib/seo";
import type { ProductListResponse, RegionsResponse } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { shopParams, type SP } from "@/lib/shop-params";
import { PageHeader } from "@/components/ui/section";
import { ShopView } from "@/components/shop/shop-view";

export const metadata: Metadata = { title: brandTitle("Shop Indian Superfoods: Teas, Rice, Spices, Ghee"), description: "Shop 16 single-origin superfoods: black rice, makhana, Gir cow ghee, raw honey, Malabar spices and Silver Needle white tea. Lab-tested, shipped from Bengaluru.", alternates: { canonical: "/shop" } };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const params = shopParams(await searchParams);
  const [data, regions] = await Promise.all([apiGet<ProductListResponse>("/catalog/products", { query: params }), apiGet<RegionsResponse>("/regions")]);
  const currency = regions.regions.find((r) => r.code === regions.current)?.currency ?? "INR";
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Shop" }]} title="Shop all superfoods" text="Sixteen single-origin foods from India's small farms. Filter by shelf, diet, pack size, origin or price." />
      <ShopView data={data} basePath="/shop" params={params} currency={currency} />
    </>
  );
}
