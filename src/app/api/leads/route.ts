import { NextRequest, NextResponse } from "next/server";

type LeadPayload = {
  intent?: string;
  agentSlug?: string;
  agentName?: string;
  ghlAssignee?: string;
  source?: string;
  pageUrl?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  message?: string;
  notes?: string;
  propertyAddress?: string;
};

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const fullName = String(body.full_name || "").trim();

  if (!email || !phone || !fullName) {
    return NextResponse.json(
      { error: "Name, email, and phone are required." },
      { status: 400 },
    );
  }

  const webhook = process.env.GHL_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL;
  const payload = {
    ...body,
    full_name: fullName,
    email,
    phone,
    receivedAt: new Date().toISOString(),
    assignedTo: body.ghlAssignee || body.agentName || "Corey Brady",
  };

  if (webhook) {
    try {
      const upstream = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!upstream.ok) {
        const text = await upstream.text();
        console.error("Lead webhook failed", upstream.status, text);
        return NextResponse.json(
          { error: "Upstream webhook failed" },
          { status: 502 },
        );
      }
    } catch (err) {
      console.error("Lead webhook error", err);
      return NextResponse.json(
        { error: "Unable to reach lead webhook" },
        { status: 502 },
      );
    }
  } else {
    // Soft-success in local/dev so the UI flow can be tested before GHL is wired.
    console.info("[leads:dev]", JSON.stringify(payload));
  }

  return NextResponse.json({ ok: true });
}
