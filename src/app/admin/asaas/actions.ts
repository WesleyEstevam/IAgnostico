"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { updateAsaasSettings } from "@/core/payments/payment-settings-service";
import { syncAsaasWebhook } from "@/infrastructure/payments/asaas-gateway";
import { getApplicationSettings } from "@/core/admin/application-settings-service";

export type AsaasActionState = { success?: string; error?: string };
const schema = z.object({ enabled: z.enum(["on"]).optional(), environment: z.enum(["sandbox", "production"]), apiKey: z.string().trim().max(500), webhookToken: z.string().trim().max(255).refine((value) => !value || (value.length >= 32 && !/\s/.test(value)), "O token do webhook deve ter ao menos 32 caracteres e não pode conter espaços.") });

export async function updateAsaasSettingsAction(_state: AsaasActionState, formData: FormData): Promise<AsaasActionState> {
  try {
    const staff = await requirePermission("settings.manage");
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revise as configurações do Asaas." };
    await updateAsaasSettings({ enabled: parsed.data.enabled === "on", environment: parsed.data.environment, apiKey: parsed.data.apiKey || undefined, webhookToken: parsed.data.webhookToken || undefined }, staff.user.uid);
    revalidatePath("/admin/asaas");
    return { success: "Configurações do Asaas atualizadas." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível salvar a integração." }; }
}

export async function syncAsaasWebhookAction(state: AsaasActionState): Promise<AsaasActionState> {
  try {
    void state;
    await requirePermission("settings.manage");
    const application = await getApplicationSettings();
    const webhookUrl = `${application.publicUrl.replace(/\/$/, "")}/api/webhooks/asaas`;
    const result = await syncAsaasWebhook(webhookUrl, application.supportEmail);
    revalidatePath("/admin/asaas");
    return { success: `Conta ${result.account.name} conectada e webhook sincronizado (${result.webhookId}).` };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível sincronizar o webhook." }; }
}
