import assert from "node:assert/strict";
import test from "node:test";
import { leadDeliveryMode } from "./lead-delivery.ts";

test("a configured webhook is forwarded in every environment", () => {
  for (const nodeEnv of ["development", "production", "test"]) {
    assert.equal(
      leadDeliveryMode({
        webhook: "https://example.test/hook",
        nodeEnv,
        vercelEnv: nodeEnv === "production" ? "production" : undefined,
      }),
      "forward",
    );
  }
});

test("production and preview drop nothing silently when the webhook is missing", () => {
  assert.equal(
    leadDeliveryMode({
      webhook: undefined,
      nodeEnv: "production",
      vercelEnv: "production",
    }),
    "unconfigured",
  );
  assert.equal(
    leadDeliveryMode({
      webhook: "  ",
      nodeEnv: "production",
      vercelEnv: "preview",
    }),
    "unconfigured",
  );
  assert.equal(
    leadDeliveryMode({
      webhook: undefined,
      nodeEnv: "production",
      vercelEnv: undefined,
    }),
    "unconfigured",
  );
});

test("local dev can still exercise the form before a webhook exists", () => {
  assert.equal(
    leadDeliveryMode({
      webhook: undefined,
      nodeEnv: "development",
      vercelEnv: undefined,
    }),
    "dev-log",
  );
  assert.equal(
    leadDeliveryMode({
      webhook: undefined,
      nodeEnv: "production",
      vercelEnv: "development",
    }),
    "dev-log",
  );
});
