import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAsaasCredentials } from "@/core/payments/payment-settings-service";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getPublicPlans } from "@/core/admin/plan-admin-service";

type JsonObject = Record<string, unknown>;
const successfulPayments = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);

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

async function processPaymentEvent(event: string, payment?: JsonObject) {
  if (!payment || typeof payment.id !== "string") return;
  const firestore = getFirebaseAdminFirestore();
  let checkoutId = typeof payment.externalReference === "string" ? payment.externalReference : "";
  if (!checkoutId && typeof payment.subscription === "string") {
    const match = await firestore.collection("subscriptions").where("providerSubscriptionId", "==", payment.subscription).limit(1).get();
    checkoutId = match.docs[0]?.id ?? "";
  }
  if (!checkoutId) return;
  const subscriptionRef = firestore.collection("subscriptions").doc(checkoutId);
  const subscriptionDocument = await subscriptionRef.get();
  const subscription = subscriptionDocument.data();
  if (!subscriptionDocument.exists || typeof subscription?.uid !== "string") return;
  const uid = subscription.uid as string;
  const paymentRef = firestore.collection("users").doc(uid).collection("billingPayments").doc(payment.id);
  const paymentDocument = await paymentRef.get();
  const amountCents = typeof payment.value === "number" ? Math.round(payment.value * 100) : subscription.amountCents ?? 0;
  const status = typeof payment.status === "string" ? payment.status : event.replace("PAYMENT_", "");
  const batch = firestore.batch();
  if (subscription.testMode !== true) batch.set(paymentRef, { provider: "asaas", providerPaymentId: payment.id, providerSubscriptionId: payment.subscription ?? subscription.providerSubscriptionId ?? null, checkoutId, description: `Plano ${subscription.planId ?? "IAgnóstico"}`, method: payment.billingType ?? subscription.method ?? null, amountCents, status, paidAt: successfulPayments.has(event) ? FieldValue.serverTimestamp() : null, createdAt: paymentDocument.data()?.createdAt ?? FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  batch.set(subscriptionRef, { providerPaymentId: payment.id, status: status.toLowerCase(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  if (successfulPayments.has(event) && subscription.testMode !== true) {
    const cycle = subscription.cycle === "annual" ? "annual" : "monthly"; const periodStart = new Date(); const periodEnd = new Date(periodStart); if (cycle === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1); else periodEnd.setMonth(periodEnd.getMonth() + 1);
    const plans = await getPublicPlans(); const plan = plans.find((item) => item.id === subscription.planId);
    batch.set(subscriptionRef, { status: "active", currentPeriodStart: Timestamp.fromDate(periodStart), currentPeriodEnd: Timestamp.fromDate(periodEnd), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(firestore.collection("users").doc(uid), { plan: subscription.planId ?? "pro", subscriptionStatus: "active", ...(plan ? { shifts: { current: plan.dailyShifts, max: plan.dailyShifts } } : {}), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(firestore.collection("checkoutSessions").doc(checkoutId), { status: "paid", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    if (!paymentDocument.exists && typeof subscription.couponCode === "string" && subscription.couponCode) batch.set(firestore.collection("coupons").doc(subscription.couponCode), { redemptions: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  if (["PAYMENT_REFUNDED", "PAYMENT_PARTIALLY_REFUNDED"].includes(event) && subscription.testMode !== true) {
    batch.set(subscriptionRef, { status: "refunded", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(firestore.collection("users").doc(uid), { plan: "free", subscriptionStatus: "refunded", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
}

async function processPixAuthorization(event: string, authorization?: JsonObject) {
  if (!authorization || typeof authorization.id !== "string") return;
  const firestore = getFirebaseAdminFirestore();
  const match = await firestore.collection("subscriptions").where("providerSubscriptionId", "==", authorization.id).limit(1).get();
  const subscriptionDocument = match.docs[0]; if (!subscriptionDocument) return; const checkoutId = subscriptionDocument.id; const subscriptionRef = subscriptionDocument.ref; const subscription = subscriptionDocument.data();
  const status = typeof authorization.status === "string" ? authorization.status.toLowerCase() : event.replace("PIX_AUTOMATIC_RECURRING_AUTHORIZATION_", "").toLowerCase();
  const batch = firestore.batch(); batch.set(subscriptionRef, { status, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  if (status === "active" && typeof subscription.uid === "string" && subscription.testMode !== true) {
    const plans = await getPublicPlans(); const plan = plans.find((item) => item.id === subscription.planId); const start = new Date(); const end = new Date(start); if (subscription.cycle === "annual") end.setFullYear(end.getFullYear() + 1); else end.setMonth(end.getMonth() + 1);
    batch.set(subscriptionRef, { currentPeriodStart: Timestamp.fromDate(start), currentPeriodEnd: Timestamp.fromDate(end) }, { merge: true });
    batch.set(firestore.collection("users").doc(subscription.uid), { plan: subscription.planId ?? "pro", subscriptionStatus: "active", ...(plan ? { shifts: { current: plan.dailyShifts, max: plan.dailyShifts } } : {}), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(firestore.collection("checkoutSessions").doc(checkoutId), { status: "paid", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
}

function safeEqual(left: string, right: string) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
