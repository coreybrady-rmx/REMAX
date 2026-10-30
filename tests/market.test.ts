import assert from "node:assert/strict";
import test from "node:test";
import {
  activeResidentialFilter,
  classifySubtype,
  median,
  pullActiveCacheListings,
  summarizeListings,
  toListingRow,
} from "../lib/market.ts";

test("classifies single-family and townhome subtype labels", () => {
  assert.equal(classifySubtype("Single Family Residence"), "singleFamily");
  assert.equal(classifySubtype("SingleFamilyResidence"), "singleFamily");
  assert.equal(classifySubtype("Townhouse"), "townhome");
  assert.equal(classifySubtype("Twin Home"), null);
  assert.equal(classifySubtype("Condominium"), null);
  assert.equal(classifySubtype(""), null);
});

test("median uses the middle of an odd list and the average of an even list", () => {
  assert.equal(median([10, 30, 20]), 20);
  assert.equal(median([10, 40]), 25);
});

test("summarizes county and city asking prices without sold data", () => {
  const snapshot = summarizeListings([
    { listPrice: 400_000, propertySubType: "Single Family Residence", city: "Logan" },
    { listPrice: 500_000, propertySubType: "Single Family Residence", city: "Logan" },
    { listPrice: 600_000, propertySubType: "Single Family Residence", city: "Hyrum" },
    { listPrice: 300_000, propertySubType: "Townhouse", city: "Logan" },
    { listPrice: 360_000, propertySubType: "Townhouse", city: "North Logan" },
    { listPrice: 250_000, propertySubType: "Condominium", city: "Logan" },
    { listPrice: 0, propertySubType: "Townhouse", city: "Logan" },
  ]);

  assert.equal(snapshot.status, "live");
  assert.equal(snapshot.county, "Cache");
  assert.equal(snapshot.singleFamily?.count, 3);
  assert.equal(snapshot.singleFamily?.medianListPrice, 500_000);
  assert.equal(snapshot.singleFamily?.averageListPrice, 500_000);
  assert.equal(snapshot.townhome?.count, 2);
  assert.equal(snapshot.townhome?.medianListPrice, 330_000);
  assert.equal(snapshot.cities.Logan.singleFamily?.count, 2);
  assert.equal(snapshot.cities.Logan.townhome?.count, 1);
  assert.equal(snapshot.cities.Logan.singleFamily?.medianListPrice, 450_000);
  assert.equal(snapshot.subtypes.includes("Condominium"), true);
});

test("builds the documented active residential filter", () => {
  const filter = activeResidentialFilter("has");
  assert.match(filter, /CountyOrParish eq 'Cache'/);
  assert.match(filter, /StandardStatus has Odata\.Models\.StandardStatus'Active'/);
  assert.match(filter, /PropertyType eq Odata\.Models\.PropertyType'Residential'/);
});

test("falls back when the has-filter is rejected and follows the next page", async () => {
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async (url) => {
    const href = String(url);
    calls.push(href);
    if (href.includes("StandardStatus%20has%20")) {
      return new Response("bad filter", { status: 400 });
    }
    if (href.startsWith("https://example.test/next")) {
      return Response.json({
        value: [{ ListPrice: 20, PropertySubType: "Single Family Residence", City: "Hyrum" }],
      });
    }
    return Response.json({
      value: [{ ListPrice: 10, PropertySubType: "Townhouse", City: "Logan" }],
      "@odata.nextLink": "https://example.test/next",
    });
  };

  const rows = await pullActiveCacheListings("token", fetchImpl, "https://mls.example/odata");
  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.city, "Logan");
  assert.equal(rows[1]?.city, "Hyrum");
  assert.equal(calls.length, 3);
  assert.match(calls[0] ?? "", /StandardStatus%20has%20/);
  assert.match(calls[1] ?? "", /StandardStatus%20eq%20/);
});

test("reads list price, subtype, and city from an OData record", () => {
  assert.deepEqual(
    toListingRow({ ListPrice: 410000.5, PropertySubType: "Townhouse", City: "Nibley" }),
    { listPrice: 410000.5, propertySubType: "Townhouse", city: "Nibley" },
  );
  assert.equal(toListingRow({ ListPrice: "nope" }), null);
});
