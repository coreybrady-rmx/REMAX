import { NextResponse, type NextRequest } from "next/server";
import { HEADLINE_COOKIE, parseHeadlineCookie } from "@/lib/headlines";

export function middleware(request: NextRequest) {
  if (parseHeadlineCookie(request.cookies.get(HEADLINE_COOKIE)?.value) !== null) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/api/headline";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/"],
};
