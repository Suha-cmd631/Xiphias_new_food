import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import type { ProductCard } from "@xsf/contracts";
import { GUIDES, guideBySlug } from "@/lib/learn";
import { apiGet } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { Faq } from "@/components/ui/faq";
import { ProductGrid } from "@/components/shop/product-grid";
import { QuickView } from "@/components/shop/quick-view";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, faqLd } from "@/components/seo/schemas";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return { title: "Not found" };
  return {
    title: { absolute: g.title },
    description: g.description,
    alternates: { canonical: `/learn/${g.slug}` },
    openGraph: { type: "article", title: g.title, description: g.description, images: [g.image] },
  };
}

/** The products a guide is about, priced for the visitor's region. A guide still renders if the catalogue is down. */
async function guideProducts(slugs: string[]): Promise<ProductCard[]> {
  const all = await apiGet<{ items: ProductCard[] }>("/catalog/products", { query: { perPage: 48 } }).catch(() => ({ items: [] as ProductCard[] }));
  return slugs.map((s) => all.items.find((p) => p.slug === s)).filter((p): p is ProductCard => !!p);
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const [products] = await Promise.all([guideProducts(g.products)]);
  const others = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.h1,
    description: g.description,
    image: [SITE.url + g.image],
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/img/logo_big.webp` } },
    mainEntityOfPage: `${SITE.url}/learn/${g.slug}`,
  };
  return (
    <>
      <JsonLd data={article} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Learn", path: "/learn" }, { name: g.h1, path: `/learn/${g.slug}` }])} />
      <JsonLd data={faqLd(g.faqs)} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { href: "/learn", label: "Learn" }, { label: g.kicker }]} />
      <article>
        <Section tight>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <span className="kick kick-line">{g.kicker}</span>
              <h1 className="max-w-[20ch] text-[clamp(34px,4.4vw,58px)] leading-[1.04]">{g.h1}</h1>
              <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted"><Clock className="h-3.5 w-3.5" /> {g.minutes} min read · by the Xiphias team, Bengaluru</p>
              <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-foreground">{g.intro}</p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-line bg-cream">
              <Image src={g.image} alt={g.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className=" object-cover" />
            </div>
          </div>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {g.facts.map((f) => (
              <div key={f.label} className="bg-paper p-5">
                <dt className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-gold-deep">{f.label}</dt>
                <dd className="mt-1 font-head text-[20px] leading-snug text-royal-deep">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section tight className="pt-0">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="prose-site max-w-[72ch] [&_h2]:font-head [&_h2]:font-light [&_h2]:text-royal-deep [&_li]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3">
              {g.sections.map((s) => (
                <section key={s.heading}>
                  <h2>{s.heading}</h2>
                  <div dangerouslySetInnerHTML={{ __html: s.html }} />
                </section>
              ))}
            </div>
            <aside className="h-fit rounded-[22px] border border-line bg-paper p-6 lg:sticky lg:top-40">
              <span className="kick">More guides</span>
              <ul className="grid gap-3 text-[15px]">
                {others.map((o) => <li key={o.slug}><Link href={`/learn/${o.slug}`} className="font-head text-[18px] leading-snug text-ink hover:text-royal">{o.h1}</Link></li>)}
              </ul>
              <Link href="/learn" className="mt-5 inline-block border-b border-gold pb-0.5 text-[14px] font-semibold text-royal">All guides →</Link>
            </aside>
          </div>
        </Section>
        <Section tight ariaLabel="Questions">
          <SectionHead kick="Questions" title="Quick answers" center />
          <Faq items={g.faqs} />
        </Section>
      </article>
      {products.length > 0 && (
        <Section tight>
          <SectionHead kick="Shop" title={products.length === 1 ? "Used in this guide" : "Used in this guide"} more={{ href: "/shop", label: "All products" }} />
          <ProductGrid items={products} />
        </Section>
      )}
      <QuickView />
    </>
  );
}
