"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { createSupportTicket, replySupportTicket, updateSupportTicket } from "@/core/admin/support-service";
import { updateSupportSubjects } from "@/core/admin/support-settings-service";

export type SupportActionState = { success?: string; error?: string; ticketId?: string };
const ticketIdSchema = z.string().min(1).max(128);
const createSchema = z.object({ requesterUid: z.string().trim().max(128), requesterName: z.string().trim().min(2).max(80), requesterEmail: z.string().trim().email().or(z.literal("")), subject: z.string().trim().min(5).max(140), description: z.string().trim().min(10).max(4000), category: z.enum(["technical", "billing", "account", "gameplay", "other"]), priority: z.enum(["low", "normal", "high", "urgent"]) });

export async function createTicketAction(_state: SupportActionState, formData: FormData): Promise<SupportActionState> {
  try {
    const staff = await requirePermission("support.manage");
    const parsed = createSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revise os dados do chamado." };
    const actorName = typeof staff.profile.displayName === "string" ? staff.profile.displayName : staff.user.email ?? "Equipe";
    const ticketId = await createSupportTicket(parsed.data, staff.user.uid, actorName);
    revalidatePath("/admin/atendimento");
    return { success: "Chamado criado.", ticketId };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível criar o chamado." }; }
}

const updateSchema = z.object({ status: z.enum(["open", "in_progress", "waiting_user", "resolved", "closed"]), priority: z.enum(["low", "normal", "high", "urgent"]), assignedTo: z.string().trim().max(128) });
export async function updateTicketAction(ticketId: string, _state: SupportActionState, formData: FormData): Promise<SupportActionState> {
  try {
    ticketIdSchema.parse(ticketId);
    const staff = await requirePermission("support.manage");
    const parsed = updateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "Revise o status, a prioridade e o responsável." };
    await updateSupportTicket(ticketId, parsed.data, staff.user.uid);
    revalidatePath(`/admin/atendimento/${ticketId}`);
    revalidatePath("/admin/atendimento");
    return { success: "Chamado atualizado." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível atualizar o chamado." }; }
}

const replySchema = z.object({ body: z.string().trim().min(2).max(4000), internal: z.enum(["on"]).optional() });
export async function replyTicketAction(ticketId: string, _state: SupportActionState, formData: FormData): Promise<SupportActionState> {
  try {
    ticketIdSchema.parse(ticketId);
    const staff = await requirePermission("support.manage");
    const parsed = replySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "A mensagem deve ter entre 2 e 4.000 caracteres." };
    const actorName = typeof staff.profile.displayName === "string" ? staff.profile.displayName : staff.user.email ?? "Equipe";
    await replySupportTicket(ticketId, parsed.data.body, parsed.data.internal === "on", staff.user.uid, actorName);
    revalidatePath(`/admin/atendimento/${ticketId}`);
    revalidatePath("/admin/atendimento");
    return { success: parsed.data.internal === "on" ? "Nota interna adicionada." : "Resposta registrada." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível enviar a resposta." }; }
}

const settingsSchema = z.object({ subjects: z.string().trim().min(2).max(3000) });
export async function updateSupportSettingsAction(_state: SupportActionState, formData: FormData): Promise<SupportActionState> {
  try {
    const staff = await requirePermission("support.manage");
    const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "Informe ao menos um assunto para o atendimento." };
    const labels = parsed.data.subjects.split("\n").map((item) => item.trim()).filter(Boolean);
    const subjects = [...new Set(labels)].slice(0, 30).map((label, index) => ({ id: `${label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 45) || "assunto"}-${index + 1}`, label: label.slice(0, 100), active: true }));
    await updateSupportSubjects(subjects, staff.user.uid);
    revalidatePath("/admin/atendimento");
    revalidatePath("/ajuda");
    return { success: "Assuntos do atendimento atualizados." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível salvar as configurações." }; }
}
