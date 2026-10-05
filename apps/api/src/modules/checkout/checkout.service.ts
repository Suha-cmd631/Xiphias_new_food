import type { Request, Response } from "express";
import type { Address, CheckoutCreateResponse, CheckoutStatusResponse } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { badRequest, conflict, notFound } from "../../shared/errors.js";
import { dec, n } from "../../shared/money.js";
import { nextOrderNumber } from "../../shared/ids.js";
import { env } from "../../config/env.js";
import { clearCookie, COOKIES, readCookie, setCookie } from "../../shared/cookies.js";
import { currentCart, pricedLines, toDto } from "../cart/cart.service.js";
import { cartRepo } from "../cart/cart.repo.js";
import { couponDiscount, totals } from "../cart/pricing.js";
import { gatewayFor, paymentsService } from "../payments/payments.service.js";
import { reserveStock } from "./inventory.repo.js";

export const checkoutService = {
  async create(req: Request, res: Response, input: { notes?: string; marketingOptIn: boolean }): Promise<CheckoutCreateResponse> {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart || cart.lines.length === 0) throw badRequest("CART_EMPTY", "Your cart is empty");
    if (!cart.email || !cart.shippingAddress) throw badRequest("ADDRESS_REQUIRED", "Add your email and shipping address first");
    const view = await toDto(cart, region);
    if (!view.shippingOption) throw badRequest("SHIPPING_REQUIRED", "Choose a shipping option");
    const address = cart.shippingAddress as Address;
    const pl = pricedLines(cart);
    const coupon = cart.couponCode ? await cartRepo.coupon(cart.couponCode) : null;
    const disc = couponDiscount(coupon, pl, region.code);
    const t = totals(pl, disc.amount, view.totals.shipping.amount, region.taxMode);
    const number = await nextOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Oversell guard: reserve atomically; a zero-row update means someone else took the last pack.
      for (const l of cart.lines) {
        if (!l.variant.trackInventory) continue;
        const ok = await reserveStock(tx, l.variantId, l.qty);
        if (!ok) throw conflict("OUT_OF_STOCK", `${l.variant.product.name} (${l.variant.title}) just sold out`);
      }
      const created = await tx.order.create({
        data: {
          number, customerId: res.locals.customer?.id ?? cart.customerId ?? undefined, email: cart.email!, phone: address.phone, regionCode: region.code, currency: region.currency,
          subtotal: dec(t.subtotal), discountTotal: dec(t.discount), shippingTotal: dec(t.shipping), taxTotal: dec(t.tax), grandTotal: dec(t.grandTotal),
          couponCode: cart.couponCode, shippingAddress: address, billingAddress: address, shippingMethod: { id: view.shippingOption!.id, name: view.shippingOption!.name, carrier: view.shippingOption!.carrier },
          notes: input.notes, marketingOptIn: input.marketingOptIn,
          lines: {
            create: cart.lines.map((l) => ({
              variantId: l.variantId, productName: l.variant.product.name, variantTitle: l.variant.title, productSlug: l.variant.product.slug, sku: l.variant.sku,
              image: l.variant.product.images[0]?.url ?? null, qty: l.qty, unitPrice: dec(n(l.variant.prices[0]?.amount)), lineTotal: dec(n(l.variant.prices[0]?.amount) * l.qty),
              weightGrams: l.variant.weightGrams, hsCode: l.variant.product.hsCode,
            })),
          },
          payments: { create: { gateway: region.gateway, amount: dec(t.grandTotal), currency: region.currency, status: "initiated" } },
        },
        include: { payments: true },
      });
      await tx.cart.update({ where: { id: cart.id }, data: { convertedOrderId: created.id } });
      return created;
    });
    clearCookie(res, COOKIES.cart);

    const gw = gatewayFor(region.gateway);
    const pay = await gw.createPayment({
      orderId: order.id, orderNumber: order.number, amount: t.grandTotal, currency: region.currency, email: order.email, phone: order.phone,
      name: `${address.firstName} ${address.lastName}`.trim(), returnUrl: `${env.WEB_ORIGIN}/checkout/thank-you/${order.id}`,
    });
    await prisma.payment.update({ where: { id: order.payments[0]!.id }, data: { gatewayOrderId: pay.gatewayOrderId, status: "pending" } });
    return { orderId: order.id, orderNumber: order.number, gateway: region.gateway, redirectUrl: pay.redirectUrl, clientSecret: pay.clientSecret, amount: t.grandTotal, currency: region.currency };
  },

  async status(orderId: string, req?: Request, res?: Response): Promise<CheckoutStatusResponse> {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order) throw notFound("Order");
    // Reconcile with the gateway if the webhook is late (> 90 s) and we have an id to ask about.
    const p = order.payments[0];
    if (p && order.paymentStatus !== "paid" && order.paymentStatus !== "failed" && p.gatewayOrderId && Date.now() - order.placedAt.getTime() > 90_000) {
      const s = await gatewayFor(p.gateway).fetchStatus(p.gatewayOrderId).catch(() => ({ status: "pending" as const }));
      if (s.status === "paid") await paymentsService.markPaid(orderId, s);
      if (s.status === "failed") await paymentsService.markFailed(orderId, "gateway_reported_failed");
    }
    const fresh = await prisma.order.findUnique({ where: { id: orderId } });
    // Payment failed: give the shopper their cart back (unless they already started a new one) so they can retry.
    if (fresh!.paymentStatus === "failed" && req && res && !readCookie(req, COOKIES.cart)) {
      const cartId = await cartRepo.reopenForFailedOrder(orderId);
      if (cartId) setCookie(res, COOKIES.cart, cartId, 30 * 24 * 3600);
    }
    return { orderId, orderNumber: fresh!.number, paymentStatus: fresh!.paymentStatus, orderStatus: fresh!.status };
  },

  /** Mock gateway only. Disabled when a real gateway is configured for the order's region. */
  async mockComplete(orderId: string, outcome: "success" | "failure", req?: Request, res?: Response) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order) throw notFound("Order");
    if (order.payments[0]?.gateway !== "mock") throw badRequest("NOT_MOCK", "This order uses a real payment gateway");
    if (outcome === "success") await paymentsService.markPaid(orderId, { gatewayPaymentId: `mockpay_${orderId}`, method: "mock" });
    else await paymentsService.markFailed(orderId, "mock_declined");
    return this.status(orderId, req, res);
  },
};
