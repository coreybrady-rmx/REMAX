import { CACHE_VALLEY_CITIES } from "./cities.ts";
import { activeResidentialFilter } from "./market.ts";

export type HomeHit = {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number | null;
  baths: number | null;
  subtype: string;
  url: string;
};

export type HomeSearchResult = {
  query: string;
  total: number | null;
  homes: HomeHit[];
};

const SAFE_QUERY = /^[a-z0-9#.,'/-]+(?: [a-z0-9#.,'/-]+)*$/i;
const RESULT_CAP = 12;

export function parseHomeQuery(raw: string): { city: string | null; address: string | null } | null {
  const query = raw.trim().replace(/\s+/g, " ");
  if (query.length < 2 || query.length > 80 || !SAFE_QUERY.test(query)) return null;

  const lower = query.toLowerCase();
  const byLength = [...CACHE_VALLEY_CITIES].sort((a, b) => b.length - a.length);
  for (const city of byLength) {
    const name = city.toLowerCase();
    if (lower === name) return { city, address: null };
    if (lower.endsWith(` ${name}`)) {
      const address = query.slice(0, query.length - city.length).trim();
      if (!address || !SAFE_QUERY.test(address)) return { city, address: null };
      return { city, address };
    }
  }

  if (query.length >= 4) {
    const starts = CACHE_VALLEY_CITIES.filter((city) => city.toLowerCase().startsWith(lower));
    if (starts.length === 1) return { city: starts[0], address: null };
  }

  return { city: null, address: query };
}

export function homeSearchFilter(raw: string): string | null {
  const parsed = parseHomeQuery(raw);
  if (!parsed || (!parsed.city && !parsed.address)) return null;
  const clauses = [
    activeResidentialFilter("eq"),
    "(PropertySubType eq 'Single Family Residence' or PropertySubType eq 'Townhouse')",
  ];
  if (parsed.city) clauses.push(`City eq '${escapeOData(parsed.city)}'`);
  if (parsed.address) clauses.push(`contains(UnparsedAddress,'${escapeOData(parsed.address)}')`);
  return clauses.join(" and ");
}

export async function searchActiveHomes(
  token: string,
  rawQuery: string,
  fetchImpl: typeof fetch = fetch,
  baseUrl = process.env.UTAH_MLS_BASE_URL || "https://resoapi.utahrealestate.com/reso/odata",
): Promise<HomeSearchResult> {
  const filter = homeSearchFilter(rawQuery);
  if (!filter) {
    throw new SearchInputError("Enter a city or part of an address.");
  }
  const select = "ListingId,UnparsedAddress,City,ListPrice,BedroomsTotal,BathroomsTotalInteger,PropertySubType";
  const url =
    `${baseUrl.replace(/\/$/, "")}/Property` +
    `?$select=${encodeURIComponent(select)}` +
    `&$filter=${encodeURIComponent(filter)}` +
    `&$orderby=ListPrice&$top=${RESULT_CAP}&$count=true`;
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`UtahRealEstate search failed (${response.status})`);
  }
  const body = (await response.json()) as {
    value?: Array<Record<string, unknown>>;
    "@odata.count"?: number;
  };
  const homes = (body.value ?? []).map(toHomeHit).filter((home): home is HomeHit => home !== null);
  const total = typeof body["@odata.count"] === "number" ? body["@odata.count"] : null;
  return { query: rawQuery.trim(), total, homes };
}

export class SearchInputError extends Error {}

function toHomeHit(record: Record<string, unknown>): HomeHit | null {
  const id = String(record.ListingId ?? "").trim();
  const address = String(record.UnparsedAddress ?? "").trim();
  const city = String(record.City ?? "").trim();
  const price = Number(record.ListPrice);
  if (!id || !address || !city || !Number.isFinite(price) || price <= 0) return null;
  const beds = finiteOrNull(record.BedroomsTotal);
  const baths = finiteOrNull(record.BathroomsTotalInteger);
  return {
    id,
    address,
    city,
    price: Math.round(price),
    beds,
    baths,
    subtype: String(record.PropertySubType ?? "").trim(),
    url: `https://www.utahrealestate.com/${encodeURIComponent(id)}`,
  };
}

function finiteOrNull(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function escapeOData(value: string): string {
  return value.replace(/'/g, "''");
}
