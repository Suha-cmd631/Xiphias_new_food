import type { Metadata } from "next";
import { brandTitle } from "@/lib/seo";
import type { Page } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { PageHeader } from "@/components/ui/section";
import { Faq } from "@/components/ui/faq";
import { JsonLd } from "@/components/seo/json-ld";
import { faqLd } from "@/components/seo/schemas";

export const metadata: Metadata = { title: brandTitle("FAQ: Shipping, Payments, Returns & Products"), description: "Answers about shipping to the USA and India, delivery times, payments, returns, storage and our products. Can't find yours? Our team replies within a day.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const p = await apiGet<Page>("/content/pages/faq");
  // The page body is stored as h2 + p pairs; render them as an accordion.
  const items = [...p.bodyHtml.matchAll(/<h2>(.*?)<\/h2>\s*<p>(.*?)<\/p>/gs)].map((m) => ({ q: m[1]!, a: `<p>${m[2]}</p>` }));
  return (
    <>
      <JsonLd data={faqLd(items.map((i) => ({ q: i.q, a: i.a.replace(/<[^>]+>/g, "") })))} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "FAQ" }]} title="Frequently asked questions" text="Shipping, payments, returns, storage and our products. Can't find your answer? Contact us and we reply within one business day." />
      <div className="wrap pb-20 pt-6"><Faq items={items} /></div>
    </>
  );
}
