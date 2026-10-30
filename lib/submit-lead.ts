import { headlineForSubmission } from "./headline-attribution.ts";
import { recordHeadlineSubmission, type HeadlineTallyStore } from "./headline-tally.ts";
import { prepareFollowUpBossEvent, sendFollowUpBossEvent, validateLead } from "./leads.ts";

const OFFICE_ERROR = "We couldn't send this just now. Call or text 435-278-1619 and we'll take it from here.";

export async function submitLead(
  request: Request,
  options: {
    apiKey: string | undefined;
    store: HeadlineTallyStore;
    fetchImpl?: typeof fetch;
  },
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Missing details." }, { status: 400 });
  }

  const parsed = validateLead(body);
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const submitted = body && typeof body === "object" ? (body as Record<string, unknown>).headline : undefined;
  const headline = headlineForSubmission(request.headers.get("cookie"), submitted);
  const attributed = { ...parsed.value, headline };

  if (!options.apiKey) {
    return Response.json(
      {
        ok: false,
        error: "We couldn't send this yet. Call or text 435-278-1619 and a Peaks agent will start it.",
      },
      { status: 503 },
    );
  }

  const prepared = await prepareFollowUpBossEvent(attributed, options.apiKey, options.fetchImpl);
  if (!prepared.ok) {
    return Response.json({ ok: false, error: OFFICE_ERROR }, { status: 502 });
  }

  const result = await sendFollowUpBossEvent(prepared.event, options.apiKey, options.fetchImpl);
  if (!result.ok) {
    return Response.json({ ok: false, error: OFFICE_ERROR }, { status: 502 });
  }

  try {
    await recordHeadlineSubmission(options.store, headline, attributed.tool);
  } catch {
    // The lead is already saved. A missed count should not turn the visitor away.
  }

  return Response.json({ ok: true });
}
