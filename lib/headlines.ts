export const HEADLINES = [
  "Your next move starts here.",
  "Curious what's possible?",
  "Know your numbers, know your options.",
  "What's your next move?",
  "Your home, your future, your move.",
  "Big real estate questions? Start here.",
] as const;

export const HEADLINE_COOKIE = "cv_headline";

export function headlineForIndex(index: number): string {
  const count = HEADLINES.length;
  const normalized = ((Math.trunc(index) % count) + count) % count;
  return HEADLINES[normalized] ?? HEADLINES[0];
}

export function parseHeadlineCookie(value: string | undefined | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0 || index >= HEADLINES.length) return null;
  return index;
}

export type HeadlineCursor = {
  value: number;
  etag: string | null;
};

export interface HeadlineStore {
  read(): Promise<HeadlineCursor>;
  compareAndSwap(next: number, etag: string | null): Promise<boolean>;
}

export async function claimHeadlineIndex(store: HeadlineStore): Promise<number> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await store.read();
    const next = current.value + 1;
    const wrote = await store.compareAndSwap(next, current.etag);
    if (wrote) return (next - 1) % HEADLINES.length;
  }
  throw new Error("Headline rotation is busy.");
}
