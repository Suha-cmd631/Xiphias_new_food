"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Gallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [i, setI] = useState(0);
  const cur = images[i] ?? images[0]!;
  return (
    <div className="grid gap-3">
      <div className="anim-clipin aspect-square overflow-hidden rounded-card bg-soft">
        <Image key={cur.url} src={cur.url} alt={cur.alt || name} width={800} height={800} priority className="anim-fadein h-full w-full object-cover" sizes="(max-width: 768px) 100vw, 560px" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((im, k) => (
            <button key={im.url} onClick={() => setI(k)} aria-pressed={k === i} aria-label={`Show photo ${k + 1} of ${images.length}`} className={cn("h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors", k === i ? "border-ink" : "border-transparent hover:border-line")}>
              <Image src={im.url} alt="" width={80} height={80} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
