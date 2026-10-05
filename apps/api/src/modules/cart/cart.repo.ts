import { prisma } from "../../shared/prisma.js";

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
};
export type CartRow = NonNullable<Awaited<ReturnType<typeof cartRepo.byId>>>;
