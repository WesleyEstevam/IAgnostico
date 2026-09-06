import "server-only";

import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "./admin";
import { SESSION_COOKIE_NAME } from "@/shared/constants/auth";

export async function getCurrentFirebaseUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    return await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
