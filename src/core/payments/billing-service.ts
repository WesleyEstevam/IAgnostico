import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getPublicPlans } from "@/core/admin/plan-admin-service";
import { getPaymentGateway } from "@/infrastructure/payments/asaas-gateway";
import { validateCoupon } from "./coupon-service";
import type { BillingCycle, BillingIdentity, CardData, PaymentMethod } from "./payment-gateway";
import { getAsaasCredentials } from "./payment-settings-service";

export const CHECKOUT_DURATION_MS = 15 * 60_000;

export async function getCheckoutPlan(planId: string, cycle: BillingCycle) {
  const plan = (await getPublicPlans()).find((item) => item.id === planId && item.active);
  if (!plan || plan.priceCents <= 0) throw new Error("Plano pago não encontrado.");
  const amountCents = cycle === "annual" ? Math.round(plan.priceCents * 12 * (100 - plan.annualDiscountPercent) / 100) : plan.priceCents;
  return { plan, amountCents };
}

export async function previewCheckout(planId: string, cycle: BillingCycle, couponCode = "") {
  const { plan, amountCents } = await getCheckoutPlan(planId, cycle);
  const discount = await validateCoupon(couponCode, planId, cycle, amountCents);
  return { plan, cycle, originalAmountCents: amountCents, ...discount };
}

