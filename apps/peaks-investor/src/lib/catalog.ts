export type BasementKind = "optional" | "finished";

export type PlanSpec = {
  slug: string;
  name: string;
  stories: 1 | 2;
  beds: number;
  baths: number;
  livingSqft: number;
  mainSqft: number;
  upperSqft: number | null;
  basementSqft: number;
  basementKind: BasementKind;
  garageSqft: number;
  garagePrimarySqft: number | null;
  garageExtraSqft: number | null;
  garageNote: string;
  specNote: string;
  strengths: string[];
  tradeoffs: string[];
  idealBuyer: string;
  constructionNotes: string;
};

const catalogNote =
  "Catalog reference for the standard configuration. A specific construction drawing or a modified project plan can differ. Omitting the basement, a bonus room, or a third-car garage changes living area and can change the room count.";

export const PLANS: PlanSpec[] = [
  {
    slug: "alpine",
    name: "Alpine",
    stories: 2,
    beds: 7,
    baths: 3.5,
    livingSqft: 4529,
    mainSqft: 1733,
    upperSqft: 1122,
    basementSqft: 1674,
    basementKind: "optional",
    garageSqft: 522,
    garagePrimarySqft: 522,
    garageExtraSqft: null,
    garageNote: "522 SF garage.",
    specNote: catalogNote,
    strengths: [
      "Balanced two-story design",
      "Strong family layout",
      "Flexible optional basement",
    ],
    tradeoffs: ["Smaller garage than several other Acadia plans", "Fewer bathrooms than Balsa", "More stairs than the rambler plans"],
    idealBuyer: "A large family that wants a two-story house and guest bedrooms.",
    constructionNotes:
      "Two-story plan. The published total of 4,529 SF includes the optional basement. Main level area is confirmed on the Acadia Alpine page.",
  },
  {
    slug: "balsa",
    name: "Balsa",
    stories: 2,
    beds: 7,
    baths: 5,
    livingSqft: 5332,
    mainSqft: 2118,
    upperSqft: 1248,
    basementSqft: 1966,
    basementKind: "optional",
    garageSqft: 511,
    garagePrimarySqft: 511,
    garageExtraSqft: null,
    garageNote: "511 SF garage.",
    specNote: catalogNote,
    strengths: ["Largest home in this collection", "Five bathrooms", "Executive and entertaining layout"],
    tradeoffs: ["Highest expected construction cost in the collection", "Suited to a premium lot", "Higher maintenance than a smaller plan"],
    idealBuyer: "Buyers comparing a large luxury two-story home.",
    constructionNotes:
      "Two-story plan. The published total of 5,332 SF includes the optional basement. Level areas are confirmed on the Acadia Balsa page.",
  },
  {
    slug: "heritage",
    name: "Heritage",
    stories: 2,
    beds: 6,
    baths: 4.5,
    livingSqft: 5324,
    mainSqft: 1759,
    upperSqft: 1856,
    basementSqft: 1709,
    basementKind: "optional",
    garageSqft: 702,
    garagePrimarySqft: 702,
    garageExtraSqft: null,
    garageNote: "702 SF garage, the largest two-story garage in this collection.",
    specNote: catalogNote,
    strengths: ["Largest two-story garage in this collection", "Luxury appearance", "Strong storage"],
    tradeoffs: ["Premium construction cost", "Larger lot requirement"],
    idealBuyer: "An executive household that wants a large garage and a two-story plan.",
    constructionNotes:
      "Two-story plan. The published total of 5,324 SF includes the optional basement. Level areas are confirmed on the Acadia Heritage page.",
  },
  {
    slug: "juniper",
    name: "Juniper",
    stories: 1,
    beds: 5,
    baths: 3.5,
    livingSqft: 3571,
    mainSqft: 1860,
    upperSqft: null,
    basementSqft: 1711,
    basementKind: "finished",
    garageSqft: 526,
    garagePrimarySqft: 526,
    garageExtraSqft: null,
    garageNote: "526 SF garage.",
    specNote: `${catalogNote} The main and basement split is taken from the Juniper plan note. The live Acadia Juniper page did not load when the catalog was checked, so that split is not reconfirmed against the live page.`,
    strengths: ["Rambler", "Aging-in-place layout", "Broad buyer appeal", "Simpler construction than the two-story plans"],
    tradeoffs: ["Fewest bedrooms in this collection", "Smaller footprint"],
    idealBuyer: "Buyers who want a rambler, including households planning to age in place.",
    constructionNotes:
      "One main story with a finished basement included in the 3,571 SF total. Main 1,860 SF and basement 1,711 SF sum to that total.",
  },
  {
    slug: "sage",
    name: "Sage",
    stories: 1,
    beds: 8,
    baths: 4.5,
    livingSqft: 3770,
    mainSqft: 1924,
    upperSqft: null,
    basementSqft: 1846,
    basementKind: "finished",
    garageSqft: 920,
    garagePrimarySqft: 541,
    garageExtraSqft: 379,
    garageNote: "541 SF garage plus a 379 SF third-car garage, 920 SF total.",
    specNote: catalogNote,
    strengths: ["Eight bedrooms", "Largest garage in this collection", "Multigenerational layout"],
    tradeoffs: ["Wide footprint", "Larger lot required"],
    idealBuyer: "A large or multigenerational household that needs bedroom count and garage space.",
    constructionNotes:
      "One main story. The 3,770 SF total includes the finished basement. Garage areas are confirmed on the Acadia Sage page.",
  },
  {
    slug: "sumac",
    name: "Sumac",
    stories: 1,
    beds: 7,
    baths: 4,
    livingSqft: 3649,
    mainSqft: 1860,
    upperSqft: null,
    basementSqft: 1789,
    basementKind: "finished",
    garageSqft: 752,
    garagePrimarySqft: 752,
    garageExtraSqft: null,
    garageNote: "752 SF garage.",
    specNote: catalogNote,
    strengths: ["Seven bedrooms", "Oversized garage", "Rambler layout"],
    tradeoffs: ["Four bathrooms", "Wider footprint"],
    idealBuyer: "A large family comparing rambler plans.",
    constructionNotes:
      "One main story. The 3,649 SF total includes the finished basement. Level areas and garage size are confirmed on the Acadia Sumac page.",
  },
];

export function getCatalogPlan(slug: string): PlanSpec | undefined {
  return PLANS.find((plan) => plan.slug === slug);
}
