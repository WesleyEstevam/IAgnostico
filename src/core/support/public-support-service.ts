import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminBucket, getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getTurnstileSecret } from "@/core/admin/support-settings-service";

type Requester = { uid: string; firstName: string; lastName: string; email: string; phone: string };
type Attachment = { name: string; url: string; contentType: string; size: number };

export function cleanPlainText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

export async function verifyTurnstile(token: string, remoteIp: string, expectedHostname: string) {
  const secret = await getTurnstileSecret();
  if (!secret)
    throw new Error(
      "O atendimento está temporariamente indisponível. Configure o Turnstile no painel administrativo.",
    );
  if (!token || token.length > 2048) throw new Error("Confirme que você não é um robô.");
  const body = new URLSearchParams({ secret, response: token, idempotency_key: randomUUID() });
  if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Não foi possível validar o captcha. Tente novamente.");
  const result = (await response.json()) as {
    success?: boolean;
    action?: string;
    hostname?: string;
    "error-codes"?: string[];
  };
  if (
    !result.success ||
    (result.action && result.action !== "support_request") ||
    (result.hostname && expectedHostname && result.hostname !== expectedHostname)
  )
    throw new Error("A validação do captcha expirou ou falhou. Recarregue e tente novamente.");
}

export async function enforceSupportRateLimit(identity: string) {
  const firestore = getFirebaseAdminFirestore();
  const key = createHash("sha256").update(identity).digest("hex");
  const reference = firestore.collection("supportRateLimits").doc(key);
  const now = Date.now();
  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data();
    const windowStart = data?.windowStart instanceof Timestamp ? data.windowStart.toMillis() : 0;
    const withinWindow = now - windowStart < 60 * 60 * 1000;
    const count = withinWindow && typeof data?.count === "number" ? data.count : 0;
    if (count >= 5) throw new Error("Limite de solicitações atingido. Tente novamente mais tarde.");
    transaction.set(
      reference,
      {
        count: count + 1,
        windowStart: Timestamp.fromMillis(withinWindow ? windowStart : now),
        expiresAt: Timestamp.fromMillis(now + 2 * 60 * 60 * 1000),
      },
      { merge: true },
    );
  });
}

export async function uploadSupportAttachment(file: File | null) {
  if (!file || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error("O anexo deve ter no máximo 5 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectFileType(buffer);
  if (!detected)
    throw new Error("Envie somente imagens PNG, JPEG ou WebP, ou arquivos PDF válidos.");
  const safeBase =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80) || `anexo.${detected.extension}`;
  const path = `support/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeBase}`;
  const token = randomUUID();
  const bucket = await getFirebaseAdminBucket();
  await bucket.file(path).save(buffer, {
    resumable: false,
    contentType: detected.contentType,
    metadata: {
      cacheControl: "private,max-age=3600",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return {
    name: safeBase,
    url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`,
    contentType: detected.contentType,
    size: file.size,
  } satisfies Attachment;
}

function detectFileType(buffer: Buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString() === "%PDF-")
    return { contentType: "application/pdf", extension: "pdf" };
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return { contentType: "image/png", extension: "png" };
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return { contentType: "image/jpeg", extension: "jpg" };
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  )
    return { contentType: "image/webp", extension: "webp" };
  return null;
}

export async function createPublicSupportTicket(input: {
  requester: Requester;
  subjectId: string;
  subjectLabel: string;
  message: string;
  attachment: Attachment | null;
}) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("supportTickets").doc();
  const messageRef = reference.collection("messages").doc();
  const protocol = `IAG-${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(new Date()).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const requesterName = `${input.requester.firstName} ${input.requester.lastName}`.trim();
  const batch = firestore.batch();
  batch.create(reference, {
    protocol,
    subject: input.subjectLabel,
    subjectId: input.subjectId,
    description: input.message,
    requesterUid: input.requester.uid,
    requesterName,
    requesterFirstName: input.requester.firstName,
    requesterLastName: input.requester.lastName,
    requesterEmail: input.requester.email,
    requesterPhone: input.requester.phone,
    status: "open",
    priority: "normal",
    category: "other",
    assignedTo: "",
    source: input.requester.uid ? "authenticated_web" : "public_web",
    attachment: input.attachment,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessagePreview: input.message.slice(0, 160),
  });
  batch.create(messageRef, {
    body: input.message,
    authorUid: input.requester.uid,
    authorName: requesterName,
    authorType: "player",
    internal: false,
    attachment: input.attachment,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  return protocol;
}
