import { pullActiveCacheListings, summarizeListings, type ListingRow, type MarketSnapshot } from "./market.ts";
import { readSnapshot, saveSnapshot } from "./snapshot.ts";

export type SnapshotSaveResult = { file: boolean; blob: boolean };

export type MarketCronEnv = {
  UTAH_MLS_TOKEN?: string;
  CRON_SECRET?: string;
  NODE_ENV?: string;
  BLOB_READ_WRITE_TOKEN?: string;
};

export type MarketCronDeps = {
  env: MarketCronEnv;
  pull: (token: string) => Promise<ListingRow[]>;
  read: () => Promise<MarketSnapshot>;
  save: (snapshot: MarketSnapshot) => Promise<SnapshotSaveResult>;
};

export function marketCronAuthorized(
  authorization: string | null,
  secret: string | undefined,
  nodeEnv: string | undefined,
): boolean {
  if (!secret) return nodeEnv !== "production";
  return authorization === `Bearer ${secret}`;
}

export async function handleMarketCron(request: Request, deps: MarketCronDeps = defaultDeps()): Promise<Response> {
  if (!marketCronAuthorized(request.headers.get("authorization"), deps.env.CRON_SECRET, deps.env.NODE_ENV)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = deps.env.UTAH_MLS_TOKEN;
  if (!token) {
    const current = await deps.read();
    return Response.json({
      ok: false,
      reason: "UTAH_MLS_TOKEN is not set. The page is still using the last saved snapshot.",
      status: current.status,
      updatedAt: current.updatedAt,
    });
  }

  try {
    const rows = await deps.pull(token);
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
    const saved = await deps.save(snapshot);
    // Production reads the blob. A file write on the serverless disk does not update the live page.
    const persisted = saved.blob || (!deps.env.BLOB_READ_WRITE_TOKEN && saved.file);
    if (!persisted) {
      return Response.json(
        {
          ok: false,
          reason: "The MLS pull succeeded, but the snapshot was not saved for the live page.",
          examined: rows.length,
          saved,
        },
        { status: 502 },
      );
    }
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

function defaultDeps(): MarketCronDeps {
  return {
    env: {
      UTAH_MLS_TOKEN: process.env.UTAH_MLS_TOKEN,
      CRON_SECRET: process.env.CRON_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    },
    pull: pullActiveCacheListings,
    read: readSnapshot,
    save: saveSnapshot,
  };
}
