import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/shared/constants/auth";

const protectedPrefixes = ["/dashboard", "/especialidade", "/preparacao", "/caso", "/evolucao", "/perfil", "/ranking", "/admin"];

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostname = (forwardedHost ?? request.headers.get("host") ?? request.nextUrl.hostname)
    .split(":")[0]
    .replace(/\.$/, "")
    .toLowerCase();
  const isAdminHost = hostname === "adm.iagnostico.com.br" || hostname === "adm.localhost";
  const isInfrastructurePath = request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.startsWith("/_next");
  const shouldRewriteAdmin = isAdminHost && !isInfrastructurePath && request.nextUrl.pathname !== "/login" && !request.nextUrl.pathname.startsWith("/admin");
  const effectivePath = shouldRewriteAdmin ? `/admin${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}` : request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => effectivePath === prefix || effectivePath.startsWith(`${prefix}/`));

  if (isProtected && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", effectivePath);
    return NextResponse.redirect(loginUrl);
  }

  if (shouldRewriteAdmin) {
    const destination = request.nextUrl.clone();
    destination.pathname = effectivePath;
    return NextResponse.rewrite(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
