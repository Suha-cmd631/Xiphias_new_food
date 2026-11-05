import type { PaidAmount } from "./gateways/types.js";

/** Pure payment rules (unit-tested). */

/** The gateway must report exactly the order's amount in the order's currency (half-a-paisa tolerance for float noise). */
export function amountMatches(reported: PaidAmount | null | undefined, expected: PaidAmount): boolean {
  if (!reported) return false;
  return reported.currency.toUpperCase() === expected.currency.toUpperCase() && Math.abs(reported.amount - expected.amount) < 0.005;
}

export type OrderPaymentState = { orderStatus: string; paymentStatus: string; paymentRecordStatus: string; paymentGateway: string };
export type PaidDecision = "mark_paid" | "already_paid" | "gateway_mismatch" | "amount_mismatch" | "needs_review" | "already_flagged";

/**
 * What a "payment succeeded" signal may do to an order, decided while the order row is locked.
 * - only the gateway the order was created with may confirm it;
 * - real gateways must report the matching amount (the mock gateway has no amount);
 * - an order that is already paid is left alone (idempotent);
 * - an order that was cancelled / expired / refunded is NOT revived (its stock reservation is gone): the money is
 *   recorded on the payment and the team is asked to review / refund — once.
 */
export function decidePaid(state: OrderPaymentState, via: string, reported: PaidAmount | null | undefined, expected: PaidAmount): PaidDecision {
  if (state.paymentGateway !== via) return "gateway_mismatch";
  if (state.paymentStatus === "paid") return "already_paid";
  if (via !== "mock" && !amountMatches(reported, expected)) return "amount_mismatch";
  if (state.orderStatus === "cancelled" || state.orderStatus === "refunded" || state.paymentStatus === "failed" || state.paymentStatus === "refunded") {
    return state.paymentRecordStatus === "paid" ? "already_flagged" : "needs_review";
  }
  return "mark_paid";
}
