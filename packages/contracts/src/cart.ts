import { z } from "zod";
import { Money } from "./common.js";
import { RegionCode } from "./region.js";

export const CartLine = z.object({
  id: z.string(),
  variantId: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  variantTitle: z.string(),
  image: z.string(),
  qty: z.number().int().min(1),
  unitPrice: Money,
  compareAt: Money.nullable(),
  lineTotal: Money,
  available: z.number().int(),
});
export type CartLine = z.infer<typeof CartLine>;

export const ShippingOption = z.object({
  id: z.string(),
  name: z.string(),
  carrier: z.string(),
  amount: Money,
  etaDays: z.tuple([z.number().int(), z.number().int()]),
});
export type ShippingOption = z.infer<typeof ShippingOption>;

export const Address = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional().default(""),
  city: z.string().min(1).max(80),
  state: z.string().max(80).optional().default(""),
  postalCode: z.string().min(2).max(20),
  countryCode: z.string().length(2),
  phone: z.string().min(6).max(20),
});
export type Address = z.infer<typeof Address>;

export const Cart = z.object({
  id: z.string(),
  region: RegionCode,
  currency: z.string(),
  lines: z.array(CartLine),
  itemCount: z.number().int(),
  couponCode: z.string().nullable(),
  email: z.string().nullable(),
  shippingAddress: Address.nullable(),
  shippingOption: ShippingOption.nullable(),
  totals: z.object({
    subtotal: Money,
    discount: Money,
    shipping: Money,
    tax: Money,
    grandTotal: Money,
    freeShippingRemaining: Money.nullable(),
  }),
  messages: z.array(z.object({ level: z.enum(["info", "warn"]), text: z.string() })),
});
export type Cart = z.infer<typeof Cart>;

export const AddLineBody = z.object({ variantId: z.string(), qty: z.number().int().min(1).max(99).default(1) });
export const UpdateLineBody = z.object({ qty: z.number().int().min(0).max(99) });
export const CouponBody = z.object({ code: z.string().min(2).max(40) });
export const CartAddressBody = z.object({ email: z.string().email(), address: Address });
export const CartShippingBody = z.object({ optionId: z.string() });
export const ShippingRatesResponse = z.object({ options: z.array(ShippingOption) });
export type ShippingRatesResponse = z.infer<typeof ShippingRatesResponse>;
export type CartAddressBody = z.infer<typeof CartAddressBody>;
