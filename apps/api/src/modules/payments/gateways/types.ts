export type CreatePaymentInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  email: string;
  phone?: string | null;
  name: string;
  returnUrl: string;
};

export type CreatePaymentResult = {
  gatewayOrderId: string;
  redirectUrl: string | null;
  clientSecret: string | null;
};

/** What the gateway says it collected (major units, e.g. 499.00 INR). Checked against the order before it is marked paid. */
export type PaidAmount = { amount: number; currency: string };

export interface PaymentGateway {
  readonly name: "mock" | "stripe" | "jiopay";
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Fallback reconciliation when no webhook arrived. Returns the gateway's view of the payment. */
  fetchStatus(gatewayOrderId: string): Promise<{ status: "paid" | "failed" | "pending"; gatewayPaymentId?: string; method?: string; paid?: PaidAmount }>;
  /** Best-effort: stop a payment that belongs to a cancelled/expired order from still being completed. */
  cancelPayment?(gatewayOrderId: string): Promise<"cancelled" | "already_final">;
}
