import { prisma, type Tx } from "../../shared/prisma.js";
import { parseCouponRules, type CouponHistory, type CouponRules } from "./pricing.js";

export const cartInclude = (priceListId: string) =>
  ({
    lines: {
      orderBy: { id: "asc" as const },
      include: { variant: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" as const }, take: 1 } } }, prices: { where: { priceListId } }, inventory: true } } },
    },
  }) as const;

export const cartRepo = {
  byId(id: string, priceListId: string) {
    return prisma.cart.findFirst({ where: { id, convertedOrderId: null, expiresAt: { gt: new Date() } }, include: cartInclude(priceListId) });
  },
  create(regionCode: string, currency: string, customerId?: string) {
    return prisma.cart.create({ data: { regionCode, currency, customerId, expiresAt: new Date(Date.now() + 30 * 864e5) } });
  },
  /** A cart frozen by an order whose payment then failed — hand it back so the customer can retry. */
  async reopenForFailedOrder(orderId: string) {
    const cart = await prisma.cart.findFirst({ where: { convertedOrderId: orderId } });
    if (!cart) return null;
    await prisma.cart.update({ where: { id: cart.id }, data: { convertedOrderId: null, expiresAt: new Date(Date.now() + 30 * 864e5) } });
    return cart.id;
  },
  coupon(code: string) {
    return prisma.coupon.findFirst({ where: { code: code.toUpperCase(), active: true } });
  },
  async couponRules(): Promise<CouponRules> {
    const row = await prisma.siteSetting.findUnique({ where: { key: "coupon_rules" } });
    return parseCouponRules(row?.value);
  },
  /** Order history of one email (case-insensitive), plus the signed-in customer's orders when there is one. */
  async couponHistory(code: string, email: string, customerId?: string | null, db: Tx | typeof prisma = prisma): Promise<CouponHistory> {
    const who = { OR: [{ email: { equals: email.trim(), mode: "insensitive" as const } }, ...(customerId ? [{ customerId }] : [])] };
    const paidOrders = await db.order.count({ where: { ...who, paidAt: { not: null } } });
    // "Used" = paid with it, or an order with it is still waiting for payment (stops two parallel checkouts sharing one code).
    const usesOfThisCoupon = await db.order.count({ where: { AND: [who, { couponCode: code.toUpperCase() }, { OR: [{ paidAt: { not: null } }, { status: "pending", paymentStatus: { in: ["initiated", "pending"] } }] }] } });
    return { paidOrders, usesOfThisCoupon };
  },
  /** Lines whose variant has no price in the cart's price list cannot be sold there — remove them. */
  removeLines(ids: string[]) {
    return prisma.cartLine.deleteMany({ where: { id: { in: ids } } });
  },
};
export type CartRow = NonNullable<Awaited<ReturnType<typeof cartRepo.byId>>>;
