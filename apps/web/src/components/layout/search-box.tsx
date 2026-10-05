"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { useSuggest } from "@/lib/api/queries";

export function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const box = useRef<HTMLFormElement>(null);
  const { data, isFetching } = useSuggest(q);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  const hasResults = data && (data.products.length || data.categories.length || data.posts.length);

  return (
    <form ref={box} role="search" onSubmit={submit} className="relative">
      <div className="flex h-12 items-center rounded-full border-[1.5px] border-line bg-white pl-4 pr-1.5 focus-within:border-ink">
        <Search className="h-4.5 w-4.5 shrink-0 text-ink" aria-hidden />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          type="search"
          placeholder="Search for black rice, white tea, makhana…"
          aria-label="Search products"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-muted"
        />
        <button type="submit" className="h-9 rounded-full bg-ink px-4 text-[13.5px] font-semibold text-white hover:bg-leaf-dark">Search</button>
      </div>
      {open && q.trim().length >= 2 && (
        <div className="anim-fadein absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          {!hasResults && !isFetching && <p className="px-4 py-3 text-[14px] text-muted">No matches for “{q}”. Try “tea”, “rice” or “honey”.</p>}
          {data?.products.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-soft">
              <Image src={p.image} alt="" width={44} height={44} className="h-11 w-11 rounded-lg object-cover" />
              <span className="flex-1 text-[14.5px] font-medium text-ink">
                {p.name}
                <small className="block text-[12px] font-normal text-muted">{p.category.name}</small>
              </span>
              <b className="text-[14px] text-leaf-dark">{p.fromPrice.formatted}</b>
            </Link>
          ))}
          {!!data?.categories.length && (
            <div className="flex flex-wrap gap-2 border-t border-line px-3 py-2.5">
              {data.categories.map((c) => (
                <Link key={c.slug} href={`/shop/${c.slug}`} onClick={() => setOpen(false)} className="rounded-full border border-line px-3 py-1 text-[13px] hover:border-ink">
                  Shelf: {c.name}
                </Link>
              ))}
            </div>
          )}
          {!!data?.posts.length && (
            <div className="border-t border-line px-3 py-2">
              <small className="kick !mb-1 !text-[11px]">Articles</small>
              {data.posts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} onClick={() => setOpen(false)} className="block py-1 text-[14px] text-ink hover:text-leaf-dark">{p.title}</Link>
              ))}
            </div>
          )}
          <button type="submit" className="block w-full border-t border-line px-4 py-2.5 text-left text-[13.5px] font-semibold text-leaf-dark hover:bg-soft">See all results for “{q}” →</button>
        </div>
      )}
    </form>
  );
}
