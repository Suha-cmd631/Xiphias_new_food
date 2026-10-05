"use client";
import { ErrorState } from "@/components/ui/feedback";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap py-16">
      <h1 className="text-[32px]">Something went wrong</h1>
      <p className="mt-2 text-muted">Our API may be starting up. {error.digest ? `Ref: ${error.digest}` : ""}</p>
      <ErrorState className="mt-6 max-w-lg" message={error.message} onRetry={reset} />
    </div>
  );
}
