"use client";
import Link from "next/link";
import { User } from "lucide-react";
import { useMe } from "@/lib/api/queries";

export function AccountButton() {
  const { data: me } = useMe();
  return (
    <Link href={me ? "/account" : "/account/login"} aria-label={me ? "Your account" : "Sign in"} className="inline-flex h-12 items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-[14px] font-medium text-ink hover:border-ink sm:px-5">
      <User className="h-4.5 w-4.5" />
      <span className="hidden sm:inline">{me ? me.firstName : "Account"}</span>
    </Link>
  );
}
