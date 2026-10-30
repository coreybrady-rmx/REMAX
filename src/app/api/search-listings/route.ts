import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy the live RE/MAX Peaks MLS search API so agent microsites can
 * show featured inventory without CORS issues.
 */
export async function GET(req: NextRequest) {
  const incoming = req.nextUrl.searchParams;
  const upstream = new URL("https://www.remaxpeaks.com/api/search-listings");
  incoming.forEach((value, key) => upstream.searchParams.set(key, value));

  if (!upstream.searchParams.has("limit")) {
    upstream.searchParams.set("limit", "6");
  }

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("search-listings proxy failed", err);
    return NextResponse.json(
      { items: [], error: "Unable to load listings" },
      { status: 502 },
    );
  }
}
