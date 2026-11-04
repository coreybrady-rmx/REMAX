export const SESSION_COOKIE = "phb_session";
const DAY_MS = 24 * 60 * 60 * 1000;

export type SessionRole = "admin" | "investor";

export type SessionPayload = {
  sub: string;
  email: string;
  role: SessionRole;
  exp: number;
};

function encode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decode(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set.");
  return value;
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return encode(new Uint8Array(signature));
}

function same(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export async function createSessionToken(input: {
  sub: string;
  email: string;
  role: SessionRole;
}): Promise<string> {
  const payload: SessionPayload = {
    ...input,
    exp: Date.now() + 7 * DAY_MS,
  };
  const body = encode(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body)}`;
}

export async function readSessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !process.env.AUTH_SECRET) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = await hmac(body);
  if (!same(signature, expected)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(decode(body))) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (payload.role !== "admin" && payload.role !== "investor") return null;
    return payload;
  } catch {
    return null;
  }
}
