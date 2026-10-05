import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  {
    variants: {
      variant: {
        outline: "border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white",
        dark: "bg-ink text-white hover:bg-leaf-dark",
        leaf: "bg-leaf text-ink hover:bg-leaf-dark hover:text-white",
        ghost: "text-ink hover:bg-soft",
        white: "bg-white text-ink shadow-card hover:bg-leaf",
      },
      size: { sm: "h-9 px-4 text-[13.5px]", md: "h-11 px-6 text-[14.5px]", lg: "h-13 px-8 text-[15.5px]", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

type Props = VariantProps<typeof buttonVariants> & { className?: string; children: ReactNode };

export function Button({ className, variant, size, ...props }: Props & ComponentProps<"button">) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ className, variant, size, ...props }: Props & ComponentProps<typeof Link>) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
