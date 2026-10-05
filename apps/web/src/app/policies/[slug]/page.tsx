import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Page } from "@xsf/contracts";
import { apiGet, ApiError } from "@/lib/api/server";
import { PageHeader } from "@/components/ui/section";
import { formatDate } from "@/lib/time";
import { brandTitle } from "@/lib/seo";

const SLUGS = ["shipping", "returns", "terms", "privacy", "cookies"];
async function load(slug: string) {
  if (!SLUGS.includes(slug)) return null;
  try { return await apiGet<Page>(`/content/pages/${slug}`); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: brandTitle(p.seoTitle ?? p.title), description: p.seoDescription ?? `${p.title} for orders placed with Xiphias Superfoods — what applies in India and for international deliveries.`, alternates: { canonical: `/policies/${p.slug}` } };
}
export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Policies" }, { label: p.title }]} title={p.title} text={`Last updated ${formatDate(p.updatedAt)}`} />
      <div className="wrap pb-20 pt-6"><div className="prose-site max-w-[76ch]" dangerouslySetInnerHTML={{ __html: p.bodyHtml }} /></div>
    </>
  );
}
