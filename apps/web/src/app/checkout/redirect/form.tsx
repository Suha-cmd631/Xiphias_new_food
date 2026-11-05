"use client";
import { useEffect, useRef } from "react";

/**
 * Auto-submitting POST form to JioPay's hosted checkout (fields are signed server-side).
 * `action` is validated by the server component (page.tsx) against the allowed payment origins — this
 * component never reads the URL itself.
 */
export function JioPayRedirect({ action, fields }: { action: string; fields: [string, string][] }) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { ref.current?.submit(); }, []);
  return (
    <div className="wrap py-24 text-center">
      <h1 className="text-[28px]">Redirecting to JioPay…</h1>
      <p className="mt-2 text-muted">Please don&apos;t close this window.</p>
      <form ref={ref} method="POST" action={action}>
        {fields.map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <button type="submit" className="mt-6 underline">Continue if you are not redirected</button>
      </form>
    </div>
  );
}
