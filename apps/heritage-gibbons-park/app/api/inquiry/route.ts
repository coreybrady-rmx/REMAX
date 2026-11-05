import { NextResponse } from "next/server";

type InquiryBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  consent?: unknown;
};

function asText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  const endpoint = process.env.INQUIRY_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { ok: false, error: "Submission is not configured." },
      { status: 503 },
    );
  }

  let body: InquiryBody;
  try {
    body = (await request.json()) as InquiryBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "The inquiry could not be read." },
      { status: 400 },
    );
  }

  const name = asText(body.name, 200);
  const email = asText(body.email, 200);
  const phone = asText(body.phone, 40);
  const message = asText(body.message, 5000);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailOk || !message || body.consent !== true) {
    return NextResponse.json(
      { ok: false, error: "Name, email, message, and consent are required." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        message,
        consent: true,
        source: "heritage-gibbons-park",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "The inquiry endpoint did not accept the submission." },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "The inquiry endpoint could not be reached." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
