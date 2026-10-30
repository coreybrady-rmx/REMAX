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
  return [...HEADLINES, UNKNOWN_HEADLINE, ...extras].map((headline) => rowFor(tally, headline)).filter((row) => {
    if ((HEADLINES as readonly string[]).includes(row.headline)) return true;
    return row.total > 0;
  });
}

function rowFor(tally: HeadlineTally, headline: string): HeadlineCountRow {
  const counts = tally.byHeadline[headline] ?? {};
  const forms = Object.keys(counts).sort((a, b) => formRank(a) - formRank(b) || a.localeCompare(b));
  const byForm = forms
    .filter((form) => (counts[form] ?? 0) > 0)
    .map((form) => ({ form, label: FORM_LABELS[form] ?? form, count: counts[form] ?? 0 }));
  const total = byForm.reduce((sum, row) => sum + row.count, 0);
  return { headline, total, byForm };
}

export function renderHeadlineResults(tally: HeadlineTally, options?: { unavailable?: boolean }): string {
  const rows = headlineCountRows(options?.unavailable ? emptyTally() : tally);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const cards = rows
    .map((row) => {
      const breakdown =
        row.total === 0
          ? ""
          : `<ul>${row.byForm
              .map(
                (form) =>
                  `<li data-form="${escapeHtml(form.form)}" data-form-count="${form.count}">${escapeHtml(form.label)}: ${form.count}</li>`,
              )
              .join("")}</ul>`;
      const countLabel = row.total === 1 ? "form submitted" : "forms submitted";
      return `<article data-headline="${escapeHtml(row.headline)}" data-count="${row.total}"><h2>${escapeHtml(row.headline)}</h2><p class="count"><strong>${row.total}</strong> ${countLabel}</p>${breakdown}</article>`;
    })
    .join("");
  const status = options?.unavailable
    ? `<p class="empty" data-unavailable="true">Headline counts could not be loaded.</p>`
    : total === 0
      ? `<p class="empty" data-empty="true" data-total="0">No forms have been submitted yet.</p>`
      : `<p class="total" data-total="${total}"><strong>${total}</strong> ${total === 1 ? "form" : "forms"} submitted.</p>`;
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
  .bar { height: 4px; background: #ec2325; }
  main { max-width: 720px; margin: 0 auto; padding: 28px 20px 48px; }
  h1 { margin: 0 0 8px; color: #0e1a33; font-size: 32px; line-height: 1.1; letter-spacing: -0.03em; }
  h2 { margin: 0; color: #0e1a33; font-size: 20px; line-height: 1.25; }
  p { margin: 0; }
  .intro { margin-top: 8px; color: #5c6570; font-size: 16px; line-height: 1.45; }
  .empty, .total { margin-top: 16px; padding: 14px 16px; background: #f3f5f8; border-radius: 16px; color: #0e1a33; font-size: 16px; line-height: 1.4; }
  article { margin-top: 16px; padding: 16px; border: 1px solid #e3e7ee; border-radius: 16px; }
  .count { margin-top: 8px; font-size: 16px; }
  .count strong, .total strong { color: #0e1a33; }
  ul { margin: 10px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 8px; }
  li { background: #f3f5f8; border-radius: 999px; padding: 6px 10px; font-size: 14px; }
</style>
</head>
<body>
<div class="bar"></div>
<main>
<h1>Headline results</h1>
<p class="intro">How many forms were submitted under each headline. Counts only.</p>
${status}
${cards}
</main>
</body>
</html>`;
}

const PRIVATE_HEADERS = {
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex",
  "referrer-policy": "no-referrer",
};

export async function handleHeadlineResults(options: { store: HeadlineTallyStore }): Promise<Response> {
  try {
    const current = await options.store.read();
    return htmlResponse(renderHeadlineResults(current.tally));
  } catch {
    console.error("Headline tally could not be read.");
    return htmlResponse(renderHeadlineResults(emptyTally(), { unavailable: true }));
  }
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      ...PRIVATE_HEADERS,
      "content-type": "text/html; charset=utf-8",
    },
  });
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
