export const RESIDENCE = {
  builder: "Acadia Homes",
  plan: "Heritage",
  type: "Two-Story Executive Residence",
  beds: "6 bed",
  baths: "4.5 bath",
  mainSf: "1,759 sf",
  upperSf: "1,856 sf",
  aboveGradeSf: "3,615 sf",
  optionalBasementSf: "1,709 sf",
  potentialTotalSf: "5,324 sf",
  garageSf: "702 sf",
} as const;

export const FEATURES = [
  "Executive kitchen",
  "Premium primary suite",
  "Family living",
  "Storage",
  "Oversized garage",
  "Potential finished basement",
  "Refined exterior",
  "Outdoor living",
] as const;

export const FLOOR_PLANS = [
  {
    id: "main",
    label: "Main level",
    title: "Main level floor plan",
    note: "Placeholder. The main level floor plan has not been provided for this illustration.",
  },
  {
    id: "upper",
    label: "Upper level",
    title: "Upper level floor plan",
    note: "Placeholder. The upper level floor plan has not been provided for this illustration.",
  },
  {
    id: "basement",
    label: "Optional basement",
    title: "Optional basement floor plan",
    note: "Placeholder. The optional basement plan has not been provided. The basement is not modeled as finished area.",
  },
] as const;

export const LOT_PLACEHOLDERS = [
  "Official Lot 1 plat",
  "Lot size",
  "Dimensions",
  "Building envelope",
  "Orientation",
  "Approved site plan",
] as const;

export const TIMELINE = [
  { when: "Month 1", label: "Mobilization and site prep" },
  { when: "Month 2", label: "Foundation and framing" },
  { when: "Month 3", label: "MEP rough-in" },
  { when: "Month 4", label: "Interior finishes" },
  { when: "Month 5", label: "Finishing" },
  {
    when: "Months 6–8",
    label: "Finalization, marketing, sale and closing allowance",
  },
] as const;

export const RISKS = [
  "Sale price may differ from the $1,400,000 target. The target is not an appraisal.",
  "Construction scope may not be delivered within the $850,000 budget.",
  "The optional basement is not finished space in this model. Finishing it would change cost and the product offered for sale.",
  "Lot feasibility is unverified here. Plat, size, dimensions, building envelope, orientation, and an approved site plan are not confirmed on this page.",
  "Financing terms may differ from 10% simple interest on drawn funds, with no compounding and no origination fee.",
  "The construction timeline is an illustration, not a confirmed schedule.",
  "A written agreement will control capital return, profit allocations, and losses. This model does not split a loss 50/50.",
] as const;
