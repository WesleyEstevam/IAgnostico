import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/shared/constants/auth";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/especialidade/:path*", "/preparacao/:path*", "/caso/:path*", "/evolucao/:path*"],
};
