"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { normalizeCouponCode, saveCoupon } from "@/core/payments/coupon-service";

export type CouponActionState = { success?: string; error?: string };
const schema = z.object({ code: z.string().trim().min(3).max(30), description: z.string().trim().min(3).max(140), discountType: z.enum(["percent", "fixed"]), discountValue: z.coerce.number().positive().max(100000), active: z.enum(["on"]).optional(), maxRedemptions: z.coerce.number().int().min(0).max(1_000_000), expiresAt: z.string().trim(), planIds: z.string().trim().max(500), monthly: z.enum(["on"]).optional(), annual: z.enum(["on"]).optional() }).refine((data) => data.monthly === "on" || data.annual === "on", { message: "Selecione ao menos uma periodicidade." }).refine((data) => data.discountType !== "percent" || data.discountValue <= 100, { message: "O desconto percentual não pode ultrapassar 100%." });

export async function saveCouponAction(_state: CouponActionState, formData: FormData): Promise<CouponActionState> {
  try {
    const staff = await requirePermission("plans.manage");
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revise o cupom." };
    const data = parsed.data;
    const code = normalizeCouponCode(data.code);
    if (code.length < 3) return { error: "Use um código com ao menos 3 caracteres válidos." };
    if (data.expiresAt && Number.isNaN(Date.parse(`${data.expiresAt}T23:59:59-03:00`))) return { error: "Informe uma data de expiração válida." };
    await saveCoupon({ code, description: data.description, discountType: data.discountType, discountValue: data.discountValue, active: data.active === "on", maxRedemptions: data.maxRedemptions, expiresAt: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59-03:00`).toISOString() : null, planIds: [...new Set(data.planIds.split(/[\n,]/).map((item) => item.trim().toLowerCase()).filter(Boolean))].slice(0, 30), cycles: [...(data.monthly === "on" ? ["monthly" as const] : []), ...(data.annual === "on" ? ["annual" as const] : [])] }, staff.user.uid);
    revalidatePath("/admin/cupons");
    return { success: `Cupom ${code} salvo.` };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível salvar o cupom." }; }
}
