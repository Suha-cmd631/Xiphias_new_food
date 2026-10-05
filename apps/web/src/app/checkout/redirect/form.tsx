"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/** Auto-submitting POST form to JioPay's hosted checkout (fields are signed server-side). */
export function JioPayRedirect() {
  const sp = useSearchParams();
  const ref = useRef<HTMLFormElement>(null);
  const action = sp.get("action") ?? "";
  useEffect(() => { ref.current?.submit(); }, []);
  return (
    <div className="wrap py-24 text-center">
      <h1 className="text-[28px]">Redirecting to JioPay…</h1>
      <p className="mt-2 text-muted">Please don't close this window.</p>
      <form ref={ref} method="POST" action={action}>
        {[...sp.entries()].filter(([k]) => k !== "action").map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <button type="submit" className="mt-6 underline">Continue if you are not redirected</button>
      </form>
    </div>
  );
}
