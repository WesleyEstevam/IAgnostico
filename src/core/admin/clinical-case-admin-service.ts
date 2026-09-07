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
  const reference = getFirebaseAdminFirestore().collection("clinicalCases").doc();
  await reference.create({
    ...data,
    status: "draft",
    createdBy: adminUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return reference.id;
}

export async function setClinicalCaseStatus(caseId: string, status: "draft" | "published" | "archived", adminUid: string) {
  await getFirebaseAdminFirestore().collection("clinicalCases").doc(caseId).update({
    status,
    updatedBy: adminUid,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
