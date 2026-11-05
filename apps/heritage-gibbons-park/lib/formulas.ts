/**
 * Pure money formulas. Amounts are integer cents.
 *
 * Simple interest on one draw:
 *   interest = principal × annual rate × outstanding months / 12
 *
 * Outstanding months = duration − draw index (0–4).
 * If duration is shorter than the draw's month (index + 1), that draw is
 * not funded: principal is 0 and outstanding months are 0.
 *
 * Project cost keeps the full construction budget even when a later draw
 * is not funded. Interest is charged only on draws the timeline reaches.
 * A shorter hold is not modeled as a cheaper house.
 *
 * Commission = sale × 5%.
 * Profit = sale − lot − construction − interest − commission − closing.
 * If profit > 0, each party receives profit × 50%.
 * Cash-on-cash = investor profit / lot. It is not an annualized IRR.
 * If profit < 0, the loss is not split.
 */

export function drawMonth(drawIndex: number): number {
  return drawIndex + 1;
}

export function isDrawFunded(durationMonths: number, drawIndex: number): boolean {
  return durationMonths >= drawMonth(drawIndex);
}

export function outstandingMonths(
  durationMonths: number,
  drawIndex: number,
): number {
  if (!isDrawFunded(durationMonths, drawIndex)) return 0;
  return durationMonths - drawIndex;
}

export function equalDrawPrincipalCents(
  constructionBudgetCents: number,
  drawCount: number,
): number {
  if (drawCount <= 0) return 0;
  if (constructionBudgetCents % drawCount !== 0) {
    throw new Error("Construction budget must divide evenly across draws.");
  }
  return constructionBudgetCents / drawCount;
}

/** sale × commission rate, rounded to the nearest cent. */
export function commissionCents(saleCents: number, commissionBps: number): number {
  if (saleCents <= 0 || commissionBps <= 0) return 0;
  return Math.round((saleCents * commissionBps) / 10_000);
}

/** principal × rate × months / 12, rounded to the nearest cent. */
export function simpleInterestCents(
  principalCents: number,
  annualRateBps: number,
  months: number,
): number {
  if (principalCents <= 0 || annualRateBps <= 0 || months <= 0) return 0;
  const numerator = principalCents * annualRateBps * months;
  return Math.round(numerator / (10_000 * 12));
}

export function projectCostCents(parts: {
  lotCents: number;
  constructionCents: number;
  interestCents: number;
  commissionCents: number;
  closingCents: number;
}): number {
  return (
    parts.lotCents +
    parts.constructionCents +
    parts.interestCents +
    parts.commissionCents +
    parts.closingCents
  );
}

export function projectProfitCents(saleCents: number, costCents: number): number {
  return saleCents - costCents;
}

export function splitProfitCents(
  profitCents: number,
  investorShare: number,
): { investorCents: number; peaksCents: number } | null {
  if (profitCents <= 0) return null;
  const investorCents = Math.round(profitCents * investorShare);
  return {
    investorCents,
    peaksCents: profitCents - investorCents,
  };
}

export function cashOnCash(investorProfitCents: number, lotCents: number): number {
  if (lotCents === 0) return 0;
  return investorProfitCents / lotCents;
}
