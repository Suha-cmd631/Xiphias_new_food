"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useMockPay } from "@/lib/api/queries";
import { Button } from "@/components/ui/button";

/** Stand-in for the JioPay / Stripe hosted page while no real keys are configured. Never shown in production. */
export default function MockPay({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const pay = useMockPay();
  const go = (outcome: "success" | "failure") => pay.mutate({ orderId, outcome }, { onSuccess: () => router.push(`/checkout/thank-you/${orderId}`) });
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-16">
      <div className="w-full max-w-md rounded-card border-2 border-dashed border-gold bg-sand/50 p-8 text-center">
        <span className="kick">Mock payment gateway</span>
        <h1 className="text-[28px]">Simulate the payment</h1>
        <p className="mt-2 text-[14.5px] text-[#444]">This page replaces JioPay (India) or Stripe (abroad) until their sandbox keys are added to <code>apps/api/.env</code>. Order <code>{orderId.slice(-6)}</code>.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="leaf" size="lg" disabled={pay.isPending} onClick={() => go("success")}>Pay (success)</Button>
          <Button variant="outline" size="lg" disabled={pay.isPending} onClick={() => go("failure")}>Decline</Button>
        </div>
        {pay.isError && <p className="mt-3 text-[13px] text-danger">{(pay.error as Error).message}</p>}
      </div>
    </div>
  );
}
