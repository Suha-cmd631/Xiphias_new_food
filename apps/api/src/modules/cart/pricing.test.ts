import test from "node:test";
import assert from "node:assert/strict";
import { couponDiscount, couponEligibility, DEFAULT_COUPON_RULES, parseCouponRules, totals } from "./pricing.js";
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

test("WELCOME10 is first-order only", () => {
  assert.equal(couponEligibility("WELCOME10", { paidOrders: 0, usesOfThisCoupon: 0 }).ok, true);
  const second = couponEligibility("welcome10", { paidOrders: 1, usesOfThisCoupon: 0 });
  assert.equal(second.ok, false);
  assert.match(second.reason!, /first orders only/);
});

test("a coupon is single-use per email unless explicitly multi-use", () => {
  // WELCOME10 attached to an order still awaiting payment counts as used (no parallel double-dip).
  assert.equal(couponEligibility("WELCOME10", { paidOrders: 0, usesOfThisCoupon: 1 }).ok, false);
  assert.equal(couponEligibility("SOMECODE", { paidOrders: 3, usesOfThisCoupon: 0 }).ok, true);
  assert.equal(couponEligibility("SOMECODE", { paidOrders: 3, usesOfThisCoupon: 1 }).ok, false);
  assert.equal(couponEligibility("BULKSAVE", { paidOrders: 9, usesOfThisCoupon: 9 }).ok, true);
});

test("coupon rules: defaults, and overrides from the coupon_rules setting", () => {
  assert.deepEqual(parseCouponRules(undefined), DEFAULT_COUPON_RULES);
  assert.deepEqual(parseCouponRules("nonsense"), DEFAULT_COUPON_RULES);
  const rules = parseCouponRules({ firstOrderOnly: ["hello5"], multiUse: [] });
  assert.equal(couponEligibility("HELLO5", { paidOrders: 1, usesOfThisCoupon: 0 }, rules).ok, false);
  assert.equal(couponEligibility("BULKSAVE", { paidOrders: 1, usesOfThisCoupon: 1 }, rules).ok, false);
});
