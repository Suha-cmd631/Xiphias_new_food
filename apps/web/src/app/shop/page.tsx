import type { Metadata } from "next";
import type { ProductListResponse, RegionsResponse } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { shopParams, type SP } from "@/lib/shop-params";
import { PageHeader } from "@/components/ui/section";
import { ShopView } from "@/components/shop/shop-view";

export const metadata: Metadata = { title: "Shop organic superfoods", description: "Sixteen certified organic superfoods — teas, grains, spices, nuts, honey and ghee. Filter by shelf, diet, pack size, origin or price.", alternates: { canonical: "/shop" } };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const params = shopParams(await searchParams);
  const [data, regions] = await Promise.all([apiGet<ProductListResponse>("/catalog/products", { query: params }), apiGet<RegionsResponse>("/regions")]);
  const currency = regions.regions.find((r) => r.code === regions.current)?.currency ?? "INR";
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Shop" }]} title="All products" text="Sixteen certified organic superfoods. Filter by shelf, diet, pack size, origin or price." />
      <ShopView data={data} basePath="/shop" params={params} currency={currency} />
    </>
  );
}
