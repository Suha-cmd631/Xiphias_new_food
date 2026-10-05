import type { Metadata } from "next";
import type { Page } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { PageHeader } from "@/components/ui/section";
import { Faq } from "@/components/ui/faq";

export const metadata: Metadata = { title: "FAQ", description: "Shipping, payments, returns and product questions answered.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const p = await apiGet<Page>("/content/pages/faq");
  // The page body is stored as h2 + p pairs; render them as an accordion.
  const items = [...p.bodyHtml.matchAll(/<h2>(.*?)<\/h2>\s*<p>(.*?)<\/p>/gs)].map((m) => ({ q: m[1]!, a: `<p>${m[2]}</p>` }));
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "FAQ" }]} title="Frequently asked questions" />
      <div className="wrap pb-20 pt-6"><Faq items={items} /></div>
    </>
  );
}
