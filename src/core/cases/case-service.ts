import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getPreviousDateKey, getShiftDateKey } from "@/core/shifts/shift-service";
import { evaluateDiagnosis, resolveClinicalCaseId } from "./clinical-case-service";
import type { ClinicalCaseDocument } from "./clinical-case-types";
import { getProfileAvatarSrc } from "@/shared/constants/profile";

export class GameSessionNotFoundError extends Error {}
export class GameSessionForbiddenError extends Error {}

type FinishReason = "tempo" | "diagnostico";

export async function finishGameSession(uid: string, gameId: string, hypothesis: string, requestedReason: FinishReason) {
  const firestore = getFirebaseAdminFirestore();
  const gameRef = firestore.collection("gameSessions").doc(gameId);
  const userRef = firestore.collection("users").doc(uid);
  const playerProfileRef = firestore.collection("playerProfiles").doc(uid);

  return firestore.runTransaction(async (transaction) => {
    const gameSnapshot = await transaction.get(gameRef);
    if (!gameSnapshot.exists) throw new GameSessionNotFoundError();
    const game = gameSnapshot.data()!;
    if (game.uid !== uid) throw new GameSessionForbiddenError();
    if (game.status === "completed" && game.result) return game.result;

    const caseRef = firestore.collection("clinicalCases").doc(resolveClinicalCaseId(game.caseId));
    const [userSnapshot, caseSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(caseRef),
    ]);
    if (!userSnapshot.exists) throw new GameSessionNotFoundError();
    if (!caseSnapshot.exists) throw new GameSessionNotFoundError();
    const clinicalCase = caseSnapshot.data() as ClinicalCaseDocument;

    const durationSeconds = typeof game.durationSeconds === "number" ? game.durationSeconds : 8 * 60;
    const startedAt = game.startedAt instanceof Timestamp ? game.startedAt.toMillis() : Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
    const reason: FinishReason = remainingSeconds === 0 ? "tempo" : requestedReason;
    const normalizedHypothesis = hypothesis.trim();
    const evaluation = reason === "diagnostico"
      ? evaluateDiagnosis(normalizedHypothesis, clinicalCase.diagnosisAliases, clinicalCase.partialDiagnosisAliases ?? [])
      : "incorrect";
    const correct = evaluation === "correct";
    const xpEarned = evaluation === "correct"
      ? clinicalCase.maxXp
      : evaluation === "partial"
        ? Math.round(clinicalCase.maxXp * 0.5)
        : reason === "diagnostico" && normalizedHypothesis
          ? Math.round(clinicalCase.maxXp * 0.2)
          : 0;
    const feedbackPrefix = evaluation === "correct"
      ? "Excelente! "
      : evaluation === "partial"
        ? `Você reconheceu o contexto clínico, mas o diagnóstico esperado era ${clinicalCase.diagnosis}. `
        : `O diagnóstico esperado era ${clinicalCase.diagnosis}. `;
    const feedback = `${feedbackPrefix}${clinicalCase.feedback}`;

    const currentStats = userSnapshot.data()?.stats ?? {};
    const today = getShiftDateKey();
    const yesterday = getPreviousDateKey(today);
    const lastActivityDate = typeof currentStats.lastActivityDate === "string" ? currentStats.lastActivityDate : null;
    const currentStreak = typeof currentStats.streak === "number" ? currentStats.streak : 0;
    const streak = lastActivityDate === today
      ? Math.max(currentStreak, 1)
      : lastActivityDate === yesterday
        ? Math.max(currentStreak, 0) + 1
        : 1;
    const casesPlayed = (typeof currentStats.casesPlayed === "number" ? currentStats.casesPlayed : 0) + 1;
    const correctAnswers = (typeof currentStats.correctAnswers === "number" ? currentStats.correctAnswers : 0) + (correct ? 1 : 0);
    const partialAnswers = (typeof currentStats.partialAnswers === "number" ? currentStats.partialAnswers : 0) + (evaluation === "partial" ? 1 : 0);
    const xp = (typeof currentStats.xp === "number" ? currentStats.xp : 0) + xpEarned;
    const result = { reason, evaluation, correct, xpEarned, remainingSeconds, feedback };

    transaction.update(gameRef, {
      status: "completed",
      hypothesis: normalizedHypothesis,
      result,
      completedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(userRef, {
      stats: {
        ...currentStats,
        xp,
        level: Math.floor(xp / 500) + 1,
        streak,
        lastActivityDate: today,
        casesPlayed,
        correctAnswers,
        partialAnswers,
        averageAccuracy: Math.round((correctAnswers / casesPlayed) * 100),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(playerProfileRef, {
      displayName: typeof userSnapshot.data()?.displayName === "string" ? userSnapshot.data()?.displayName : "Jogador",
      photoURL: getProfileAvatarSrc(userSnapshot.data()?.avatarId) ?? (typeof userSnapshot.data()?.photoURL === "string" ? userSnapshot.data()?.photoURL : null),
      xp,
      level: Math.floor(xp / 500) + 1,
      streak,
      casesPlayed,
      averageAccuracy: Math.round((correctAnswers / casesPlayed) * 100),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return result;
  });
}
