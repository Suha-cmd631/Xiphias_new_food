import type { Request, Response } from "express";
import type { Address, Cart as CartDto, CartLine } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { badRequest, conflict, notFound } from "../../shared/errors.js";
import { COOKIES, readCookie, setCookie } from "../../shared/cookies.js";
import { money, n } from "../../shared/money.js";
import { regionForCountry, type RegionCtx } from "../regions/regions.service.js";
import { shippingService } from "../shipping/shipping.service.js";
import { cartRepo, type CartRow } from "./cart.repo.js";
import { couponDiscount, totals, type PricedLine } from "./pricing.js";

const MONTH = 30 * 24 * 3600;

export async function currentCart(req: Request, res: Response, create = false): Promise<CartRow | null> {
  const region = res.locals.region;
  const id = readCookie(req, COOKIES.cart);
  let cart = id ? await cartRepo.byId(id, region.priceListId) : null;
  // A cart belongs to one region (one currency). Switching region starts a fresh cart.
  if (cart && cart.regionCode !== region.code) {
    if (cart.lines.length === 0) cart = null;
    else {
      const moved = await prisma.cart.create({
        data: { regionCode: region.code, currency: region.currency, expiresAt: new Date(Date.now() + MONTH * 1000), lines: { create: cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })) } },
      });
      cart = await cartRepo.byId(moved.id, region.priceListId);
      setCookie(res, COOKIES.cart, moved.id, MONTH);
    }
  }
  if (!cart && create) {
    const created = await cartRepo.create(region.code, region.currency, res.locals.customer?.id);
    setCookie(res, COOKIES.cart, created.id, MONTH);
    cart = await cartRepo.byId(created.id, region.priceListId);
  }
  return cart;
}

export function pricedLines(cart: CartRow): PricedLine[] {
  return cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty, unitPrice: n(l.variant.prices[0]?.amount), weightGrams: l.variant.weightGrams }));
}

export async function toDto(cart: CartRow | null, region: RegionCtx): Promise<CartDto> {
  const cur = region.currency;
  if (!cart) {
    const zero = money(0, cur);
    return { id: "", region: region.code, currency: cur, lines: [], itemCount: 0, couponCode: null, email: null, shippingAddress: null, shippingOption: null, totals: { subtotal: zero, discount: zero, shipping: zero, tax: zero, grandTotal: zero, freeShippingRemaining: region.freeShippingAbove ? money(region.freeShippingAbove, cur) : null }, messages: [] };
  }
  const messages: CartDto["messages"] = [];
  const lines: CartLine[] = cart.lines.map((l) => {
    const price = n(l.variant.prices[0]?.amount);
    const compare = l.variant.prices[0]?.compareAt;
    const available = l.variant.inventory ? l.variant.inventory.onHand - l.variant.inventory.reserved : 999;
    if (l.variant.trackInventory && available < l.qty) messages.push({ level: "warn", text: `Only ${Math.max(0, available)} left of ${l.variant.product.name} (${l.variant.title})` });
    return {
      id: l.id, variantId: l.variantId, productSlug: l.variant.product.slug, productName: l.variant.product.name, variantTitle: l.variant.title,
      image: l.variant.product.images[0]?.url ?? "/img/placeholder.webp", qty: l.qty, unitPrice: money(price, cur),
      compareAt: compare && n(compare) > price ? money(compare, cur) : null, lineTotal: money(price * l.qty, cur), available: Math.max(0, available),
    };
  });
  const pl = pricedLines(cart);
  const coupon = cart.couponCode ? await cartRepo.coupon(cart.couponCode) : null;
  const disc = couponDiscount(coupon, pl, region.code);
  if (cart.couponCode && disc.reason) messages.push({ level: "info", text: disc.reason });
  const merch = pl.reduce((s, l) => s + l.unitPrice * l.qty, 0) - disc.amount;
  const weight = pl.reduce((s, l) => s + l.weightGrams * l.qty, 0);
  const address = (cart.shippingAddress as Address | null) ?? null;
  const option = cart.shippingOptionId ? await shippingService.optionById(region, cart.shippingOptionId, weight, merch, address?.countryCode ?? region.defaultCountry) : null;
  const shipping = option ? (coupon?.type === "free_shipping" ? 0 : option.amount.amount) : 0;
  const t = totals(pl, disc.amount, shipping, region.taxMode);
  const remaining = region.freeShippingAbove != null && merch < region.freeShippingAbove ? region.freeShippingAbove - merch : null;
  return {
    id: cart.id, region: region.code, currency: cur, lines, itemCount: lines.reduce((s, l) => s + l.qty, 0), couponCode: cart.couponCode, email: cart.email,
    shippingAddress: address, shippingOption: option,
    totals: { subtotal: money(t.subtotal, cur), discount: money(t.discount, cur), shipping: money(t.shipping, cur), tax: money(t.tax, cur), grandTotal: money(t.grandTotal, cur), freeShippingRemaining: remaining != null ? money(remaining, cur) : null },
    messages,
  };
}

