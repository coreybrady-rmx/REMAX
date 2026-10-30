import { timingSafeEqual } from "node:crypto";
import { HEADLINES } from "./headlines.ts";
import { UNKNOWN_HEADLINE } from "./headline-attribution.ts";

export type HeadlineTally = {
  byHeadline: Record<string, Record<string, number>>;
};

export interface HeadlineTallyStore {
  read(): Promise<{ tally: HeadlineTally; etag: string | null }>;
  compareAndSwap(next: HeadlineTally, etag: string | null): Promise<boolean>;
}

const FORM_LABELS: Record<string, string> = {
  cma: "CMA",
  affordability: "Buyer",
  payment: "Payment",
};

const FORM_ORDER = ["cma", "affordability", "payment"];

export function emptyTally(): HeadlineTally {
  return { byHeadline: {} };
}

export function parseTally(raw: string): HeadlineTally {
  try {
    const parsed = JSON.parse(raw) as { byHeadline?: unknown };
    if (!parsed || typeof parsed !== "object" || !parsed.byHeadline || typeof parsed.byHeadline !== "object") {
      return emptyTally();
    }
    const byHeadline: Record<string, Record<string, number>> = {};
    for (const [headline, forms] of Object.entries(parsed.byHeadline)) {
      if (headline === "__proto__" || headline === "constructor" || headline === "prototype") continue;
      if (!forms || typeof forms !== "object" || Array.isArray(forms)) continue;
      const counts: Record<string, number> = {};
      for (const [form, count] of Object.entries(forms)) {
        if (typeof count === "number" && Number.isInteger(count) && count >= 0) counts[form] = count;
      }
      byHeadline[headline] = counts;
    }
    return { byHeadline };
  } catch {
    return emptyTally();
  }
}

export function incrementTally(tally: HeadlineTally, headline: string, form: string): HeadlineTally {
  const byHeadline: Record<string, Record<string, number>> = {};
  for (const [key, forms] of Object.entries(tally.byHeadline)) {
    byHeadline[key] = { ...forms };
  }
  const forms = { ...(byHeadline[headline] ?? {}) };
  forms[form] = (forms[form] ?? 0) + 1;
  byHeadline[headline] = forms;
  return { byHeadline };
}

export async function recordHeadlineSubmission(
  store: HeadlineTallyStore,
  headline: string,
  form: string,
): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await store.read();
    const next = incrementTally(current.tally, headline, form);
    const wrote = await store.compareAndSwap(next, current.etag);
    if (wrote) return;
  }
  throw new Error("Headline tally is busy.");
}

export type HeadlineCountRow = {
  headline: string;
  total: number;
  byForm: Array<{ form: string; label: string; count: number }>;
};

export function headlineCountRows(tally: HeadlineTally): HeadlineCountRow[] {
  const known = new Set<string>([...HEADLINES, UNKNOWN_HEADLINE]);
  const extras = Object.keys(tally.byHeadline)
    .filter((key) => !known.has(key))
    .sort();
  return [...HEADLINES, UNKNOWN_HEADLINE, ...extras].map((headline) => {
    const counts = tally.byHeadline[headline] ?? {};
    const forms = Object.keys(counts).sort((a, b) => formRank(a) - formRank(b) || a.localeCompare(b));
    const byForm = forms
      .filter((form) => (counts[form] ?? 0) > 0)
      .map((form) => ({ form, label: FORM_LABELS[form] ?? form, count: counts[form] ?? 0 }));
    const total = byForm.reduce((sum, row) => sum + row.count, 0);
    return { headline, total, byForm };
  });
}

export function renderHeadlineResults(tally: HeadlineTally): string {
  const rows = headlineCountRows(tally);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const cards = rows
    .map((row) => {
      const breakdown =
        row.byForm.length === 0
          ? ""
          : `<ul>${row.byForm
              .map(
                (form) =>
                  `<li data-form="${escapeHtml(form.form)}" data-form-count="${form.count}">${escapeHtml(form.label)}: ${form.count}</li>`,
              )
              .join("")}</ul>`;
      return `<article data-headline="${escapeHtml(row.headline)}" data-count="${row.total}"><h2>${escapeHtml(row.headline)}</h2><p><strong>${row.total}</strong> ${row.total === 1 ? "submission" : "submissions"}</p>${breakdown}</article>`;
    })
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="referrer" content="no-referrer">
<title>Headline results</title>
<style>
  body { margin: 0; font-family: Inter, "Segoe UI", sans-serif; color: #2c3138; background: #fff; }
  main { max-width: 720px; margin: 0 auto; padding: 28px 20px 48px; }
  h1 { margin: 0 0 8px; color: #0e1a33; font-size: 32px; letter-spacing: -0.03em; }
  h2 { margin: 0; color: #0e1a33; font-size: 20px; }
  p { margin: 8px 0 0; }
  .intro { color: #5c6570; }
  article { margin-top: 16px; padding: 16px; border: 1px solid #e3e7ee; border-radius: 16px; }
  ul { margin: 8px 0 0; padding-left: 18px; }
</style>
</head>
<body>
<main>
<h1>Headline results</h1>
<p class="intro" data-total="${total}">${total} ${total === 1 ? "submission" : "submissions"} across these headlines. Counts only.</p>
${cards}
</main>
</body>
</html>`;
}

export function resultsKeyMatches(secret: string | undefined, provided: string | null): boolean {
  const expected = secret?.trim() ?? "";
  const actual = provided?.trim() ?? "";
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function providedResultsKey(request: Request): string | null {
  const query = new URL(request.url).searchParams.get("key");
  if (query !== null) return query;
  return request.headers.get("x-results-key");
}

const PRIVATE_HEADERS = {
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex",
  "referrer-policy": "no-referrer",
};

export async function handleHeadlineResults(
  request: Request,
  options: { secret: string | undefined; store: HeadlineTallyStore },
): Promise<Response> {
  if (!resultsKeyMatches(options.secret, providedResultsKey(request))) {
    return new Response("Not found", { status: 404, headers: PRIVATE_HEADERS });
  }
  try {
    const current = await options.store.read();
    return new Response(renderHeadlineResults(current.tally), {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        "content-type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return new Response("Headline counts are unavailable.", {
      status: 500,
      headers: PRIVATE_HEADERS,
    });
  }
}

function formRank(form: string): number {
  const index = FORM_ORDER.indexOf(form);
  return index === -1 ? FORM_ORDER.length : index;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
