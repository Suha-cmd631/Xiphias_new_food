"use client";
import { create } from "zustand";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ProductDetail } from "@xsf/contracts";
import { api } from "@/lib/api/client";
import { BuyBox } from "@/components/product/buy-box";
import { Skeleton, ErrorState } from "@/components/ui/feedback";
import { useOverlay } from "@/lib/use-overlay";

export const useQuickView = create<{ slug: string | null; open: (s: string) => void; close: () => void }>((set) => ({ slug: null, open: (slug) => set({ slug }), close: () => set({ slug: null }) }));

export function QuickView() {
  const { slug, close } = useQuickView();
  const q = useQuery({ queryKey: ["product", slug], queryFn: () => api.get<ProductDetail>(`/catalog/products/${slug}`), enabled: !!slug });
  useOverlay(!!slug, close);
  if (!slug) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={close} role="dialog" aria-modal="true" aria-label="Quick view">
      <div className="anim-fadein relative grid max-h-[92vh] w-full max-w-3xl gap-6 overflow-y-auto rounded-card bg-white p-6 md:grid-cols-2 md:p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 p-1"><X className="h-5 w-5" /></button>
        {q.isLoading && <><Skeleton className="aspect-square" /><div className="grid gap-3"><Skeleton className="h-8" /><Skeleton className="h-24" /></div></>}
        {q.isError && <ErrorState className="md:col-span-2" message="Couldn't load this product." onRetry={() => q.refetch()} />}
        {q.data && (
          <>
            <Image src={q.data.image} alt={q.data.name} width={600} height={600} className="aspect-square w-full rounded-xl object-cover" />
            <div>
              <span className="kick">{q.data.category.name}</span>
              <h2 className="text-[28px] leading-tight">{q.data.name}</h2>
              <p className="mt-2 text-[14.5px] text-[#444]">{q.data.description}</p>
              <BuyBox product={q.data} compact onAdded={close} />
              <Link href={`/products/${q.data.slug}`} onClick={close} className="mt-4 inline-block text-[14px] font-semibold text-leaf-dark underline">Full details →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
