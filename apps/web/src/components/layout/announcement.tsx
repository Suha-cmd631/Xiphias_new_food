import Link from "next/link";

export function Announcement({ text, code, suffix, href }: { text: string; code: string; suffix: string; href: string }) {
  return (
    <div className="anim-dropin bg-ink px-4 py-2 text-center text-[13px] tracking-[0.02em] text-white">
      <Link href={href} className="hover:underline">
        {text} <b className="font-semibold text-leaf">{code}</b> {suffix}
      </Link>
    </div>
  );
}
