import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import type { BillingCycle } from "./payment-gateway";

export type Coupon = {
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
  maxRedemptions: number;
  redemptions: number;
  expiresAt: string | null;
  planIds: string[];
  cycles: BillingCycle[];
};

export function normalizeCouponCode(value: string) { return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30); }

function readCoupon(id: string, data: FirebaseFirestore.DocumentData): Coupon {
  return {
    code: id,
    description: typeof data.description === "string" ? data.description : "",
    discountType: data.discountType === "fixed" ? "fixed" : "percent",
    discountValue: typeof data.discountValue === "number" ? data.discountValue : 0,
    active: data.active === true,
    maxRedemptions: typeof data.maxRedemptions === "number" ? data.maxRedemptions : 0,
    redemptions: typeof data.redemptions === "number" ? data.redemptions : 0,
    expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : null,
    planIds: Array.isArray(data.planIds) ? data.planIds.filter((item: unknown): item is string => typeof item === "string") : [],
    cycles: Array.isArray(data.cycles) ? data.cycles.filter((item: unknown): item is BillingCycle => item === "monthly" || item === "annual") : ["monthly", "annual"],
  };
}

export async function listCoupons() {
  const snapshot = await getFirebaseAdminFirestore().collection("coupons").orderBy("createdAt", "desc").limit(200).get();
  return snapshot.docs.map((document) => readCoupon(document.id, document.data()));
}

export async function saveCoupon(coupon: Omit<Coupon, "redemptions">, actorUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("coupons").doc(coupon.code);
  const previous = await reference.get();
  const batch = firestore.batch();
  batch.set(reference, {
    ...coupon,
    code: coupon.code,
    redemptions: previous.data()?.redemptions ?? 0,
    expiresAt: coupon.expiresAt ? Timestamp.fromDate(new Date(coupon.expiresAt)) : null,
    createdAt: previous.data()?.createdAt ?? FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: actorUid,
  }, { merge: true });
  batch.create(firestore.collection("adminAuditLogs").doc(), { actorUid, action: "coupon.updated", targetType: "coupon", targetId: coupon.code, before: previous.exists ? previous.data() : null, after: coupon, createdAt: FieldValue.serverTimestamp() });
  await batch.commit();
}

export async function validateCoupon(codeValue: string, planId: string, cycle: BillingCycle, amountCents: number) {
  const code = normalizeCouponCode(codeValue);
  if (!code) return { code: "", discountCents: 0, finalAmountCents: amountCents };
  const document = await getFirebaseAdminFirestore().collection("coupons").doc(code).get();
  if (!document.exists) throw new Error("Cupom não encontrado.");
  const coupon = readCoupon(document.id, document.data()!);
  if (!coupon.active) throw new Error("Este cupom não está ativo.");
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) < Date.now()) throw new Error("Este cupom expirou.");
  if (coupon.maxRedemptions > 0 && coupon.redemptions >= coupon.maxRedemptions) throw new Error("Este cupom atingiu o limite de utilizações.");
  if (coupon.planIds.length && !coupon.planIds.includes(planId)) throw new Error("Este cupom não é válido para o plano selecionado.");
  if (!coupon.cycles.includes(cycle)) throw new Error("Este cupom não é válido para esta periodicidade.");
  const discountCents = coupon.discountType === "percent" ? Math.round(amountCents * Math.min(coupon.discountValue, 100) / 100) : Math.round(coupon.discountValue * 100);
  return { code, discountCents: Math.min(discountCents, Math.max(0, amountCents - 100)), finalAmountCents: Math.max(100, amountCents - discountCents) };
}
