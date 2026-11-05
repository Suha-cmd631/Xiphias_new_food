import test from "node:test";
import assert from "node:assert/strict";
import { safeEqual } from "./secure.js";

test("safeEqual: equal strings match, different or empty never match", () => {
  assert.equal(safeEqual("s3cret", "s3cret"), true);
  assert.equal(safeEqual("s3cret", "s3creT"), false);
  assert.equal(safeEqual("s3", "s3cret"), false);
  assert.equal(safeEqual("", ""), false); // unconfigured secret must never authenticate
  assert.equal(safeEqual(undefined, "x"), false);
  assert.equal(safeEqual("x", ""), false);
});
