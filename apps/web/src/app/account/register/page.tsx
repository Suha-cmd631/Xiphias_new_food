import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/auth-forms";
export const metadata: Metadata = { title: "Create account", robots: { index: false } };
export default function RegisterPage() {
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-16">
      <div className="w-full max-w-md rounded-card border border-line p-8">
        <h1 className="text-[32px]">Create account</h1>
        <p className="mb-6 mt-1 text-[14.5px] text-muted">Already registered? <Link href="/account/login" className="font-semibold text-leaf-dark underline">Sign in</Link></p>
        <RegisterForm />
      </div>
    </div>
  );
}
