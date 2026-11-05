import { ASSUMPTIONS, SENSITIVITY_SALE_PRICES } from "./assumptions";
import {
  cashOnCash,
  equalDrawPrincipalCents,
  isDrawFunded,
  outstandingMonths,
  projectCostCents,
  projectProfitCents,
  simpleInterestCents,
  splitProfitCents,
} from "./formulas";

export type ModelInput = {
  salePrice: number;
  durationMonths: number;
  annualRateBps: number;
};

export type DrawLine = {
  index: number;
  month: number;
  funded: boolean;
  principalCents: number;
  outstandingMonths: number;
  interestCents: number;
};

export type ModelResult = {
  interestCents: number;
  constructionCents: number;
  totalCostCents: number;
  profitCents: number;
  isLoss: boolean;
  peaksCents: number | null;
  investorCents: number | null;
  capitalReturnCents: number | null;
  proceedsCents: number | null;
  cashOnCash: number | null;
  breakEvenCents: number;
  draws: DrawLine[];
};

const DOLLARS = 100;

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * DOLLARS);
}

export function calculate(input: ModelInput): ModelResult {
  const lotCents = dollarsToCents(ASSUMPTIONS.lotEquity);
  const constructionCents = dollarsToCents(ASSUMPTIONS.constructionBudget);
  const closingCents = dollarsToCents(ASSUMPTIONS.closingCosts);
  const saleCents = dollarsToCents(input.salePrice);
  const drawPrincipal = equalDrawPrincipalCents(
    constructionCents,
    ASSUMPTIONS.drawCount,
  );

  const draws: DrawLine[] = Array.from(
    { length: ASSUMPTIONS.drawCount },
    (_, index) => {
      const funded = isDrawFunded(input.durationMonths, index);
      const principalCents = funded ? drawPrincipal : 0;
      const months = outstandingMonths(input.durationMonths, index);
      return {
        index,
        month: index + 1,
        funded,
        principalCents,
        outstandingMonths: months,
        interestCents: simpleInterestCents(
          principalCents,
          input.annualRateBps,
          months,
        ),
      };
    },
  );

  const interestCents = draws.reduce((sum, draw) => sum + draw.interestCents, 0);
  const totalCostCents = projectCostCents({
    lotCents,
    constructionCents,
    interestCents,
    closingCents,
  });
  const profitCents = projectProfitCents(saleCents, totalCostCents);
  const isLoss = profitCents < 0;
  const shared = {
    interestCents,
    constructionCents,
    totalCostCents,
    profitCents,
    breakEvenCents: totalCostCents,
    draws,
  };

  if (isLoss) {
    return {
      ...shared,
      isLoss: true,
      peaksCents: null,
      investorCents: null,
      capitalReturnCents: null,
      proceedsCents: null,
      cashOnCash: null,
    };
  }

  if (profitCents === 0) {
    return {
      ...shared,
      isLoss: false,
      peaksCents: 0,
      investorCents: 0,
      capitalReturnCents: lotCents,
      proceedsCents: lotCents,
      cashOnCash: 0,
    };
  }

  const split = splitProfitCents(profitCents, ASSUMPTIONS.profitShare);
  if (!split) {
    throw new Error("Expected a profit split.");
  }

  return {
    interestCents,
    constructionCents,
    totalCostCents,
    profitCents,
    isLoss: false,
    peaksCents: split.peaksCents,
    investorCents: split.investorCents,
    capitalReturnCents: lotCents,
    proceedsCents: lotCents + split.investorCents,
    cashOnCash: cashOnCash(split.investorCents, lotCents),
    breakEvenCents: totalCostCents,
    draws,
  };
}

export function sensitivityCases(
  input: Pick<ModelInput, "durationMonths" | "annualRateBps">,
  salePrices: readonly number[] = SENSITIVITY_SALE_PRICES,
): Array<{ salePrice: number; result: ModelResult }> {
  return salePrices.map((salePrice) => ({
    salePrice,
    result: calculate({ ...input, salePrice }),
  }));
}

export function interestByDuration(
  annualRateBps: number,
  from = ASSUMPTIONS.durationMin,
  to = ASSUMPTIONS.durationMax,
): Array<{ durationMonths: number; interestCents: number }> {
  const rows = [];
  for (let durationMonths = from; durationMonths <= to; durationMonths += 1) {
    const result = calculate({
      salePrice: ASSUMPTIONS.salePrice,
      durationMonths,
      annualRateBps,
    });
    rows.push({ durationMonths, interestCents: result.interestCents });
  }
  return rows;
}

export const baseCase = calculate({
  salePrice: ASSUMPTIONS.salePrice,
  durationMonths: ASSUMPTIONS.durationMonths,
  annualRateBps: ASSUMPTIONS.annualRateBps,
});
