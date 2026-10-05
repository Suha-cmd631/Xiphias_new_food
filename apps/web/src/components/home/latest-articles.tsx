import type { PostListResponse } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { Section, SectionHead } from "@/components/ui/section";
import { PostCard } from "@/components/blog/post-card";

export async function LatestArticles() {
  const data = await apiGet<PostListResponse>("/content/posts", { query: { perPage: 3 } }).catch(() => null);
  if (!data?.items.length) return null;
  return (
    <Section tight>
      <SectionHead kick="Latest articles" title="From the journal" more={{ href: "/blog", label: "Visit the blog" }} />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((p, i) => <PostCard key={p.slug} p={p} index={i} />)}</div>
    </Section>
  );
}
