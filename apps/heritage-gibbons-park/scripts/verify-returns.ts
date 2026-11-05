import assert from "node:assert/strict";
import { ASSUMPTIONS, SENSITIVITY_SALE_PRICES } from "../lib/assumptions";
import { baseCase, calculate, sensitivityCases } from "../lib/calculate";
import { formatDollars, formatPercent } from "../lib/format";

const base = baseCase;

assert.equal(formatDollars(base.interestCents), "$42,500");
assert.equal(formatDollars(base.commissionCents), "$70,000");
assert.equal(formatDollars(base.totalCostCents), "$1,192,500");
assert.equal(formatDollars(base.profitCents), "$207,500");
assert.equal(formatDollars(base.investorCents ?? 0), "$103,750");
assert.equal(formatDollars(base.peaksCents ?? 0), "$103,750");
assert.equal(formatDollars(base.proceedsCents ?? 0), "$328,750");
assert.equal(formatDollars(base.capitalReturnCents ?? 0), "$225,000");
assert.equal(formatPercent(base.cashOnCash ?? 0), "46.1%");
assert.equal(formatDollars(base.breakEvenCents), "$1,192,500");
assert.equal(base.isLoss, false);
assert.deepEqual(
  base.draws.map((draw) => draw.outstandingMonths),
  [8, 7, 6, 5, 4],
);
assert.equal(
  base.draws.every((draw) => draw.funded),
  true,
);

const expectedSensitivity: Array<[number, string, string, string, string]> = [
  [1_200_000, "$60,000", "$17,500", "$8,750", "3.9%"],
  [1_300_000, "$65,000", "$112,500", "$56,250", "25.0%"],
  [1_400_000, "$70,000", "$207,500", "$103,750", "46.1%"],
  [1_450_000, "$72,500", "$255,000", "$127,500", "56.7%"],
];

assert.deepEqual([...SENSITIVITY_SALE_PRICES], expectedSensitivity.map(([price]) => price));

const rows = sensitivityCases({
  durationMonths: ASSUMPTIONS.durationMonths,
  annualRateBps: ASSUMPTIONS.annualRateBps,
});

rows.forEach((row, index) => {
  const [, commission, profit, investor, coc] = expectedSensitivity[index];
  assert.equal(formatDollars(row.result.commissionCents), commission);
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
assert.equal(formatDollars(loss.commissionCents), "$55,000");
assert.equal(formatDollars(loss.profitCents), "-$77,500");
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
