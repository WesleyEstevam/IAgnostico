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
    await firestore.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const identity = {
        displayName: userRecord.displayName ?? "Jogador",
        email: userRecord.email ?? null,
        photoURL: userRecord.photoURL ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (userSnapshot.exists) {
        transaction.update(userRef, identity);
        return;
      }

      transaction.create(userRef, {
        ...identity,
        plan: "free",
        shifts: { current: 3, max: 3 },
        stats: { xp: 0, level: 1, streak: 0, averageAccuracy: 0 },
        createdAt: FieldValue.serverTimestamp(),
      });
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

  const profile = await getFirebaseAdminFirestore().collection("users").doc(user.uid).get();
  const shifts = profile.data()?.shifts ?? { current: 3, max: 3 };

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
