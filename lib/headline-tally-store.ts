import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { emptyTally, parseTally, type HeadlineTally, type HeadlineTallyStore } from "./headline-tally.ts";

const FILE = path.join(process.cwd(), "data", "headline-tally.json");
const BLOB_PATH = "headline-tally.json";

export function tallyStoreFromEnv(): HeadlineTallyStore {
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobTallyStore(process.env.BLOB_READ_WRITE_TOKEN);
  return fileTallyStore();
}

export function fileTallyStore(file = FILE): HeadlineTallyStore {
  return {
    async read() {
      try {
        const raw = await readFile(file, "utf8");
        return { tally: parseTally(raw), etag: raw };
      } catch {
        return { tally: emptyTally(), etag: null };
      }
    },
    async compareAndSwap(next, etag) {
      const current = await this.read();
      if (current.etag !== etag) return false;
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(next), "utf8");
      return true;
    },
  };
}

export function blobTallyStore(token: string): HeadlineTallyStore {
  return {
    async read() {
      try {
        // Private blobs are not the public CDN object. useCache: false reads
        // the latest tally from origin storage.
        const result = await get(BLOB_PATH, { token, access: "private", useCache: false });
        if (!result) return { tally: emptyTally(), etag: null };
        if (result.statusCode !== 200 || !result.stream) {
          throw new Error("Headline tally could not be read.");
        }
        const raw = await new Response(result.stream).text();
        return { tally: parseTally(raw), etag: result.blob.etag };
      } catch (error) {
        if (error instanceof BlobNotFoundError) return { tally: emptyTally(), etag: null };
        throw error;
      }
    },
    async compareAndSwap(next, etag) {
      try {
        await put(BLOB_PATH, JSON.stringify(tallyBody(next)), {
          access: "private",
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

function tallyBody(tally: HeadlineTally): HeadlineTally {
  return { byHeadline: { ...tally.byHeadline } };
}
