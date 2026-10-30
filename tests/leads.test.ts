import assert from "node:assert/strict";
import test from "node:test";
import { LEAD_SOURCE, buildFollowUpBossEvent, validateLead } from "../lib/leads.ts";

const valid = {
  tool: "cma",
  name: "Ada Lovelace",
  phone: "(435) 555-0100",
  email: "ada@example.com",
  textConsent: false,
  details: "CMA for 123 W Center St, Logan. Single-family.",
};

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
  assert.deepEqual(event.person.tags, [LEAD_SOURCE, "cma"]);
  assert.match(event.message, /Text consent: no/);
  assert.equal(event.person.phones[0]?.value, "(435) 555-0100");
});

test("adds an SMS consent tag only when the box is checked", () => {
  const parsed = validateLead({ ...valid, textConsent: true, tool: "affordability" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const event = buildFollowUpBossEvent(parsed.value);
  assert.deepEqual(event.person.tags, [LEAD_SOURCE, "affordability", "SMS consent"]);
  assert.match(event.message, /Text consent: yes/);
});
