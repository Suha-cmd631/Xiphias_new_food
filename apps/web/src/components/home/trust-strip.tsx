import { FlaskConical, PackageCheck, Sprout, ShieldCheck } from "lucide-react";

const ITEMS = [
  { Icon: PackageCheck, t: "Ships in 1–2 days", d: "From Bengaluru · DHL Express abroad" },
  { Icon: FlaskConical, t: "Lab-tested", d: "Every lot · report on request" },
  { Icon: Sprout, t: "Farm-direct", d: "Bought from the growers, no middlemen" },
  { Icon: ShieldCheck, t: "Secure checkout", d: "Cards, UPI, Apple Pay, Google Pay" },
];

/** Four reasons to trust the shop, right under the hero. */
export function TrustStrip() {
  return (
    <div className="border-y border-line bg-paper">
      <ul className="wrap grid grid-cols-2 gap-x-6 gap-y-5 py-6 lg:grid-cols-4">
        {ITEMS.map(({ Icon, t, d }) => (
          <li key={t} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-royal"><Icon className="h-[18px] w-[18px]" /></span>
            <span className="text-[13.5px] leading-snug text-muted"><b className="block text-[14.5px] font-semibold text-royal-deep">{t}</b>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
