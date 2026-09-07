import "server-only";

import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export async function getCurrentAdmin() {
  const user = await getCurrentFirebaseUser();
  if (!user) return null;
  const profile = await getFirebaseAdminFirestore().collection("users").doc(user.uid).get();
  return profile.data()?.role === "admin" ? user : null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Acesso administrativo não autorizado.");
  return admin;
}
