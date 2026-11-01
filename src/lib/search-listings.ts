const UPSTREAM_ORIGIN = "https://www.remaxpeaks.com/api/search-listings";

function isResidential(value: string | null): boolean {
  return value?.trim().toLowerCase() === "residential";
}

/**
 * The MLS search API filters on `propertyType`. `category` is ignored, so a
 * homes request that only set `category=residential` came back mixed with
 * land and commercial listings.
 */
export function buildUpstreamListingSearch(incoming: URLSearchParams): URL {
  const upstream = new URL(UPSTREAM_ORIGIN);

  incoming.forEach((value, key) => {
    if (key === "category") return;
    upstream.searchParams.set(key, value);
  });

  if (
    !upstream.searchParams.has("propertyType") &&
    isResidential(incoming.get("category"))
  ) {
    upstream.searchParams.set("propertyType", "residential");
  }

  if (!upstream.searchParams.has("limit")) {
    upstream.searchParams.set("limit", "6");
  }

  return upstream;
}

export function requestedResidential(incoming: URLSearchParams): boolean {
  return isResidential(
    buildUpstreamListingSearch(incoming).searchParams.get("propertyType"),
  );
}

export function homesOnly<T extends { category?: string | null }>(
  items: T[],
): T[] {
  if (!items.some((item) => item?.category)) return items;
  return items.filter(
    (item) => item?.category?.toLowerCase() === "residential",
  );
}

export function featuredHomesQuery(city: string): string {
  return new URLSearchParams({
    city,
    propertyType: "residential",
    limit: "6",
  }).toString();
}

export function featuredHomes<T extends { category?: string | null }>(
  items: T[],
): T[] {
  return homesOnly(items).slice(0, 6);
}
