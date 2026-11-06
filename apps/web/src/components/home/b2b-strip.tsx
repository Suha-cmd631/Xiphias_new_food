import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

/** Wholesale on the home page: a calm cream band that sends buyers to /b2b. */
export function B2BStrip() {
  return (
    <Section tight ariaLabel="Wholesale">
      <Reveal from="scale" className="grid overflow-hidden rounded-[28px] border border-line bg-cream md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14 lg:px-16">
          <span className="kick kick-line">Wholesale &amp; private label</span>
          <h2 className="max-w-[18ch] text-[clamp(30px,3.4vw,46px)] leading-[1.08]">Stocking a café, store or brand?</h2>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-muted">Bulk supply, private label and export from one source, with lab reports for every lot. Tell us the product and the volume; we reply with a landed quote within one working day.</p>
          <div className="mt-7">
            <ButtonLink href="/b2b" variant="dark" size="lg">Request a quote <ArrowRight className="h-4 w-4" /></ButtonLink>
          </div>
        </div>
        <div className="relative min-h-[240px] md:min-h-[380px]">
          <Image src="/img/b2b_export.webp" alt="Xiphias pouches and an export carton ready for shipping" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        </div>
      </Reveal>
    </Section>
  );
}
