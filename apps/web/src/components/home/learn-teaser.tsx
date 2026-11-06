import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHead } from "@/components/ui/section";
import { GUIDES } from "@/lib/learn";

/** Three guides on the home page: they answer the questions people search for and link straight to the product. */
export function LearnTeaser() {
  const picks = ["how-to-brew-white-tea", "how-to-cook-black-rice", "what-is-makhana"].map((s) => GUIDES.find((g) => g.slug === s)!).filter(Boolean);
  return (
    <Section ariaLabel="Guides">
      <SectionHead kick="Learn" title="Guides that answer what you're searching for" text="Brewing temperatures, cooking ratios and simple recipes, from the people who source the food." more={{ href: "/learn", label: "All guides" }} />
      <div className="grid gap-5 md:grid-cols-3">
        {picks.map((g, i) => (
          <Reveal key={g.slug} delay={i * 80}>
            <Link href={`/learn/${g.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-paper transition-shadow hover:shadow-card">
              <span className="relative block aspect-[16/10] overflow-hidden bg-cream">
                <Image src={g.image} alt={g.imageAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className=" object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
              </span>
              <span className="flex flex-1 flex-col p-6">
                <span className="kick">{g.kicker}</span>
                <span className="font-head text-[23px] leading-snug text-ink">{g.h1}</span>
                <span className="mt-2 flex-1 text-[14.5px] text-muted">{g.facts.slice(0, 2).map((f) => `${f.label}: ${f.value}`).join(" · ")}</span>
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
  );
}
