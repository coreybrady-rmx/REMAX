import assert from "node:assert/strict";
import test from "node:test";
import {
  buildUpstreamListingSearch,
  featuredHomes,
  featuredHomesQuery,
  homesOnly,
  requestedResidential,
} from "./search-listings.ts";

test("homes query uses the propertyType filter the MLS API honors", () => {
  const params = new URLSearchParams(featuredHomesQuery("Logan"));
  assert.equal(params.get("city"), "Logan");
  assert.equal(params.get("propertyType"), "residential");
  assert.equal(params.get("category"), null);

  const upstream = buildUpstreamListingSearch(params);
  assert.equal(upstream.searchParams.get("propertyType"), "residential");
  assert.equal(upstream.searchParams.get("category"), null);
  assert.equal(upstream.searchParams.get("city"), "Logan");
  assert.equal(requestedResidential(params), true);
});

test("legacy category=residential is translated instead of forwarded", () => {
  const incoming = new URLSearchParams(
    "city=Garden+City%2C+UT&category=residential",
  );
  const upstream = buildUpstreamListingSearch(incoming);

  assert.equal(upstream.searchParams.get("propertyType"), "residential");
  assert.equal(upstream.searchParams.get("category"), null);
  assert.equal(upstream.searchParams.get("city"), "Garden City, UT");
  assert.equal(upstream.searchParams.get("limit"), "6");
  assert.equal(requestedResidential(incoming), true);
});

test("an explicit property type is preserved and limits are not overwritten", () => {
  const incoming = new URLSearchParams(
    "city=Preston&propertyType=land&category=residential&limit=12",
  );
  const upstream = buildUpstreamListingSearch(incoming);

  assert.equal(upstream.searchParams.get("propertyType"), "land");
  assert.equal(upstream.searchParams.get("limit"), "12");
  assert.equal(upstream.searchParams.get("category"), null);
  assert.equal(requestedResidential(incoming), false);
});

test("featured homes drop land and commercial before the six-card slice", () => {
  const items = [
    { category: "residential", mlsNumber: "1" },
    { category: "residential", mlsNumber: "2" },
    { category: "land", mlsNumber: "3" },
    { category: "commercial", mlsNumber: "4" },
    { category: "land", mlsNumber: "5" },
    { category: "land", mlsNumber: "6" },
    { category: "residential", mlsNumber: "7" },
  ];

  assert.deepEqual(
    featuredHomes(items).map((item) => item.mlsNumber),
    ["1", "2", "7"],
  );
  assert.deepEqual(homesOnly(items).length, 3);
});

test("listings without a category are left intact", () => {
  const items = [{ mlsNumber: "1" }, { mlsNumber: "2" }];
  assert.deepEqual(homesOnly(items), items);
});
