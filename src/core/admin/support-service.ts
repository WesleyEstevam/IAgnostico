import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export type TicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketCategory = "technical" | "billing" | "account" | "gameplay" | "other";
export const SUPPORT_PAGE_SIZE = 25;

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}
function iso(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

export async function listSupportTickets(input: {
  status?: string;
  priority?: string;
  category?: string;
  assigned?: string;
  search?: string;
  page?: number;
}) {
  const firestore = getFirebaseAdminFirestore();
  const snapshot = await firestore
    .collection("supportTickets")
    .orderBy("updatedAt", "desc")
    .limit(1000)
    .get();
  const search = (input.search ?? "").trim().toLocaleLowerCase("pt-BR");
  const raw = snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      protocol: text(data.protocol),
      subject: text(data.subject),
      requesterUid: text(data.requesterUid),
      requesterName: text(data.requesterName) || "Usuário",
      requesterEmail: text(data.requesterEmail),
      status: text(data.status) as TicketStatus,
      priority: text(data.priority) as TicketPriority,
      category: text(data.category) as TicketCategory,
      assignedTo: text(data.assignedTo),
      createdAt: iso(data.createdAt),
      updatedAt: iso(data.updatedAt),
      lastMessagePreview: text(data.lastMessagePreview),
    };
  });
  const filtered = raw.filter(
    (item) =>
      (!input.status || item.status === input.status) &&
      (!input.priority || item.priority === input.priority) &&
      (!input.category || item.category === input.category) &&
      (!input.assigned ||
        (input.assigned === "unassigned"
          ? !item.assignedTo
          : item.assignedTo === input.assigned)) &&
      (!search ||
        `${item.subject} ${item.requesterName} ${item.requesterEmail} ${item.id}`
          .toLocaleLowerCase("pt-BR")
          .includes(search)),
  );
  const staffIds = [...new Set(raw.map((item) => item.assignedTo).filter(Boolean))];
  const staffDocs = staffIds.length
    ? await firestore.getAll(...staffIds.map((uid) => firestore.collection("users").doc(uid)))
    : [];
  const staffNames = new Map(
    staffDocs.map((document) => [
      document.id,
      text(document.data()?.displayName) || text(document.data()?.email) || document.id,
    ]),
  );
  const agentsSnapshot = await firestore.collection("users").limit(1000).get();
  const agents = agentsSnapshot.docs
    .filter((document) => ["superadmin", "admin", "support"].includes(text(document.data().role)))
    .map((document) => ({
      uid: document.id,
      name: text(document.data().displayName) || text(document.data().email) || document.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const start = (page - 1) * SUPPORT_PAGE_SIZE;
  const tickets = filtered
    .slice(start, start + SUPPORT_PAGE_SIZE)
    .map((item) => ({
      ...item,
      assignedName: item.assignedTo ? (staffNames.get(item.assignedTo) ?? item.assignedTo) : null,
    }));
  const metrics = {
    open: raw.filter((item) => item.status === "open").length,
    inProgress: raw.filter((item) => item.status === "in_progress").length,
    waiting: raw.filter((item) => item.status === "waiting_user").length,
    urgent: raw.filter(
      (item) => item.priority === "urgent" && !["resolved", "closed"].includes(item.status),
    ).length,
  };
  return {
    tickets,
    agents,
    metrics,
    page,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / SUPPORT_PAGE_SIZE)),
    truncated: snapshot.size === 1000,
  };
}

