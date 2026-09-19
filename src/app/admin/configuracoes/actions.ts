"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { updateApplicationSettings } from "@/core/admin/application-settings-service";

export type SettingsActionState = { success?: string; error?: string };

const optionalUrl = z.string().trim().max(300).refine(
  (value) => !value || z.string().url().safeParse(value).success,
  "Informe uma URL válida ou deixe o campo vazio.",
);
const schema = z.object({
  productName: z.string().trim().min(2).max(80),
  legalName: z.string().trim().min(2).max(160),
  supportEmail: z.string().trim().email().max(160),
  publicUrl: z.string().trim().url().max(300),
  adminUrl: z.string().trim().url().max(300),
  locale: z.literal("pt-BR"),
  timezone: z.enum(["America/Bahia", "America/Fortaleza", "America/Sao_Paulo"]),
  registrationsEnabled: z.enum(["on"]).optional(),
  announcementEnabled: z.enum(["on"]).optional(),
  announcementText: z.string().trim().max(180),
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  youtubeUrl: optionalUrl,
}).superRefine((data, context) => {
  if (data.announcementEnabled === "on" && data.announcementText.length < 3) {
    context.addIssue({ code: "custom", path: ["announcementText"], message: "Escreva o aviso antes de publicá-lo." });
  }
});

export async function updateApplicationSettingsAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  try {
    const staff = await requirePermission("settings.manage");
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revise as configurações." };
    const data = parsed.data;
    await updateApplicationSettings({
      ...data,
      locale: "pt-BR",
      registrationsEnabled: data.registrationsEnabled === "on",
      announcementEnabled: data.announcementEnabled === "on",
    }, staff.user.uid);
    revalidatePath("/", "layout");
    revalidatePath("/admin/configuracoes");
    revalidatePath("/registro");
    return { success: "Configurações gerais atualizadas." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível salvar as configurações." };
  }
}
