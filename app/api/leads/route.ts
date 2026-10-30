import {
  prepareFollowUpBossEvent,
  selectFollowUpBossApiKey,
  sendFollowUpBossEvent,
  validateLead,
} from "@/lib/leads";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  const apiKey = selectFollowUpBossApiKey({
    FOLLOW_UP_BOSS_API_KEY: process.env.FOLLOW_UP_BOSS_API_KEY,
    FollowUpBoss: process.env.FollowUpBoss,
  });
  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        error: "We couldn't send this yet. Call or text 435-278-1619 and a Peaks agent will start it.",
      },
      { status: 503 },
    );
  }

  const prepared = await prepareFollowUpBossEvent(parsed.value, apiKey);
  if (!prepared.ok) {
    return Response.json(
      {
        ok: false,
        error: "We couldn't send this just now. Call or text 435-278-1619 and we'll take it from here.",
      },
      { status: 502 },
    );
  }

  const result = await sendFollowUpBossEvent(prepared.event, apiKey);
  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        error: "We couldn't send this just now. Call or text 435-278-1619 and we'll take it from here.",
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
