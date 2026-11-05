import Link from "next/link";

export function Announcement({ text, code, suffix, href }: { text: string; code: string; suffix: string; href: string }) {
  return (
    <div className="anim-dropin bg-royal-deep px-4 py-2.5 text-center text-[12.5px] tracking-[0.04em] text-white">
      <Link href={href} className="underline-offset-4 hover:underline">
        {text} <b className="mx-0.5 font-semibold tracking-[0.14em] text-gold">{code}</b> {suffix}
      </Link>
    </div>
  );
}