export async function createCheckout(input: { uid: string; planId: string; cycle: BillingCycle; method: PaymentMethod; couponCode: string; identity: BillingIdentity; card?: CardData; remoteIp: string; testMode?: boolean }) {
  const summary = await previewCheckout(input.planId, input.cycle, input.couponCode);
  if (input.method === "credit_card" && !input.card) throw new Error("Informe os dados do cartão.");
  const firestore = getFirebaseAdminFirestore();
  const userRef = firestore.collection("users").doc(input.uid);
  const userDocument = await userRef.get();
  if (!userDocument.exists) throw new Error("Cadastro do jogador não encontrado.");
  const gateway = await getPaymentGateway("asaas", { allowDisabledSandbox: input.testMode === true });
  const providerSettings = await getAsaasCredentials();
  if (input.testMode && providerSettings.environment !== "sandbox") throw new Error("O checkout administrativo só pode ser usado no ambiente Sandbox.");
  const environment = providerSettings.environment;
  let customerId = typeof userDocument.data()?.billing?.asaasCustomers?.[environment] === "string" ? userDocument.data()!.billing.asaasCustomers[environment] as string : "";
  if (!customerId) {
    customerId = await gateway.createCustomer({ ...input.identity, externalReference: input.uid });
    await userRef.set({ billing: { asaasCustomers: { [environment]: customerId }, updatedAt: FieldValue.serverTimestamp() } }, { merge: true });
  }
  const checkoutId = randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + CHECKOUT_DURATION_MS);
  await firestore.collection("checkoutSessions").doc(checkoutId).create({ uid: input.uid, planId: input.planId, cycle: input.cycle, method: input.method, provider: gateway.provider, environment, testMode: input.testMode === true, status: "processing", couponCode: summary.code || null, originalAmountCents: summary.originalAmountCents, discountCents: summary.discountCents, amountCents: summary.finalAmountCents, createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromDate(expiresAt) });
  try {
    const common = { customerId, amountCents: summary.finalAmountCents, cycle: input.cycle, description: `${summary.plan.name} ${input.cycle === "annual" ? "Anual" : "Mensal"}`, externalReference: checkoutId, identity: input.identity, remoteIp: input.remoteIp };
    const result = input.method === "credit_card" ? await gateway.createCardSubscription({ ...common, card: input.card! }) : await gateway.createPixAutomaticSubscription(common);
    const subscriptionRef = firestore.collection("subscriptions").doc(checkoutId);
    const batch = firestore.batch();
    batch.set(subscriptionRef, { uid: input.uid, planId: input.planId, cycle: input.cycle, method: input.method, provider: gateway.provider, environment, testMode: input.testMode === true, providerSubscriptionId: result.providerSubscriptionId, providerPaymentId: result.providerPaymentId, status: result.status.toLowerCase(), couponCode: summary.code || null, amountCents: summary.finalAmountCents, startedAt: FieldValue.serverTimestamp(), currentPeriodEnd: null, cancelAtPeriodEnd: false, updatedAt: FieldValue.serverTimestamp() });
    batch.update(firestore.collection("checkoutSessions").doc(checkoutId), { status: input.method === "credit_card" ? "awaiting_confirmation" : "awaiting_pix_authorization", providerSubscriptionId: result.providerSubscriptionId, providerPaymentId: result.providerPaymentId, qrCodePayload: result.qrCodePayload ?? null, qrCodeImage: result.qrCodeImage ?? null, providerExpiresAt: result.expiresAt ?? null, updatedAt: FieldValue.serverTimestamp() });
    if (!input.testMode) batch.set(userRef, { billing: { currentSubscriptionId: checkoutId, updatedAt: FieldValue.serverTimestamp() } }, { merge: true });
    await batch.commit();
    return { checkoutId, expiresAt: expiresAt.toISOString(), method: input.method, status: result.status, qrCodePayload: result.qrCodePayload, qrCodeImage: result.qrCodeImage };
  } catch (error) {
    await firestore.collection("checkoutSessions").doc(checkoutId).set({ status: "failed", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    throw error;
  }
}

export async function getPlayerBilling(uid: string) {
  const firestore = getFirebaseAdminFirestore();
  const userDocument = await firestore.collection("users").doc(uid).get();
  const subscriptionId = typeof userDocument.data()?.billing?.currentSubscriptionId === "string" ? userDocument.data()!.billing.currentSubscriptionId as string : "";
  const [subscriptionDocument, paymentSnapshot] = await Promise.all([
    subscriptionId ? firestore.collection("subscriptions").doc(subscriptionId).get() : Promise.resolve(null),
    firestore.collection("users").doc(uid).collection("billingPayments").orderBy("createdAt", "desc").limit(50).get(),
  ]);
  let subscription = subscriptionDocument?.exists ? serializeDocument(subscriptionDocument) : null;
  if (subscription?.cancelAtPeriodEnd === true && typeof subscription.currentPeriodEnd === "string" && Date.parse(subscription.currentPeriodEnd) <= Date.now()) {
    await Promise.all([
      firestore.collection("users").doc(uid).set({ plan: "free", subscriptionStatus: "cancelled", updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
      subscriptionDocument!.ref.set({ status: "cancelled", updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
    ]);
    subscription = { ...subscription, status: "cancelled" };
  }
  return { planId: typeof userDocument.data()?.plan === "string" ? userDocument.data()!.plan as string : "free", subscription, payments: paymentSnapshot.docs.map(serializeDocument) };
}

export async function hasActiveProAccess(uid: string, userData?: FirebaseFirestore.DocumentData) {
  const firestore = getFirebaseAdminFirestore();
  const data = userData ?? (await firestore.collection("users").doc(uid).get()).data();
  if (data?.plan !== "pro") return false;
  const subscriptionId = typeof data?.billing?.currentSubscriptionId === "string" ? data.billing.currentSubscriptionId as string : "";
  if (!subscriptionId) return true;
  const subscription = await firestore.collection("subscriptions").doc(subscriptionId).get(); const details = subscription.data();
  if (!subscription.exists || ["cancelled", "refunded", "refund_requested"].includes(details?.status)) {
    await firestore.collection("users").doc(uid).set({ plan: "free", subscriptionStatus: details?.status ?? "cancelled", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return false;
  }
  if (details?.cancelAtPeriodEnd === true && details.currentPeriodEnd instanceof Timestamp && details.currentPeriodEnd.toMillis() <= Date.now()) {
    await Promise.all([firestore.collection("users").doc(uid).set({ plan: "free", subscriptionStatus: "cancelled", updatedAt: FieldValue.serverTimestamp() }, { merge: true }), subscription.ref.set({ status: "cancelled", updatedAt: FieldValue.serverTimestamp() }, { merge: true })]);
    return false;
  }
  return true;
}

export async function cancelPlayerSubscription(uid: string, mode: "period_end" | "refund") {
  const firestore = getFirebaseAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const userDocument = await userRef.get();
  const subscriptionId = typeof userDocument.data()?.billing?.currentSubscriptionId === "string" ? userDocument.data()!.billing.currentSubscriptionId as string : "";
  if (!subscriptionId) throw new Error("Você não possui uma assinatura ativa.");
  const subscriptionRef = firestore.collection("subscriptions").doc(subscriptionId);
  const subscriptionDocument = await subscriptionRef.get();
  const data = subscriptionDocument.data();
  if (!subscriptionDocument.exists || typeof data?.providerSubscriptionId !== "string") throw new Error("Assinatura não encontrada.");
  const method: PaymentMethod = data.method === "pix_automatic" ? "pix_automatic" : "credit_card";
  const gateway = await getPaymentGateway(typeof data.provider === "string" ? data.provider : "asaas");
  if (mode === "refund") {
    const latest = await userRef.collection("billingPayments").orderBy("createdAt", "desc").limit(50).get();
    const payment = latest.docs.filter((document) => ["CONFIRMED", "RECEIVED"].includes(document.data().status)).map((document) => ({ document, data: document.data(), time: document.data().paidAt instanceof Timestamp ? document.data().paidAt.toMillis() : document.data().createdAt instanceof Timestamp ? document.data().createdAt.toMillis() : 0 })).sort((a, b) => b.time - a.time)[0];
    if (!payment || Date.now() - payment.time > 7 * 24 * 60 * 60_000) throw new Error("O prazo de 7 dias corridos para solicitar reembolso terminou.");
    const providerPaymentId = typeof payment.data.providerPaymentId === "string" ? payment.data.providerPaymentId : payment.document.id;
    await gateway.refundPayment(providerPaymentId);
    await gateway.cancelSubscription(data.providerSubscriptionId, method);
    const batch = firestore.batch();
    batch.set(subscriptionRef, { status: "refund_requested", cancelledAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(userRef, { plan: "free", subscriptionStatus: "refund_requested", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(payment.document.ref, { status: "REFUND_REQUESTED", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit();
    return { message: "Cancelamento e reembolso solicitados." };
  }
  await gateway.cancelSubscription(data.providerSubscriptionId, method);
  const start = data.currentPeriodStart instanceof Timestamp ? data.currentPeriodStart.toDate() : new Date();
  const periodEnd = data.currentPeriodEnd instanceof Timestamp ? data.currentPeriodEnd.toDate() : addCycle(start, data.cycle === "annual" ? "annual" : "monthly");
  await subscriptionRef.set({ cancelAtPeriodEnd: true, status: "cancelling", currentPeriodEnd: Timestamp.fromDate(periodEnd), cancelledAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { message: `Sua assinatura permanecerá ativa até ${periodEnd.toLocaleDateString("pt-BR", { timeZone: "America/Bahia" })}.` };
}

function serializeDocument(document: FirebaseFirestore.DocumentSnapshot): Record<string, unknown> & { id: string } {
  const data = document.data() ?? {};
  return { id: document.id, ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof Timestamp ? value.toDate().toISOString() : value])) };
}

function addCycle(date: Date, cycle: BillingCycle) { const result = new Date(date); if (cycle === "annual") result.setFullYear(result.getFullYear() + 1); else result.setMonth(result.getMonth() + 1); return result; }
