export type CityListing = {
  city?: string | null;
  mlsNumber?: string | null;
  address?: string | null;
  price?: number | null;
};

/** City label only, so "Garden City, UT" matches listings in Garden City. */
export function normalizeCity(value: string | null | undefined): string {
  return (value ?? "").split(",")[0].trim().replace(/\s+/g, " ").toLowerCase();
}

function listingKey(item: CityListing): string {
  const mls = item.mlsNumber?.trim();
  if (mls) return `mls:${mls}`;
  return `row:${item.address ?? ""}|${item.price ?? ""}|${normalizeCity(item.city)}`;
}

/**
 * Featured cards are the first rows of a radius search, which can be other
 * cities entirely. Keep only listings in the requested city, in API order.
 */
export function selectCityListings<T extends CityListing>(
  pages: readonly (readonly T[])[],
  city: string,
  limit = 6,
): T[] {
  const target = normalizeCity(city);
  if (!target || limit <= 0) return [];

  const seen = new Set<string>();
  const selected: T[] = [];
  for (const page of pages) {
    for (const item of page) {
      if (normalizeCity(item.city) !== target) continue;
      const key = listingKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      selected.push(item);
      if (selected.length >= limit) return selected;
    }
  }
  return selected;
}
