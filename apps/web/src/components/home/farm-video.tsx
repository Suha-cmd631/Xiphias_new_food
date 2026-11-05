"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

/** The site's "Rooted in Nature" band. Video loads only when scrolled near (saves ~2.5 MB on first paint). */
export function FarmVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      v.src = v.dataset.src!;
      v.load();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => setPlaying(false));
      else setPlaying(false);
    }, { rootMargin: "600px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const toggle = () => { const v = ref.current!; if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } };
  return (
    <Section tight ariaLabel="Rooted in nature">
      <Reveal from="scale" className="relative min-h-[440px] overflow-hidden rounded-3xl bg-ink text-white md:min-h-[540px]">
        <video ref={ref} data-src="/img/farm.mp4" poster="/img/poster.webp" muted={muted} loop playsInline preload="none" aria-label="Illustrated farm at sunset" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/5 md:bg-gradient-to-r md:from-ink/80 md:via-ink/35 md:to-transparent" />
        <div className="relative flex h-full min-h-[440px] max-w-[620px] flex-col justify-end px-7 pb-20 pt-10 sm:px-12 md:min-h-[540px] md:justify-center md:pb-10 lg:px-16 xl:px-20">
          <span className="kick !text-gold">Our farm story</span>
          <h2 className="text-[clamp(34px,4.4vw,60px)] leading-[1.04] text-white">Rooted <em className="font-light">in nature</em></h2>
          <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-white/85">Simple harvests, slow mornings and timeless grains — straight from the land, with no shortcuts.</p>
          <ButtonLink href="/about" variant="white" className="mt-7 self-start">Read our story</ButtonLink>
        </div>
        <div className="absolute bottom-5 right-5 flex gap-2">
          <button onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/35">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute video" : "Mute video"} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/35">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
        </div>
      </Reveal>
    </Section>
  );
}
