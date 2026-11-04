import assert from "node:assert/strict";
import test from "node:test";
import {
  costSensitivity,
  durationSensitivity,
  evaluate,
  priceSensitivity,
  type ModelInput,
} from "./finance.ts";

function base(overrides: Partial<ModelInput> = {}): ModelInput {
  return {
    lines: [
      { id: "land", label: "Land", inclusion: "included", amountCents: 20_000_00 },
      { id: "build", label: "Hard construction", inclusion: "included", amountCents: 80_000_00 },
    ],
    salePriceCents: 120_000_00,
    commission: { mode: "none" },
    durationMonths: null,
    monthlyCarryCents: null,
    investor: { kind: "undefined" },
    ...overrides,
  };
}

test("profit, margin, and project ROI use supplied costs only", () => {
  const result = evaluate(base());
  assert.equal(result.complete, true);
  assert.equal(result.netProfitCents, 20_000_00);
  assert.equal(result.margin, 20_000_00 / 120_000_00);
  assert.equal(result.projectRoi, 20_000_00 / 100_000_00);
  assert.equal(result.projectLoss, false);
  assert.equal(result.investorProfitCents, null);
});

test("a lower sale price is reported as a project loss", () => {
  const result = evaluate(base({ salePriceCents: 80_000_00 }));
  assert.equal(result.complete, true);
  assert.equal(result.netProfitCents, -20_000_00);
  assert.equal(result.projectLoss, true);
  assert.ok(result.projectRoi !== null && result.projectRoi < 0);
});

test("a blank included cost blocks profit instead of becoming zero", () => {
  const result = evaluate(
    base({
      lines: [
        { id: "land", label: "Land", inclusion: "included", amountCents: 20_000_00 },
        { id: "build", label: "Hard construction", inclusion: "included", amountCents: null },
      ],
    }),
  );
  assert.equal(result.complete, false);
  assert.equal(result.netProfitCents, null);
  assert.equal(result.projectRoi, null);
  assert.equal(result.knownCostCents, 20_000_00);
});

test("an explicit zero is kept and an excluded line is omitted", () => {
  const result = evaluate(
    base({
      lines: [
        { id: "land", label: "Land", inclusion: "included", amountCents: 100_000_00 },
        { id: "fees", label: "Builder fees", inclusion: "included", amountCents: 0 },
        { id: "landscape", label: "Landscaping", inclusion: "excluded", amountCents: 50_000_00 },
      ],
      salePriceCents: 100_000_00,
    }),
  );
  assert.equal(result.complete, true);
  assert.equal(result.netProfitCents, 0);
  assert.equal(result.projectLoss, false);
});

test("unknown lines block the model even when a figure is present", () => {
  const result = evaluate(
    base({
      lines: [
        { id: "land", label: "Land", inclusion: "included", amountCents: 100_000_00 },
        { id: "close", label: "Closing costs", inclusion: "unknown", amountCents: 1_000_00 },
      ],
    }),
  );
  assert.equal(result.complete, false);
  assert.equal(result.netProfitCents, null);
});

test("percent commission changes break-even and is not added twice", () => {
  const result = evaluate(
    base({
      salePriceCents: null,
      commission: { mode: "percent", inclusion: "included", bps: 500 },
    }),
  );
  assert.equal(result.complete, false);
  assert.ok(result.breakEvenSaleCents !== null);
  const atEven = evaluate(
    base({
      salePriceCents: result.breakEvenSaleCents,
      commission: { mode: "percent", inclusion: "included", bps: 500 },
    }),
  );
  assert.equal(atEven.complete, true);
  assert.ok(atEven.netProfitCents !== null && atEven.netProfitCents >= 0);
  const below = evaluate(
    base({
      salePriceCents: result.breakEvenSaleCents! - 1,
      commission: { mode: "percent", inclusion: "included", bps: 500 },
    }),
  );
  assert.equal(below.projectLoss, true);
});

test("investor cash return is not the same figure as project ROI", () => {
  const result = evaluate(
    base({
      investor: { kind: "profitShare", shareBps: 5_000, capitalCents: 40_000_00 },
    }),
  );
  assert.equal(result.complete, true);
  assert.equal(result.projectRoi, 0.2);
  assert.equal(result.investorProfitCents, 10_000_00);
  assert.equal(result.investorRoi, 0.25);
  assert.notEqual(result.investorRoi, result.projectRoi);
});

test("investor return stays blank until capital and a share are both defined", () => {
  const noRule = evaluate(base());
  assert.equal(noRule.investorProfitCents, null);
  const noCapital = evaluate(
    base({ investor: { kind: "profitShare", shareBps: 5_000, capitalCents: null } }),
  );
  assert.equal(noCapital.complete, false);
  assert.equal(noCapital.investorProfitCents, null);
});

test("holding period does not invent carry, and supplied carry changes profit", () => {
  const without = evaluate(base());
  assert.equal(without.carryApplied, false);
  assert.equal(durationSensitivity(base()), null);
  const withCarry = evaluate(
    base({ monthlyCarryCents: 1_000_00, durationMonths: 4, salePriceCents: 120_000_00 }),
  );
  assert.equal(withCarry.carryCents, 4_000_00);
  assert.equal(withCarry.netProfitCents, 16_000_00);
  const longer = durationSensitivity(
    base({ monthlyCarryCents: 1_000_00, durationMonths: 4 }),
  );
  assert.ok(longer);
  assert.equal(longer![2].result.netProfitCents, 10_000_00);
});

test("sensitivity shifts the supplied price and cost", () => {
  const prices = priceSensitivity(base());
  assert.equal(prices?.[0].result.netProfitCents, 8_000_00);
  assert.equal(prices?.[2].result.netProfitCents, 32_000_00);
  const costs = costSensitivity(base());
  assert.equal(costs[0].result.knownCostCents, 90_000_00);
  assert.equal(costs[2].result.knownCostCents, 110_000_00);
  assert.equal(priceSensitivity(base({ salePriceCents: null })), null);
});
