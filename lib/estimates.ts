export const DEFAULT_ASSUMPTIONS = {
  annualRatePercent: 6.5,
  termYears: 30,
  annualTaxPercent: 0.6,
  annualInsurance: 1800,
  monthlyHoa: 0,
} as const;

export type Assumptions = {
  annualRatePercent: number;
  termYears: number;
  annualTaxPercent: number;
  annualInsurance: number;
  monthlyHoa: number;
};

export type PaymentEstimate = {
  principal: number;
  principalAndInterest: number;
  taxes: number;
  insurance: number;
  hoa: number;
  total: number;
};

export type AffordabilityEstimate = {
  maxPrice: number;
  comfortablePrice: number;
  maxHousingPayment: number;
  comfortableHousingPayment: number;
  limitingRule: "28% of gross income" | "36% of gross income after other debts";
};

const FRONT_RATIO = 0.28;
const BACK_RATIO = 0.36;
const COMFORTABLE_SHARE = 0.9;

export function mortgagePaymentFactor(annualRatePercent: number, termYears: number): number {
  const months = termYears * 12;
  if (months <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return 1 / months;
  const growth = (1 + monthlyRate) ** months;
  return (monthlyRate * growth) / (growth - 1);
}

export function monthlyPrincipalAndInterest(
  principal: number,
  annualRatePercent: number,
  termYears: number,
): number {
  if (principal <= 0) return 0;
  return principal * mortgagePaymentFactor(annualRatePercent, termYears);
}

export function paymentEstimate(
  price: number,
  downPayment: number,
  assumptions: Assumptions,
): PaymentEstimate | null {
  if (!Number.isFinite(price) || price <= 0) return null;
  const down = clampMoney(downPayment);
  const principal = Math.max(0, price - down);
  const principalAndInterest = monthlyPrincipalAndInterest(
    principal,
    assumptions.annualRatePercent,
    assumptions.termYears,
  );
  const taxes = (price * clampPercent(assumptions.annualTaxPercent)) / 100 / 12;
  const insurance = clampMoney(assumptions.annualInsurance) / 12;
  const hoa = clampMoney(assumptions.monthlyHoa);
  return {
    principal,
    principalAndInterest,
    taxes,
    insurance,
    hoa,
    total: principalAndInterest + taxes + insurance + hoa,
  };
}

export function affordabilityEstimate(
  grossMonthlyIncome: number,
  monthlyDebts: number,
  downPayment: number,
  assumptions: Assumptions,
): AffordabilityEstimate | null {
  if (!Number.isFinite(grossMonthlyIncome) || grossMonthlyIncome <= 0) return null;
  const debts = clampMoney(monthlyDebts);
  const down = clampMoney(downPayment);
  const frontCap = grossMonthlyIncome * FRONT_RATIO;
  const backCap = grossMonthlyIncome * BACK_RATIO - debts;
  const limitingRule =
    backCap < frontCap
      ? "36% of gross income after other debts"
      : "28% of gross income";
  const maxHousingPayment = Math.max(0, Math.min(frontCap, backCap));
  const factor = mortgagePaymentFactor(assumptions.annualRatePercent, assumptions.termYears);
  const taxMonthlyRate = clampPercent(assumptions.annualTaxPercent) / 100 / 12;
  const flatMonthly = clampMoney(assumptions.annualInsurance) / 12 + clampMoney(assumptions.monthlyHoa);

  return {
    maxPrice: priceFromPayment(maxHousingPayment, down, factor, taxMonthlyRate, flatMonthly),
    comfortablePrice: priceFromPayment(
      maxHousingPayment * COMFORTABLE_SHARE,
      down,
      factor,
      taxMonthlyRate,
      flatMonthly,
    ),
    maxHousingPayment,
    comfortableHousingPayment: maxHousingPayment * COMFORTABLE_SHARE,
    limitingRule,
  };
}

function priceFromPayment(
  housingPayment: number,
  downPayment: number,
  factor: number,
  taxMonthlyRate: number,
  flatMonthly: number,
): number {
  const available = housingPayment - flatMonthly;
  if (available <= 0 || factor + taxMonthlyRate <= 0) return 0;
  const price = (available + downPayment * factor) / (factor + taxMonthlyRate);
  if (!Number.isFinite(price) || price <= 0) return 0;
  return price;
}

function clampMoney(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}
