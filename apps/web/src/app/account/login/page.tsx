import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/auth-forms";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export default function LoginPage() {
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-16">
      <div className="w-full max-w-md rounded-card border border-line p-8">
        <h1 className="text-[32px]">Sign in</h1>
        <p className="mb-6 mt-1 text-[14.5px] text-muted">New here? <Link href="/account/register" className="font-semibold text-leaf-dark underline">Create an account</Link></p>
        <LoginForm />
      </div>
    </div>
  );
}
