import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export type SupportSubject = { id: string; label: string; active: boolean };
const defaults: SupportSubject[] = [
  { id: "problema-tecnico", label: "Problema técnico", active: true },
  { id: "conta-acesso", label: "Conta e acesso", active: true },
  { id: "cobranca-assinatura", label: "Cobrança e assinatura", active: true },
  { id: "caso-clinico", label: "Caso clínico ou partida", active: true },
  { id: "sugestao", label: "Sugestão", active: true },
  { id: "outro", label: "Outro assunto", active: true },
];

export async function getPublicSupportSettings() {
  const snapshot = await getFirebaseAdminFirestore()
    .collection("supportSettings")
    .doc("public")
    .get();
  const data = snapshot.data();
  const subjects = Array.isArray(data?.subjects)
    ? data.subjects
        .filter((item: unknown): item is SupportSubject =>
          Boolean(item && typeof item === "object" && "id" in item && "label" in item),
        )
        .map((item) => ({
          id: String(item.id).slice(0, 60),
          label: String(item.label).slice(0, 100),
          active: item.active !== false,
        }))
    : defaults;
  return {
    subjects: subjects.filter((item) => item.active),
    siteKey: typeof data?.turnstileSiteKey === "string" ? data.turnstileSiteKey : "",
  };
}

export async function getSupportSettingsForAdmin() {
  const firestore = getFirebaseAdminFirestore();
  const [publicSnapshot, privateSnapshot] = await Promise.all([
    firestore.collection("supportSettings").doc("public").get(),
    firestore.collection("privateSettings").doc("turnstile").get(),
  ]);
  const data = publicSnapshot.data();
  return {
    subjects: Array.isArray(data?.subjects) ? (data.subjects as SupportSubject[]) : defaults,
    siteKey: typeof data?.turnstileSiteKey === "string" ? data.turnstileSiteKey : "",
    secretConfigured:
      typeof privateSnapshot.data()?.secretKey === "string" &&
      privateSnapshot.data()!.secretKey.length > 0,
  };
}

export async function getTurnstileSecret() {
  const snapshot = await getFirebaseAdminFirestore()
    .collection("privateSettings")
    .doc("turnstile")
    .get();
  return typeof snapshot.data()?.secretKey === "string"
    ? (snapshot.data()!.secretKey as string)
    : "";
}

export async function updateSupportSubjects(subjects: SupportSubject[], actorUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const publicRef = firestore.collection("supportSettings").doc("public");
  const previous = await publicRef.get();
  const batch = firestore.batch();
  batch.set(
    publicRef,
    {
      subjects,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
    },
    { merge: true },
  );
  batch.create(firestore.collection("adminAuditLogs").doc(), {
    actorUid,
    action: "support.subjects_updated",
    targetType: "supportSettings",
    targetId: "public",
    before: previous.exists ? { subjects: previous.data()?.subjects ?? [] } : null,
    after: { subjects },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}

export async function updateTurnstileSettings(
  input: { siteKey: string; secretKey?: string },
  actorUid: string,
) {
  const firestore = getFirebaseAdminFirestore();
  const publicRef = firestore.collection("supportSettings").doc("public");
  const privateRef = firestore.collection("privateSettings").doc("turnstile");
  const [previousPublic, previousPrivate] = await Promise.all([publicRef.get(), privateRef.get()]);
  const batch = firestore.batch();
  batch.set(publicRef, {
    turnstileSiteKey: input.siteKey,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: actorUid,
  }, { merge: true });
  if (input.secretKey) batch.set(privateRef, {
    secretKey: input.secretKey,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: actorUid,
  }, { merge: true });
  batch.create(firestore.collection("adminAuditLogs").doc(), {
    actorUid,
    action: "application_settings.turnstile_updated",
    targetType: "applicationSettings",
    targetId: "turnstile",
    before: {
      siteKeyConfigured: Boolean(previousPublic.data()?.turnstileSiteKey),
      secretConfigured: Boolean(previousPrivate.data()?.secretKey),
    },
    after: {
      siteKeyConfigured: Boolean(input.siteKey),
      secretConfigured: Boolean(input.secretKey) || Boolean(previousPrivate.data()?.secretKey),
      secretUpdated: Boolean(input.secretKey),
    },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}
