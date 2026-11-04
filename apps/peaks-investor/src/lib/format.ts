export function formatSqft(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} SF`;
}

export function formatBaths(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatCents(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatRatio(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
}

export function parseCents(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").trim().replaceAll(",", "").replaceAll("$", "");
  if (!text) return null;
  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error("Enter a dollar amount, or leave the field blank.");
  }
  return Math.round(Number(text) * 100);
}

export function centsToInput(cents: number | null): string {
  if (cents === null) return "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}
