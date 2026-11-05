import Stripe from "stripe";
import { env } from "../../../config/env.js";
import { fromMinor, toMinor } from "../../../shared/money.js";
import type { PaymentGateway } from "./types.js";

export const stripeClient = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" }) : null;

/** Stripe Payment Intents + Payment Element (cards, Apple/Google Pay, SEPA, iDEAL… enabled per currency in the dashboard). */
export const stripeGateway: PaymentGateway = {
  name: "stripe",
  async createPayment(input) {
    if (!stripeClient) throw new Error("Stripe not configured");
    const pi = await stripeClient.paymentIntents.create({
      amount: toMinor(input.amount, input.currency),
      currency: input.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: input.email,
      metadata: { orderId: input.orderId, orderNumber: input.orderNumber },
      description: `Xiphias Superfoods order ${input.orderNumber}`,
    });
    return { gatewayOrderId: pi.id, redirectUrl: null, clientSecret: pi.client_secret };
  },
  async fetchStatus(id) {
    if (!stripeClient) return { status: "pending" };
    const pi = await stripeClient.paymentIntents.retrieve(id);
    if (pi.status === "succeeded") return { status: "paid", gatewayPaymentId: typeof pi.latest_charge === "string" ? pi.latest_charge : pi.id, method: pi.payment_method_types[0], paid: { amount: fromMinor(pi.amount_received, pi.currency.toUpperCase()), currency: pi.currency.toUpperCase() } };
    if (pi.status === "canceled") return { status: "failed" };
    return { status: "pending" };
  },
  async cancelPayment(id) {
    if (!stripeClient) throw new Error("Stripe not configured");
    const pi = await stripeClient.paymentIntents.retrieve(id);
    // Already paid (the webhook will route it to manual review) or already cancelled: nothing to do.
    if (pi.status === "succeeded" || pi.status === "canceled") return "already_final";
    await stripeClient.paymentIntents.cancel(id);
    return "cancelled";
  },
};
