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

export interface PaymentGateway {
  readonly name: "mock" | "stripe" | "jiopay";
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Fallback reconciliation when no webhook arrived. Returns the gateway's view of the payment. */
  fetchStatus(gatewayOrderId: string): Promise<{ status: "paid" | "failed" | "pending"; gatewayPaymentId?: string; method?: string }>;
}
