import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export type AsaasEnvironment = "sandbox" | "production";
export type AsaasPublicSettings = {
  enabled: boolean;
  environment: AsaasEnvironment;
  apiKeyConfigured: boolean;
  webhookTokenConfigured: boolean;
};
type AsaasPrivateSettings = { apiKey: string; webhookToken: string };

export async function getAsaasSettingsForAdmin(): Promise<AsaasPublicSettings> {
  const firestore = getFirebaseAdminFirestore();
  const [publicDocument, privateDocument] = await Promise.all([
    firestore.collection("paymentSettings").doc("asaas").get(),
    firestore.collection("privateSettings").doc("asaas").get(),
  ]);
  const publicData = publicDocument.data();
  const privateData = privateDocument.data();
  return {
    enabled: publicData?.enabled === true,
    environment: publicData?.environment === "production" ? "production" : "sandbox",
    apiKeyConfigured: typeof privateData?.apiKey === "string" && privateData.apiKey.length > 10,
    webhookTokenConfigured: typeof privateData?.webhookToken === "string" && privateData.webhookToken.length >= 32,
  };
}

export async function getAsaasCredentials(): Promise<AsaasPublicSettings & AsaasPrivateSettings> {
  const publicSettings = await getAsaasSettingsForAdmin();
  const privateDocument = await getFirebaseAdminFirestore().collection("privateSettings").doc("asaas").get();
  const data = privateDocument.data();
  return {
    ...publicSettings,
    apiKey: typeof data?.apiKey === "string" ? data.apiKey : "",
    webhookToken: typeof data?.webhookToken === "string" ? data.webhookToken : "",
  };
}

export async function updateAsaasSettings(input: { enabled: boolean; environment: AsaasEnvironment; apiKey?: string; webhookToken?: string }, actorUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const publicRef = firestore.collection("paymentSettings").doc("asaas");
  const privateRef = firestore.collection("privateSettings").doc("asaas");
  const [previousPublic, previousPrivate] = await Promise.all([publicRef.get(), privateRef.get()]);
  const currentPrivate = previousPrivate.data();
  const webhookToken = input.webhookToken || (typeof currentPrivate?.webhookToken === "string" ? currentPrivate.webhookToken : randomBytes(32).toString("hex"));
  const batch = firestore.batch();
  batch.set(publicRef, { enabled: input.enabled, environment: input.environment, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorUid }, { merge: true });
  batch.set(privateRef, {
    ...(input.apiKey ? { apiKey: input.apiKey } : {}),
    webhookToken,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: actorUid,
  }, { merge: true });
  batch.create(firestore.collection("adminAuditLogs").doc(), {
    actorUid,
    action: "payment_settings.asaas_updated",
    targetType: "paymentSettings",
    targetId: "asaas",
    before: { enabled: previousPublic.data()?.enabled === true, environment: previousPublic.data()?.environment ?? "sandbox", apiKeyConfigured: Boolean(currentPrivate?.apiKey), webhookTokenConfigured: Boolean(currentPrivate?.webhookToken) },
    after: { enabled: input.enabled, environment: input.environment, apiKeyConfigured: Boolean(input.apiKey) || Boolean(currentPrivate?.apiKey), webhookTokenConfigured: true },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}
