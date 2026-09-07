import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { MAX_PATIENT_CHAT_MESSAGES, type CaseSpecialty, type ClinicalCaseDocument, type PublicClinicalCase } from "./clinical-case-types";

const specialtyLabels: Record<CaseSpecialty, string> = {
  cardiologia: "Cardiologia",
  "clinica-geral": "Clínica Geral",
  infectologia: "Infectologia",
};

const legacyCaseIds: Record<string, string> = {
  "pulmonary-embolism-001": "clinica-geral-tep",
  "cardiologia-disseccao-aorta": "cardiologia-disseccao-aorta",
  "cardiologia-emergencia-hipertensiva": "cardiologia-emergencia-hipertensiva",
  "cardiologia-fibrilacao-atrial": "cardiologia-fibrilacao-atrial-rvr",
  "cardiologia-iam-com-supra": "cardiologia-iam-anterior",
  "cardiologia-insuficiencia-cardiaca": "cardiologia-ic-fer-descompensada",
  "cardiologia-pericardite": "cardiologia-pericardite-aguda",
  "clinica-geral-tromboembolismo-pulmonar": "clinica-geral-tep",
  "clinica-geral-cetoacidose-diabetica": "clinica-geral-cetoacidose-diabetica",
  "clinica-geral-asma-aguda": "clinica-geral-asma-grave",
  "clinica-geral-hemorragia-digestiva-alta": "clinica-geral-hda-ulcera",
  "clinica-geral-avc-isquemico": "clinica-geral-avc-isquemico",
  "clinica-geral-pielonefrite": "clinica-geral-pielonefrite",
  "infectologia-dengue-sinais-alarme": "infectologia-dengue-alarme",
  "infectologia-meningite-bacteriana": "infectologia-meningite-pneumococica",
  "infectologia-tuberculose-pulmonar": "infectologia-tb-pulmonar",
  "infectologia-pneumonia-comunitaria": "infectologia-pneumonia-pneumococica",
  "infectologia-leptospirose": "infectologia-leptospirose",
};

export function resolveClinicalCaseId(caseId: unknown) {
  const value = String(caseId);
  const legacyBase = value.replace(/-\d{2}$/, "");
  return legacyCaseIds[value] ?? legacyCaseIds[legacyBase] ?? value;
}

export class ClinicalCaseNotFoundError extends Error {}

export async function selectPublishedCase(specialty: CaseSpecialty | "aleatorio") {
  const snapshot = await getFirebaseAdminFirestore()
    .collection("clinicalCases")
    .where("status", "==", "published")
    .limit(200)
    .get();
  const available = snapshot.docs.filter((document) => specialty === "aleatorio" || document.data().specialty === specialty);
  if (!available.length) throw new ClinicalCaseNotFoundError();
  return available[Math.floor(Math.random() * available.length)];
}

export async function getPublicGameCase(uid: string, gameId: string): Promise<PublicClinicalCase> {
  const firestore = getFirebaseAdminFirestore();
  const gameSnapshot = await firestore.collection("gameSessions").doc(gameId).get();
  if (!gameSnapshot.exists || gameSnapshot.data()?.uid !== uid || gameSnapshot.data()?.status !== "active") {
    throw new ClinicalCaseNotFoundError();
  }
  const game = gameSnapshot.data()!;
  const caseSnapshot = await firestore.collection("clinicalCases").doc(resolveClinicalCaseId(game.caseId)).get();
  if (!caseSnapshot.exists || caseSnapshot.data()?.status !== "published") throw new ClinicalCaseNotFoundError();
  const clinicalCase = caseSnapshot.data() as ClinicalCaseDocument;
  const startedAt = game.startedAt instanceof Timestamp ? game.startedAt.toMillis() : Date.now();
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const remainingSeconds = Math.max(0, clinicalCase.durationSeconds - elapsedSeconds);
  const chatMessages = Array.isArray(game.chatMessages)
    ? game.chatMessages
        .filter(
          (message: unknown): message is { who: "patient" | "you"; text: string } =>
            typeof message === "object" &&
            message !== null &&
            "who" in message &&
            (message.who === "patient" || message.who === "you") &&
            "text" in message &&
            typeof message.text === "string",
        )
        .map(({ who, text }: { who: "patient" | "you"; text: string }) => ({ who, text }))
    : [];
  const chatMessageCount = typeof game.chatMessageCount === "number" ? game.chatMessageCount : 0;

  return {
    id: caseSnapshot.id,
    specialty: clinicalCase.specialty,
    specialtyLabel: specialtyLabels[clinicalCase.specialty],
    requestedSpecialty: game.requestedSpecialty === "aleatorio" ? "aleatorio" : clinicalCase.specialty,
    difficulty: clinicalCase.difficulty,
    title: clinicalCase.title,
    setting: clinicalCase.setting,
    summary: clinicalCase.summary,
    patient: clinicalCase.patient,
    initialMessages: clinicalCase.initialMessages,
    fallbackReply: clinicalCase.fallbackReply,
    exams: clinicalCase.exams,
    durationSeconds: clinicalCase.durationSeconds,
    maxXp: clinicalCase.maxXp,
    sourceRefs: clinicalCase.sourceRefs.filter((source) => /^https?:\/\//i.test(source)),
    remainingSeconds,
    chatMessages,
    remainingChatMessages: Math.max(0, MAX_PATIENT_CHAT_MESSAGES - chatMessageCount),
  };
}

export type DiagnosisEvaluation = "correct" | "partial" | "incorrect";

function normalizeDiagnosis(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
}

function includesAlias(normalizedHypothesis: string, aliases: string[]) {
  return aliases.some((alias) => {
    const normalizedAlias = normalizeDiagnosis(alias);
    return normalizedAlias.length > 0 && (` ${normalizedHypothesis} `.includes(` ${normalizedAlias} `));
  });
}

export function evaluateDiagnosis(hypothesis: string, correctAliases: string[], partialAliases: string[]): DiagnosisEvaluation {
  const normalizedHypothesis = normalizeDiagnosis(hypothesis);
  if (!normalizedHypothesis) return "incorrect";
  if (includesAlias(normalizedHypothesis, correctAliases)) return "correct";
  if (includesAlias(normalizedHypothesis, partialAliases)) return "partial";
  return "incorrect";
}
