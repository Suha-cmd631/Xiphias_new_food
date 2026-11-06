import type { Metadata } from "next";
import { brandTitle } from "@/lib/seo";
import Image from "next/image";
import { ShieldCheck, FlaskConical, Truck } from "lucide-react";
import type { ProductCard } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, faqLd } from "@/components/seo/schemas";
import { Faq } from "@/components/ui/faq";
import { ProductGrid } from "@/components/shop/product-grid";
import { NewsletterBox } from "@/components/home/newsletter-box";
import { QuoteForm } from "@/components/forms/quote-form";
import { QuickView } from "@/components/shop/quick-view";

export const metadata: Metadata = {
  title: brandTitle("Wholesale Indian Superfoods: Bulk, Private Label & Export"),
  description: "Buy superfoods wholesale from Bengaluru: black rice, makhana, Gir cow ghee, Malabar spices, masala chai and white tea in bulk, private label or for export.",
  alternates: { canonical: "/b2b" },
};

const SERVICES = [
  { img: "/img/b2b_2.webp", alt: "Bulk sacks of grains ready for dispatch", t: "Bulk supply", lead: "For cafés, stores, restaurants and distributors", pts: ["Black rice, makhana, white tea, masala tea, green tea and more", "Flexible quantities, from sample lots upward", "Fast, reliable delivery across India", "Consistent lots, tested before dispatch"], cta: "Get bulk pricing" },
  { img: "/img/b2b_3.webp", alt: "Private label pouches on a packing table", t: "Private label", lead: "Launch your own brand with our sourcing", pts: ["The same single-origin foods we sell under our name", "Your pack, your artwork, your brand", "Artwork and label compliance review included", "Flexible minimum order quantities"], cta: "Start a private label" },
  { img: "/img/b2b_export.webp", alt: "Export cartons stacked and ready for shipping", t: "Export", lead: "Shipments to importers worldwide", pts: ["Export paperwork handled for you", "Lanes to the UAE, Europe and North America", "Ex-works, FOB or CIF pricing", "Tracking shared until delivery"], cta: "Talk to the export desk" },
];
const STEPS = [["01", "Tell us the product and volume", "From sample lots to full containers. Share your market and label requirements."], ["02", "Get a quote within a working day", "Ex-works, FOB or CIF pricing, with the certificates your market needs listed up front."], ["03", "Approve the sample, we ship", "The lab report travels with every lot, and tracking is shared until delivery."]];
const FAQS = [
  { q: "What is your minimum order for wholesale?", a: "It depends on the product and on whether you need our pack or your own label. Tell us the product and rough volume in the quote form and we will reply with minimums and pricing within one working day." },
  { q: "Can you supply under my own brand (private label)?", a: "Yes. We supply the same single-origin foods we sell under our own name, packed in your branded pouches or jars, and we review artwork and label requirements for your market." },
  { q: "Which certificates do you provide?", a: "Every lot comes with a lab report. We are FSSAI licensed and ISO certified, and for export orders we prepare the documents your market requires, such as phytosanitary certificates. Ask us about specific certifications for your country." },
  { q: "Do you export to the USA, Canada and Europe?", a: "Yes. We ship to importers in the UAE, Europe and North America and can quote ex-works, FOB or CIF. Food imports have country-specific rules, so we confirm the paperwork with you before shipping." },
  { q: "Can I get samples before ordering?", a: "Yes. We send sample packs so you can check taste, grade and packaging before you place a bulk order." },
];

