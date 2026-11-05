import type { Request, Response } from "express";
import type { Address, Cart as CartDto, CartLine } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { badRequest, conflict, notFound } from "../../shared/errors.js";
import { COOKIES, readCookie, setCookie } from "../../shared/cookies.js";
import { money, n } from "../../shared/money.js";
import { assertCheckoutOpen, regionForCountry, type RegionCtx } from "../regions/regions.service.js";
import type { Tx } from "../../shared/prisma.js";
import { shippingService } from "../shipping/shipping.service.js";
import { cartRepo, type CartRow } from "./cart.repo.js";
import { couponDiscount, couponEligibility, totals, type PricedLine } from "./pricing.js";
import type { Coupon } from "@prisma/client";

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
  // A variant with no price in this region's price list must never be priced at 0 (e.g. after a region switch,
  // or when a price is withdrawn): take it out of the cart and tell the shopper once.
  if (cart) {
    const unpriced = cart.lines.filter((l) => !hasPrice(l));
    if (unpriced.length) {
      await cartRepo.removeLines(unpriced.map((l) => l.id));
      const cleaned = await cartRepo.byId(cart.id, region.priceListId);
      if (cleaned) removedNotes.set(cleaned, unpriced.map((l) => `${l.variant.product.name} (${l.variant.title}) isn't sold in ${region.name}, so we removed it from your cart`));
      cart = cleaned;
    }
  }
  return cart;
}

type Line = CartRow["lines"][number];
const removedNotes = new WeakMap<CartRow, string[]>();
const hasPrice = (l: Line) => l.variant.prices[0] != null && n(l.variant.prices[0].amount) > 0;

/** Unit price of a cart line in the cart's region. Refuses (never returns 0) when the variant has no price there. */
export function unitPriceOf(l: Line): number {
  if (!hasPrice(l)) throw conflict("NOT_SOLD_IN_REGION", `${l.variant.product.name} (${l.variant.title}) is not available in your region — please remove it from your cart`);
  return n(l.variant.prices[0]!.amount);
}

export function pricedLines(cart: CartRow): PricedLine[] {
  return cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty, unitPrice: unitPriceOf(l), weightGrams: l.variant.weightGrams }));
}

export type Shopper = { id: string; email: string } | null | undefined;
export type CouponResult = { coupon: Coupon | null; amount: number; reason?: string; applied: boolean };

/**
 * The one place a cart's coupon is judged: validity rules (dates, region, minimums) + per-customer rules
 * (first order only / once per email) as soon as we know who is buying. Used by the cart view and by checkout.
 */
export async function evaluateCoupon(cart: CartRow, region: RegionCtx, shopper?: Shopper, db?: Tx): Promise<CouponResult> {
  if (!cart.couponCode) return { coupon: null, amount: 0, applied: false };
  const coupon = await cartRepo.coupon(cart.couponCode);
  if (!coupon) return { coupon: null, amount: 0, reason: `${cart.couponCode} is no longer valid`, applied: false };
  const d = couponDiscount(coupon, pricedLines(cart), region.code);
  if (d.reason) return { coupon, amount: 0, reason: d.reason, applied: false };
  const email = cart.email ?? shopper?.email;
  if (email) {
    const history = await cartRepo.couponHistory(coupon.code, email, shopper?.id ?? cart.customerId, db);
    const e = couponEligibility(coupon.code, history, await cartRepo.couponRules());
    if (!e.ok) return { coupon, amount: 0, reason: e.reason, applied: false };
  }
  return { coupon, amount: d.amount, applied: true };
}

