import Link from "next/link";
import Image from "next/image";
import type { Category } from "@xsf/contracts";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHead } from "@/components/ui/section";

export function Shelves({ categories }: { categories: Category[] }) {
  return (
    <Section>
      <SectionHead kick="Shop by shelf" title="Five shelves, sixteen honest foods" text="Pick a shelf to open the shop already filtered. Every product is certified organic and traceable to the district it came from." more={{ href: "/shop", label: "All 16 products" }} from="top" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 70} className="group">
            <Link href={`/shop/${c.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-card bg-soft shadow-card">
              <Image src={c.image ?? "/img/rice.webp"} alt="" fill sizes="(max-width: 640px) 50vw, 240px" className="pop origin-bottom-right scale-[1.08] object-cover object-right transition-transform duration-700 group-hover:scale-[1.14]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-semibold text-ink">{c.productCount} products</span>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <h3 className="text-[20px] font-medium text-white">{c.name}</h3>
                <span className="text-[12.5px] text-white/80">{c.description}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
