import { NewsletterForm } from "@/components/forms/newsletter-form";
import { CA_NOTICE } from "@/lib/market";

/** Canada: no ordering yet, so the only action on /ca pages is this email signup (newsletter endpoint, source "ca-notify"). */
export function NotifyPanel({ about, heading = "h2" }: { about?: string; heading?: "h2" | "h3" }) {
  const H = heading;
  return (
    <div id="notify" className="grid scroll-mt-28 items-center gap-6 rounded-card bg-sand px-6 py-8 sm:px-10 md:grid-cols-[1.2fr_1fr] md:py-10">
      <div>
        <span className="kick">Canada</span>
        <H className="text-[clamp(24px,3vw,34px)] leading-tight">Tell me when you deliver to Canada</H>
        <p className="mt-2 max-w-[56ch] text-[15px] text-foreground">
          {CA_NOTICE} Leave your email and we will write to you when {about ? `${about} and the rest of the range` : "the range"} can be ordered from Canada.
        </p>
      </div>
      <div>
        <NewsletterForm source="ca-notify" />
        <p className="mt-2.5 text-[12.5px] text-muted">We will email you a link to confirm the address. This also adds you to our newsletter, and every email has an unsubscribe link.</p>
      </div>
    </div>
  );
}
