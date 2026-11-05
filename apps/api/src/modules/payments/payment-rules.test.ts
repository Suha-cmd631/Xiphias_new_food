import test from "node:test";
import assert from "node:assert/strict";
import { amountMatches, decidePaid } from "./payment-rules.js";

const expected = { amount: 1499, currency: "INR" };
const fresh = { orderStatus: "pending", paymentStatus: "initiated", paymentRecordStatus: "pending", paymentGateway: "jiopay" };

test("amountMatches: exact amount and currency only", () => {
  assert.equal(amountMatches({ amount: 1499, currency: "inr" }, expected), true);
  assert.equal(amountMatches({ amount: 1499.004, currency: "INR" }, expected), true);
  assert.equal(amountMatches({ amount: 1, currency: "INR" }, expected), false);
  assert.equal(amountMatches({ amount: 1499, currency: "USD" }, expected), false);
  assert.equal(amountMatches(null, expected), false);
  assert.equal(amountMatches({ amount: NaN, currency: "INR" }, expected), false);
});

test("decidePaid: happy path, idempotency, wrong gateway, wrong amount", () => {
  assert.equal(decidePaid(fresh, "jiopay", { amount: 1499, currency: "INR" }, expected), "mark_paid");
  assert.equal(decidePaid({ ...fresh, orderStatus: "paid", paymentStatus: "paid", paymentRecordStatus: "paid" }, "jiopay", { amount: 1499, currency: "INR" }, expected), "already_paid");
  assert.equal(decidePaid({ ...fresh, paymentGateway: "mock" }, "jiopay", { amount: 1499, currency: "INR" }, expected), "gateway_mismatch");
  assert.equal(decidePaid({ ...fresh, paymentGateway: "stripe" }, "jiopay", { amount: 1499, currency: "INR" }, expected), "gateway_mismatch");
  assert.equal(decidePaid(fresh, "jiopay", { amount: 1, currency: "INR" }, expected), "amount_mismatch");
  assert.equal(decidePaid(fresh, "jiopay", undefined, expected), "amount_mismatch"); // real gateways must report an amount
  assert.equal(decidePaid({ ...fresh, paymentGateway: "mock" }, "mock", undefined, expected), "mark_paid");
});

test("decidePaid: a cancelled / expired order is never revived — review once", () => {
  const cancelled = { orderStatus: "cancelled", paymentStatus: "failed", paymentRecordStatus: "failed", paymentGateway: "stripe" };
  assert.equal(decidePaid(cancelled, "stripe", { amount: 1499, currency: "INR" }, expected), "needs_review");
  assert.equal(decidePaid({ ...cancelled, paymentRecordStatus: "paid" }, "stripe", { amount: 1499, currency: "INR" }, expected), "already_flagged");
});
