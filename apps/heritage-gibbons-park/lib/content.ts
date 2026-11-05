export const RESIDENCE = {
  builder: "Acadia Homes",
  plan: "Heritage",
  type: "Two-Story Executive Residence",
  beds: "6 bed",
  baths: "4.5 bath",
  mainSf: "1,759 sf",
  upperSf: "1,856 sf",
  aboveGradeSf: "3,615 sf",
  basementSf: "1,709 sf",
  totalSf: "5,324 sf",
  garageSf: "702 sf",
} as const;

export const FEATURES = [
  "Executive kitchen",
  "Premium primary suite",
  "Family living",
  "Storage",
  "Oversized garage",
  "Finished basement",
  "Refined exterior",
  "Outdoor living",
] as const;

export const FLOOR_PLANS = [
  {
    id: "main",
    label: "Main level",
    title: "Main level",
    src: "/heritage-plan-c.webp",
    width: 1728,
    height: 1946,
    alt: "Main level floor plan of The Heritage, showing the great room, kitchen, dining room, office, and two-car garage.",
    note: "Owner’s main level sheet, shown as drawn.",
  },
  {
    id: "upper",
    label: "Upper level",
    title: "Upper level",
    src: "/heritage-plan-b.webp",
    width: 1706,
    height: 1722,
    alt: "Upper level floor plan of The Heritage, showing the primary suite, two bedrooms, and the area open to below.",
    note: "Owner’s upper level sheet, shown as drawn.",
  },
  {
    id: "basement",
    label: "Basement",
    title: "Basement",
    src: "/heritage-plan-a.webp",
    width: 2500,
    height: 1841,
    alt: "Basement floor plan of The Heritage. Finished rooms include a recreation room, play room, and three bedrooms. Hatched areas are printed UNEXCAVATED and GARAGE OPTIONAL.",
    note: "Owner’s basement sheet, shown as drawn. The basement is finished. Hatched areas still print UNEXCAVATED and GARAGE OPTIONAL. Those hatched areas are not finished living space.",
  },
] as const;

export const LOT_FACTS = [
  {
    label: "Official Lot 1 plat",
    value: "Gibbons Park Estates final plat",
    detail:
      "Sheet 1 of 1, dated 02-09-2026, prepared by Alpenglow Engineers & Surveyors. The sheet is shown here.",
  },
  {
    label: "Lot size",
    value: "0.249 acres",
    detail: "Printed inside the Lot 1 label with the address 1415 Red Fox Court.",
  },
  {
    label: "Dimensions",
    value: "North line 82.46 ft. East line North 109.78 ft. West side 78.13 ft.",
    detail:
      "These calls are drawn on Lot 1. The frontage also shows a 38.88 ft segment, a 5.00 ft segment, and curve C4. Dimensions printed on other lots are not listed here.",
  },
  {
    label: "Storm water easement",
    value: "20.00 ft on the west side of Lot 1",
    detail:
      "The plat draws a storm water detention easement on Lot 1 and labels it 20.00 ft. A plat note dedicates the easement shown on Lot 1 and Lot 10 to the project HOA.",
  },
  {
    label: "Building envelope",
    value: "Not yet verified",
    detail: "A setback line is drawn, but this page does not state envelope distances for Lot 1.",
  },
  {
    label: "Orientation",
    value: "Not yet verified",
    detail: "The plat does not state which way the house on Lot 1 faces.",
  },
  {
    label: "Approved site plan",
    value: "Not yet verified",
    detail: "This sheet is the subdivision plat, not an approved site plan for the house.",
  },
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
  "The basement is finished, and the dollar model is unchanged. The basement sheet still prints UNEXCAVATED and GARAGE OPTIONAL on hatched areas. Those hatched areas are not finished living space.",
  "The plat shows Lot 1 as 0.249 acres at 1415 Red Fox Court, with a storm water detention easement. A building envelope, house orientation, and an approved site plan are not confirmed on this page.",
  "Financing terms may differ from 10% simple interest on drawn funds, with no compounding and no origination fee.",
  "The construction timeline is an illustration, not a confirmed schedule.",
  "A written agreement will control capital return, profit allocations, and losses. This model does not split a loss 50/50.",
] as const;
