import assert from "node:assert/strict";
import test from "node:test";
import { homeSearchFilter, parseHomeQuery, searchActiveHomes } from "../lib/search.ts";

test("a city name searches that city only", () => {
  assert.deepEqual(parseHomeQuery("north logan"), { city: "North Logan", address: null });
  const filter = homeSearchFilter("Logan");
  assert.match(filter ?? "", /City eq 'Logan'/);
  assert.doesNotMatch(filter ?? "", /UnparsedAddress/);
  assert.match(filter ?? "", /CountyOrParish eq 'Cache'/);
  assert.match(filter ?? "", /StandardStatus eq Odata\.Models\.StandardStatus'Active'/);
  assert.match(filter ?? "", /PropertySubType eq 'Single Family Residence'/);
  assert.match(filter ?? "", /PropertySubType eq 'Townhouse'/);
});

test("an address keeps the city when both are typed", () => {
  assert.deepEqual(parseHomeQuery("Main St Smithfield"), {
    city: "Smithfield",
    address: "Main St",
  });
  const filter = homeSearchFilter("Main St Smithfield");
  assert.match(filter ?? "", /City eq 'Smithfield'/);
  assert.match(filter ?? "", /contains\(UnparsedAddress,'Main St'\)/);
});

test("a street fragment searches the address", () => {
  const filter = homeSearchFilter("center");
  assert.match(filter ?? "", /contains\(UnparsedAddress,'center'\)/);
  assert.doesNotMatch(filter ?? "", /City eq/);
});

test("rejects filter characters and tiny queries", () => {
  assert.equal(parseHomeQuery("a"), null);
  assert.equal(homeSearchFilter("'; drop"), null);
  const filter = homeSearchFilter("logan or 1 eq 1");
  assert.match(filter ?? "", /contains\(UnparsedAddress,'logan or 1 eq 1'\)/);
  assert.doesNotMatch(filter ?? "", / or 1 eq 1(?!')/);
});

test("maps a listing record and ignores a row without a price", async () => {
  const fetchImpl: typeof fetch = async () =>
    Response.json({
      "@odata.count": 2,
      value: [
        {
          ListingId: "100",
          UnparsedAddress: "10 E Center",
          City: "Logan",
          ListPrice: 450000,
          BedroomsTotal: 3,
          BathroomsTotalInteger: 2,
          PropertySubType: "Single Family Residence",
        },
        { ListingId: "101", UnparsedAddress: "Hidden", City: "Logan", ListPrice: 0 },
      ],
    });
  const result = await searchActiveHomes("token", "Logan", fetchImpl, "https://mls.example/odata");
  assert.equal(result.total, 2);
  assert.equal(result.homes.length, 1);
  assert.equal(result.homes[0]?.price, 450000);
  assert.equal(result.homes[0]?.url, "https://www.utahrealestate.com/100");
});
