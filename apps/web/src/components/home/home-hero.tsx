import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CouponChip } from "./coupon-chip";

type Feature = { name: string; href: string; price: string | null; pack: string | null };

/**
 * Home hero: one clear promise on the left, the Silver Needle pack in a gold-lined arch on the right.
 * Static on purpose: the H1 and the pack photo are the first thing Google and shoppers see, with no slider delay.
 */
export function HomeHero({ feature }: { feature: Feature }) {
  return (
    <section aria-label="Welcome" className="relative overflow-hidden">
      <div className="wrap grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="hero-t">
          <span className="kick kick-line">Single-origin superfoods, shipped from India</span>
          <h1 className="max-w-[16ch] text-[clamp(40px,5.6vw,80px)] leading-[1.02] text-balance">
            Rare superfoods, <em className="font-light text-royal">straight</em> from the farms that grow them.
          </h1>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-muted sm:text-[18px]">
            Heirloom black rice, makhana, Gir cow ghee and raw honey from India's small farms, plus rare teas like Silver Needle. Sourced lot by lot, lab-tested, and shipped from Bengaluru to your door.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/shop" variant="dark" size="lg">Shop the collection</ButtonLink>
            <ButtonLink href={feature.href} size="lg">Start with white tea <ArrowRight className="h-4 w-4" /></ButtonLink>
          </div>
          <CouponChip className="mt-6" />
          <dl className="mt-9 grid max-w-[520px] grid-cols-3 gap-4 border-t border-line pt-6 text-[13.5px] text-muted">
            <div><dt className="sr-only">Range</dt><dd><b className="block font-head text-[26px] font-light leading-none text-ink">16</b>single-origin foods</dd></div>
            <div><dt className="sr-only">Dispatch</dt><dd><b className="block font-head text-[26px] font-light leading-none text-ink">1–2 days</b>to dispatch</dd></div>
            <div><dt className="sr-only">Testing</dt><dd><b className="block font-head text-[26px] font-light leading-none text-ink">Every lot</b>lab-tested</dd></div>
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-[560px] anim-cardin">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[28px] border border-line bg-cream">
            <Image src="/img/pack_white.webp" alt="Xiphias Silver Needle White Tea pouch with loose buds and a cup of tea" fill priority sizes="(max-width: 1024px) 90vw, 560px" className="origin-[65%_80%] scale-[1.2] object-cover mix-blend-multiply" />
            <span aria-hidden className="pointer-events-none absolute inset-3.5 rounded-t-[999px] rounded-b-[18px] border border-gold/60" />
          </div>
          <Link href={feature.href} className="absolute bottom-8 left-4 max-w-[78%] rounded-2xl border border-line bg-paper/95 px-5 py-4 shadow-card backdrop-blur-sm transition-transform hover:-translate-y-0.5 sm:left-6">
            <span className="block font-head text-[19px] leading-tight text-ink">{feature.name}</span>
            <span className="mt-1 block text-[13.5px] text-muted">Hand-picked buds{feature.price ? <> · <b className="font-semibold text-royal">{feature.price}</b>{feature.pack ? ` / ${feature.pack}` : ""}</> : null}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
