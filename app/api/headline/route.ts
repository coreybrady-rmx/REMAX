import { NextResponse } from "next/server";
import { HEADLINE_COOKIE } from "@/lib/headlines";
import { nextHeadlineIndex } from "@/lib/headline-store";

export const dynamic = "force-dynamic";

function homeUrl(request: Request): URL {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    forwardedProto || (host && (host.startsWith("localhost") || host.startsWith("127.")) ? "http" : "https");
  if (host) return new URL("/", `${proto}://${host}`);
  return new URL("/", request.url);
}

export async function GET(request: Request) {
  let index = 0;
  try {
    index = await nextHeadlineIndex();
  } catch {
    index = 0;
  }
  const home = homeUrl(request);
  const response = NextResponse.redirect(home);
  response.cookies.set(HEADLINE_COOKIE, String(index), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    secure: home.protocol === "https:",
  });
  return response;
}
