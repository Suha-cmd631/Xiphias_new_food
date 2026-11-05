import test from "node:test";
import assert from "node:assert/strict";
import { closedCountriesOf, isCountryClosed, isRegionClosed, notOpenMessage } from "./closed.js";
import { resolveGateway } from "./gateway-policy.js";

const CA = { code: "CA", countries: ["CA"] };
const US = { code: "US", countries: ["US"] };
const ROW = { code: "ROW", countries: ["AU", "NZ", "SG"] };
const dflt = { countries: ["CA"], regions: [] };

test("default config: Canada is closed at country and region level, others open", () => {
  assert.equal(isCountryClosed("ca", "CA", dflt), true);
  assert.equal(isRegionClosed(CA, dflt), true); // single-country region whose only country is closed
  assert.equal(isCountryClosed("US", "US", dflt), false);
  assert.equal(isRegionClosed(US, dflt), false);
  assert.equal(isCountryClosed("IN", "IN", dflt), false);
});

test("a closed country inside a multi-country region closes only that country", () => {
  const cfg = { countries: ["NZ"], regions: [] };
  assert.equal(isRegionClosed(ROW, cfg), false);
  assert.deepEqual(closedCountriesOf(ROW, cfg), ["NZ"]);
  assert.equal(isCountryClosed("NZ", "ROW", cfg), true);
  assert.equal(isCountryClosed("AU", "ROW", cfg), false);
});

test("a closed region closes every country in it; all countries closed closes the region", () => {
  const byRegion = { countries: [], regions: ["ROW"] };
  assert.equal(isRegionClosed(ROW, byRegion), true);
  assert.equal(isCountryClosed("SG", "ROW", byRegion), true);
  assert.deepEqual(closedCountriesOf(ROW, byRegion), ["AU", "NZ", "SG"]);
  assert.equal(isRegionClosed(ROW, { countries: ["AU", "NZ", "SG"], regions: [] }), true);
});

test("nothing configured = everything open", () => {
  const open = { countries: [], regions: [] };
  assert.equal(isRegionClosed(CA, open), false);
  assert.equal(isCountryClosed("CA", "CA", open), false);
});

test("message is plain English", () => {
  assert.match(notOpenMessage("Canada"), /^We don't deliver to Canada yet\./);
});

test("gateway: dev falls back to mock, production never does without the flag", () => {
  const none = { stripe: false, jiopay: false };
  assert.deepEqual(resolveGateway("stripe", none, true), { gateway: "mock", paymentsConfigured: true });
  assert.deepEqual(resolveGateway("jiopay", none, true), { gateway: "mock", paymentsConfigured: true });
  assert.deepEqual(resolveGateway("stripe", none, false), { gateway: "stripe", paymentsConfigured: false });
  assert.deepEqual(resolveGateway("jiopay", none, false), { gateway: "jiopay", paymentsConfigured: false });
  assert.deepEqual(resolveGateway("mock", none, false), { gateway: "mock", paymentsConfigured: false });
  assert.deepEqual(resolveGateway("stripe", { stripe: true, jiopay: false }, false), { gateway: "stripe", paymentsConfigured: true });
  assert.deepEqual(resolveGateway("jiopay", { stripe: true, jiopay: false }, false), { gateway: "jiopay", paymentsConfigured: false });
});
