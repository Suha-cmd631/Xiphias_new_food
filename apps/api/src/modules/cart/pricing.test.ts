import test from "node:test";
import assert from "node:assert/strict";
import { couponDiscount, totals } from "./pricing.js";
import { Prisma } from "@prisma/client";

const coupon = (o: Partial<Parameters<typeof couponDiscount>[0] & object>) =>
  ({ id: "c", code: "BULKSAVE", type: "percent", value: new Prisma.Decimal(20), minSubtotal: null, minQty: 3, regions: [], startsAt: null, endsAt: null, usageLimit: null, usedCount: 0, active: true, description: null, ...o }) as never;

test("BULKSAVE needs 3 packs", () => {
  const lines = [{ variantId: "a", qty: 2, unitPrice: 100, weightGrams: 500 }];
  assert.equal(couponDiscount(coupon({}), lines, "IN").amount, 0);
  lines[0]!.qty = 3;
  assert.equal(couponDiscount(coupon({}), lines, "IN").amount, 60);
});

test("totals never go negative and round to 2dp", () => {
  const t = totals([{ variantId: "a", qty: 1, unitPrice: 10.005, weightGrams: 100 }], 50, 4.9, "dap");
  assert.equal(t.grandTotal, 4.9);
  assert.equal(t.subtotal, 10.01);
});
