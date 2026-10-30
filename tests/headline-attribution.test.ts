import assert from "node:assert/strict";
import test from "node:test";
import { HEADLINES } from "../lib/headlines.ts";
import { buildFollowUpBossEvent, LEAD_SOURCE, validateLead } from "../lib/leads.ts";
import { headlineForSubmission } from "../lib/headline-attribution.ts";
import {
  emptyTally,
  handleHeadlineResults,
  incrementTally,
  recordHeadlineSubmission,
  type HeadlineTally,
  type HeadlineTallyStore,
} from "../lib/headline-tally.ts";
import { submitLead } from "../lib/submit-lead.ts";

const valid = {
  tool: "cma",
  name: "Ada Lovelace",
  phone: "(435) 555-0100",
  email: "ada@example.com",
  textConsent: false,
  details: "Free CMA request for 10 Main St, Logan.",
  headline: "Your next move starts here.",
};

test("cookie headline is attached to the lead payload", async () => {
  const store = memoryTallyStore();
  const posted: unknown[] = [];
  const response = await submitLead(leadRequest("cv_headline=2", valid), {
    apiKey: "test-key",
    store,
    fetchImpl: mockFollowUpBoss(posted),
  });
  assert.equal(response.status, 200);
  const event = posted.at(-1) as {
    source: string;
    message: string;
    person: { tags: string[]; assignedTo?: string; assignedUserId?: number };
  };
  assert.equal(event.source, LEAD_SOURCE);
  assert.match(event.message, /Headline: Know your numbers, know your options\./);
  assert.equal(event.person.tags.includes("Know your numbers, know your options."), true);
  assert.equal(event.person.tags.includes("Your next move starts here."), false);
  assert.equal(event.person.assignedTo, "Eli Hopkins");
  assert.equal(event.person.assignedUserId, 4242);
  assert.equal(headlineForSubmission("cv_headline=2", valid.headline), "Know your numbers, know your options.");
  const saved = await store.read();
  assert.equal(saved.tally.byHeadline["Know your numbers, know your options."]?.cma, 1);
});

