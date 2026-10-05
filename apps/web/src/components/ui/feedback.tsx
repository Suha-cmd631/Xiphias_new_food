import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-soft", className)} />;
}

export function ErrorState({ message, onRetry, className }: { message?: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("rounded-2xl border border-rose bg-rose/40 px-5 py-4 text-[14.5px] text-ink", className)}>
      <p>{message ?? "Something went wrong loading this section."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-semibold underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function Notice({ children, tone = "info", className }: { children: React.ReactNode; tone?: "info" | "warn" | "success"; className?: string }) {
  const tones = { info: "bg-sky/60 text-ink", warn: "bg-sand text-ink", success: "bg-leaf-soft text-leaf-dark" };
  return <div className={cn("rounded-xl px-4 py-3 text-[14px]", tones[tone], className)}>{children}</div>;
}