export async function toDto(cart: CartRow | null, region: RegionCtx, shopper?: Shopper): Promise<CartDto> {
  const cur = region.currency;
  if (!cart) {
    const zero = money(0, cur);
    return { id: "", region: region.code, currency: cur, lines: [], itemCount: 0, couponCode: null, email: null, shippingAddress: null, shippingOption: null, totals: { subtotal: zero, discount: zero, shipping: zero, tax: zero, grandTotal: zero, freeShippingRemaining: region.freeShippingAbove ? money(region.freeShippingAbove, cur) : null }, messages: [] };
  }
  const messages: CartDto["messages"] = (removedNotes.get(cart) ?? []).map((text) => ({ level: "warn" as const, text }));
  const lines: CartLine[] = cart.lines.map((l) => {
    const price = unitPriceOf(l);
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
  const disc = await evaluateCoupon(cart, region, shopper);
  if (cart.couponCode && disc.reason) messages.push({ level: "info", text: disc.reason });
  const merch = pl.reduce((s, l) => s + l.unitPrice * l.qty, 0) - disc.amount;
  const weight = pl.reduce((s, l) => s + l.weightGrams * l.qty, 0);
  const address = (cart.shippingAddress as Address | null) ?? null;
  const option = cart.shippingOptionId ? await shippingService.optionById(region, cart.shippingOptionId, weight, merch, address?.countryCode ?? region.defaultCountry) : null;
  const shipping = option ? (disc.applied && disc.coupon?.type === "free_shipping" ? 0 : option.amount.amount) : 0;
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
    if (!variant.prices[0] || n(variant.prices[0].amount) <= 0) throw conflict("NOT_SOLD_IN_REGION", `${variant.product.name} is not available in ${region.name}`);
    if (variant.product.availableIn.length && !variant.product.availableIn.some((c) => region.countries.includes(c))) throw conflict("NOT_SOLD_IN_REGION", `${variant.product.name} cannot be shipped to ${region.name}`);
    const cart = (await currentCart(req, res, true))!;
    const existing = cart.lines.find((l) => l.variantId === variantId);
    const newQty = (existing?.qty ?? 0) + qty;
    const available = variant.inventory ? variant.inventory.onHand - variant.inventory.reserved : 999;
    if (variant.trackInventory && newQty > available) throw conflict("OUT_OF_STOCK", `Only ${Math.max(0, available)} in stock`);
    await prisma.cartLine.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId } }, update: { qty: newQty }, create: { cartId: cart.id, variantId, qty } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region, res.locals.customer);
  },
  async updateLine(req: Request, res: Response, lineId: string, qty: number) {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart || !cart.lines.some((l) => l.id === lineId)) throw notFound("Cart line");
    if (qty === 0) await prisma.cartLine.delete({ where: { id: lineId } });
    else await prisma.cartLine.update({ where: { id: lineId }, data: { qty } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region, res.locals.customer);
  },
  async setCoupon(req: Request, res: Response, code: string | null) {
    const region = res.locals.region;
    // No cart is created just to hold a code (an empty cart has nothing to discount, and bots would mint rows).
    const cart = await currentCart(req, res);
    if (!cart || cart.lines.length === 0) throw badRequest("CART_EMPTY", "Add something to your cart before applying a code");
    if (code) {
      const coupon = await cartRepo.coupon(code);
      if (!coupon) throw badRequest("COUPON_INVALID", "That code isn't valid");
      const d = await evaluateCoupon({ ...cart, couponCode: coupon.code }, region, res.locals.customer);
      if (d.reason) throw badRequest("COUPON_NOT_APPLICABLE", d.reason);
    }
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: code ? code.toUpperCase() : null } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region, res.locals.customer);
  },
  async setAddress(req: Request, res: Response, email: string, address: Address) {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart) throw notFound("Cart");
    // Closed destinations (e.g. Canada) get the plain "we don't deliver there yet" answer, not "switch region".
    await assertCheckoutOpen(region, address.countryCode);
    const expected = await regionForCountry(address.countryCode);
    if (expected !== region.code) throw conflict("REGION_MISMATCH", `${address.countryCode} is served from our ${expected} store. Switch region to continue.`, { suggestedRegion: expected });
    await prisma.cart.update({ where: { id: cart.id }, data: { email, shippingAddress: address, shippingOptionId: null } });
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region, res.locals.customer);
  },
  async shippingRates(req: Request, res: Response) {
    const region = res.locals.region;
    const cart = await currentCart(req, res);
    if (!cart || cart.lines.length === 0) return { options: [] };
    const pl = pricedLines(cart);
    const merch = pl.reduce((s, l) => s + l.unitPrice * l.qty, 0) - (await evaluateCoupon(cart, region, res.locals.customer)).amount;
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
    return toDto(await cartRepo.byId(cart.id, region.priceListId), region, res.locals.customer);
  },
};
