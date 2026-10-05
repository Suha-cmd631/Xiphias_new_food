import { z } from "zod";
import { Gateway } from "./region.js";

export const CheckoutCreateBody = z.object({
  notes: z.string().max(500).optional(),
  acceptTerms: z.literal(true),
  marketingOptIn: z.boolean().default(false),
});

export const CheckoutCreateResponse = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  gateway: Gateway,
  // mock: redirect to the local mock payment page; jiopay: hosted redirect; stripe: client secret
  redirectUrl: z.string().nullable(),
  clientSecret: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
});
export type CheckoutCreateResponse = z.infer<typeof CheckoutCreateResponse>;

export const PaymentStatus = z.enum(["initiated", "pending", "paid", "failed", "refunded"]);
export const CheckoutStatusResponse = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  paymentStatus: PaymentStatus,
  orderStatus: z.string(),
});
export type CheckoutStatusResponse = z.infer<typeof CheckoutStatusResponse>;

export const MockPayBody = z.object({ orderId: z.string(), outcome: z.enum(["success", "failure"]) });
