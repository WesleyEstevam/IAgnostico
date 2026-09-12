import type { NextRequest } from "next/server";

function configuredOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "");
  const allowed = new Set<string>([request.nextUrl.origin]);

  if (host) allowed.add(`${protocol}://${host}`);
  for (const configured of [configuredOrigin(process.env.APP_URL), configuredOrigin(process.env.ADMIN_URL)]) {
    if (configured) allowed.add(configured);
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const parsed = new URL(origin);
      if (["localhost", "127.0.0.1", "adm.localhost"].includes(parsed.hostname)) allowed.add(parsed.origin);
    } catch {
      return false;
    }
  }

  return allowed.has(origin);
}
