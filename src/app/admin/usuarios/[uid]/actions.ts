"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { createAdminPasswordResetLink, updateAdminUserPlan, updateAdminUserProfile, updateAdminUserStatus } from "@/core/admin/admin-user-service";

export type UserActionState = { success?: string; error?: string; resetLink?: string };
const uidSchema = z.string().min(1).max(128);
const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/).or(z.literal("")),
  university: z.string().trim().max(120),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  gender: z.enum(["", "masculino", "feminino", "outro", "nao-informar"]),
});

export async function updateUserProfileAction(uid: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  try {
    uidSchema.parse(uid);
    const staff = await requirePermission("users.manage");
    const parsed = profileSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "Revise os dados. O telefone deve incluir o código do país, como +5571999999999." };
    const data = parsed.data;
    await updateAdminUserProfile(uid, { displayName: data.displayName, phone: data.phone || null, university: data.university || null, birthDate: data.birthDate || null, gender: data.gender || null }, staff.user.uid);
    revalidatePath(`/admin/usuarios/${uid}`);
    revalidatePath("/admin/usuarios");
    return { success: "Dados do usuário atualizados." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível atualizar o usuário." };
  }
}

export async function updateUserPlanAction(uid: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  try {
    uidSchema.parse(uid);
    const staff = await requirePermission("plans.manage");
    const plan = z.enum(["free", "pro"]).parse(formData.get("plan"));
    await updateAdminUserPlan(uid, plan, staff.user.uid);
    revalidatePath(`/admin/usuarios/${uid}`);
    return { success: `Plano alterado para ${plan === "pro" ? "Pro" : "Gratuito"}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível alterar o plano." };
  }
}

export async function updateUserStatusAction(uid: string, _state: UserActionState, formData: FormData): Promise<UserActionState> {
  try {
    uidSchema.parse(uid);
    const staff = await requirePermission("users.manage");
    const disabled = z.enum(["true", "false"]).parse(formData.get("disabled")) === "true";
    await updateAdminUserStatus(uid, disabled, staff.user.uid);
    revalidatePath(`/admin/usuarios/${uid}`);
    return { success: disabled ? "Conta desativada." : "Conta reativada." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível alterar o status." };
  }
}

export async function createPasswordResetAction(uid: string, state: UserActionState): Promise<UserActionState> {
  void state;
  try {
    uidSchema.parse(uid);
    const staff = await requirePermission("users.manage");
    const resetLink = await createAdminPasswordResetLink(uid, staff.user.uid);
    return { success: "Link seguro gerado. Ele expira conforme as regras do Firebase.", resetLink };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível gerar o link." };
  }
}
