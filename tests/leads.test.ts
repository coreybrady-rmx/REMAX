import assert from "node:assert/strict";
import test from "node:test";
import {
  CMA_ASSIGNEE_NAME,
  LEAD_SOURCE,
  buildFollowUpBossEvent,
  prepareFollowUpBossEvent,
  selectFollowUpBossApiKey,
  sendFollowUpBossEvent,
  validateLead,
} from "../lib/leads.ts";

const valid = {
  tool: "cma",
  name: "Ada Lovelace",
  phone: "(435) 555-0100",
  email: "ada@example.com",
  textConsent: false,
  details: "CMA for 123 W Center St, Logan. Single-family.",
};

test("prefers FOLLOW_UP_BOSS_API_KEY and falls back to the saved FollowUpBoss name", () => {
  assert.equal(
    selectFollowUpBossApiKey({
      FOLLOW_UP_BOSS_API_KEY: "preferred-key",
      FollowUpBoss: "saved-name-key",
    }),
    "preferred-key",
  );
  assert.equal(selectFollowUpBossApiKey({ FollowUpBoss: "saved-name-key" }), "saved-name-key");
  assert.equal(
    selectFollowUpBossApiKey({ FOLLOW_UP_BOSS_API_KEY: "  ", FollowUpBoss: " saved-name-key " }),
    "saved-name-key",
  );
  assert.equal(selectFollowUpBossApiKey({}), undefined);
});

test("rejects incomplete leads and honeypot fills", () => {
  assert.equal(validateLead({ ...valid, email: "not-an-email" }).ok, false);
  assert.equal(validateLead({ ...valid, phone: "555" }).ok, false);
  assert.equal(validateLead({ ...valid, company: "spam co" }).ok, false);
  assert.equal(validateLead({ ...valid, tool: "other" }).ok, false);
});

test("builds a Follow Up Boss event tagged Logan Main QR", () => {
  const parsed = validateLead(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const event = buildFollowUpBossEvent(parsed.value);
  assert.equal(event.source, LEAD_SOURCE);
  assert.equal(event.person.firstName, "Ada");
  assert.equal(event.person.lastName, "Lovelace");
  assert.deepEqual(event.person.tags, [LEAD_SOURCE, "cma", "unknown"]);
  assert.match(event.message, /Headline: unknown/);
  assert.match(event.message, /Text consent: no/);
  assert.equal(event.person.phones[0]?.value, "(435) 555-0100");
});

test("adds an SMS consent tag only when the box is checked", () => {
  const parsed = validateLead({ ...valid, textConsent: true, tool: "affordability" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const event = buildFollowUpBossEvent(parsed.value);
  assert.deepEqual(event.person.tags, [LEAD_SOURCE, "affordability", "unknown", "SMS consent"]);
  assert.match(event.message, /Text consent: yes/);
  assert.equal(event.person.assignedTo, undefined);
  assert.equal(event.person.assignedUserId, undefined);
});

test("CMA events assign Eli Hopkins using the id returned by the users API", async () => {
  const parsed = validateLead({
    ...valid,
    textConsent: false,
    details: "Free CMA request for 10 Main St, Logan.",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const returnedId = 4242;
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    calls.push(url.toString());
    assert.equal(url.origin + url.pathname, "https://api.followupboss.com/v1/users");
    assert.equal(url.searchParams.get("name"), CMA_ASSIGNEE_NAME);
    assert.equal(init?.method, "GET");
    const auth = new Headers(init?.headers).get("authorization");
    assert.equal(auth, `Basic ${Buffer.from("test-key:").toString("base64")}`);
    return Response.json({
      users: [
        { id: 7, name: "Someone Else" },
        { id: returnedId, name: "Eli Hopkins" },
      ],
    });
  };

  const prepared = await prepareFollowUpBossEvent(parsed.value, "test-key", fetchImpl);
  assert.equal(prepared.ok, true);
  if (!prepared.ok) return;
  assert.equal(calls.length, 1);
  assert.equal(prepared.event.source, LEAD_SOURCE);
  assert.equal(prepared.event.person.assignedTo, "Eli Hopkins");
  assert.equal(prepared.event.person.assignedUserId, returnedId);
  assert.match(prepared.event.message, /^Free CMA request for 10 Main St, Logan\./);
  assert.match(prepared.event.message, /Text consent: no/);
  assert.equal(prepared.event.person.tags.includes("SMS consent"), false);

  let posted = "";
  const sent = await sendFollowUpBossEvent(prepared.event, "test-key", async (_input, init) => {
    posted = String(init?.body ?? "");
    return Response.json({ id: 9 });
  });
  assert.equal(sent.ok, true);
  const body = JSON.parse(posted) as {
    source: string;
    person: { assignedTo?: string; assignedUserId?: number };
  };
  assert.equal(body.source, "Logan Main QR");
  assert.equal(body.person.assignedTo, "Eli Hopkins");
  assert.equal(body.person.assignedUserId, returnedId);
});

test("does not assign a CMA when Eli Hopkins is not the only exact name match", async () => {
  const parsed = validateLead(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const missing = await prepareFollowUpBossEvent(parsed.value, "test-key", async () =>
    Response.json({ users: [{ id: 5, name: "Elijah Hopkins" }] }),
  );
  assert.equal(missing.ok, false);
  const ambiguous = await prepareFollowUpBossEvent(parsed.value, "test-key", async () =>
    Response.json({
      users: [
        { id: 5, name: "Eli Hopkins" },
        { id: 6, name: "Eli Hopkins" },
      ],
    }),
  );
  assert.equal(ambiguous.ok, false);
});

test("buyer tools are not assigned through the users lookup", async () => {
  const parsed = validateLead({ ...valid, tool: "affordability", details: "Budget around 400k." });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  let called = false;
  const prepared = await prepareFollowUpBossEvent(parsed.value, "test-key", async () => {
    called = true;
    return Response.json({ users: [] });
  });
  assert.equal(called, false);
  assert.equal(prepared.ok, true);
  if (!prepared.ok) return;
  assert.equal(prepared.event.person.assignedTo, undefined);
  assert.equal(prepared.event.person.assignedUserId, undefined);
});
