/**
 * City label and geocoder query for a neighborhood page.
 *
 * The listings API geocodes the city string. Unqualified "Providence" and
 * "Garden City" resolve outside Utah and return no homes. The same names
 * with a state return Cache Valley inventory.
 */
export function listingSearchLabel(slug: string, name: string): string {
  if (slug === "bear-lake") return "Garden City";
  if (slug === "north-logan") return "North Logan";
  return name;
}

export function listingSearchQuery(slug: string, name: string): string {
  if (slug === "bear-lake") return "Garden City, UT";
  if (slug === "providence") return "Providence, UT";
  return listingSearchLabel(slug, name);
}
