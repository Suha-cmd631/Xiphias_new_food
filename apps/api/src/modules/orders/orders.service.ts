import type { Address, OrderDetail, OrderSummary } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { notFound } from "../../shared/errors.js";
import { money } from "../../shared/money.js";

type Row = NonNullable<Awaited<ReturnType<typeof ordersRepo.detail>>>;
const ordersRepo = {
  detail(where: { id?: string; number?: string }) {
    return prisma.order.findFirst({ where, include: { lines: true, shipment: true } });
  },
  forCustomer(customerId: string) {
    return prisma.order.findMany({ where: { customerId }, orderBy: { placedAt: "desc" }, include: { lines: true } });
  },
};

const summary = (o: { id: string; number: string; status: string; paymentStatus: string; fulfillmentStatus: string; currency: string; grandTotal: unknown; placedAt: Date; lines: { qty: number }[] }): OrderSummary => ({
  id: o.id, number: o.number, status: o.status, paymentStatus: o.paymentStatus, fulfillmentStatus: o.fulfillmentStatus, currency: o.currency,
  grandTotal: money(o.grandTotal as never, o.currency), placedAt: o.placedAt.toISOString(), itemCount: o.lines.reduce((s, l) => s + l.qty, 0),
});

const detail = (o: Row): OrderDetail => ({
  ...summary(o),
  email: o.email,
  lines: o.lines.map((l) => ({ productName: l.productName, variantTitle: l.variantTitle, sku: l.sku, image: l.image, qty: l.qty, unitPrice: money(l.unitPrice, o.currency), lineTotal: money(l.lineTotal, o.currency) })),
  subtotal: money(o.subtotal, o.currency), discount: money(o.discountTotal, o.currency), shipping: money(o.shippingTotal, o.currency), tax: money(o.taxTotal, o.currency),
  shippingAddress: o.shippingAddress as Address,
  shippingMethod: (o.shippingMethod as { name: string; carrier: string } | null) ?? null,
  tracking: o.shipment ? { carrier: o.shipment.carrier, awb: o.shipment.awb, status: o.shipment.status, trackingUrl: o.shipment.trackingUrl, events: (o.shipment.events as OrderDetail["tracking"] extends infer T ? T extends { events: infer E } ? E : never : never) ?? [] } : null,
});

export const ordersService = {
  /**
   * One order by id. The id alone is NOT enough (it travels in URLs): the caller must prove a link to the order —
   * signed-in owner, the order-access cookie set at checkout for this browser, or the order's email address.
   * Every failure is the same 404 so ids cannot be probed.
   */
  async byIdWithProof(id: string, proof: { customerId?: string | null; hasGrant: boolean; email?: string }) {
    const o = await ordersRepo.detail({ id });
    if (!o) throw notFound("Order");
    const owner = proof.customerId != null && o.customerId === proof.customerId;
    const emailOk = proof.email != null && proof.email.trim() !== "" && o.email.toLowerCase() === proof.email.trim().toLowerCase();
    if (!owner && !proof.hasGrant && !emailOk) throw notFound("Order");
    return detail(o);
  },
  async track(number: string, email: string) {
    const o = await ordersRepo.detail({ number: number.trim().toUpperCase() });
    if (!o || o.email.toLowerCase() !== email.toLowerCase()) throw notFound("Order");
    return detail(o);
  },
  async mine(customerId: string) {
    return (await ordersRepo.forCustomer(customerId)).map(summary);
  },
  async mineDetail(customerId: string, id: string) {
    const o = await ordersRepo.detail({ id });
    if (!o || o.customerId !== customerId) throw notFound("Order");
    return detail(o);
  },
};
