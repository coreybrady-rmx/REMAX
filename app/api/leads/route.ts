import { buildFollowUpBossEvent, sendFollowUpBossEvent, validateLead } from "@/lib/leads";

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

  const apiKey = process.env.FOLLOW_UP_BOSS_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        error: "We couldn't send this yet. Call or text 435-278-1619 and a Peaks agent will start it.",
      },
      { status: 503 },
    );
  }

  const event = buildFollowUpBossEvent(parsed.value);
  const result = await sendFollowUpBossEvent(event, apiKey);
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
