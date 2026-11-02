import assert from "node:assert/strict";
import test from "node:test";
import { selectCityListings } from "./listing-match.ts";

test("North Logan does not keep the Logan and Smithfield rows that lead the radius", () => {
  const pages = [
    [
      { mlsNumber: "1", city: "Logan", address: "450 N 200 E" },
      { mlsNumber: "2", city: "Smithfield", address: "642 Wasatch Blvd" },
      { mlsNumber: "3", city: "Logan", address: "247 E 300 N" },
      { mlsNumber: "4", city: "Logan", address: "1374 Maple Dr" },
      { mlsNumber: "5", city: "Logan", address: "1300 W 1000 N" },
      { mlsNumber: "6", city: "Smithfield", address: "645 N 550 W" },
    ],
    [
      { mlsNumber: "7", city: "North Logan", address: "613 E 1800 N" },
      { mlsNumber: "8", city: "Logan", address: "100 W Center" },
      { mlsNumber: "9", city: "North Logan", address: "1821 N 300 W" },
    ],
  ];

  assert.deepEqual(
    selectCityListings(pages, "North Logan").map((item) => item.mlsNumber),
    ["7", "9"],
  );
});

test("an in-city first page is unchanged and later pages are not required", () => {
  const page = [
    { mlsNumber: "1", city: "Logan" },
    { mlsNumber: "2", city: "Logan" },
    { mlsNumber: "3", city: "Logan" },
    { mlsNumber: "4", city: "Logan" },
    { mlsNumber: "5", city: "Logan" },
    { mlsNumber: "6", city: "Logan" },
    { mlsNumber: "7", city: "Logan" },
  ];

  assert.deepEqual(
    selectCityListings([page], "Logan").map((item) => item.mlsNumber),
    ["1", "2", "3", "4", "5", "6"],
  );
});

test("state-qualified queries match the listing city, and duplicates are dropped", () => {
  const pages = [
    [{ mlsNumber: "1", city: "Garden City" }],
    [
      { mlsNumber: "1", city: "Garden City" },
      { mlsNumber: "2", city: "Fish Haven" },
      { mlsNumber: "3", city: "Garden City" },
    ],
  ];

  assert.deepEqual(
    selectCityListings(pages, "Garden City, UT").map((item) => item.mlsNumber),
    ["1", "3"],
  );
});
