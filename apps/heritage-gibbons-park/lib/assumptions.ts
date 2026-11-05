/**
 * Underwriting assumptions for The Heritage at Gibbons Park Estates.
 * Change figures here. Formulas live in formulas.ts. The model is assembled
 * in calculate.ts. Run `npm run verify` after changing a number.
 */
export const ASSUMPTIONS = {
  lotEquity: 225_000,
  constructionBudget: 850_000,
  closingCosts: 5_000,
  /** Commission is 5% of the sale price. */
  commissionBps: 500,
  drawCount: 5,
  profitShare: 0.5,
  annualRateBps: 1_000,
  durationMonths: 8,
  salePrice: 1_400_000,
  salePriceMin: 1_100_000,
  salePriceMax: 1_600_000,
  salePriceStep: 5_000,
  durationMin: 5,
  durationMax: 15,
  rateMinBps: 600,
  rateMaxBps: 1_400,
  rateStepBps: 10,
} as const;

export const SENSITIVITY_SALE_PRICES = [
  1_200_000, 1_300_000, 1_400_000, 1_450_000,
] as const;

export const DEFAULT_INPUT = {
  salePrice: ASSUMPTIONS.salePrice,
  durationMonths: ASSUMPTIONS.durationMonths,
  annualRateBps: ASSUMPTIONS.annualRateBps,
} as const;

/** Public Lot 1 route on the Gibbons Park Estates site (hash modal). */
export const GIBBONS_PARK_LOT_URL =
  "https://gibbons-park-estates.netlify.app/#modal-lot-1";
