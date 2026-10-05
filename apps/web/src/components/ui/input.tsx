import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-ink", className)} {...props} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn("w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-ink", className)} {...props} />;
}
export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn("h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-[15px] outline-none focus:border-ink", className)} {...props} />;
}
export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("grid gap-1.5 text-[13.5px] font-semibold text-ink", className)} {...props} />;
}
export function FieldError({ children }: { children?: string }) {
  return children ? <span className="text-[12.5px] font-normal text-danger">{children}</span> : null;
}
