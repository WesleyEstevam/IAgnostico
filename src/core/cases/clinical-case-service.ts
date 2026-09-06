import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import type { CaseSpecialty, ClinicalCaseDocument, PublicClinicalCase } from "./clinical-case-types";

const specialtyLabels: Record<CaseSpecialty, string> = {
  cardiologia: "Cardiologia",
  "clinica-geral": "Clínica Geral",
  infectologia: "Infectologia",
};

export function resolveClinicalCaseId(caseId: unknown) {
  const value = String(caseId);
  return value === "pulmonary-embolism-001" ? "clinica-geral-tromboembolismo-pulmonar-01" : value;
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

  return {
    id: caseSnapshot.id,
    specialty: clinicalCase.specialty,
    specialtyLabel: specialtyLabels[clinicalCase.specialty],
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
    remainingSeconds,
  };
}

export type DiagnosisEvaluation = "correct" | "partial" | "incorrect";

function normalizeDiagnosis(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
}

function includesAlias(normalizedHypothesis: string, aliases: string[]) {
  return aliases.some((alias) => {
    const normalizedAlias = normalizeDiagnosis(alias);
    return normalizedAlias.length > 0 && (normalizedHypothesis === normalizedAlias || normalizedHypothesis.includes(normalizedAlias));
  });
}

export function evaluateDiagnosis(hypothesis: string, correctAliases: string[], partialAliases: string[]): DiagnosisEvaluation {
  const normalizedHypothesis = normalizeDiagnosis(hypothesis);
  if (!normalizedHypothesis) return "incorrect";
  if (includesAlias(normalizedHypothesis, correctAliases)) return "correct";
  if (includesAlias(normalizedHypothesis, partialAliases)) return "partial";
  return "incorrect";
}
