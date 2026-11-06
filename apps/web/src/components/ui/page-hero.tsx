import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

/** About / B2B hero: text drops in top-down, image wipes in from the right. */
export function PageHero({ kick, title, text, image, alt, children }: { kick: string; title: string; text: string; image: string; alt: string; children?: ReactNode }) {
  return (
    <Reveal from="scale" className="mt-7 grid items-center overflow-hidden rounded-[28px] border border-line bg-cream md:grid-cols-[1.05fr_0.95fr]">
      <div className="hero-t p-8 sm:p-12 lg:p-16">
        <span className="kick kick-line">{kick}</span>
        <h1 className="my-3 text-[clamp(34px,4.6vw,62px)] leading-[1.06]">{title}</h1>
        <p className="mb-7 max-w-[56ch] text-[16.5px] leading-relaxed text-foreground/85">{text}</p>
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
      <Image src={image} alt={alt} width={760} height={507} priority className="anim-clipin h-full min-h-[320px] w-full object-cover md:min-h-[480px]" sizes="(max-width: 768px) 100vw, 600px" />
    </Reveal>
  );
}
