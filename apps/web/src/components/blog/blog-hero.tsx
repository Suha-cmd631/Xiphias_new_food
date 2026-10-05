import Link from "next/link";
import Image from "next/image";

/** Blog header: real photography with a soft overlay (replaces the illustration). */
export function BlogHero({ total }: { total: number }) {
  return (
    <div className="relative mt-7 overflow-hidden rounded-3xl bg-ink text-white">
      <Image src="/img/poster.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
      <div className="relative px-8 py-16 sm:px-14 sm:py-24">
        <nav className="text-[13px] text-white/70"><Link href="/" className="font-semibold text-leaf">Home</Link> » Blog</nav>
        <h1 className="mt-2 text-[clamp(40px,6vw,72px)] leading-none text-white">The Xiphias Journal</h1>
        <p className="mt-4 max-w-[52ch] text-[16px] text-white/85">{total} articles on black rice, white tea, makhana, ghee, honey and the rest — written by the people who source them.</p>
      </div>
    </div>
  );
}
