import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE, type SessionPayload } from "./session";

export async function currentSession(): Promise<SessionPayload | null> {
  return readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
