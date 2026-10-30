import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, BlobPreconditionFailedError, get, head, put } from "@vercel/blob";
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
        // head() goes through the Blob API. A missing tally is "not found",
        // including when this store cannot serve a private pathname. get()
        // against the private host with cache=0 returns 400 on a public store
        // instead of an empty tally, which blanked the results page.
        const meta = await head(BLOB_PATH, { token });
        const access = meta.url.includes(".private.blob.vercel-storage.com") ? "private" : "public";
        const result = await readBlob(token, meta.url, access);
        return { tally: parseTally(result.raw), etag: meta.etag || result.etag };
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

async function readBlob(
  token: string,
  url: string,
  access: "public" | "private",
): Promise<{ raw: string; etag: string }> {
  let result;
  try {
    result = await get(url, {
      token,
      access,
      ...(access === "private" ? { useCache: false as const } : {}),
    });
  } catch (error) {
    if (access !== "private" || !isCacheBypassRejection(error)) throw error;
    result = await get(url, { token, access: "private" });
  }
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Headline tally could not be read.");
  }
  return { raw: await readBlobStream(result.stream), etag: result.blob.etag };
}

function isCacheBypassRejection(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("400") || message.includes("cache");
}

async function readBlobStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function tallyBody(tally: HeadlineTally): HeadlineTally {
  return { byHeadline: { ...tally.byHeadline } };
}
