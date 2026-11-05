import Link from "next/link";
import { Notice } from "@/components/ui/feedback";

/** Region / country where checkout is switched off (API: REGION_NOT_OPEN, regions[].checkoutEnabled === false). */
export function isCanada(codes: (string | undefined | null)[]) {
  return codes.some((c) => c?.toUpperCase() === "CA");
}

/**
 * Calm "we don't deliver there yet" notice (not an error). Pass `place` for a region we know is closed, or the
 * API's own sentence as `message`. Canada gets a link to its own page.
 */
export function CheckoutClosedNotice({ place, message, canada, className }: { place?: string; message?: string; canada: boolean; className?: string }) {
  return (
    <Notice tone="info" className={className}>
      {place && <p className="font-semibold">We don&apos;t deliver to {place} yet</p>}
      <p className={place ? "mt-1" : undefined}>{message ?? "You can still browse products and prices, and we'll announce it as soon as orders open."}</p>
      {canada && <Link href="/ca" className="mt-2 inline-block font-semibold underline">See what&apos;s planned for Canada</Link>}
    </Notice>
  );
}
