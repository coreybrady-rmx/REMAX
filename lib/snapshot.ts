import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MarketSnapshot } from "./market";

const FILE = path.join(process.cwd(), "data", "market-snapshot.json");
const BLOB_PATH = "market-snapshot.json";

export async function readSnapshot(): Promise<MarketSnapshot> {
  const fromBlob = await readBlobSnapshot();
  if (fromBlob) return fromBlob;
  return readFileSnapshot();
}

export async function readFileSnapshot(): Promise<MarketSnapshot> {
  const raw = await readFile(FILE, "utf8");
  return JSON.parse(raw) as MarketSnapshot;
}

export async function saveSnapshot(snapshot: MarketSnapshot): Promise<{ file: boolean; blob: boolean }> {
  let file = false;
  try {
    await writeFile(FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    file = true;
  } catch {
    file = false;
  }
  const blob = await writeBlobSnapshot(snapshot);
  return { file, blob };
}

async function readBlobSnapshot(): Promise<MarketSnapshot | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  try {
    const { head } = await import("@vercel/blob");
    const blob = await head(BLOB_PATH, { token });
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as MarketSnapshot;
  } catch {
    return null;
  }
}

async function writeBlobSnapshot(snapshot: MarketSnapshot): Promise<boolean> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return false;
  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, JSON.stringify(snapshot), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token,
    });
    return true;
  } catch {
    return false;
  }
}
