import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getShiftDateKey, SHIFT_TIME_ZONE } from "@/core/shifts/shift-service";

const specialtyNames: Record<string, string> = {
  cardiologia: "Cardiologia",
  "clinica-geral": "Clínica Geral",
  infectologia: "Infectologia",
  aleatorio: "Aleatório",
};

type GameRecord = {
  id: string;
  status?: string;
  completedAt?: Timestamp;
  specialty?: string;
  caseTitle?: string;
  result?: { correct?: boolean; xpEarned?: number };
};

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function getPlayerProgress(uid: string) {
  const firestore = getFirebaseAdminFirestore();
  const userPromise = firestore.collection("users").doc(uid).get();
  const gamesCollection = firestore.collection("gameSessions");
  let gamesSnapshot: FirebaseFirestore.QuerySnapshot;

  try {
    gamesSnapshot = await gamesCollection
      .where("uid", "==", uid)
      .orderBy("completedAt", "desc")
      .limit(100)
      .get();
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "9" && code !== "failed-precondition") throw error;
    gamesSnapshot = await gamesCollection.where("uid", "==", uid).limit(500).get();
  }

  const userSnapshot = await userPromise;

  const storedStats = userSnapshot.data()?.stats ?? {};
  const stats = {
    xp: numberValue(storedStats.xp),
    level: numberValue(storedStats.level, 1),
    streak: numberValue(storedStats.streak),
    averageAccuracy: numberValue(storedStats.averageAccuracy),
    casesPlayed: numberValue(storedStats.casesPlayed),
    correctAnswers: numberValue(storedStats.correctAnswers),
  };

  const games = gamesSnapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }) as GameRecord)
    .filter((game): game is GameRecord & { completedAt: Timestamp } => game.status === "completed" && game.completedAt instanceof Timestamp)
    .sort((a, b) => b.completedAt.toMillis() - a.completedAt.toMillis())
    .slice(0, 100);

  const now = new Date();
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
    return {
      key: getShiftDateKey(date),
      label: new Intl.DateTimeFormat("pt-BR", { timeZone: SHIFT_TIME_ZONE, weekday: "narrow" }).format(date).toUpperCase(),
    };
  });
  const currentWeekKeys = new Set(lastSevenDays.map((day) => day.key));
  const previousWeekKeys = new Set(Array.from({ length: 7 }, (_, index) => getShiftDateKey(new Date(now.getTime() - (13 - index) * 24 * 60 * 60 * 1000))));

  const gamesByDate = new Map<string, typeof games>();
  for (const game of games) {
    const key = getShiftDateKey(game.completedAt.toDate());
    gamesByDate.set(key, [...(gamesByDate.get(key) ?? []), game]);
  }
  const accuracyFor = (selectedGames: typeof games) => selectedGames.length
    ? Math.round((selectedGames.filter((game) => game.result?.correct === true).length / selectedGames.length) * 100)
    : 0;

  const weekly = lastSevenDays.map((day) => {
    const dayGames = gamesByDate.get(day.key) ?? [];
    return { ...day, accuracy: accuracyFor(dayGames), cases: dayGames.length };
  });
  const currentWeekGames = games.filter((game) => currentWeekKeys.has(getShiftDateKey(game.completedAt.toDate())));
  const previousWeekGames = games.filter((game) => previousWeekKeys.has(getShiftDateKey(game.completedAt.toDate())));
  const currentAccuracy = accuracyFor(currentWeekGames);
  const previousAccuracy = accuracyFor(previousWeekGames);
  const weekDelta = previousWeekGames.length ? currentAccuracy - previousAccuracy : null;

  const specialtyGroups = new Map<string, typeof games>();
  for (const game of games) {
    const specialty = typeof game.specialty === "string" ? game.specialty : "aleatorio";
    specialtyGroups.set(specialty, [...(specialtyGroups.get(specialty) ?? []), game]);
  }
  const bySpecialty = [...specialtyGroups.entries()]
    .map(([specialty, specialtyGames]) => ({
      name: specialtyNames[specialty] ?? specialty,
      accuracy: accuracyFor(specialtyGames),
      cases: specialtyGames.length,
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.cases - a.cases);

  const today = getShiftDateKey(now);
  const yesterday = getShiftDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const history = games.slice(0, 10).map((game) => {
    const completedDate = game.completedAt.toDate();
    const dateKey = getShiftDateKey(completedDate);
    const date = dateKey === today ? "Hoje" : dateKey === yesterday ? "Ontem" : new Intl.DateTimeFormat("pt-BR", { timeZone: SHIFT_TIME_ZONE, day: "2-digit", month: "2-digit" }).format(completedDate);
    return {
      id: game.id,
      date,
      caseTitle: typeof game.caseTitle === "string" ? game.caseTitle : "Mulher, 32 anos, dispneia súbita",
      specialty: specialtyNames[typeof game.specialty === "string" ? game.specialty : ""] ?? "Clínica Geral",
      correct: game.result?.correct === true,
      xp: numberValue(game.result?.xpEarned),
    };
  });

  return {
    stats,
    weekly,
    weeklyXp: currentWeekGames.reduce((total, game) => total + numberValue(game.result?.xpEarned), 0),
    weekDelta,
    bySpecialty,
    history,
  };
}
