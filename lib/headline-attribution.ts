import { HEADLINES, HEADLINE_COOKIE, parseHeadlineCookie } from "./headlines.ts";

export const UNKNOWN_HEADLINE = "unknown";

export function headlineFromCookie(value: string | null | undefined): string {
  const index = parseHeadlineCookie(value);
  if (index === null) return UNKNOWN_HEADLINE;
  return HEADLINES[index];
}

export function canonicalHeadline(value: unknown): string {
  if (typeof value !== "string") return UNKNOWN_HEADLINE;
  if (value === UNKNOWN_HEADLINE) return UNKNOWN_HEADLINE;
  if ((HEADLINES as readonly string[]).includes(value)) return value;
  return UNKNOWN_HEADLINE;
}

/**
 * The headline on a submission is the one already stored in cv_headline.
 * A missing or invalid cookie is unknown. A headline sent in the form body
 * cannot replace the cookie, and this does not advance the rotation.
 */
export function resolveAttributedHeadline(cookieValue: string | null | undefined, submitted: unknown): string {
  const fromCookie = headlineFromCookie(cookieValue);
  // The form may repeat the on-screen headline. A different value cannot replace the cookie.
  if (fromCookie !== UNKNOWN_HEADLINE && canonicalHeadline(submitted) !== fromCookie) return fromCookie;
  if (fromCookie === UNKNOWN_HEADLINE) return UNKNOWN_HEADLINE;
  return fromCookie;
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    const raw = trimmed.slice(eq + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return undefined;
}

export function headlineForSubmission(cookieHeader: string | null, submitted: unknown): string {
  return resolveAttributedHeadline(readCookie(cookieHeader, HEADLINE_COOKIE), submitted);
}
