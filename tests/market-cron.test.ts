import assert from "node:assert/strict";
import test from "node:test";
import { handleMarketCron, type MarketCronDeps } from "../lib/market-cron.ts";
import type { ListingRow, MarketSnapshot } from "../lib/market.ts";

const rows: ListingRow[] = [
  { listPrice: 400_000, propertySubType: "Single Family Residence", city: "Logan" },
  { listPrice: 600_000, propertySubType: "Single Family Residence", city: "Hyrum" },
  { listPrice: 300_000, propertySubType: "Townhouse", city: "Logan" },
  { listPrice: 360_000, propertySubType: "Townhouse", city: "Smithfield" },
  { listPrice: 250_000, propertySubType: "Condominium", city: "Logan" },
];

const emptySnapshot: MarketSnapshot = {
  status: "awaiting_mls",
  updatedAt: null,
  county: "Cache",
  source: "UtahRealEstate",
  singleFamily: null,
  townhome: null,
  cities: {},
  subtypes: [],
};

function deps(): MarketCronDeps & { calls: { pull: number } } {
  const calls = { pull: 0 };
  return {
    calls,
    env: {
      UTAH_MLS_TOKEN: "mls-token",
      CRON_SECRET: "cron-secret",
      NODE_ENV: "production",
      BLOB_READ_WRITE_TOKEN: "blob-token",
    },
    pull: async (token) => {
      calls.pull += 1;
      assert.equal(token, "mls-token");
      return rows;
    },
    read: async () => emptySnapshot,
    save: async (snapshot) => {
      assert.equal(snapshot.singleFamily?.count, 2);
      assert.equal(snapshot.townhome?.count, 2);
      return { file: false, blob: true };
    },
  };
}

function cronRequest(secret: string) {
  return new Request("https://example.test/api/cron/market", {
    headers: { authorization: `Bearer ${secret}` },
  });
}

test("rejects a bad cron secret without calling the MLS", async () => {
  const d = deps();
  const response = await handleMarketCron(cronRequest("wrong-secret"), d);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(d.calls.pull, 0);
});

test("refreshes single-family and townhome stats from the mocked MLS rows", async () => {
  const d = deps();
  const response = await handleMarketCron(cronRequest("cron-secret"), d);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.examined, 5);
  assert.equal(body.singleFamily.count, 2);
  assert.equal(body.singleFamily.medianListPrice, 500_000);
  assert.equal(body.singleFamily.averageListPrice, 500_000);
  assert.equal(body.townhome.count, 2);
  assert.equal(body.townhome.medianListPrice, 330_000);
  assert.equal(body.townhome.averageListPrice, 330_000);
  assert.equal(body.saved.blob, true);
  assert.equal(d.calls.pull, 1);
  assert.equal(typeof body.updatedAt, "string");
});

test("does not report success when the live snapshot was not saved", async () => {
  const d = deps();
  d.save = async () => ({ file: false, blob: false });
  const response = await handleMarketCron(cronRequest("cron-secret"), d);
  assert.equal(response.status, 502);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(d.calls.pull, 1);
});
