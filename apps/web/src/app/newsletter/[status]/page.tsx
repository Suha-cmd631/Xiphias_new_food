import { ButtonLink } from "@/components/ui/button";
const COPY: Record<string, [string, string]> = {
  confirmed: ["You're in.", "Thanks for confirming — recipes, new lots and subscriber-only offers are on their way."],
  unsubscribed: ["Unsubscribed.", "You won't hear from us again unless you re-subscribe. The shop stays open regardless."],
  invalid: ["That link didn't work.", "It may have expired. Subscribe again from the footer and we'll send a fresh one."],
};
export default async function NewsletterStatus({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const [t, d] = COPY[status] ?? COPY.invalid!;
  return <div className="wrap py-24 text-center"><h1 className="text-[40px]">{t}</h1><p className="mx-auto mt-2 max-w-md text-muted">{d}</p><ButtonLink href="/shop" variant="dark" className="mt-6">Back to the shop</ButtonLink></div>;
}
