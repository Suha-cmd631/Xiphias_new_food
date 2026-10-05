import { env } from "../../../config/env.js";
import type { PaymentGateway } from "./types.js";

/** Local development gateway: redirects to a page in the web app with "Pay" / "Fail" buttons. Never enabled when real keys exist. */
export const mockGateway: PaymentGateway = {
  name: "mock",
  async createPayment(input) {
    return { gatewayOrderId: `mock_${input.orderId}`, redirectUrl: `${env.WEB_ORIGIN}/checkout/mock-pay/${input.orderId}`, clientSecret: null };
  },
  async fetchStatus() {
    return { status: "pending" };
  },
};
