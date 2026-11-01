import { NextRequest, NextResponse } from "next/server";
import {
  buildUpstreamListingSearch,
  homesOnly,
  requestedResidential,
} from "@/lib/search-listings";

/**
 * Proxy the live RE/MAX Peaks MLS search API so agent microsites can
 * show featured inventory without CORS issues.
 */
export async function GET(req: NextRequest) {
  const incoming = req.nextUrl.searchParams;
  const upstream = buildUpstreamListingSearch(incoming);
  const residential = requestedResidential(incoming);

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });
    const data = await res.json();
    if (residential && Array.isArray(data?.items)) {
      data.items = homesOnly(data.items);
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("search-listings proxy failed", err);
    return NextResponse.json(
      { items: [], error: "Unable to load listings" },
      { status: 502 },
    );
  }
}
