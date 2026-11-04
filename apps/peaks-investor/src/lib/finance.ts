export type Inclusion = "included" | "excluded" | "unknown";

export type CostLine = {
  id: string;
  label: string;
  inclusion: Inclusion;
  amountCents: number | null;
};

export type CommissionInput =
  | { mode: "none" }
  | { mode: "fixed"; inclusion: Inclusion; amountCents: number | null }
  | { mode: "percent"; inclusion: Inclusion; bps: number | null };

export type InvestorRule =
  | { kind: "undefined" }
  | { kind: "profitShare"; shareBps: number | null; capitalCents: number | null };

export type ModelInput = {
  lines: CostLine[];
  salePriceCents: number | null;
  commission: CommissionInput;
  durationMonths: number | null;
  /** Separate monthly carrying cost. Null means no monthly carry was supplied. */
  monthlyCarryCents: number | null;
  investor: InvestorRule;
};

export type MissingItem = {
  id: string;
  label: string;
};

export type ModelResult = {
  complete: boolean;
  missing: MissingItem[];
  knownCostCents: number;
  carryCents: number | null;
  carryApplied: boolean;
  commissionCents: number | null;
  totalInvestmentCents: number | null;
  netProfitCents: number | null;
  /** Net profit divided by sale price. */
  margin: number | null;
  /** Net profit divided by total project investment. Not an investor cash return. */
  projectRoi: number | null;
  breakEvenSaleCents: number | null;
  investorProfitCents: number | null;
  /** Investor profit divided by contributed cash. */
  investorRoi: number | null;
  projectLoss: boolean | null;
};

export type SensitivityCell = {
  label: string;
  result: ModelResult;
};

function roundRatio(cents: number, bps: number): number {
  return Math.round((cents * bps) / 10_000);
}

function pushMissing(missing: MissingItem[], id: string, label: string) {
  if (!missing.some((item) => item.id === id)) missing.push({ id, label });
}

export function evaluate(input: ModelInput): ModelResult {
  const missing: MissingItem[] = [];
  let knownCostCents = 0;
  let costsComplete = true;

  for (const line of input.lines) {
    if (line.inclusion === "excluded") continue;
    if (line.inclusion === "unknown" || line.amountCents === null) {
      costsComplete = false;
      pushMissing(missing, line.id, line.label);
      continue;
    }
    knownCostCents += line.amountCents;
  }

  let carryCents: number | null = null;
  let carryApplied = false;
  if (input.monthlyCarryCents === null) {
    carryCents = 0;
    carryApplied = false;
  } else if (input.durationMonths === null) {
    costsComplete = false;
    pushMissing(missing, "duration", "Holding period");
  } else if (input.durationMonths < 0 || input.monthlyCarryCents < 0) {
    costsComplete = false;
    pushMissing(missing, "carry", "Monthly carrying cost");
  } else {
    carryCents = input.monthlyCarryCents * input.durationMonths;
    carryApplied = true;
  }

  let commissionCents: number | null = null;
  let commissionBps: number | null = null;
  const commission = input.commission;
  if (commission.mode === "none") {
    commissionCents = 0;
  } else if (commission.inclusion === "excluded") {
    commissionCents = 0;
  } else if (commission.mode === "fixed") {
    if (commission.inclusion === "unknown" || commission.amountCents === null) {
      costsComplete = false;
      pushMissing(missing, "commission", "Sales commission");
    } else {
      commissionCents = commission.amountCents;
    }
  } else if (commission.bps === null || commission.inclusion === "unknown") {
    costsComplete = false;
    pushMissing(missing, "commission", "Sales commission rate");
  } else if (commission.bps < 0 || commission.bps >= 10_000) {
    costsComplete = false;
    pushMissing(missing, "commission", "Sales commission rate");
  } else {
    commissionBps = commission.bps;
    if (input.salePriceCents === null) {
      commissionCents = null;
    } else {
      commissionCents = roundRatio(input.salePriceCents, commission.bps);
    }
  }

  const fixedCosts =
    costsComplete && carryCents !== null ? knownCostCents + carryCents : null;
  const fixedCommission = commission.mode === "percent" ? 0 : commissionCents;
  const breakEvenSaleCents =
    fixedCosts !== null && fixedCommission !== null
      ? commissionBps === null
        ? fixedCosts + fixedCommission
        : Math.ceil((fixedCosts * 10_000) / (10_000 - commissionBps))
      : null;

  const saleKnown = input.salePriceCents !== null;
  if (!saleKnown) pushMissing(missing, "sale", "Selling price");

  const totalInvestmentCents =
    costsComplete && commissionCents !== null && carryCents !== null && saleKnown
      ? knownCostCents + carryCents + commissionCents
      : costsComplete &&
          commission.mode !== "percent" &&
          commissionCents !== null &&
          carryCents !== null
        ? knownCostCents + carryCents + commissionCents
        : null;

  const profitReady =
    totalInvestmentCents !== null && input.salePriceCents !== null && commissionCents !== null;
  const netProfitCents = profitReady ? input.salePriceCents! - totalInvestmentCents! : null;
  const margin =
    netProfitCents !== null && input.salePriceCents
      ? netProfitCents / input.salePriceCents
      : null;
  const projectRoi =
    netProfitCents !== null && totalInvestmentCents
      ? netProfitCents / totalInvestmentCents
      : null;

  let investorProfitCents: number | null = null;
  let investorRoi: number | null = null;
  if (input.investor.kind === "profitShare") {
    if (input.investor.shareBps === null) {
      pushMissing(missing, "investor-share", "Investor profit share");
    } else if (input.investor.capitalCents === null) {
      pushMissing(missing, "investor-capital", "Investor capital contributed");
    } else if (netProfitCents !== null) {
      investorProfitCents = roundRatio(netProfitCents, input.investor.shareBps);
      investorRoi =
        input.investor.capitalCents > 0
          ? investorProfitCents / input.investor.capitalCents
          : null;
    }
  }

  const complete = missing.length === 0 && netProfitCents !== null;

  return {
    complete,
    missing,
    knownCostCents,
    carryCents: carryApplied ? carryCents : null,
    carryApplied,
    commissionCents,
    totalInvestmentCents: complete ? totalInvestmentCents : totalInvestmentCents,
    netProfitCents: complete ? netProfitCents : null,
    margin: complete ? margin : null,
    projectRoi: complete ? projectRoi : null,
    breakEvenSaleCents,
    investorProfitCents: complete ? investorProfitCents : null,
    investorRoi: complete ? investorRoi : null,
    projectLoss: complete && netProfitCents !== null ? netProfitCents < 0 : null,
  };
}

