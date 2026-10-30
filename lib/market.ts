export type SegmentKey = "singleFamily" | "townhome";

export type PriceSegment = {
  count: number;
  medianListPrice: number;
  averageListPrice: number;
};

export type CitySegments = {
  singleFamily: PriceSegment | null;
  townhome: PriceSegment | null;
};

export type MarketSnapshot = {
  status: "awaiting_mls" | "live";
  updatedAt: string | null;
  county: "Cache";
  source: "UtahRealEstate";
  singleFamily: PriceSegment | null;
  townhome: PriceSegment | null;
  cities: Record<string, CitySegments>;
  subtypes: string[];
};

export type ListingRow = {
  listPrice: number;
  propertySubType: string;
  city: string;
};

const MLS_BASE = "https://resoapi.utahrealestate.com/reso/odata";
const PAGE_CAP = 40;

export function classifySubtype(value: string | null | undefined): SegmentKey | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("town") || normalized.includes("twin")) return "townhome";
  if (normalized.includes("singlefamily")) return "singleFamily";
  return null;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function segmentFromPrices(prices: number[]): PriceSegment | null {
  const usable = prices.filter((price) => Number.isFinite(price) && price > 0);
  if (usable.length === 0) return null;
  return {
    count: usable.length,
    medianListPrice: Math.round(median(usable)),
    averageListPrice: Math.round(average(usable)),
  };
}

export function summarizeListings(rows: ListingRow[]): MarketSnapshot {
  const buckets: Record<SegmentKey, number[]> = { singleFamily: [], townhome: [] };
  const byCity = new Map<string, Record<SegmentKey, number[]>>();
  const subtypes = new Set<string>();

  for (const row of rows) {
    if (row.propertySubType) subtypes.add(row.propertySubType);
    const kind = classifySubtype(row.propertySubType);
    if (!kind || !(row.listPrice > 0)) continue;
    buckets[kind].push(row.listPrice);
    const city = row.city.trim();
    if (!city) continue;
    const cityBuckets = byCity.get(city) ?? { singleFamily: [], townhome: [] };
    cityBuckets[kind].push(row.listPrice);
    byCity.set(city, cityBuckets);
  }

  const cities: Record<string, CitySegments> = {};
  for (const [city, prices] of byCity) {
    cities[city] = {
      singleFamily: segmentFromPrices(prices.singleFamily),
      townhome: segmentFromPrices(prices.townhome),
    };
  }

  return {
    status: "live",
    updatedAt: new Date().toISOString(),
    county: "Cache",
    source: "UtahRealEstate",
    singleFamily: segmentFromPrices(buckets.singleFamily),
    townhome: segmentFromPrices(buckets.townhome),
    cities,
    subtypes: [...subtypes].sort(),
  };
}

type ODataPage = {
  value?: Array<Record<string, unknown>>;
  "@odata.nextLink"?: string;
};

export function activeResidentialFilter(style: "has" | "eq"): string {
  const status =
    style === "has"
      ? "StandardStatus has Odata.Models.StandardStatus'Active'"
      : "StandardStatus eq Odata.Models.StandardStatus'Active'";
  const propertyType = "PropertyType eq Odata.Models.PropertyType'Residential'";
  return `CountyOrParish eq 'Cache' and ${status} and ${propertyType}`;
}

export function toListingRow(record: Record<string, unknown>): ListingRow | null {
  const price = Number(record.ListPrice);
  const subtype = String(record.PropertySubType ?? "");
  const city = String(record.City ?? "");
  if (!Number.isFinite(price)) return null;
  return { listPrice: price, propertySubType: subtype, city };
}

export async function pullActiveCacheListings(
  token: string,
  fetchImpl: typeof fetch = fetch,
  baseUrl = process.env.UTAH_MLS_BASE_URL || MLS_BASE,
): Promise<ListingRow[]> {
  const first = await pullPages(token, fetchImpl, baseUrl, "has");
  if (first.ok) return first.rows;
  if (first.status !== 400) {
    throw new Error(`UtahRealEstate request failed (${first.status}): ${first.detail}`);
  }
  const second = await pullPages(token, fetchImpl, baseUrl, "eq");
  if (!second.ok) {
    throw new Error(`UtahRealEstate request failed (${second.status}): ${second.detail}`);
  }
  return second.rows;
}

async function pullPages(
  token: string,
  fetchImpl: typeof fetch,
  baseUrl: string,
  style: "has" | "eq",
): Promise<{ ok: true; rows: ListingRow[] } | { ok: false; status: number; detail: string }> {
  const filter = encodeURIComponent(activeResidentialFilter(style));
  let url =
    `${baseUrl.replace(/\/$/, "")}/Property` +
    `?$select=ListPrice,PropertySubType,City,ListingKeyNumeric` +
    `&$orderby=ListingKeyNumeric&$top=200&$count=true&$filter=${filter}`;
  const rows: ListingRow[] = [];

  for (let page = 0; page < PAGE_CAP && url; page += 1) {
    const response = await fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 400);
      return { ok: false, status: response.status, detail };
    }
    const body = (await response.json()) as ODataPage;
    const value = body.value ?? [];
    for (const record of value) {
      const row = toListingRow(record);
      if (row) rows.push(row);
    }
    url = body["@odata.nextLink"] ?? "";
    if (value.length === 0) break;
  }

  return { ok: true, rows };
}
