import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAsaasCredentials } from "@/core/payments/payment-settings-service";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { processPaymentEvent, processPixAuthorization } from "@/core/payments/payment-event-service";

type JsonObject = Record<string, unknown>;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1_000_000) return NextResponse.json({ error: "Payload muito grande." }, { status: 413 });
  const credentials = await getAsaasCredentials();
  if (!credentials.webhookToken) return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  const receivedToken = request.headers.get("asaas-access-token") || "";
  if (!safeEqual(receivedToken, credentials.webhookToken)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const raw = await request.text();
  let body: JsonObject;
  try { body = JSON.parse(raw) as JsonObject; } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const event = typeof body.event === "string" ? body.event : "";
  const eventId = typeof body.id === "string" ? body.id : createHash("sha256").update(raw).digest("hex");
  if (!event) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  const firestore = getFirebaseAdminFirestore();
  const eventRef = firestore.collection("paymentWebhookEvents").doc(eventId);
  try {
    await eventRef.create({ provider: "asaas", event, status: "processing", receivedAt: FieldValue.serverTimestamp() });
  } catch {
    if ((await eventRef.get()).exists) return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "Falha temporária no registro." }, { status: 500 });
  }
  try {
    if (event.startsWith("PAYMENT_")) await processPaymentEvent(event, body.payment as JsonObject | undefined);
    if (event.startsWith("PIX_AUTOMATIC_RECURRING_AUTHORIZATION_")) await processPixAuthorization(event, body.authorization as JsonObject | undefined);
    await eventRef.set({ status: "processed", processedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ received: true });
  } catch (error) {
    await eventRef.delete().catch(() => undefined);
    console.error("Falha ao processar webhook Asaas", event, error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Falha temporária no processamento." }, { status: 500 });
  }
}

function safeEqual(left: string, right: string) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
