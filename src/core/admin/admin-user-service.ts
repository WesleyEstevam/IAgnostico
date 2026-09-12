import "server-only";

import { FieldValue, Timestamp, type Query } from "firebase-admin/firestore";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export const ADMIN_USERS_PAGE_SIZE = 20;
export type AdminUserSort = "recent" | "oldest" | "name" | "xp";

export function normalizeUserSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9@.+_-]/g, " ").replace(/\s+/g, " ").trim();
}

export function buildUserSearchKeywords(values: Array<string | null | undefined>) {
  const keywords = new Set<string>();
  for (const original of values) {
    const value = normalizeUserSearch(original ?? "");
    if (!value) continue;
    for (const part of new Set([value, ...value.split(" ")])) {
      for (let length = 2; length <= Math.min(part.length, 50); length += 1) keywords.add(part.slice(0, length));
    }
  }
  return [...keywords].slice(0, 300);
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function mapAdminUser(document: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = document.data();
  return {
    uid: document.id,
    displayName: text(data.displayName) || "Jogador",
    email: text(data.email),
    phone: text(data.phone),
    photoURL: text(data.photoURL),
    plan: data.plan === "pro" ? "pro" as const : "free" as const,
    accountStatus: data.accountStatus === "disabled" ? "disabled" as const : "active" as const,
    subscriptionStatus: text(data.subscriptionStatus),
    provider: text(data.provider),
    createdAt: isoDate(data.createdAt),
    lastAccessAt: isoDate(data.lastAccessAt),
    xp: number(data.stats?.xp),
    level: Math.max(1, number(data.stats?.level)),
    casesPlayed: number(data.stats?.casesPlayed),
  };
}

export async function listAdminUsers(input: { search?: string; plan?: string; status?: string; sort?: string; page?: number }) {
  const firestore = getFirebaseAdminFirestore();
  let query: Query = firestore.collection("users");
  const search = normalizeUserSearch(input.search ?? "");
  const plan = input.plan === "free" || input.plan === "pro" ? input.plan : "";
  const status = input.status === "active" || input.status === "disabled" ? input.status : "";
  const requestedSort: AdminUserSort = ["recent", "oldest", "name", "xp"].includes(input.sort ?? "") ? input.sort as AdminUserSort : "recent";
  const sort = requestedSort;
  const page = Math.max(1, Math.floor(input.page ?? 1));

  // A busca é filtrada e ordenada no servidor para não depender de um índice
  // composto diferente para cada combinação de texto, plano, status e ordem.
  if (search.length >= 2) {
    const snapshot = await firestore.collection("users").where("searchKeywords", "array-contains", search).limit(1000).get();
    const matches = snapshot.docs
      .map(mapAdminUser)
      .filter((user) => (!plan || user.plan === plan) && (!status || user.accountStatus === status))
      .sort((a, b) => {
        if (sort === "name") return a.displayName.localeCompare(b.displayName, "pt-BR");
        if (sort === "xp") return b.xp - a.xp;
        const difference = (Date.parse(b.createdAt ?? "") || 0) - (Date.parse(a.createdAt ?? "") || 0);
        return sort === "oldest" ? -difference : difference;
      });
    const total = matches.length;
    const start = (page - 1) * ADMIN_USERS_PAGE_SIZE;
    return { users: matches.slice(start, start + ADMIN_USERS_PAGE_SIZE), page, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_USERS_PAGE_SIZE)), filters: { search, plan, status, sort } };
  }

  if (plan) query = query.where("plan", "==", plan);
  if (status) query = query.where("accountStatus", "==", status);

  if (sort === "name") query = query.orderBy("displayNameNormalized", "asc");
  else if (sort === "xp") query = query.orderBy("stats.xp", "desc");
  else query = query.orderBy("createdAt", sort === "oldest" ? "asc" : "desc");

  const [total, snapshot] = await Promise.all([
    query.count().get(),
    query.offset((page - 1) * ADMIN_USERS_PAGE_SIZE).limit(ADMIN_USERS_PAGE_SIZE).get(),
  ]);

  const users = snapshot.docs.map(mapAdminUser);
  const totalCount = total.data().count;
  return { users, page, total: totalCount, totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_USERS_PAGE_SIZE)), filters: { search, plan, status, sort } };
}

