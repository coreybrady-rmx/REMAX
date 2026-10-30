export const LEAD_SOURCE = "Logan Main QR";

export type LeadTool = "cma" | "affordability" | "payment";

export type LeadInput = {
  tool: LeadTool;
  name: string;
  phone: string;
  email: string;
  textConsent: boolean;
  details: string;
};

export type FollowUpBossEvent = {
  source: string;
  system: string;
  type: "General Inquiry";
  message: string;
  person: {
    firstName: string;
    lastName?: string;
    emails: Array<{ value: string; type: "home" }>;
    phones: Array<{ value: string; type: "mobile" }>;
    tags: string[];
  };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(body: unknown): { ok: true; value: LeadInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Missing details." };
  const record = body as Record<string, unknown>;
  if (typeof record.company === "string" && record.company.trim()) {
    return { ok: false, error: "Could not send." };
  }
  const tool = record.tool;
  if (tool !== "cma" && tool !== "affordability" && tool !== "payment") {
    return { ok: false, error: "Choose a request type." };
  }
  const name = stringField(record.name);
  const phone = stringField(record.phone);
  const email = stringField(record.email);
  const details = stringField(record.details);
  if (name.length < 2) return { ok: false, error: "Add your name." };
  if (phone.replace(/\D/g, "").length < 10) return { ok: false, error: "Add a mobile number." };
  if (!EMAIL.test(email)) return { ok: false, error: "Add an email address." };
  if (!details) return { ok: false, error: "Add what you want us to look at." };
  return {
    ok: true,
    value: {
      tool,
      name,
      phone,
      email,
      textConsent: record.textConsent === true,
      details,
    },
  };
}

export function buildFollowUpBossEvent(input: LeadInput): FollowUpBossEvent {
  const parts = input.name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  const tags = [LEAD_SOURCE, input.tool];
  if (input.textConsent) tags.push("SMS consent");
  const consentLine = input.textConsent
    ? "Text consent: yes. The person asked to be texted about this request."
    : "Text consent: no.";
  return {
    source: LEAD_SOURCE,
    system: "REMAX Peaks QR",
    type: "General Inquiry",
    message: `${input.details}\n\n${consentLine}`,
    person: {
      firstName,
      ...(lastName ? { lastName } : {}),
      emails: [{ value: input.email, type: "home" }],
      phones: [{ value: input.phone, type: "mobile" }],
      tags,
    },
  };
}

export async function sendFollowUpBossEvent(
  event: FollowUpBossEvent,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; id?: unknown } | { ok: false; status: number; detail: string }> {
  const response = await fetchImpl("https://api.followupboss.com/v1/events", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    return { ok: false, status: response.status, detail: (await response.text()).slice(0, 300) };
  }
  const payload = (await response.json().catch(() => ({}))) as { id?: unknown };
  return { ok: true, id: payload.id };
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