export const cartService = {
  async addLine(req: Request, res: Response, variantId: string, qty: number) {
    const region = res.locals.region;
    const variant = await prisma.variant.findUnique({ where: { id: variantId }, include: { product: true, prices: { where: { priceListId: region.priceListId } }, inventory: true } });
    if (!variant || variant.product.status !== "active") throw notFound("Variant");
    if (!variant.prices[0]) throw conflict("NOT_SOLD_IN_REGION", `${variant.product.name} is not available in ${region.name}`);
    if (variant.product.availableIn.length && !variant.product.availableIn.some((c) => region.countries.includes(c))) throw conflict("NOT_SOLD_IN_REGION", `${variant.product.name} cannot be shipped to ${region.name}`);
    const cart = (await currentCart(req, res, true))!;
    const existing = cart.lines.find((l) => l.variantId === variantId);
    const newQty = (existing?.qty ?? 0) + qty;
    const available = variant.inventory ? variant.inventory.onHand - variant.inventory.reserved : 999;
    if (variant.trackInventory && newQty > available) throw conflict("OUT_OF_STOCK", `Only ${Math.max(0, available)} in stock`);
    await prisma.cartLine.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId } }, update: { qty: newQty }, create: { cartId: cart.id, variantId, qty } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region);
  },
  async updateLine(req: Request, res: Response, lineId: string, qty: number) {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart || !cart.lines.some((l) => l.id === lineId)) throw notFound("Cart line");
    if (qty === 0) await prisma.cartLine.delete({ where: { id: lineId } });
    else await prisma.cartLine.update({ where: { id: lineId }, data: { qty } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region);
  },
  async setCoupon(req: Request, res: Response, code: string | null) {
    const region = res.locals.region;
    const cart = await currentCart(req, res, true);
    if (!cart) throw notFound("Cart");
    if (code) {
      const coupon = await cartRepo.coupon(code);
      if (!coupon) throw badRequest("COUPON_INVALID", "That code isn't valid");
      const d = couponDiscount(coupon, pricedLines(cart), region.code);
      if (d.reason) throw badRequest("COUPON_NOT_APPLICABLE", d.reason);
    }
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: code ? code.toUpperCase() : null } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region);
  },
  async setAddress(req: Request, res: Response, email: string, address: Address) {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart) throw notFound("Cart");
    const expected = await regionForCountry(address.countryCode);
    if (expected !== region.code) throw conflict("REGION_MISMATCH", `${address.countryCode} is served from our ${expected} store. Switch region to continue.`, { suggestedRegion: expected });
    await prisma.cart.update({ where: { id: cart.id }, data: { email, shippingAddress: address, shippingOptionId: null } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region);
  },
  async shippingRates(req: Request, res: Response) {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart || cart.lines.length === 0) return { options: [] };
    const pl = pricedLines(cart);
    const coupon = cart.couponCode ? await cartRepo.coupon(cart.couponCode) : null;
    const merch = pl.reduce((s, l) => s + l.unitPrice * l.qty, 0) - couponDiscount(coupon, pl, region.code).amount;
    const address = cart.shippingAddress as Address | null;
    return { options: await shippingService.options(region, pl.reduce((s, l) => s + l.weightGrams * l.qty, 0), merch, address?.countryCode ?? region.defaultCountry) };
  },
  async setShipping(req: Request, res: Response, optionId: string) {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart) throw notFound("Cart");
    const { options } = await this.shippingRates(req, res);
    if (!options.some((o) => o.id === optionId)) throw badRequest("SHIPPING_OPTION_INVALID", "Pick a shipping option from the list");
    await prisma.cart.update({ where: { id: cart.id }, data: { shippingOptionId: optionId } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region);
  },
};
