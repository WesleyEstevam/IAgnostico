import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { ClinicalCaseNotFoundError, selectPublishedCase } from "@/core/cases/clinical-case-service";
import type { CaseSpecialty } from "@/core/cases/clinical-case-types";

export const SHIFT_TIME_ZONE = "America/Bahia";
export const FREE_PLAN_MAX_SHIFTS = 3;

type ShiftBalance = {
  current: number;
  max: number;
  lastRefillDate: string;
};

export class NoShiftsAvailableError extends Error {}
export class PlayerProfileNotFoundError extends Error {}

export function getShiftDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SHIFT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getPreviousDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, "0")}-${String(previous.getUTCDate()).padStart(2, "0")}`;
}

function readBalance(data: FirebaseFirestore.DocumentData | undefined, today: string): ShiftBalance {
  const max = typeof data?.shifts?.max === "number" ? data.shifts.max : FREE_PLAN_MAX_SHIFTS;
  const storedCurrent = typeof data?.shifts?.current === "number" ? data.shifts.current : max;
  const lastRefillDate = typeof data?.shifts?.lastRefillDate === "string" ? data.shifts.lastRefillDate : "";
  return {
    current: lastRefillDate === today ? Math.max(0, Math.min(storedCurrent, max)) : max,
    max,
    lastRefillDate: today,
  };
}

export async function getRefreshedShiftBalance(uid: string) {
  const firestore = getFirebaseAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const today = getShiftDateKey();

  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists) throw new PlayerProfileNotFoundError();
    const balance = readBalance(snapshot.data(), today);
    const stored = snapshot.data()?.shifts;

    if (stored?.current !== balance.current || stored?.max !== balance.max || stored?.lastRefillDate !== today) {
      transaction.update(userRef, { shifts: balance, updatedAt: FieldValue.serverTimestamp() });
    }
    return balance;
  });
}

export async function startShift(uid: string, specialty: string, requestId: string) {
  const firestore = getFirebaseAdminFirestore();
  const selectedCase = await selectPublishedCase(specialty as CaseSpecialty | "aleatorio");
  if (!selectedCase) throw new ClinicalCaseNotFoundError();
  const clinicalCase = selectedCase.data();
  const userRef = firestore.collection("users").doc(uid);
  const gameRef = firestore.collection("gameSessions").doc(requestId);
  const today = getShiftDateKey();

  return firestore.runTransaction(async (transaction) => {
    const existingGame = await transaction.get(gameRef);
    if (existingGame.exists) {
      if (existingGame.data()?.uid !== uid) throw new Error("Identificador de partida inválido.");
      const balance = await transaction.get(userRef);
      return {
        gameId: gameRef.id,
        shifts: readBalance(balance.data(), today),
      };
    }

    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists) throw new PlayerProfileNotFoundError();
    const balance = readBalance(userSnapshot.data(), today);
    if (balance.current <= 0) throw new NoShiftsAvailableError();

    const updatedBalance = { ...balance, current: balance.current - 1 };
    transaction.update(userRef, { shifts: updatedBalance, updatedAt: FieldValue.serverTimestamp() });
    transaction.create(gameRef, {
      uid,
      specialty: clinicalCase.specialty,
      requestedSpecialty: specialty,
      caseId: selectedCase.id,
      caseTitle: clinicalCase.title,
      status: "active",
      durationSeconds: clinicalCase.durationSeconds,
      startedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    });

    return { gameId: gameRef.id, shifts: updatedBalance };
  });
}
