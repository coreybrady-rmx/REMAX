import assert from "node:assert/strict";
import { ASSUMPTIONS, SENSITIVITY_SALE_PRICES } from "../lib/assumptions";
import { baseCase, calculate, sensitivityCases } from "../lib/calculate";
import { formatDollars, formatPercent } from "../lib/format";

const base = baseCase;

assert.equal(formatDollars(base.interestCents), "$42,500");
assert.equal(formatDollars(base.totalCostCents), "$1,122,500");
assert.equal(formatDollars(base.profitCents), "$277,500");
assert.equal(formatDollars(base.investorCents ?? 0), "$138,750");
assert.equal(formatDollars(base.peaksCents ?? 0), "$138,750");
assert.equal(formatDollars(base.proceedsCents ?? 0), "$363,750");
assert.equal(formatDollars(base.capitalReturnCents ?? 0), "$225,000");
assert.equal(formatPercent(base.cashOnCash ?? 0), "61.7%");
assert.equal(formatDollars(base.breakEvenCents), "$1,122,500");
assert.equal(base.isLoss, false);
assert.deepEqual(
  base.draws.map((draw) => draw.outstandingMonths),
  [8, 7, 6, 5, 4],
);
assert.equal(
  base.draws.every((draw) => draw.funded),
  true,
);

const expectedSensitivity: Array<[number, string, string, string]> = [
  [1_200_000, "$77,500", "$38,750", "17.2%"],
  [1_300_000, "$177,500", "$88,750", "39.4%"],
  [1_400_000, "$277,500", "$138,750", "61.7%"],
  [1_450_000, "$327,500", "$163,750", "72.8%"],
];

assert.deepEqual([...SENSITIVITY_SALE_PRICES], expectedSensitivity.map(([price]) => price));

const rows = sensitivityCases({
  durationMonths: ASSUMPTIONS.durationMonths,
  annualRateBps: ASSUMPTIONS.annualRateBps,
});

rows.forEach((row, index) => {
  const [, profit, investor, coc] = expectedSensitivity[index];
  assert.equal(formatDollars(row.result.profitCents), profit);
  assert.equal(formatDollars(row.result.investorCents ?? 0), investor);
  assert.equal(formatPercent(row.result.cashOnCash ?? 0), coc);
});

const short = calculate({
  salePrice: 1_400_000,
  durationMonths: 4,
  annualRateBps: 1_000,
});
assert.equal(short.draws[4].funded, false);
assert.equal(short.draws[4].principalCents, 0);
assert.equal(short.draws[4].interestCents, 0);
assert.equal(short.draws[4].outstandingMonths, 0);
assert.equal(formatDollars(short.interestCents), "$14,166.67");
assert.equal(formatDollars(short.constructionCents), "$850,000");

const boundary = calculate({
  salePrice: 1_400_000,
  durationMonths: 5,
  annualRateBps: 1_000,
});
assert.equal(boundary.draws[4].funded, true);
assert.equal(boundary.draws[4].outstandingMonths, 1);

const loss = calculate({
  salePrice: 1_100_000,
  durationMonths: 8,
  annualRateBps: 1_000,
});
assert.equal(loss.isLoss, true);
assert.equal(formatDollars(loss.profitCents), "-$22,500");
assert.equal(loss.investorCents, null);
assert.equal(loss.peaksCents, null);
assert.equal(loss.capitalReturnCents, null);
assert.equal(loss.proceedsCents, null);
assert.equal(loss.cashOnCash, null);

const longer = calculate({
  salePrice: 1_400_000,
  durationMonths: 9,
  annualRateBps: 1_000,
});
assert.ok(longer.interestCents > base.interestCents);
const longerRow = sensitivityCases({
  durationMonths: 9,
  annualRateBps: 1_000,
}).find((row) => row.salePrice === 1_400_000);
assert.ok(longerRow);
assert.ok(longerRow.result.profitCents < base.profitCents);

console.log("verify-returns: default case, sensitivity, unfunded draw, and loss passed");
