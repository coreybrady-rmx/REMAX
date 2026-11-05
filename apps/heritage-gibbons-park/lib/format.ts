export function formatDollars(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.trunc(abs / 100);
  const rem = abs % 100;
  const body = dollars.toLocaleString("en-US");
  const text = rem === 0 ? `$${body}` : `$${body}.${String(rem).padStart(2, "0")}`;
  return negative ? `-${text}` : text;
}

/** One decimal place. 103750 / 225000 → 46.1%. */
export function formatPercent(ratio: number): string {
  const rounded = Math.round(ratio * 1000) / 10;
  return `${rounded.toFixed(1)}%`;
}

export function formatRate(annualRateBps: number): string {
  const pct = annualRateBps / 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

export function formatMonths(months: number): string {
  return months === 1 ? "1 month" : `${months} months`;
}
