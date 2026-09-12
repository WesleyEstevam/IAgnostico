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
import { getProfileAvatarSrc } from "@/shared/constants/profile";
import { isAllowedRequestOrigin } from "@/shared/security/request-origin";
import { buildUserSearchKeywords, normalizeUserSearch } from "@/core/admin/admin-user-service";

const sessionSchema = z.object({ idToken: z.string().min(1) });

export async function POST(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) {
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
      const storedProfile = userSnapshot.data();
      const identity = {
        displayName: typeof storedProfile?.displayName === "string" && storedProfile.displayName.trim()
          ? storedProfile.displayName
          : userRecord.displayName ?? "Jogador",
        email: userRecord.email ?? null,
        photoURL: userRecord.photoURL ?? null,
        phone: userRecord.phoneNumber ?? null,
        provider: userRecord.providerData[0]?.providerId ?? "password",
        accountStatus: "active",
        displayNameNormalized: normalizeUserSearch(typeof storedProfile?.displayName === "string" ? storedProfile.displayName : userRecord.displayName ?? "Jogador"),
        searchKeywords: buildUserSearchKeywords([
          typeof storedProfile?.displayName === "string" ? storedProfile.displayName : userRecord.displayName,
          userRecord.email,
          userRecord.phoneNumber,
          userRecord.uid,
        ]),
        lastAccessAt: FieldValue.serverTimestamp(),
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
        photoURL: getProfileAvatarSrc(storedProfile?.avatarId) ?? identity.photoURL,
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
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Firebase Admin não configurado")) {
      return NextResponse.json({ error: "Firebase Admin não configurado no servidor. Verifique as variáveis FIREBASE_ADMIN_* na Vercel." }, { status: 500 });
    }
    if (/private key|PEM|credential/i.test(message)) {
      return NextResponse.json({ error: "A credencial do Firebase Admin na Vercel é inválida. Verifique FIREBASE_ADMIN_PRIVATE_KEY e FIREBASE_ADMIN_CLIENT_EMAIL." }, { status: 500 });
    }
    return NextResponse.json({ error: "Não foi possível validar sua autenticação no servidor." }, { status: 401 });
  }
}

export async function GET() {
  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

  const shifts = await getRefreshedShiftBalance(user.uid);
  const profile = await getFirebaseAdminFirestore().collection("users").doc(user.uid).get();
  const profileData = profile.data();

  return NextResponse.json({
    authenticated: true,
    user: {
      uid: user.uid,
      email: user.email ?? null,
      displayName: typeof profileData?.displayName === "string" ? profileData.displayName : user.name ?? null,
      photoURL: getProfileAvatarSrc(profileData?.avatarId) ?? (typeof profileData?.photoURL === "string" ? profileData.photoURL : typeof user.picture === "string" ? user.picture : null),
      emailVerified: user.email_verified === true,
      role: ["superadmin", "admin", "support"].includes(profileData?.role) ? profileData?.role : "player",
    },
    shifts,
  });
}

export async function DELETE(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) {
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
