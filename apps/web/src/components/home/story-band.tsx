"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";

/** Royal-blue story band: where the food comes from, beside the farm film (loads only when scrolled near). */
export function StoryBand() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      v.src = v.dataset.src!;
      v.load();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }, { rootMargin: "500px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const toggle = () => { const v = ref.current!; if (v.paused) { void v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } };
  return (
    <section aria-label="Our story" className="my-10 bg-royal-deep text-[#e9eef8] sm:my-16">
      <div className="wrap grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal from="left">
          <span className="kick kick-line !text-gold">Our story</span>
          <h2 className="max-w-[18ch] text-[clamp(32px,3.8vw,54px)] leading-[1.06] !text-white">From India&apos;s oldest growing regions, without the middlemen.</h2>
          <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-[#c9d5ea]">We buy directly from farmer groups in Assam, Bihar, Gujarat and the Malabar coast, test every lot, and ship from Bengaluru. Fewer hands between the field and your kitchen means fresher food and fairer prices for the people who grow it.</p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-gold/40 pt-6 text-[13.5px] text-[#c9d5ea]">
            <div><dt className="sr-only">Dispatch</dt><dd><b className="block font-head text-[34px] font-light leading-none text-gold">1–2</b>days to dispatch</dd></div>
            <div><dt className="sr-only">Testing</dt><dd><b className="block font-head text-[34px] font-light leading-none text-gold">100%</b>of lots lab-tested</dd></div>
            <div><dt className="sr-only">Range</dt><dd><b className="block font-head text-[34px] font-light leading-none text-gold">16</b>foods, one source</dd></div>
          </dl>
          <ButtonLink href="/about" variant="gold" className="mt-8">Read our story</ButtonLink>
        </Reveal>
        <Reveal from="right" className="relative overflow-hidden rounded-[28px] bg-ink">
          <video ref={ref} data-src="/img/farm.mp4" poster="/img/poster.webp" muted loop playsInline preload="none" aria-label="Aerial view of the fields we buy from" className="aspect-[4/3] h-full w-full object-cover" />
          <button onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/35">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
        </Reveal>
      </div>
    </section>
  );
}
