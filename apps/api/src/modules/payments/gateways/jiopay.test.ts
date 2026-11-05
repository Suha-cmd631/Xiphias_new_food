import "../../../test-env.js";
import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { jiopayPaidAmount, verifyJioPaySignature } from "./jiopay.js";

const body = { merchantOrderId: "XS-2026-000001", transactionId: "T1", status: "success", amount: "499.00", currency: "INR" };
const hashWith = (key: string, b: Record<string, string> = body) =>
  createHmac("sha256", key).update(Object.keys(b).sort().map((k) => `${k}=${b[k]}`).join("|")).digest("hex");

test("valid signature with the configured key verifies", () => {
  const hash = hashWith("real-secret");
  assert.equal(verifyJioPaySignature({ ...body, hash }, hash, "real-secret"), true);
  assert.equal(verifyJioPaySignature({ ...body, hash }, hash.toUpperCase(), "real-secret"), true);
});

test("an empty key never verifies — the forged-webhook hole", () => {
  const forged = hashWith(""); // what an attacker can compute when JIOPAY_SECRET is unset
  assert.equal(verifyJioPaySignature({ ...body, hash: forged }, forged, ""), false);
});

test("wrong key, tampered body, missing or odd-length signature fail", () => {
  const hash = hashWith("real-secret");
  assert.equal(verifyJioPaySignature({ ...body, hash: hashWith("other") }, hashWith("other"), "real-secret"), false);
  assert.equal(verifyJioPaySignature({ ...body, amount: "1.00", hash }, hash, "real-secret"), false);
  assert.equal(verifyJioPaySignature({ ...body }, undefined, "real-secret"), false);
  assert.equal(verifyJioPaySignature({ ...body, hash: "abc" }, "abc", "real-secret"), false);
});

test("paid amount is read strictly; missing pieces give null", () => {
  assert.deepEqual(jiopayPaidAmount(body), { amount: 499, currency: "INR" });
  assert.equal(jiopayPaidAmount({ status: "success" }), null);
  assert.equal(jiopayPaidAmount({ amount: "abc", currency: "INR" }), null);
  assert.equal(jiopayPaidAmount({ amount: "", currency: "INR" }), null);
  assert.equal(jiopayPaidAmount({ amount: "499.00" }), null);
});
