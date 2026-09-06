import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminConfig } from "@/shared/config/firebase-env.server";

function getFirebaseAdminApp() {
  if (getApps().length) return getApp();

  const serviceAccount = getFirebaseAdminConfig();
  return initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.projectId });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}
