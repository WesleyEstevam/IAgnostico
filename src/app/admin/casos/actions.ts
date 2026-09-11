"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClinicalCaseDraft, setClinicalCaseStatus } from "@/core/admin/clinical-case-admin-service";
import { requireAdmin } from "@/core/admin/admin-service";

export type CaseFormState = { success?: string; error?: string };

const caseSchema = z.object({
  specialty: z.enum(["cardiologia", "clinica-geral", "infectologia", "pediatria", "ginecologia-obstetricia", "anestesiologia", "ortopedia", "radiologia", "oncologia", "dermatologia"]),
  difficulty: z.enum(["facil", "intermediario", "dificil"]),
  title: z.string().trim().min(8).max(160),
  setting: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(20).max(600),
  patientName: z.string().trim().min(2).max(60),
  patientAge: z.coerce.number().int().min(1).max(120),
  patientAvatar: z.string().trim().min(1).max(8),
  opening: z.string().trim().min(10).max(500),
  clue: z.string().trim().min(10).max(500),
  fallbackReply: z.string().trim().min(10).max(500),
  exams: z.string().trim().min(5),
  durationMinutes: z.coerce.number().int().min(2).max(30),
  maxXp: z.coerce.number().int().min(50).max(1000),
  diagnosis: z.string().trim().min(3).max(160),
  diagnosisAliases: z.string().trim().min(3),
  partialDiagnosisAliases: z.string().trim(),
  feedback: z.string().trim().min(20).max(1000),
  sourceRefs: z.string().trim().min(10),
});

const splitList = (value: string) => value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);

export async function createCaseAction(_previous: CaseFormState, formData: FormData): Promise<CaseFormState> {
  try {
    const admin = await requireAdmin();
    const parsed = caseSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revise os campos do caso." };
    const input = parsed.data;
    const exams = input.exams.split("\n").map((line) => {
      const [name, ...resultParts] = line.split("|");
      return { name: name?.trim() ?? "", result: resultParts.join("|").trim() };
    }).filter((exam) => exam.name && exam.result);
    if (!exams.length) return { error: "Informe ao menos um exame no formato Nome | Resultado." };
    const sourceRefs = splitList(input.sourceRefs);
    if (sourceRefs.some((source) => !z.string().url().safeParse(source).success || !/^https?:\/\//i.test(source))) {
      return { error: "Informe referências válidas iniciadas por http:// ou https://." };
    }

    await createClinicalCaseDraft({
      schemaVersion: 1,
      status: "draft",
      specialty: input.specialty,
      difficulty: input.difficulty,
      title: input.title,
      setting: input.setting,
      summary: input.summary,
      patient: { name: input.patientName, age: input.patientAge, avatar: input.patientAvatar },
      initialMessages: [
        { who: "patient", text: input.opening },
        { who: "you", text: "Conte um pouco mais sobre o início dos sintomas e outros sinais associados." },
        { who: "patient", text: input.clue },
      ],
      fallbackReply: input.fallbackReply,
      exams,
      durationSeconds: input.durationMinutes * 60,
      maxXp: input.maxXp,
      diagnosis: input.diagnosis,
      diagnosisAliases: splitList(input.diagnosisAliases),
      partialDiagnosisAliases: splitList(input.partialDiagnosisAliases),
      feedback: input.feedback,
      sourceRefs,
    }, admin.uid);
    revalidatePath("/admin/casos");
    return { success: "Caso salvo como rascunho. Revise-o antes de publicar." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível salvar o caso." };
  }
}

export async function changeCaseStatusAction(caseId: string, status: "draft" | "published" | "archived") {
  const admin = await requireAdmin();
  if (!z.string().min(1).max(150).safeParse(caseId).success) throw new Error("Caso inválido.");
  await setClinicalCaseStatus(caseId, status, admin.uid);
  revalidatePath("/admin/casos");
}
