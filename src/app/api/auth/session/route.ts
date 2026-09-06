import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import {
  MAX_RECENT_SIGN_IN_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/shared/constants/auth";
import { FREE_PLAN_MAX_SHIFTS, getRefreshedShiftBalance, getShiftDateKey } from "@/core/shifts/shift-service";

const sessionSchema = z.object({ idToken: z.string().min(1) });

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  try {
    const { idToken } = sessionSchema.parse(await request.json());
    const adminAuth = getFirebaseAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (nowInSeconds - decodedToken.auth_time > MAX_RECENT_SIGN_IN_AGE_SECONDS) {
      return NextResponse.json({ error: "Faça login novamente para continuar." }, { status: 401 });
    }

    const userRecord = await adminAuth.getUser(decodedToken.uid);
    const firestore = getFirebaseAdminFirestore();
    const userRef = firestore.collection("users").doc(decodedToken.uid);
    const playerProfileRef = firestore.collection("playerProfiles").doc(decodedToken.uid);
    await firestore.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const identity = {
        displayName: userRecord.displayName ?? "Jogador",
        email: userRecord.email ?? null,
        photoURL: userRecord.photoURL ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      };

      const initialStats = {
        xp: 0,
        level: 1,
        streak: 0,
        lastActivityDate: null,
        casesPlayed: 0,
        correctAnswers: 0,
        partialAnswers: 0,
        averageAccuracy: 0,
      };
      const stats = userSnapshot.data()?.stats ?? initialStats;

      if (userSnapshot.exists) {
        transaction.update(userRef, identity);
      } else {
        transaction.create(userRef, {
          ...identity,
          plan: "free",
          shifts: {
            current: FREE_PLAN_MAX_SHIFTS,
            max: FREE_PLAN_MAX_SHIFTS,
            lastRefillDate: getShiftDateKey(),
          },
          stats: initialStats,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.set(playerProfileRef, {
        displayName: identity.displayName,
        photoURL: identity.photoURL,
        xp: typeof stats.xp === "number" ? stats.xp : 0,
        level: typeof stats.level === "number" ? stats.level : 1,
        streak: typeof stats.streak === "number" ? stats.streak : 0,
        casesPlayed: typeof stats.casesPlayed === "number" ? stats.casesPlayed : 0,
        averageAccuracy: typeof stats.averageAccuracy === "number" ? stats.averageAccuracy : 0,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });
    return response;
  } catch (error) {
    console.error("Falha ao criar sessão do Firebase", error);
    return NextResponse.json({ error: "Não foi possível iniciar sua sessão." }, { status: 401 });
  }
}

export async function GET() {
  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

  const shifts = await getRefreshedShiftBalance(user.uid);

  return NextResponse.json({
    authenticated: true,
    user: {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.name ?? null,
      photoURL: typeof user.picture === "string" ? user.picture : null,
      emailVerified: user.email_verified === true,
    },
    shifts,
  });
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
