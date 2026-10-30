import { pullActiveCacheListings, summarizeListings } from "@/lib/market";
import { readSnapshot, saveSnapshot } from "@/lib/snapshot";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.UTAH_MLS_TOKEN;
  if (!token) {
    const current = await readSnapshot();
    return Response.json({
      ok: false,
      reason: "UTAH_MLS_TOKEN is not set. The page is still using the last saved snapshot.",
      status: current.status,
      updatedAt: current.updatedAt,
    });
  }

  try {
    const rows = await pullActiveCacheListings(token);
    const snapshot = summarizeListings(rows);
    if (!snapshot.singleFamily && !snapshot.townhome) {
      return Response.json(
        {
          ok: false,
          reason: "The MLS pull returned no Cache County single-family or townhome asking prices. The previous snapshot was kept.",
          examined: rows.length,
          subtypes: snapshot.subtypes,
        },
        { status: 502 },
      );
    }
    const saved = await saveSnapshot(snapshot);
    return Response.json({
      ok: true,
      updatedAt: snapshot.updatedAt,
      examined: rows.length,
      singleFamily: snapshot.singleFamily,
      townhome: snapshot.townhome,
      subtypes: snapshot.subtypes,
      saved,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MLS pull failed";
    return Response.json({ ok: false, reason: message }, { status: 502 });
  }
}

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
