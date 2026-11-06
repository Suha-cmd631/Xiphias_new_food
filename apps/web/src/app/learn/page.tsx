import type { Metadata } from "next";
import { brandTitle } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { GUIDES } from "@/lib/learn";
import { PageHeader, Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: brandTitle("Learn: Brewing Guides & Recipes for Indian Superfoods"),
  description: "How to brew white tea, cook black rice, roast makhana, make masala chai, brew butterfly pea tea and use Gir cow ghee. Clear steps, US and metric units.",
  alternates: { canonical: "/learn" },
};

/** Learn hub: every guide, with its key numbers on the card. */
export default function LearnPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Learn", path: "/learn" }])} />
      <JsonLd data={itemListLd("Guides", GUIDES.map((g) => ({ name: g.h1, path: `/learn/${g.slug}` })))} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Learn" }]} title="Brewing guides & recipes" text="Temperatures, ratios and simple recipes for everything we sell, written by the people who source it. US and metric units throughout." />
      <Section tight>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Reveal key={g.slug} delay={(i % 3) * 70}>
              <Link href={`/learn/${g.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-paper transition-shadow hover:shadow-card">
                <span className="relative block aspect-[16/10] overflow-hidden bg-cream">
                  <Image src={g.image} alt={g.imageAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className=" object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                </span>
                <span className="flex flex-1 flex-col p-6">
                  <span className="kick">{g.kicker}</span>
                  <h2 className="font-head text-[24px] font-normal leading-snug text-ink">{g.h1}</h2>
                  <ul className="mt-3 grid flex-1 gap-1 text-[14px] text-muted">
                    {g.facts.slice(0, 3).map((f) => <li key={f.label}><b className="font-semibold text-ink">{f.label}:</b> {f.value}</li>)}
                  </ul>
                  <span className="mt-5 flex items-center justify-between text-[14px] font-semibold text-royal">
                    <span className="inline-flex items-center gap-1.5 border-b border-gold pb-0.5">Read the guide <ArrowRight className="h-3.5 w-3.5" /></span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-normal text-muted"><Clock className="h-3.5 w-3.5" /> {g.minutes} min</span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
