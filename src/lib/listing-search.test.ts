import assert from "node:assert/strict";
import test from "node:test";
import { listingSearchLabel, listingSearchQuery } from "./listing-search.ts";

test("ambiguous Utah towns are sent to the geocoder with a state", () => {
  assert.equal(listingSearchLabel("providence", "Providence"), "Providence");
  assert.equal(listingSearchQuery("providence", "Providence"), "Providence, UT");

  assert.equal(listingSearchLabel("bear-lake", "Bear Lake"), "Garden City");
  assert.equal(listingSearchQuery("bear-lake", "Bear Lake"), "Garden City, UT");
});

test("towns the geocoder already resolves are unchanged", () => {
  assert.equal(listingSearchQuery("logan", "Logan"), "Logan");
  assert.equal(listingSearchQuery("north-logan", "North Logan"), "North Logan");
  assert.equal(listingSearchQuery("nibley", "Nibley"), "Nibley");
  assert.equal(listingSearchQuery("preston", "Preston"), "Preston");
});
