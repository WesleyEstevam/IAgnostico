import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export type PlanId = string;
export type PublicPlan = {
  id: PlanId;
  name: string;
  priceCents: number;
  priceSuffix: string;
  description: string;
  features: string[];
  ctaLabel: string;
  badge: string;
  highlighted: boolean;
  active: boolean;
  dailyShifts: number;
  annualDiscountPercent: number;
  order: number;
};

export const DEFAULT_PLANS: Record<"free" | "pro", PublicPlan> = {
  free: { id: "free", name: "Gratuito", priceCents: 0, priceSuffix: "para sempre", description: "Comece sem cartão de crédito.", features: ["3 casos por dia", "XP, streak e ranking", "3 especialidades"], ctaLabel: "Começar grátis", badge: "", highlighted: false, active: true, dailyShifts: 3, annualDiscountPercent: 0, order: 0 },
  pro: { id: "pro", name: "Pro", priceCents: 4990, priceSuffix: "/mês", description: "Cancele quando quiser", features: ["10 casos por dia", "+10 especialidades", "Feedback avançado da IA", "Trilha personalizada de residência", "Análise de imagens"], ctaLabel: "Assinar Pro", badge: "Mais popular", highlighted: true, active: true, dailyShifts: 10, annualDiscountPercent: 20, order: 1 },
};

function string(value: unknown, fallback: string) { return typeof value === "string" ? value : fallback; }
function boolean(value: unknown, fallback: boolean) { return typeof value === "boolean" ? value : fallback; }
function integer(value: unknown, fallback: number) { return typeof value === "number" && Number.isInteger(value) ? value : fallback; }

function readPlan(id: PlanId, data: FirebaseFirestore.DocumentData | undefined, fallback?: PublicPlan): PublicPlan {
  const base = fallback ?? { ...DEFAULT_PLANS.pro, id, name: "Novo plano", badge: "", highlighted: false, order: 99 };
  return {
    id,
    name: string(data?.name, base.name),
    priceCents: integer(data?.priceCents, base.priceCents),
    priceSuffix: string(data?.priceSuffix, base.priceSuffix),
    description: string(data?.description, base.description),
    features: Array.isArray(data?.features) ? data.features.filter((item: unknown): item is string => typeof item === "string").slice(0, 12) : base.features,
    ctaLabel: string(data?.ctaLabel, base.ctaLabel),
    badge: string(data?.badge, base.badge),
    highlighted: boolean(data?.highlighted, base.highlighted),
    active: boolean(data?.active, base.active),
    dailyShifts: integer(data?.dailyShifts, base.dailyShifts),
    annualDiscountPercent: integer(data?.annualDiscountPercent, base.annualDiscountPercent),
    order: integer(data?.order, base.order),
  };
}

export async function getPublicPlans() {
  const firestore = getFirebaseAdminFirestore();
  const snapshot = await firestore.collection("plans").get();
  const stored = new Map(snapshot.docs.map((document) => [document.id, document.data()]));
  const plans = [
    readPlan("free", stored.get("free"), DEFAULT_PLANS.free),
    readPlan("pro", stored.get("pro"), DEFAULT_PLANS.pro),
    ...snapshot.docs.filter((document) => document.id !== "free" && document.id !== "pro").map((document) => readPlan(document.id, document.data())),
  ];
  return plans.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "pt-BR"));
}

export async function getPlanShiftLimits() {
  const plans = await getPublicPlans();
  return { free: plans.find((plan) => plan.id === "free")?.dailyShifts ?? 3, pro: plans.find((plan) => plan.id === "pro")?.dailyShifts ?? 10 };
}

export async function getPlansAdminOverview() {
  const firestore = getFirebaseAdminFirestore();
  const [plans, proUsers] = await Promise.all([
    getPublicPlans(),
    firestore.collection("users").where("plan", "==", "pro").get(),
  ]);
  const subscriptions = proUsers.docs.map((document) => {
    const data = document.data();
    return {
      uid: document.id,
      displayName: string(data.displayName, "Jogador"),
      email: typeof data.email === "string" ? data.email : null,
      status: string(data.subscriptionStatus, "manual"),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
    };
  }).sort((a, b) => (Date.parse(b.updatedAt ?? "") || 0) - (Date.parse(a.updatedAt ?? "") || 0));
  const active = subscriptions.filter((item) => ["active", "trialing", "manual"].includes(item.status)).length;
  return { plans, subscriptions, metrics: { proUsers: subscriptions.length, active, attention: subscriptions.length - active } };
}

export async function updatePlan(plan: PublicPlan, actorUid: string, createOnly = false) {
  const firestore = getFirebaseAdminFirestore();
  const planRef = firestore.collection("plans").doc(plan.id);
  const previous = await planRef.get();
  if (createOnly && previous.exists) throw new Error("Já existe um plano com esse identificador.");
  const batch = firestore.batch();
  batch.set(planRef, { ...plan, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorUid }, { merge: true });
  batch.create(firestore.collection("adminAuditLogs").doc(), { actorUid, action: "plan.updated", targetType: "plan", targetId: plan.id, before: previous.exists ? previous.data() : null, after: plan, createdAt: FieldValue.serverTimestamp() });
  await batch.commit();
}
