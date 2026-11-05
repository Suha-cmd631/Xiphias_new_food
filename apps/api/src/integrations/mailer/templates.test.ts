import "../../test-env.js";
import test from "node:test";
import assert from "node:assert/strict";
import type { Lead } from "@prisma/client";
import { esc, escMultiline, subjectText } from "./escape.js";
import { templates } from "./templates.js";

const XSS = `<img src=x onerror="alert(1)">`;
const lead = (o: Partial<Lead>): Lead => ({ id: "l1", reference: "L-2026-0001", source: "contact", status: "new", company: null, name: "Asha", email: "a@example.com", phone: null, country: null, interest: null, products: [], volume: null, message: null, ownerId: null, createdAt: new Date(), updatedAt: new Date(), ...o });

test("esc escapes the five HTML-significant characters", () => {
  assert.equal(esc(`<a href="x" title='y'>&</a>`), "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  assert.equal(esc(null), "");
  assert.equal(escMultiline("a<b\nc"), "a&lt;b<br>c");
});

test("subjects lose line breaks and control characters", () => {
  assert.equal(subjectText("Hello\r\nBcc: victim@example.com"), "Hello Bcc: victim@example.com");
});

test("staff notification escapes every visitor-supplied field", () => {
  const m = templates.leadNotify(lead({ name: XSS, company: XSS, phone: XSS, country: XSS, interest: XSS, volume: XSS, products: [XSS], message: `${XSS}\nline two`, email: `"><script>x</script>@e.com` }));
  assert.equal(m.html.includes("<img"), false);
  assert.equal(m.html.includes("<script"), false);
  assert.ok(m.html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(m.html.includes("<br>line two"));
});

test("acknowledgement is generic: nothing the visitor typed is echoed back", () => {
  const m = templates.leadAck(lead({ name: "CLICK http://evil.example NOW", message: "Buy pills at http://evil.example", company: "EvilCo" }));
  for (const s of ["evil.example", "CLICK", "pills", "EvilCo"]) assert.equal((m.html + m.subject).includes(s), false);
  assert.ok(m.html.includes("L-2026-0001"));
});

test("order emails escape names, coupon codes and product text", () => {
  const order = {
    number: "XS-2026-000001", email: "b@example.com", regionCode: "IN", currency: "INR", status: "paid", paymentStatus: "paid", couponCode: XSS, notes: XSS,
    subtotal: 100, discountTotal: 10, shippingTotal: 0, grandTotal: 90, shippingAddress: { firstName: XSS }, shippingMethod: { name: XSS },
    lines: [{ productName: XSS, variantTitle: XSS, qty: 1, lineTotal: 100 }],
  } as never;
  for (const m of [templates.orderConfirmation(order), templates.adminNewOrder(order), templates.paymentReview(order, XSS)]) {
    assert.equal(m.html.includes("<img"), false);
  }
});