export async function getAdminUserDetails(uid: string) {
  const firestore = getFirebaseAdminFirestore();
  const [authUser, profile, games] = await Promise.all([
    getFirebaseAdminAuth().getUser(uid),
    firestore.collection("users").doc(uid).get(),
    firestore.collection("gameSessions").where("uid", "==", uid).get(),
  ]);
  const data = profile.data() ?? {};
  const stats = data.stats ?? {};
  return {
    uid,
    displayName: text(data.displayName) || authUser.displayName || "Jogador",
    email: text(data.email) || authUser.email || null,
    phone: text(data.phone) || authUser.phoneNumber || null,
    photoURL: text(data.photoURL) || authUser.photoURL || null,
    birthDate: text(data.birthDate),
    university: text(data.university),
    favoriteSpecialty: text(data.favoriteSpecialty),
    gender: text(data.gender),
    plan: data.plan === "pro" ? "pro" as const : "free" as const,
    role: text(data.role) || "player",
    accountStatus: authUser.disabled ? "disabled" as const : "active" as const,
    subscriptionStatus: text(data.subscriptionStatus),
    createdAt: isoDate(data.createdAt) || authUser.metadata.creationTime || null,
    lastAccessAt: isoDate(data.lastAccessAt) || authUser.metadata.lastSignInTime || null,
    shifts: { current: number(data.shifts?.current), max: number(data.shifts?.max) },
    stats: { xp: number(stats.xp), level: Math.max(1, number(stats.level)), streak: number(stats.streak), casesPlayed: number(stats.casesPlayed), correctAnswers: number(stats.correctAnswers), partialAnswers: number(stats.partialAnswers), averageAccuracy: number(stats.averageAccuracy) },
    games: games.docs.map((document) => {
      const game = document.data();
      return { id: document.id, title: text(game.caseTitle) || "Caso clínico", specialty: text(game.specialty) || "—", status: text(game.status) || "—", completedAt: isoDate(game.completedAt), evaluation: text(game.result?.evaluation), xp: number(game.result?.xpEarned) };
    }).sort((a, b) => (Date.parse(b.completedAt ?? "") || 0) - (Date.parse(a.completedAt ?? "") || 0)).slice(0, 10),
  };
}

export async function updateAdminUserProfile(uid: string, input: { displayName: string; phone: string | null; university: string | null; birthDate: string | null; gender: string | null }, actorUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const current = await userRef.get();
  if (!current.exists) throw new Error("Usuário não encontrado.");
  const before = current.data() ?? {};
  await getFirebaseAdminAuth().updateUser(uid, { displayName: input.displayName, phoneNumber: input.phone || null });
  const after = { ...input, displayNameNormalized: normalizeUserSearch(input.displayName), searchKeywords: buildUserSearchKeywords([input.displayName, before.email, input.phone, uid]) };
  const batch = firestore.batch();
  batch.update(userRef, { ...after, updatedAt: FieldValue.serverTimestamp() });
  batch.set(firestore.collection("playerProfiles").doc(uid), { displayName: input.displayName, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  batch.create(firestore.collection("adminAuditLogs").doc(), { actorUid, action: "user.profile_updated", targetType: "user", targetId: uid, before: { displayName: before.displayName ?? null, phone: before.phone ?? null, university: before.university ?? null, birthDate: before.birthDate ?? null, gender: before.gender ?? null }, after: input, createdAt: FieldValue.serverTimestamp() });
  await batch.commit();
}

export async function updateAdminUserPlan(uid: string, plan: "free" | "pro", actorUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const current = await userRef.get();
  if (!current.exists) throw new Error("Usuário não encontrado.");
  const batch = firestore.batch();
  batch.update(userRef, { plan, shifts: { current: plan === "pro" ? 10 : 3, max: plan === "pro" ? 10 : 3, lastRefillDate: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(new Date()) }, updatedAt: FieldValue.serverTimestamp() });
  batch.create(firestore.collection("adminAuditLogs").doc(), { actorUid, action: "user.plan_changed", targetType: "user", targetId: uid, before: { plan: current.data()?.plan ?? "free" }, after: { plan }, createdAt: FieldValue.serverTimestamp() });
  await batch.commit();
}

export async function updateAdminUserStatus(uid: string, disabled: boolean, actorUid: string) {
  if (uid === actorUid && disabled) throw new Error("Você não pode desativar sua própria conta.");
  const firestore = getFirebaseAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const current = await userRef.get();
  if (!current.exists) throw new Error("Usuário não encontrado.");
  await getFirebaseAdminAuth().updateUser(uid, { disabled });
  const status = disabled ? "disabled" : "active";
  const batch = firestore.batch();
  batch.update(userRef, { accountStatus: status, updatedAt: FieldValue.serverTimestamp() });
  batch.create(firestore.collection("adminAuditLogs").doc(), { actorUid, action: disabled ? "user.disabled" : "user.enabled", targetType: "user", targetId: uid, before: { accountStatus: current.data()?.accountStatus ?? "active" }, after: { accountStatus: status }, createdAt: FieldValue.serverTimestamp() });
  await batch.commit();
}

export async function createAdminPasswordResetLink(uid: string, actorUid: string) {
  const auth = getFirebaseAdminAuth();
  const user = await auth.getUser(uid);
  if (!user.email) throw new Error("Este usuário não possui e-mail cadastrado.");
  const link = await auth.generatePasswordResetLink(user.email);
  await getFirebaseAdminFirestore().collection("adminAuditLogs").add({ actorUid, action: "user.password_reset_link_generated", targetType: "user", targetId: uid, before: null, after: { email: user.email }, createdAt: FieldValue.serverTimestamp() });
  return link;
}
