"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  inMemoryPersistence,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseClientConfig } from "@/shared/config/firebase-env";

let authPersistencePromise: Promise<void> | undefined;

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(getFirebaseClientConfig());
}

export async function getFirebaseAuth(): Promise<Auth> {
  const auth = getAuth(getFirebaseApp());
  authPersistencePromise ??= setPersistence(auth, inMemoryPersistence);
  await authPersistencePromise;
  return auth;
}

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseApp());
}
