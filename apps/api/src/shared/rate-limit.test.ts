import test from "node:test";
import assert from "node:assert/strict";
import { SlidingWindowLimiter } from "./rate-limit.js";

test("allows up to the limit, then blocks with a retry time", () => {
  let now = 1_000_000;
  const l = new SlidingWindowLimiter(3, 60_000, () => now);
  assert.equal(l.hit("login:1.1.1.1").allowed, true);
  now += 1000;
  assert.equal(l.hit("login:1.1.1.1").allowed, true);
  assert.deepEqual(l.hit("login:1.1.1.1"), { allowed: true, remaining: 0, retryAfterMs: 0 });
  const blocked = l.hit("login:1.1.1.1");
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterMs, 59_000); // first hit leaves the window 60 s after it happened
});

test("keys are independent (other IP / other route group)", () => {
  const l = new SlidingWindowLimiter(1, 60_000, () => 5);
  assert.equal(l.hit("login:1.1.1.1").allowed, true);
  assert.equal(l.hit("login:1.1.1.1").allowed, false);
  assert.equal(l.hit("login:2.2.2.2").allowed, true);
  assert.equal(l.hit("register:1.1.1.1").allowed, true);
});

test("window slides: old hits expire, blocked attempts do not extend the block", () => {
  let now = 0;
  const l = new SlidingWindowLimiter(2, 10_000, () => now);
  l.hit("k"); now = 4000; l.hit("k");
  now = 9000; assert.equal(l.hit("k").allowed, false);
  now = 10_001; assert.equal(l.hit("k").allowed, true); // the hit at t=0 expired; the blocked one at 9000 was not counted
  assert.equal(l.hit("k").allowed, false);
});

test("prune forgets idle keys and the key count is capped", () => {
  let now = 0;
  const l = new SlidingWindowLimiter(5, 1000, () => now, 3);
  l.hit("a"); l.hit("b"); l.hit("c");
  l.hit("d"); // cap reached with all keys still live → oldest dropped
  assert.equal(l.size, 3);
  now = 5000;
  l.prune();
  assert.equal(l.size, 0);
});
