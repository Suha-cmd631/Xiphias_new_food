import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

/** Wholesale gets real weight on the home page: one calm royal-blue band that sends buyers to /b2b. */
export function B2BStrip() {
  return (
    <Section tight ariaLabel="For businesses">
      <Reveal from="scale" className="grid overflow-hidden rounded-3xl bg-royal-deep text-white md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col justify-center px-7 py-11 sm:px-12 sm:py-14 lg:px-16 lg:py-20 xl:px-20">
          <span className="kick !text-gold">For businesses</span>
          <h2 className="max-w-[15ch] text-[clamp(31px,3.7vw,52px)] leading-[1.06] text-white">Bulk supply, private label <em className="font-light text-gold">and export</em></h2>
          <p className="mt-5 max-w-[44ch] text-[15.5px] leading-relaxed text-white/80 sm:text-[16.5px]">For retailers, brands and importers. Tell us the product and the volume, and get a landed quote in 24 hours.</p>
          <div className="mt-8">
            <ButtonLink href="/b2b" variant="gold" size="lg">Request a quote <ArrowRight className="h-4 w-4" /></ButtonLink>
          </div>
        </div>
        <div className="relative min-h-[260px] md:min-h-[440px]">
          <Image src="/img/b2b_export.webp" alt="Xiphias pouches and an export carton ready for shipping" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
        </div>
      </Reveal>
    </Section>
  );
}
