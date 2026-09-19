import "server-only";

import { cache } from "react";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export type ApplicationSettings = {
  productName: string;
  legalName: string;
  supportEmail: string;
  publicUrl: string;
  adminUrl: string;
  locale: "pt-BR";
  timezone: string;
  registrationsEnabled: boolean;
  announcementEnabled: boolean;
  announcementText: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
};

export const DEFAULT_APPLICATION_SETTINGS: ApplicationSettings = {
  productName: "IAgnóstico",
  legalName: "IAgnóstico",
  supportEmail: "suporte@iagnostico.com.br",
  publicUrl: process.env.APP_URL || "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL || "http://adm.localhost:3000",
  locale: "pt-BR",
  timezone: "America/Bahia",
  registrationsEnabled: true,
  announcementEnabled: false,
  announcementText: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
};

function readString(data: FirebaseFirestore.DocumentData | undefined, key: keyof ApplicationSettings) {
  const value = data?.[key];
  return typeof value === "string" ? value.trim() : DEFAULT_APPLICATION_SETTINGS[key] as string;
}

export const getApplicationSettings = cache(async (): Promise<ApplicationSettings> => {
  const snapshot = await getFirebaseAdminFirestore().collection("applicationSettings").doc("general").get();
  const data = snapshot.data();
  return {
    productName: readString(data, "productName") || DEFAULT_APPLICATION_SETTINGS.productName,
    legalName: readString(data, "legalName") || DEFAULT_APPLICATION_SETTINGS.legalName,
    supportEmail: readString(data, "supportEmail") || DEFAULT_APPLICATION_SETTINGS.supportEmail,
    publicUrl: readString(data, "publicUrl") || DEFAULT_APPLICATION_SETTINGS.publicUrl,
    adminUrl: readString(data, "adminUrl") || DEFAULT_APPLICATION_SETTINGS.adminUrl,
    locale: "pt-BR",
    timezone: readString(data, "timezone") || DEFAULT_APPLICATION_SETTINGS.timezone,
    registrationsEnabled: typeof data?.registrationsEnabled === "boolean" ? data.registrationsEnabled : true,
    announcementEnabled: typeof data?.announcementEnabled === "boolean" ? data.announcementEnabled : false,
    announcementText: readString(data, "announcementText"),
    instagramUrl: readString(data, "instagramUrl"),
    linkedinUrl: readString(data, "linkedinUrl"),
    youtubeUrl: readString(data, "youtubeUrl"),
  };
});

export async function updateApplicationSettings(settings: ApplicationSettings, actorUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("applicationSettings").doc("general");
  const previous = await reference.get();
  const batch = firestore.batch();
  batch.set(reference, {
    ...settings,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: actorUid,
  }, { merge: true });
  batch.create(firestore.collection("adminAuditLogs").doc(), {
    actorUid,
    action: "application_settings.updated",
    targetType: "applicationSettings",
    targetId: "general",
    before: previous.exists ? previous.data() : null,
    after: settings,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}
