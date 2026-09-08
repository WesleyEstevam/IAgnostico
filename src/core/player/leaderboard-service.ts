import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getProfileAvatarSrc } from "@/shared/constants/profile";

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function getLeaderboard(currentUid: string, limit = 50) {
  const firestore = getFirebaseAdminFirestore();
  const playerProfileRef = firestore.collection("playerProfiles").doc(currentUid);
  const playerProfile = await playerProfileRef.get();

  if (!playerProfile.exists) {
    const privateProfile = await firestore.collection("users").doc(currentUid).get();
    if (privateProfile.exists) {
      const data = privateProfile.data() ?? {};
      const stats = data.stats ?? {};
      await playerProfileRef.set({
        displayName: typeof data.displayName === "string" && data.displayName.trim() ? data.displayName : "Jogador",
        photoURL: getProfileAvatarSrc(data.avatarId) ?? (typeof data.photoURL === "string" ? data.photoURL : null),
        xp: numberValue(stats.xp),
        level: numberValue(stats.level, 1),
        streak: numberValue(stats.streak),
        casesPlayed: numberValue(stats.casesPlayed),
        averageAccuracy: numberValue(stats.averageAccuracy),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  const snapshot = await firestore
    .collection("playerProfiles")
    .orderBy("xp", "desc")
    .limit(limit)
    .get();

  const players = snapshot.docs.map((document, index) => {
    const data = document.data();
    return {
      uid: document.id,
      position: index + 1,
      displayName: typeof data.displayName === "string" && data.displayName.trim() ? data.displayName : "Jogador",
      photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
      xp: numberValue(data.xp),
      level: numberValue(data.level, 1),
      streak: numberValue(data.streak),
      casesPlayed: numberValue(data.casesPlayed),
      averageAccuracy: numberValue(data.averageAccuracy),
      isCurrentPlayer: document.id === currentUid,
    };
  });

  return {
    players,
    currentPlayer: players.find((player) => player.isCurrentPlayer) ?? null,
  };
}
