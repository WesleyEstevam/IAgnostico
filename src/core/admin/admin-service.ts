import "server-only";

import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export const STAFF_ROLES = ["superadmin", "admin", "support"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export type AdminPermission = "dashboard.read" | "users.read" | "users.manage" | "cases.manage" | "plans.manage" | "support.read" | "support.manage" | "settings.manage" | "audit.read" | "roles.manage";

const ROLE_PERMISSIONS: Record<StaffRole, readonly AdminPermission[]> = {
  superadmin: ["dashboard.read", "users.read", "users.manage", "cases.manage", "plans.manage", "support.read", "support.manage", "settings.manage", "audit.read", "roles.manage"],
  admin: ["dashboard.read", "users.read", "users.manage", "cases.manage", "plans.manage", "support.read", "support.manage", "settings.manage", "audit.read"],
  support: ["dashboard.read", "users.read", "support.read", "support.manage"],
};

function readStaffRole(value: unknown): StaffRole | null {
  if (value === "admin") return "admin";
  return STAFF_ROLES.includes(value as StaffRole) ? value as StaffRole : null;
}

export async function getCurrentStaff() {
  const user = await getCurrentFirebaseUser();
  if (!user) return null;
  const profile = await getFirebaseAdminFirestore().collection("users").doc(user.uid).get();
  const role = readStaffRole(profile.data()?.role);
  if (!role) return null;
  return { user, role, permissions: ROLE_PERMISSIONS[role], profile: profile.data() ?? {} };
}

export async function requireStaff() {
  const staff = await getCurrentStaff();
  if (!staff) throw new Error("Acesso administrativo não autorizado.");
  return staff;
}

export async function requirePermission(permission: AdminPermission) {
  const staff = await requireStaff();
  if (!staff.permissions.includes(permission)) throw new Error("Você não possui permissão para realizar esta ação.");
  return staff;
}

export async function getCurrentAdmin() {
  const staff = await getCurrentStaff();
  return staff?.permissions.includes("cases.manage") ? staff.user : null;
}

export async function requireAdmin() {
  return (await requirePermission("cases.manage")).user;
}
