export const COST_CATEGORIES = [
  ["land_acquisition", "Land acquisition"],
  ["site_development", "Site development"],
  ["excavation", "Excavation and grading"],
  ["utilities", "Utilities and impact fees"],
  ["architecture", "Architectural and engineering"],
  ["permits", "Permits and soft costs"],
  ["hard_construction", "Hard construction"],
  ["landscaping", "Landscaping and exterior"],
  ["contingency", "Construction contingency"],
  ["builder_fees", "Builder fees and overhead"],
  ["financing", "Financing expenses"],
  ["interest_carry", "Interest and carrying costs"],
  ["taxes_insurance", "Property taxes and insurance"],
  ["marketing", "Marketing"],
  ["closing", "Closing costs"],
] as const;

export type CostCategory = (typeof COST_CATEGORIES)[number][0];

export function categoryLabel(category: string): string {
  return COST_CATEGORIES.find(([key]) => key === category)?.[1] ?? category;
}
