import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, BlobPreconditionFailedError, head, put } from "@vercel/blob";
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
        // The blob body sits on a CDN for at least a minute. The metadata from
        // head() does not, so the byte size is the counter.
        const meta = await head(BLOB_PATH, { token });
        return { value: meta.size, etag: meta.etag };
      } catch (error) {
        if (error instanceof BlobNotFoundError) return { value: 0, etag: null };
        throw error;
      }
    },
    async compareAndSwap(next, etag) {
      try {
        await put(BLOB_PATH, "x".repeat(next), {
          access: "public",
          token,
          addRandomSuffix: false,
          allowOverwrite: etag !== null,
          ifMatch: etag ?? undefined,
          contentType: "text/plain",
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
