import type { Request, Response } from "express";
import type { Address, CheckoutCreateResponse, CheckoutStatusResponse } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { badRequest, conflict, notFound, unavailable } from "../../shared/errors.js";
import { dec } from "../../shared/money.js";
import { nextOrderNumber } from "../../shared/ids.js";
import { env, mockPaymentsAllowed } from "../../config/env.js";
import { clearCookie, COOKIES, readCookie, setCookie } from "../../shared/cookies.js";
import { currentCart, evaluateCoupon, pricedLines, toDto, unitPriceOf } from "../cart/cart.service.js";
import { cartRepo } from "../cart/cart.repo.js";
import { totals } from "../cart/pricing.js";
import { gatewayFor, paymentsService } from "../payments/payments.service.js";
import { assertCheckoutOpen } from "../regions/regions.service.js";
import { grantOrderAccess, hasOrderGrant } from "../orders/order-access.js";
import { reserveStock } from "./inventory.repo.js";

/** May this request see / act on the order as its buyer? Signed-in owner, or the order-access cookie set at checkout. */
const isBuyer = (req: Request | undefined, res: Response | undefined, order: { id: string; customerId: string | null }) =>
  Boolean(req && ((res?.locals.customer && order.customerId === res.locals.customer.id) || hasOrderGrant(req, order.id)));

