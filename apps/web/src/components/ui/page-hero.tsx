import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

/** About / B2B hero: text drops in top-down, image wipes in from the right. */
export function PageHero({ kick, title, text, image, alt, children }: { kick: string; title: string; text: string; image: string; alt: string; children?: ReactNode }) {
  return (
    <Reveal from="scale" className="mt-7 grid items-center overflow-hidden rounded-3xl bg-soft md:grid-cols-[1.05fr_0.95fr]">
      <div className="hero-t p-8 sm:p-12 lg:p-16">
        <span className="kick">{kick}</span>
        <h1 className="my-3 text-[clamp(36px,5vw,64px)] leading-[1.05]">{title}</h1>
        <p className="mb-6 max-w-[54ch] text-[16.5px] text-[#444]">{text}</p>
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
      <Image src={image} alt={alt} width={760} height={507} priority className="anim-clipin h-full min-h-[320px] w-full object-cover md:min-h-[480px]" sizes="(max-width: 768px) 100vw, 600px" />
    </Reveal>
  );
}
