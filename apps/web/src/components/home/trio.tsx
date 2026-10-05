import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";

const CARDS = [
  { bg: "bg-sage", img: "/img/life_rice.webp", alt: "Organic black rice in a wooden spoon", kick: "New arrival", title: "Organic Black Rice", text: "Rich in antioxidants, fibre-packed, and perfect for wholesome meals.", href: "/products/organic-black-rice", cta: "Shop Now" },
  { bg: "bg-beige", img: "/img/life_immunity.webp", alt: "Cyclists at sunrise", kick: "Introducing", title: "Immunity-Boosting Blends", text: "Blends of natural herbs, seeds, and spices that strengthen immunity and wellness naturally.", href: "/shop/teas", cta: "Explore More" },
  { bg: "bg-sky", img: "/img/life_community.webp", alt: "Runner on a seaside boardwalk", kick: "From our community", title: "Loved by Wellness Enthusiasts", text: "See how our customers incorporate organic superfoods into daily life.", href: "/blog", cta: "Read Stories" },
];

export function Trio() {
  return (
    <Section tight ariaLabel="Featured">
      <div className="grid gap-6 md:grid-cols-3">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 80} as="article" className={`group relative flex flex-col overflow-hidden rounded-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card ${c.bg}`}>
            <Link href={c.href} className="block aspect-[1/1.05] overflow-hidden">
              <Image src={c.img} alt={c.alt} width={640} height={672} className="pop h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 400px" />
            </Link>
            <div className="grid flex-1 content-start gap-3 p-8 pt-9">
              <span className="kick">{c.kick}</span>
              <h3 className="text-[28px] leading-tight">{c.title}</h3>
              <p className="text-[15px] text-[#444]">{c.text}</p>
              <Link href={c.href} className={buttonVariants({ variant: "outline", size: "md", className: "mt-2 justify-self-start" })}>{c.cta}</Link>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
