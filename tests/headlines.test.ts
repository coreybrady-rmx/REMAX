import assert from "node:assert/strict";
import test from "node:test";
import {
  HEADLINES,
  claimHeadlineIndex,
  headlineForIndex,
  parseHeadlineCookie,
  type HeadlineStore,
} from "../lib/headlines.ts";

test("rotates the six scan headlines in order", async () => {
  const store = memoryStore();
  const seen = [];
  for (let i = 0; i < HEADLINES.length + 2; i += 1) {
    seen.push(headlineForIndex(await claimHeadlineIndex(store)));
  }
  assert.deepEqual(seen, [
    "Your next move starts here.",
    "Curious what's possible?",
    "Know your numbers, know your options.",
    "What's your next move?",
    "Your home, your future, your move.",
    "Big real estate questions? Start here.",
    "Your next move starts here.",
    "Curious what's possible?",
  ]);
});

test("keeps a returning visitor on the headline they already received", () => {
  assert.equal(parseHeadlineCookie("2"), 2);
  assert.equal(headlineForIndex(2), "Know your numbers, know your options.");
  assert.equal(parseHeadlineCookie("6"), null);
  assert.equal(parseHeadlineCookie("nope"), null);
  assert.equal(parseHeadlineCookie(""), null);
});

test("retries when two scans claim the same spot", async () => {
  const store = memoryStore();
  let races = 0;
  const original = store.compareAndSwap.bind(store);
  store.compareAndSwap = async (next, etag) => {
    races += 1;
    if (races === 1) {
      await original(next, etag);
      return false;
    }
    return original(next, etag);
  };
  const index = await claimHeadlineIndex(store);
  assert.equal(index, 1);
  assert.equal(headlineForIndex(index), "Curious what's possible?");
});

function memoryStore(): HeadlineStore {
  let value = 0;
  let etag: string | null = null;
  return {
    async read() {
      return { value, etag };
    },
    async compareAndSwap(next, expected) {
      if (etag !== expected) return false;
      value = next;
      etag = String(next);
      return true;
    },
  };
}
