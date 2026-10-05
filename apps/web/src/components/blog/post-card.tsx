import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PostCard as P } from "@xsf/contracts";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/time";

export function PostCard({ p, index = 0 }: { p: P; index?: number }) {
  return (
    <Reveal as="article" delay={(index % 4) * 60} className="group grid content-start gap-2.5">
      <Link href={`/blog/${p.slug}`} className="block aspect-[3/2] overflow-hidden rounded-card bg-soft">
        <Image src={p.coverImage} alt={p.title} width={360} height={240} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 360px" />
      </Link>
      <small className="text-[12.5px] text-muted"><Link href={`/blog?category=${encodeURIComponent(p.category)}`} className="font-semibold text-leaf-dark">{p.category}</Link> – {formatDate(p.publishedAt)}</small>
      <h3 className="text-[20px] leading-snug"><Link href={`/blog/${p.slug}`} className="hover:text-leaf-dark">{p.title}</Link></h3>
      <p className="line-clamp-2 text-[14px] text-[#444]">{p.excerpt}</p>
      <Link href={`/blog/${p.slug}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:text-leaf-dark">Read more <ArrowRight className="h-3.5 w-3.5" /></Link>
    </Reveal>
  );
}
