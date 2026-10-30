import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { claimHeadlineIndex, type HeadlineCursor, type HeadlineStore } from "./headlines.ts";

const FILE = path.join(process.cwd(), "data", "headline-cursor.json");
const BLOB_PATH = "headline-cursor.json";

export async function nextHeadlineIndex(): Promise<number> {
  return claimHeadlineIndex(storeFromEnv());
}

function storeFromEnv(): HeadlineStore {
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobStore(process.env.BLOB_READ_WRITE_TOKEN);
  return fileStore();
}

export function fileStore(file = FILE): HeadlineStore {
  return {
    async read() {
      try {
        const raw = await readFile(file, "utf8");
        return cursorFromText(raw, raw);
      } catch {
        return { value: 0, etag: null };
      }
    },
    async compareAndSwap(next, etag) {
      const current = await this.read();
      if (current.etag !== etag) return false;
      await writeFile(file, JSON.stringify({ next }), "utf8");
      return true;
    },
  };
}

export function blobStore(token: string): HeadlineStore {
  return {
    async read() {
      try {
        const result = await get(BLOB_PATH, { access: "public", token, useCache: false });
        if (!result || result.statusCode !== 200) return { value: 0, etag: null };
        const text = await new Response(result.stream).text();
        return cursorFromText(text, result.blob.etag);
      } catch (error) {
        if (error instanceof BlobNotFoundError) return { value: 0, etag: null };
        throw error;
      }
    },
    async compareAndSwap(next, etag) {
      try {
        await put(BLOB_PATH, JSON.stringify({ next }), {
          access: "public",
          token,
          addRandomSuffix: false,
          allowOverwrite: etag !== null,
          ifMatch: etag ?? undefined,
          contentType: "application/json",
          cacheControlMaxAge: 60,
        });
        return true;
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError || error instanceof BlobNotFoundError) return false;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("already exists") || message.includes("precondition")) return false;
        throw error;
      }
    },
  };
}

function cursorFromText(raw: string, etag: string): HeadlineCursor {
  const parsed = JSON.parse(raw) as { next?: unknown };
  const value = Number(parsed.next);
  if (!Number.isInteger(value) || value < 0) return { value: 0, etag };
  return { value, etag };
}
