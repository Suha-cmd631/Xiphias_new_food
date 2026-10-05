import type { Metadata } from "next";
import type { Page } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { PageHeader } from "@/components/ui/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Our store – Koramangala, Bengaluru", alternates: { canonical: "/store" } };

export default async function StorePage() {
  const p = await apiGet<Page>("/content/pages/store");
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Store", name: SITE.name, address: SITE.address, telephone: SITE.phone, openingHours: ["Mo-Fr 09:00-17:00", "Sa 10:00-13:00"] }} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Store" }]} title={p.title} />
      <div className="wrap grid gap-10 pb-20 pt-6 lg:grid-cols-2">
        <div className="prose-site" dangerouslySetInnerHTML={{ __html: p.bodyHtml }} />
        <iframe title="Map" className="h-80 w-full rounded-card border-0 lg:h-full" loading="lazy" src="https://www.google.com/maps?q=JK+Nirmala+Arcade+80+Feet+Road+Koramangala+Bengaluru&output=embed" />
      </div>
    </>
  );
}
