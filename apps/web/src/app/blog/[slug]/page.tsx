import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { PostDetail } from "@xsf/contracts";
import { apiGet, ApiError } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/time";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/motion/reveal";

async function load(slug: string) {
  try { return await apiGet<PostDetail>(`/content/posts/${slug}`); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: p.seoTitle ?? p.title, description: p.seoDescription ?? p.excerpt, openGraph: { type: "article", images: [p.coverImage], publishedTime: p.publishedAt }, alternates: { canonical: `/blog/${p.slug}` } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const share = encodeURIComponent(`${SITE.url}/blog/${p.slug}`);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: p.title, image: SITE.url + p.coverImage, datePublished: p.publishedAt, author: { "@type": "Organization", name: p.authorName }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/img/logo_big.webp` } }, description: p.excerpt }} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { href: "/blog", label: "Blog" }, { label: p.title }]} />
      <article className="wrap pb-10 pt-8">
        <header className="hero-t mx-auto max-w-3xl text-center">
          <p className="text-[13px] text-muted"><Link href={`/blog?category=${encodeURIComponent(p.category)}`} className="font-semibold text-leaf-dark">{p.category}</Link> · {formatDate(p.publishedAt)} · {p.readMinutes} min read · By {p.authorName}</p>
          <h1 className="mt-3 text-[clamp(32px,4.6vw,54px)] leading-[1.08]">{p.title}</h1>
          <p className="mt-4 text-[17px] text-muted">{p.excerpt}</p>
        </header>
        <Reveal from="scale" className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-card">
          <Image src={p.coverImage} alt={p.title} width={1200} height={675} priority className="aspect-video w-full object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
        </Reveal>
        <div className="prose-site mx-auto mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: p.bodyHtml }} />
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
          <a className="rounded-full border border-line px-4 py-2 text-[13px] hover:border-ink" href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a className="rounded-full border border-line px-4 py-2 text-[13px] hover:border-ink" href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noreferrer">Facebook</a>
          <a className="rounded-full border border-line px-4 py-2 text-[13px] hover:border-ink" href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="rounded-full border border-line px-4 py-2 text-[13px] hover:border-ink" href={`https://twitter.com/intent/tweet?url=${share}&text=${encodeURIComponent(p.title)}`} target="_blank" rel="noreferrer">X</a>
        </div>
      </article>
      {p.related.length > 0 && (
        <Section tight>
          <SectionHead kick="Keep reading" title="Related articles" more={{ href: "/blog", label: "All articles" }} />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{p.related.map((r, i) => <PostCard key={r.slug} p={r} index={i} />)}</div>
        </Section>
      )}
    </>
  );
}
