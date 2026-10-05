import Image from "next/image";
import Link from "next/link";
import type { ProductDetail } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { Reveal, WordRise } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { BuyBox } from "@/components/product/buy-box";

/** One product, told properly: big photo, story, pack sizes and add-to-cart — without leaving the home page. */
export async function Spotlight({ slug, flip, bg = "bg-soft", kick, blurb }: { slug: string; flip?: boolean; bg?: string; kick: string; blurb?: string }) {
  const p = await apiGet<ProductDetail>(`/catalog/products/${slug}`).catch(() => null);
  if (!p) return null;
  return (
    <Section tight>
      <div className={`grid items-center gap-8 overflow-hidden rounded-card ${bg} md:grid-cols-2`}>
        <Reveal from={flip ? "right" : "left"} className={`pic relative aspect-square md:aspect-auto md:h-full ${flip ? "md:order-2" : ""}`}>
          <span className="imw block h-full"><Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="scale-[1.3] object-cover object-[55%_70%]" /></span>
        </Reveal>
        <Reveal from={flip ? "left" : "right"} delay={100} className="p-8 sm:p-12 lg:p-14">
          <span className="kick">{kick}</span>
          <h2 className="text-[clamp(30px,3.4vw,44px)] leading-[1.1]"><WordRise text={p.name} /></h2>
          <p className="mt-4 text-[15.5px] text-[#444]">{blurb ?? p.description}</p>
          <BuyBox product={p} compact />
          <Link href={`/products/${p.slug}`} className="mt-4 inline-block text-[14px] font-semibold text-leaf-dark underline">Full details &amp; origin →</Link>
        </Reveal>
      </div>
    </Section>
  );
}