export default async function B2BPage() {
  const best = await apiGet<{ items: ProductCard[] }>("/catalog/products/bestsellers", { query: { limit: 8 } }).catch(() => ({ items: [] as ProductCard[] }));
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Wholesale", path: "/b2b" }])} />
      <JsonLd data={faqLd(FAQS)} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Wholesale" }]} />
      <div className="wrap">
        <PageHero kick="Wholesale & export" title="Indian superfoods in bulk, under your label, or shipped abroad." image="/img/b2b_export.webp" alt="Xiphias export cartons ready for shipping" text="We supply cafés, stores, restaurants, brands and importers with the same single-origin teas, grains, spices, honey and ghee we sell online, bought directly from farmers and tested every lot.">
          <ButtonLink href="#quote" variant="dark">Request a quote</ButtonLink>
          <ButtonLink href="mailto:info@xiphias.in?subject=Catalogue%20request">Download catalogue</ButtonLink>
        </PageHero>
      </div>
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal from="left" className="relative">
            <span className="block overflow-hidden rounded-[28px] border border-line"><Image src="/img/b2b_1.webp" alt="Harvest crates in a greenhouse" width={640} height={427} className="aspect-[4/3] w-full object-cover" /></span>
            <div className="absolute -bottom-5 left-5 max-w-[250px] rounded-2xl border border-line bg-paper px-5 py-4 shadow-card"><b className="block font-head text-[21px] font-normal leading-tight text-royal-deep">Lab report with every lot</b><span className="text-[13px] text-muted">So you know exactly what you are stocking.</span></div>
          </Reveal>
          <Reveal from="right" delay={100}>
            <span className="kick kick-line">Why buyers choose us</span>
            <h2 className="my-3 text-[clamp(30px,3.6vw,46px)] leading-[1.08]">One supplier for rare Indian foods.</h2>
            <p className="mb-4 text-[16.5px] leading-relaxed">Sourcing heirloom rice from Assam, makhana from Bihar and pepper from Kerala usually means three suppliers and three sets of paperwork. We buy directly from growers in each region, test every lot and ship from one place.</p>
            <p className="text-[16.5px] leading-relaxed">Whether you need sacks for a kitchen, retail packs for a shelf or a container for import, you get one contact, one invoice and consistent quality from order to order.</p>
          </Reveal>
        </div>
      </Section>
      <Section tight>
        <SectionHead kick="Ways to work with us" title="Bulk, private label or export" text="Pick the route that fits your business. All three start with a quick quote." center />
        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.t} delay={i * 80} as="article" className="flex flex-col overflow-hidden rounded-[22px] border border-line bg-paper transition-shadow hover:shadow-card">
              <span className="block overflow-hidden bg-cream"><Image src={s.img} alt={s.alt} width={640} height={480} className="aspect-[4/3] w-full object-cover" /></span>
              <div className="grid flex-1 gap-2.5 p-6 pb-7">
                <h3 className="text-[26px] text-royal-deep">{s.t}</h3>
                <p className="text-[14.5px] font-semibold text-gold-deep">{s.lead}</p>
                <ul className="grid list-disc gap-1.5 pl-4.5 text-[14.5px] text-foreground/85 marker:text-gold">{s.pts.map((p) => <li key={p}>{p}</li>)}</ul>
                <ButtonLink href="#quote" size="sm" className="mt-auto justify-self-start">{s.cta}</ButtonLink>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tight>
        <SectionHead kick="How it works" title="From enquiry to delivery in three steps" />
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 80} className="rounded-[22px] border border-line bg-cream p-7"><i className="mb-3 block font-head text-[44px] font-light not-italic leading-none text-gold-deep">{n}</i><b className="mb-1.5 block font-head text-[21px] font-normal text-royal-deep">{t}</b><span className="text-[14.5px] text-foreground/85">{d}</span></Reveal>
          ))}
        </div>
      </Section>
      <Section tight id="quote">
        <Reveal from="scale" className="grid gap-10 rounded-[28px] bg-royal-deep p-8 text-white md:grid-cols-[0.9fr_1.1fr] md:p-12">
          <div>
            <span className="kick kick-line !text-gold">Request a quote</span>
            <h2 className="text-[clamp(28px,3.4vw,40px)] leading-tight text-white">Tell us what you need. We reply within one working day.</h2>
            <p className="mt-3 text-[15px] text-white/75">Importers, hotel groups, cafés, wellness brands and retailers source from the same farms we do.</p>
            <ul className="mt-6 grid gap-3 text-[14.5px]">
              <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold" /> FSSAI licensed · ISO certified</li>
              <li className="flex items-center gap-3"><FlaskConical className="h-5 w-5 text-gold" /> Lab-tested every lot, certificate on request</li>
              <li className="flex items-center gap-3"><Truck className="h-5 w-5 text-gold" /> Nationwide delivery in India · export worldwide</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-paper p-6 text-foreground"><QuoteForm /></div>
        </Reveal>
      </Section>
      <Section><SectionHead kick="Questions" title="Wholesale questions" center /><Faq items={FAQS} /></Section>
      <Section tight><SectionHead kick="Available in bulk" title="Our most-requested foods" more={{ href: "/shop", label: "All products" }} /><ProductGrid items={best.items} /></Section>
      <NewsletterBox source="b2b" />
      <QuickView />
    </>
  );
}
