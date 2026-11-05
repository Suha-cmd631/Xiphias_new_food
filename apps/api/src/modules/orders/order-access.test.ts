import "../../test-env.js";
import test from "node:test";
import assert from "node:assert/strict";
import { grantedOrderIds, signOrderGrant, verifyOrderGrant } from "./order-access.js";

const SECRET = "unit-test-secret-unit-test-secret";
const now = 1_800_000_000_000;

test("a grant authorises exactly its order until it expires", () => {
  const g = signOrderGrant("order_a", SECRET, now, 3600);
  assert.equal(verifyOrderGrant(g, SECRET, now + 1000), "order_a");
  assert.equal(verifyOrderGrant(g, SECRET, now + 3601_000), null);
});

test("forged, re-targeted or malformed grants are rejected", () => {
  const g = signOrderGrant("order_a", SECRET, now, 3600);
  const [, exp, sig] = g.split(".");
  assert.equal(verifyOrderGrant(`order_b.${exp}.${sig}`, SECRET, now), null); // another order id
  assert.equal(verifyOrderGrant(`order_a.${Number(exp) + 9999}.${sig}`, SECRET, now), null); // extended expiry
  assert.equal(verifyOrderGrant(g, "another-secret", now), null);
  assert.equal(verifyOrderGrant("order_a", SECRET, now), null);
  assert.equal(verifyOrderGrant("", SECRET, now), null);
});

test("cookie value with several grants", () => {
  const value = [signOrderGrant("o1", SECRET, now), "garbage", signOrderGrant("o2", SECRET, now)].join("~");
  assert.deepEqual(grantedOrderIds(value, SECRET, now), ["o1", "o2"]);
  assert.deepEqual(grantedOrderIds(undefined, SECRET, now), []);
});
