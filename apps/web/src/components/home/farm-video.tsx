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
      <Reveal from="scale" className="relative min-h-[420px] overflow-hidden rounded-card bg-ink text-white md:min-h-[520px]">
        <video ref={ref} data-src="/img/farm.mp4" poster="/img/poster.webp" muted={muted} loop playsInline preload="none" aria-label="Aerial view of our fields" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        <div className="relative flex h-full min-h-[420px] max-w-xl flex-col justify-center p-8 md:min-h-[520px] md:p-14">
          <small className="kick !text-leaf">From sunrise fields to your plate</small>
          <h2 className="text-[clamp(34px,4.5vw,56px)] leading-[1.05] text-white">Rooted in Nature</h2>
          <p className="mt-3 text-[16px] text-white/80">Simple harvests, slow mornings, and timeless grains. Our millets come straight from the land — no shortcuts, just the way it's meant to be.</p>
          <ButtonLink href="/shop" variant="white" className="mt-6 self-start">Discover the Goodness</ButtonLink>
        </div>
        <div className="absolute bottom-5 right-5 flex gap-2">
          <button onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/40">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute video" : "Mute video"} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/40">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
        </div>
      </Reveal>
    </Section>
  );
}
