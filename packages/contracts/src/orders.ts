import { z } from "zod";
import { Money } from "./common.js";
import { Address } from "./cart.js";

export const OrderLine = z.object({
  productName: z.string(),
  variantTitle: z.string(),
  sku: z.string(),
  image: z.string().nullable(),
  qty: z.number().int(),
  unitPrice: Money,
  lineTotal: Money,
});

export const OrderSummary = z.object({
  id: z.string(),
  number: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  fulfillmentStatus: z.string(),
  currency: z.string(),
  grandTotal: Money,
  placedAt: z.string(),
  itemCount: z.number().int(),
});
export type OrderSummary = z.infer<typeof OrderSummary>;

export const OrderDetail = OrderSummary.extend({
  email: z.string(),
  lines: z.array(OrderLine),
  subtotal: Money,
  discount: Money,
  shipping: Money,
  tax: Money,
  shippingAddress: Address,
  shippingMethod: z.object({ name: z.string(), carrier: z.string() }).nullable(),
  tracking: z
    .object({
      carrier: z.string(),
      awb: z.string().nullable(),
      status: z.string(),
      trackingUrl: z.string().nullable(),
      events: z.array(z.object({ at: z.string(), status: z.string(), location: z.string().nullable() })),
    })
    .nullable(),
});
export type OrderDetail = z.infer<typeof OrderDetail>;

export const TrackQuery = z.object({ number: z.string().min(4), email: z.string().email() });
