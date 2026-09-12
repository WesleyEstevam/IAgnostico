"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { updatePlan } from "@/core/admin/plan-admin-service";

export type PlanActionState = { success?: string; error?: string };

const schema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]{2,40}$/),
  mode: z.enum(["create", "update"]),
  name: z.string().trim().min(2).max(40),
  price: z.coerce.number().min(0).max(9999),
  priceSuffix: z.string().trim().max(30),
  description: z.string().trim().min(3).max(140),
  dailyShifts: z.coerce.number().int().min(1).max(100),
  annualDiscountPercent: z.coerce.number().int().min(0).max(90),
  order: z.coerce.number().int().min(0).max(100),
  features: z.string().trim().min(3).max(1000),
  ctaLabel: z.string().trim().min(2).max(40),
  badge: z.string().trim().max(30),
  active: z.enum(["on"]).optional(),
  highlighted: z.enum(["on"]).optional(),
});

export async function updatePlanAction(_state: PlanActionState, formData: FormData): Promise<PlanActionState> {
  try {
    const staff = await requirePermission("plans.manage");
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revise os dados do plano." };
    const data = parsed.data;
    const features = data.features.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!features.length) return { error: "Informe ao menos um benefício." };
    await updatePlan({ id: data.id, name: data.name, priceCents: Math.round(data.price * 100), priceSuffix: data.priceSuffix, description: data.description, dailyShifts: data.dailyShifts, annualDiscountPercent: data.annualDiscountPercent, order: data.order, features, ctaLabel: data.ctaLabel, badge: data.badge, active: data.active === "on", highlighted: data.highlighted === "on" }, staff.user.uid, data.mode === "create");
    revalidatePath("/");
    revalidatePath("/admin/planos");
    return { success: `Plano ${data.name} atualizado. A landing page já recebeu a nova configuração.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível atualizar o plano." };
  }
}