export async function getSupportTicket(ticketId: string) {
  const firestore = getFirebaseAdminFirestore();
  const ticketRef = firestore.collection("supportTickets").doc(ticketId);
  const [ticketSnapshot, messagesSnapshot] = await Promise.all([
    ticketRef.get(),
    ticketRef.collection("messages").orderBy("createdAt", "asc").limit(500).get(),
  ]);
  if (!ticketSnapshot.exists) return null;
  const data = ticketSnapshot.data() ?? {};
  const ids = [...new Set([text(data.requesterUid), text(data.assignedTo)].filter(Boolean))];
  const profiles = ids.length
    ? await firestore.getAll(...ids.map((uid) => firestore.collection("users").doc(uid)))
    : [];
  const names = new Map(
    profiles.map((document) => [
      document.id,
      text(document.data()?.displayName) || text(document.data()?.email) || document.id,
    ]),
  );
  const agentsSnapshot = await firestore.collection("users").limit(1000).get();
  const agents = agentsSnapshot.docs
    .filter((document) => ["superadmin", "admin", "support"].includes(text(document.data().role)))
    .map((document) => ({
      uid: document.id,
      name: text(document.data().displayName) || text(document.data().email) || document.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const readAttachment = (value: unknown) =>
    value && typeof value === "object"
      ? {
          name: text((value as Record<string, unknown>).name),
          url: text((value as Record<string, unknown>).url),
          contentType: text((value as Record<string, unknown>).contentType),
          size:
            typeof (value as Record<string, unknown>).size === "number"
              ? ((value as Record<string, unknown>).size as number)
              : 0,
        }
      : null;
  return {
    id: ticketId,
    protocol: text(data.protocol),
    subject: text(data.subject),
    description: text(data.description),
    requesterUid: text(data.requesterUid),
    requesterName: text(data.requesterName) || names.get(text(data.requesterUid)) || "Usuário",
    requesterEmail: text(data.requesterEmail),
    requesterPhone: text(data.requesterPhone),
    status: text(data.status) as TicketStatus,
    priority: text(data.priority) as TicketPriority,
    category: text(data.category) as TicketCategory,
    assignedTo: text(data.assignedTo),
    assignedName: names.get(text(data.assignedTo)) ?? null,
    attachment: readAttachment(data.attachment),
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
    agents,
    messages: messagesSnapshot.docs.map((document) => {
      const message = document.data();
      return {
        id: document.id,
        body: text(message.body),
        authorUid: text(message.authorUid),
        authorName: text(message.authorName) || "Sistema",
        authorType: text(message.authorType),
        internal: message.internal === true,
        attachment: readAttachment(message.attachment),
        createdAt: iso(message.createdAt),
      };
    }),
  };
}

export async function createSupportTicket(
  input: {
    requesterUid: string;
    requesterName: string;
    requesterEmail: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
  },
  actorUid: string,
  actorName: string,
) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("supportTickets").doc();
  const messageRef = reference.collection("messages").doc();
  const batch = firestore.batch();
  batch.create(reference, {
    ...input,
    status: "open",
    assignedTo: actorUid,
    source: "admin",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessagePreview: input.description.slice(0, 160),
  });
  batch.create(messageRef, {
    body: input.description,
    authorUid: actorUid,
    authorName: actorName,
    authorType: "staff",
    internal: false,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.create(firestore.collection("adminAuditLogs").doc(), {
    actorUid,
    action: "support.ticket_created",
    targetType: "supportTicket",
    targetId: reference.id,
    before: null,
    after: { subject: input.subject, priority: input.priority, category: input.category },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  return reference.id;
}

export async function updateSupportTicket(
  ticketId: string,
  changes: { status: TicketStatus; priority: TicketPriority; assignedTo: string },
  actorUid: string,
) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("supportTickets").doc(ticketId);
  const current = await reference.get();
  if (!current.exists) throw new Error("Chamado não encontrado.");
  const before = current.data() ?? {};
  const batch = firestore.batch();
  batch.update(reference, {
    ...changes,
    updatedAt: FieldValue.serverTimestamp(),
    resolvedAt: changes.status === "resolved" ? FieldValue.serverTimestamp() : null,
  });
  batch.create(firestore.collection("adminAuditLogs").doc(), {
    actorUid,
    action: "support.ticket_updated",
    targetType: "supportTicket",
    targetId: ticketId,
    before: {
      status: before.status ?? null,
      priority: before.priority ?? null,
      assignedTo: before.assignedTo ?? null,
    },
    after: changes,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}

export async function replySupportTicket(
  ticketId: string,
  body: string,
  internal: boolean,
  actorUid: string,
  actorName: string,
) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("supportTickets").doc(ticketId);
  const current = await reference.get();
  if (!current.exists) throw new Error("Chamado não encontrado.");
  const messageRef = reference.collection("messages").doc();
  const batch = firestore.batch();
  batch.create(messageRef, {
    body,
    authorUid: actorUid,
    authorName: actorName,
    authorType: "staff",
    internal,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.update(reference, {
    status: internal ? (current.data()?.status ?? "in_progress") : "waiting_user",
    updatedAt: FieldValue.serverTimestamp(),
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessagePreview: body.slice(0, 160),
  });
  batch.create(firestore.collection("adminAuditLogs").doc(), {
    actorUid,
    action: internal ? "support.internal_note_added" : "support.reply_sent",
    targetType: "supportTicket",
    targetId: ticketId,
    before: null,
    after: { internal, preview: body.slice(0, 120) },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}
