import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_ASSUMPTIONS,
  affordabilityEstimate,
  monthlyPrincipalAndInterest,
  paymentEstimate,
} from "../lib/estimates.ts";

test("principal and interest at 6% for 30 years", () => {
  const payment = monthlyPrincipalAndInterest(400_000, 6, 30);
  assert.ok(Math.abs(payment - 2398.2) < 1);
});

test("a zero rate splits the loan evenly", () => {
  const payment = monthlyPrincipalAndInterest(360_000, 0, 30);
  assert.equal(payment, 1000);
});

test("payment estimate adds taxes, insurance, and HOA", () => {
  const estimate = paymentEstimate(500_000, 100_000, {
    ...DEFAULT_ASSUMPTIONS,
    annualRatePercent: 6,
    annualTaxPercent: 0.6,
    annualInsurance: 1800,
    monthlyHoa: 150,
  });
  assert.ok(estimate);
  assert.equal(estimate.principal, 400_000);
  assert.ok(Math.abs(estimate.principalAndInterest - 2398.2) < 1);
  assert.equal(Math.round(estimate.taxes), 250);
  assert.equal(estimate.insurance, 150);
  assert.equal(estimate.hoa, 150);
  assert.ok(estimate.total > estimate.principalAndInterest);
});

test("affordability uses the tighter of the 28 and 36 rules", () => {
  const estimate = affordabilityEstimate(10_000, 500, 40_000, {
    ...DEFAULT_ASSUMPTIONS,
    annualRatePercent: 6,
    annualTaxPercent: 0,
    annualInsurance: 0,
    monthlyHoa: 0,
  });
  assert.ok(estimate);
  assert.equal(estimate.limitingRule, "28% of gross income");
  assert.ok(Math.abs(estimate.maxHousingPayment - 2800) < 0.01);
  const factor = 2398.2 / 400_000;
  const expected = 2800 / factor + 40_000;
  assert.ok(Math.abs(estimate.maxPrice - expected) < 50);
  assert.ok(estimate.comfortablePrice < estimate.maxPrice);
});

test("heavy debts switch the limit to the 36 rule", () => {
  const estimate = affordabilityEstimate(10_000, 3000, 0, {
    ...DEFAULT_ASSUMPTIONS,
    annualRatePercent: 6,
    annualTaxPercent: 0,
    annualInsurance: 0,
    monthlyHoa: 0,
  });
  assert.ok(estimate);
  assert.equal(estimate.limitingRule, "36% of gross income after other debts");
  assert.equal(estimate.maxHousingPayment, 600);
});

test("debts above the back-end ratio produce no purchase price", () => {
  const estimate = affordabilityEstimate(8_000, 4000, 20_000, DEFAULT_ASSUMPTIONS);
  assert.ok(estimate);
  assert.equal(estimate.maxPrice, 0);
  assert.equal(estimate.comfortablePrice, 0);
});

test("empty price does not invent a payment", () => {
  assert.equal(paymentEstimate(0, 0, DEFAULT_ASSUMPTIONS), null);
  assert.equal(affordabilityEstimate(0, 0, 0, DEFAULT_ASSUMPTIONS), null);
});
