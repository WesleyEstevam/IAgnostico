import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import type { ClinicalCaseDocument } from "@/core/cases/clinical-case-types";

export type AdminCaseSummary = Pick<ClinicalCaseDocument, "title" | "specialty" | "difficulty" | "status" | "diagnosis"> & { id: string };

export async function listClinicalCasesForAdmin(): Promise<AdminCaseSummary[]> {
  const snapshot = await getFirebaseAdminFirestore().collection("clinicalCases").limit(200).get();
  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }) as AdminCaseSummary)
    .sort((a, b) => a.status.localeCompare(b.status) || a.specialty.localeCompare(b.specialty) || a.title.localeCompare(b.title, "pt-BR"));
}

export async function createClinicalCaseDraft(data: ClinicalCaseDocument, adminUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("clinicalCases").doc();
  const auditRef = firestore.collection("adminAuditLogs").doc();
  const batch = firestore.batch();
  batch.create(reference, {
    ...data,
    status: "draft",
    createdBy: adminUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.create(auditRef, {
    actorUid: adminUid,
    action: "clinical_case.created",
    targetType: "clinicalCase",
    targetId: reference.id,
    before: null,
    after: { title: data.title, specialty: data.specialty, status: "draft" },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  return reference.id;
}

export async function setClinicalCaseStatus(caseId: string, status: "draft" | "published" | "archived", adminUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("clinicalCases").doc(caseId);
  const current = await reference.get();
  if (!current.exists) throw new Error("Caso clínico não encontrado.");
  const auditRef = firestore.collection("adminAuditLogs").doc();
  const batch = firestore.batch();
  batch.update(reference, {
    status,
    updatedBy: adminUid,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.create(auditRef, {
    actorUid: adminUid,
    action: "clinical_case.status_changed",
    targetType: "clinicalCase",
    targetId: caseId,
    before: { status: current.data()?.status ?? null },
    after: { status },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}
