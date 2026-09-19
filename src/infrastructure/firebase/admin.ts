import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdminConfig } from "@/shared/config/firebase-env.server";

function getFirebaseAdminApp() {
  if (getApps().length) return getApp();

  const serviceAccount = getFirebaseAdminConfig();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace(
    /^gs:\/\//,
    "",
  ).trim();
  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
    storageBucket,
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

export function getFirebaseAdminStorage() {
  return getStorage(getFirebaseAdminApp());
}

export async function getFirebaseAdminBucket() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace(
    /^gs:\/\//,
    "",
  ).trim();
  if (!bucketName)
    throw new Error(
      "Cloud Storage não configurado. Informe NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no ambiente.",
    );
  const bucket = getFirebaseAdminStorage().bucket(bucketName);
  try {
    const [exists] = await bucket.exists();
    if (!exists) throw new Error("BUCKET_NOT_FOUND");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "BUCKET_NOT_FOUND" || /bucket does not exist|not found/i.test(message)) {
      throw new Error(
        `O bucket ${bucketName} não existe. Ative o Cloud Storage no Console do Firebase e copie o nome exato exibido em Storage > Files.`,
      );
    }
    throw new Error(
      "Não foi possível acessar o Cloud Storage. Verifique o bucket e as permissões da conta de serviço.",
    );
  }
  return bucket;
}