test("invalid cookie becomes unknown", async () => {
  const store = memoryTallyStore();
  const posted: unknown[] = [];
  const fetchImpl = mockFollowUpBoss(posted);
  const invalid = await submitLead(leadRequest("cv_headline=nope", valid), {
    apiKey: "test-key",
    store,
    fetchImpl,
  });
  const missing = await submitLead(leadRequest(null, valid), {
    apiKey: "test-key",
    store,
    fetchImpl,
  });
  assert.equal(invalid.status, 200);
  assert.equal(missing.status, 200);
  assert.equal(headlineForSubmission("cv_headline=99", HEADLINES[0]), "unknown");
  assert.equal(headlineForSubmission(null, HEADLINES[1]), "unknown");
  for (const event of posted) {
    const body = event as { message: string; person: { tags: string[] } };
    assert.match(body.message, /Headline: unknown/);
    assert.equal(body.person.tags.includes("unknown"), true);
    assert.equal(body.person.tags.includes(HEADLINES[0]), false);
  }
  const saved = await store.read();
  assert.equal(saved.tally.byHeadline.unknown?.cma, 2);
  assert.equal(saved.tally.byHeadline[HEADLINES[0]], undefined);

  const parsed = validateLead(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const event = buildFollowUpBossEvent({ ...parsed.value, headline: "Not a real headline" });
  assert.match(event.message, /Headline: unknown/);
  assert.equal(event.source, "Logan Main QR");
});

test("tally increments the right headline", async () => {
  const store = memoryTallyStore();
  const before = emptyTally();
  const next = incrementTally(before, HEADLINES[1], "cma");
  assert.deepEqual(before.byHeadline, {});
  assert.equal(next.byHeadline[HEADLINES[1]]?.cma, 1);

  await recordHeadlineSubmission(store, HEADLINES[1], "cma");
  await recordHeadlineSubmission(store, HEADLINES[1], "cma");
  await recordHeadlineSubmission(store, HEADLINES[1], "affordability");
  await recordHeadlineSubmission(store, "unknown", "cma");

  const saved = await store.read();
  assert.equal(saved.tally.byHeadline[HEADLINES[1]]?.cma, 2);
  assert.equal(saved.tally.byHeadline[HEADLINES[1]]?.affordability, 1);
  assert.equal(saved.tally.byHeadline.unknown?.cma, 1);
  assert.equal(saved.tally.byHeadline[HEADLINES[0]], undefined);

  const posted: unknown[] = [];
  const buyer = await submitLead(
    leadRequest("cv_headline=4", {
      ...valid,
      tool: "affordability",
      details: "Budget around 400k.",
    }),
    { apiKey: "test-key", store, fetchImpl: mockFollowUpBoss(posted) },
  );
  assert.equal(buyer.status, 200);
  const afterBuyer = await store.read();
  assert.equal(afterBuyer.tally.byHeadline[HEADLINES[4]]?.affordability, 1);
  const buyerEvent = posted.at(-1) as { person: { assignedTo?: string }; message: string };
  assert.match(buyerEvent.message, /Headline: Your home, your future, your move\./);
  assert.equal(buyerEvent.person.assignedTo, undefined);
});

test("a failed lead does not increment the tally", async () => {
  const store = memoryTallyStore();
  const response = await submitLead(leadRequest("cv_headline=1", valid), {
    apiKey: "test-key",
    store,
    fetchImpl: async () => new Response("no", { status: 500 }),
  });
  assert.equal(response.status, 502);
  const saved = await store.read();
  assert.deepEqual(saved.tally.byHeadline, {});
});

test("results route rejects a missing or wrong key and returns counts for the right key", async () => {
  const store = memoryTallyStore();
  await recordHeadlineSubmission(store, HEADLINES[2], "cma");
  await recordHeadlineSubmission(store, HEADLINES[2], "affordability");
  const secret = "results-test-key";
  const options = { secret, store };

  const missing = await handleHeadlineResults(new Request("https://www.remaxpeaks.com/your-next-move/results"), options);
  assert.equal(missing.status, 404);

  const wrong = await handleHeadlineResults(
    new Request("https://www.remaxpeaks.com/your-next-move/results?key=nope"),
    options,
  );
  assert.equal(wrong.status, 404);

  const unset = await handleHeadlineResults(
    new Request("https://www.remaxpeaks.com/your-next-move/results?key=results-test-key"),
    { secret: undefined, store },
  );
  assert.equal(unset.status, 404);
  const blank = await handleHeadlineResults(
    new Request("https://www.remaxpeaks.com/your-next-move/results?key=results-test-key"),
    { secret: "  ", store },
  );
  assert.equal(blank.status, 404);

  const ok = await handleHeadlineResults(
    new Request("https://www.remaxpeaks.com/your-next-move/results?key=results-test-key"),
    options,
  );
  assert.equal(ok.status, 200);
  const html = await ok.text();
  assert.match(html, /data-headline="Know your numbers, know your options\." data-count="2"/);
  assert.match(html, /data-form="cma" data-form-count="1"/);
  assert.match(html, /data-form="affordability" data-form-count="1"/);
  assert.match(html, /Buyer: 1/);
  assert.match(html, /data-headline="unknown" data-count="0"/);
  assert.equal(html.includes("results-test-key"), false);
  assert.equal(html.includes("ada@"), false);
  assert.equal(html.includes("555-0100"), false);

  const headerOk = await handleHeadlineResults(
    new Request("https://www.remaxpeaks.com/your-next-move/results", {
      headers: { "x-results-key": secret },
    }),
    options,
  );
  assert.equal(headerOk.status, 200);
  const headerHtml = await headerOk.text();
  assert.match(headerHtml, /data-count="2"/);
});

function leadRequest(cookie: string | null, body: Record<string, unknown>): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (cookie) headers.set("cookie", `other=1; ${cookie}`);
  return new Request("https://www.remaxpeaks.com/your-next-move/api/leads", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function mockFollowUpBoss(posted: unknown[]): typeof fetch {
  return async (input, init) => {
    const url = String(input);
    if (url.includes("/v1/users")) {
      return Response.json({ users: [{ id: 4242, name: "Eli Hopkins" }] });
    }
    if (url.includes("/v1/events")) {
      posted.push(JSON.parse(String(init?.body ?? "{}")));
      return Response.json({ id: 9 });
    }
    throw new Error(`Unexpected request ${url}`);
  };
}

function memoryTallyStore(): HeadlineTallyStore {
  let tally: HeadlineTally = emptyTally();
  let etag: string | null = null;
  return {
    async read() {
      return { tally, etag };
    },
    async compareAndSwap(next, expected) {
      if (etag !== expected) return false;
      tally = next;
      etag = JSON.stringify(next);
      return true;
    },
  };
}