export const checkoutService = {
  async create(req: Request, res: Response, input: { notes?: string; marketingOptIn: boolean }): Promise<CheckoutCreateResponse> {
    const region = res.locals.region;
    const shopper = res.locals.customer;
    const cart = await currentCart(req, res);
    if (!cart || cart.lines.length === 0) throw badRequest("CART_EMPTY", "Your cart is empty");
    // Legal / logistics switch (CHECKOUT_CLOSED_*): refuse before asking for anything else.
    await assertCheckoutOpen(region, (cart.shippingAddress as Address | null)?.countryCode);
    // No real gateway keys and the mock gateway is not allowed here (production): never pretend to take a payment.
    if (!region.paymentsConfigured) throw unavailable("PAYMENTS_NOT_CONFIGURED", `Online payment isn't available for ${region.name} yet. Please try again later or contact us to place your order.`, { region: region.code, gateway: region.gateway });
    if (!cart.email || !cart.shippingAddress) throw badRequest("ADDRESS_REQUIRED", "Add your email and shipping address first");
    const view = await toDto(cart, region, shopper);
    if (!view.shippingOption) throw badRequest("SHIPPING_REQUIRED", "Choose a shipping option");
    const address = cart.shippingAddress as Address;
    const pl = pricedLines(cart); // throws NOT_SOLD_IN_REGION rather than pricing a line at 0
    const shown = await evaluateCoupon(cart, region, shopper);
    const email = cart.email;

    const { order, t } = await prisma.$transaction(async (tx) => {
      // One checkout at a time per email, so the per-customer coupon rules cannot be raced by parallel requests.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${email.trim().toLowerCase()}))`;
      const disc = await evaluateCoupon(cart, region, shopper, tx);
      if (disc.amount !== shown.amount) throw conflict("COUPON_NOT_APPLICABLE", `${disc.reason ?? "Your coupon changed"}. Your total has been updated — please review it and try again.`);
      const t = totals(pl, disc.amount, view.totals.shipping.amount, region.taxMode);
      // Oversell guard: reserve atomically; a zero-row update means someone else took the last pack.
      for (const l of cart.lines) {
        if (!l.variant.trackInventory) continue;
        const ok = await reserveStock(tx, l.variantId, l.qty);
        if (!ok) throw conflict("OUT_OF_STOCK", `${l.variant.product.name} (${l.variant.title}) just sold out`);
      }
      // Atomic counter inside this transaction: no two orders share a number, and a rollback does not burn one.
      const number = await nextOrderNumber(tx);
      const created = await tx.order.create({
        data: {
          number, customerId: shopper?.id ?? cart.customerId ?? undefined, email, phone: address.phone, regionCode: region.code, currency: region.currency,
          subtotal: dec(t.subtotal), discountTotal: dec(t.discount), shippingTotal: dec(t.shipping), taxTotal: dec(t.tax), grandTotal: dec(t.grandTotal),
          // Only a coupon that really applied is recorded (and later counted as used).
          couponCode: disc.applied ? disc.coupon!.code : null,
          shippingAddress: address, billingAddress: address, shippingMethod: { id: view.shippingOption!.id, name: view.shippingOption!.name, carrier: view.shippingOption!.carrier },
          notes: input.notes, marketingOptIn: input.marketingOptIn,
          lines: {
            create: cart.lines.map((l) => ({
              variantId: l.variantId, productName: l.variant.product.name, variantTitle: l.variant.title, productSlug: l.variant.product.slug, sku: l.variant.sku,
              image: l.variant.product.images[0]?.url ?? null, qty: l.qty, unitPrice: dec(unitPriceOf(l)), lineTotal: dec(unitPriceOf(l) * l.qty),
              weightGrams: l.variant.weightGrams, hsCode: l.variant.product.hsCode,
            })),
          },
          payments: { create: { gateway: region.gateway, amount: dec(t.grandTotal), currency: region.currency, status: "initiated" } },
        },
        include: { payments: true },
      });
      await tx.cart.update({ where: { id: cart.id }, data: { convertedOrderId: created.id } });
      return { order: created, t };
    });
    clearCookie(res, COOKIES.cart);
    // This browser placed the order: let it (and only it) load the order on the thank-you / mock-pay pages.
    grantOrderAccess(req, res, order.id);

    const gw = gatewayFor(region.gateway);
    const pay = await gw.createPayment({
      orderId: order.id, orderNumber: order.number, amount: t.grandTotal, currency: region.currency, email: order.email, phone: order.phone,
      name: `${address.firstName} ${address.lastName}`.trim(), returnUrl: `${env.WEB_ORIGIN}/checkout/thank-you/${order.id}`,
    });
    await prisma.payment.update({ where: { id: order.payments[0]!.id }, data: { gatewayOrderId: pay.gatewayOrderId, status: "pending" } });
    return { orderId: order.id, orderNumber: order.number, gateway: region.gateway, redirectUrl: pay.redirectUrl, clientSecret: pay.clientSecret, amount: t.grandTotal, currency: region.currency };
  },

  /**
   * Payment progress for the thank-you page. Returns no personal data (order number + statuses only), so the order id
   * is enough to poll it; anything personal — the order itself, or getting the cart back after a failure — needs buyer proof.
   */
  async status(orderId: string, req?: Request, res?: Response): Promise<CheckoutStatusResponse> {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order) throw notFound("Order");
    // Reconcile with the gateway if the webhook is late (> 90 s) and we have an id to ask about.
    const p = order.payments[0];
    if (p && order.paymentStatus !== "paid" && order.paymentStatus !== "failed" && p.gatewayOrderId && Date.now() - order.placedAt.getTime() > 90_000) {
      const s = await gatewayFor(p.gateway).fetchStatus(p.gatewayOrderId).catch(() => ({ status: "pending" as const }));
      if (s.status === "paid") await paymentsService.markPaid(orderId, { via: p.gateway, gatewayPaymentId: s.gatewayPaymentId, method: s.method, paid: "paid" in s ? s.paid : undefined });
      if (s.status === "failed") await paymentsService.markFailed(orderId, "gateway_reported_failed", p.gateway);
    }
    const fresh = await prisma.order.findUnique({ where: { id: orderId } });
    // Payment failed: give the shopper their cart back (unless they already started a new one) so they can retry.
    // The cart holds their email and address, so only the buyer's own browser gets it.
    if (fresh!.paymentStatus === "failed" && req && res && isBuyer(req, res, order) && !readCookie(req, COOKIES.cart)) {
      const cartId = await cartRepo.reopenForFailedOrder(orderId);
      if (cartId) setCookie(res, COOKIES.cart, cartId, 30 * 24 * 3600);
    }
    return { orderId, orderNumber: fresh!.number, paymentStatus: fresh!.paymentStatus, orderStatus: fresh!.status };
  },

  /**
   * Mock gateway only (local development). In production the endpoint does not exist unless ALLOW_MOCK_PAYMENTS=true,
   * and even then only the browser that placed the order may complete it.
   */
  async mockComplete(orderId: string, outcome: "success" | "failure", req?: Request, res?: Response) {
    if (!mockPaymentsAllowed) throw notFound("Route");
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order || !isBuyer(req, res, order)) throw notFound("Order");
    if (order.payments[0]?.gateway !== "mock") throw badRequest("NOT_MOCK", "This order uses a real payment gateway");
    if (outcome === "success") await paymentsService.markPaid(orderId, { via: "mock", gatewayPaymentId: `mockpay_${orderId}`, method: "mock" });
    else await paymentsService.markFailed(orderId, "mock_declined", "mock");
    return this.status(orderId, req, res);
  },
};
