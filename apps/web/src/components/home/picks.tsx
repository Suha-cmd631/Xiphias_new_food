import Image from "next/image";
import Link from "next/link";
import { SectionHead } from "@/components/ui/section";

const PICKS = [
  ["picks_white_tea", "Silver Needle White Tea", "/products/silver-needle-white-tea"],
  ["picks_masala_tea", "Masala Tea", "/products/masala-tea-indian-spiced"],
  ["picks_ginger_powder", "Organic Ginger Powder", "/products/premium-organic-ginger-powder"],
  ["picks_black_rice", "Organic Black Rice", "/products/organic-black-rice"],
  ["picks_buckwheat", "Buckwheat", "/products/premium-organic-buckwheat"],
  ["picks_joha_rice", "Aromatic Joha Rice", "/products/premium-aromatic-joha-rice"],
  ["picks_makhana", "Premium Makhana", "/products/premium-makhana-fox-nuts"],
] as const;

/** The original "Nutritious Picks" strip: a slow, endless row of product photos. Pauses on hover. */
export function Picks() {
  const items = [...PICKS, ...PICKS];
  return (
    <section className="py-10 sm:py-14" aria-label="Nutritious picks">
      <div className="wrap"><SectionHead kick="Handpicked" title="Nutritious picks for a healthier you" text="Handpicked superfoods to nourish your body and delight your senses — from wholesome almonds to soothing white tea." center from="top" /></div>
      <div className="group overflow-hidden">
        <div className="anim-marquee-slow flex w-max gap-5 px-4 group-hover:[animation-play-state:paused]">
          {items.map(([img, name, href], i) => (
            <Link key={i} href={href} className="relative block h-[220px] w-[220px] shrink-0 overflow-hidden rounded-card bg-soft sm:h-[260px] sm:w-[260px]">
              <Image src={`/img/${img}.webp`} alt={name} fill sizes="260px" className="object-cover transition-transform duration-700 hover:scale-105" />
              <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-3 py-1.5 text-center text-[12.5px] font-semibold text-ink">{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