export function withSale(input: ModelInput, salePriceCents: number | null): ModelInput {
  return { ...input, salePriceCents };
}

export function withCostScale(input: ModelInput, factor: number): ModelInput {
  return {
    ...input,
    lines: input.lines.map((line) =>
      line.inclusion === "included" && line.amountCents !== null
        ? { ...line, amountCents: Math.round(line.amountCents * factor) }
        : line,
    ),
  };
}

export function withDuration(input: ModelInput, durationMonths: number | null): ModelInput {
  return { ...input, durationMonths };
}

export function priceSensitivity(input: ModelInput): SensitivityCell[] | null {
  if (input.salePriceCents === null) return null;
  return [-0.1, 0, 0.1].map((shift) => ({
    label: shift === 0 ? "Supplied price" : shift < 0 ? "Price −10%" : "Price +10%",
    result: evaluate(withSale(input, Math.round(input.salePriceCents! * (1 + shift)))),
  }));
}

export function costSensitivity(input: ModelInput): SensitivityCell[] {
  return [-0.1, 0, 0.1].map((shift) => ({
    label: shift === 0 ? "Supplied cost" : shift < 0 ? "Cost −10%" : "Cost +10%",
    result: evaluate(withCostScale(input, 1 + shift)),
  }));
}

export function durationSensitivity(input: ModelInput): SensitivityCell[] | null {
  if (input.monthlyCarryCents === null || input.durationMonths === null) return null;
  return [0, 3, 6].map((extra) => ({
    label: extra === 0 ? "Supplied duration" : `Duration +${extra} months`,
    result: evaluate(withDuration(input, input.durationMonths! + extra)),
  }));
}

export function blankModel(): ModelInput {
  return {
    lines: [
      { id: "hard_construction", label: "Hard construction", inclusion: "included", amountCents: null },
      { id: "land_acquisition", label: "Land acquisition", inclusion: "included", amountCents: null },
      { id: "financing", label: "Financing expenses", inclusion: "included", amountCents: null },
    ],
    salePriceCents: null,
    commission: { mode: "percent", inclusion: "included", bps: null },
    durationMonths: null,
    monthlyCarryCents: null,
    investor: { kind: "undefined" },
  };
}

export const FORMULA_NOTES = [
  {
    term: "Total project investment",
    definition:
      "Sum of every cost line marked included, plus sales commission and any supplied monthly carry multiplied by the holding period.",
  },
  {
    term: "Project net profit",
    definition: "Selling price minus total project investment. A negative result is a project loss.",
  },
  {
    term: "Net margin",
    definition: "Project net profit divided by the selling price.",
  },
  {
    term: "Project ROI",
    definition:
      "Project net profit divided by total project investment. This is not the investor’s return on contributed cash.",
  },
  {
    term: "Break-even selling price",
    definition:
      "The sale price at which project net profit is zero. A percent commission is solved so the commission is not ignored.",
  },
  {
    term: "Investor cash return",
    definition:
      "Calculated only after investor capital and a profit-share rule are both entered. The investor’s profit is their share of project net profit, which may be negative. Return of capital is not added on top.",
  },
] as const;
