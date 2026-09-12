import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export async function getAdminDashboardMetrics() {
  const firestore = getFirebaseAdminFirestore();
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", year: "numeric", month: "numeric", day: "numeric" }).formatToParts();
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  const year = value("year");
  const month = value("month");
  const day = value("day");
  // Fortaleza permanece em UTC−3; 03:00 UTC corresponde à meia-noite local.
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 3));
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const startOfWeek = new Date(startOfDay.getTime() - ((weekday + 6) % 7) * 86_400_000);
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 3));
  const users = firestore.collection("users");
  const games = firestore.collection("gameSessions");
  const [total, today, week, monthUsers, free, pro, consultations] = await Promise.all([
    users.count().get(),
    users.where("createdAt", ">=", Timestamp.fromDate(startOfDay)).count().get(),
    users.where("createdAt", ">=", Timestamp.fromDate(startOfWeek)).count().get(),
    users.where("createdAt", ">=", Timestamp.fromDate(startOfMonth)).count().get(),
    users.where("plan", "==", "free").count().get(),
    users.where("plan", "==", "pro").count().get(),
    games.where("status", "==", "completed").count().get(),
  ]);
  return { totalUsers: total.data().count, newToday: today.data().count, newThisWeek: week.data().count, newThisMonth: monthUsers.data().count, freeUsers: free.data().count, paidUsers: pro.data().count, consultations: consultations.data().count };
}
