import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export const AUDIT_PAGE_SIZE = 25;

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function isoDate(value: unknown) { return value instanceof Timestamp ? value.toDate().toISOString() : null; }

function serializable(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializable);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializable(item)]));
  return value ?? null;
}

export async function listAuditLogs(input: { category?: string; actor?: string; search?: string; from?: string; to?: string; page?: number }) {
  const firestore = getFirebaseAdminFirestore();
  const snapshot = await firestore.collection("adminAuditLogs").orderBy("createdAt", "desc").limit(1000).get();
  const category = ["user", "clinical_case", "clinicalCase", "plan", "staff", "siteContent"].includes(input.category ?? "") ? input.category ?? "" : "";
  const actor = (input.actor ?? "").trim();
  const search = (input.search ?? "").trim().toLocaleLowerCase("pt-BR");
  const fromTime = input.from && /^\d{4}-\d{2}-\d{2}$/.test(input.from) ? new Date(`${input.from}T00:00:00-03:00`).getTime() : null;
  const toTime = input.to && /^\d{4}-\d{2}-\d{2}$/.test(input.to) ? new Date(`${input.to}T23:59:59.999-03:00`).getTime() : null;
  const raw = snapshot.docs.map((document) => {
    const data = document.data();
    return { id: document.id, actorUid: text(data.actorUid), action: text(data.action), targetType: text(data.targetType), targetId: text(data.targetId), before: serializable(data.before), after: serializable(data.after), createdAt: isoDate(data.createdAt) };
  }).filter((item) => {
    const time = item.createdAt ? Date.parse(item.createdAt) : 0;
    return (!category || item.action.startsWith(`${category}.`)) && (!actor || item.actorUid === actor) && (!search || `${item.action} ${item.targetId}`.toLocaleLowerCase("pt-BR").includes(search)) && (fromTime === null || time >= fromTime) && (toTime === null || time <= toTime);
  });

  const userIds = [...new Set(raw.flatMap((item) => [item.actorUid, item.targetType === "user" || item.targetType === "staff" ? item.targetId : ""]).filter(Boolean))];
  const userSnapshots = userIds.length ? await firestore.getAll(...userIds.map((uid) => firestore.collection("users").doc(uid))) : [];
  const users = new Map(userSnapshots.map((document) => {
    const data = document.data();
    return [document.id, { name: text(data?.displayName) || text(data?.email) || document.id, email: text(data?.email) || null }];
  }));
  const actors = [...new Map(raw.filter((item) => item.actorUid).map((item) => [item.actorUid, { uid: item.actorUid, name: users.get(item.actorUid)?.name ?? item.actorUid }])).values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const logs = raw.map((item) => ({ ...item, actorName: users.get(item.actorUid)?.name ?? (item.actorUid || "Sistema"), targetName: users.get(item.targetId)?.name ?? null }));
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const start = (page - 1) * AUDIT_PAGE_SIZE;
  return { logs: logs.slice(start, start + AUDIT_PAGE_SIZE), actors, page, total: logs.length, totalPages: Math.max(1, Math.ceil(logs.length / AUDIT_PAGE_SIZE)), filters: { category, actor, search, from: input.from ?? "", to: input.to ?? "" }, truncated: snapshot.size === 1000 };
}
