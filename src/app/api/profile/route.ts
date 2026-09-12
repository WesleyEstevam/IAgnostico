import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { FAVORITE_SPECIALTY_IDS, getProfileAvatarSrc, PROFILE_AVATAR_IDS } from "@/shared/constants/profile";
import { isAllowedRequestOrigin } from "@/shared/security/request-origin";

const birthDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= "1900-01-01" && value <= new Date().toISOString().slice(0, 10);
});

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  avatarId: z.enum(PROFILE_AVATAR_IDS).nullable(),
  birthDate: birthDateSchema.nullable(),
  university: z.string().trim().max(120).nullable(),
  favoriteSpecialty: z.enum(FAVORITE_SPECIALTY_IDS).nullable(),
});

export async function PATCH(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  const user = await getCurrentFirebaseUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  try {
    const profile = profileSchema.parse(await request.json());
    const firestore = getFirebaseAdminFirestore();
    const userRef = firestore.collection("users").doc(user.uid);
    const playerProfileRef = firestore.collection("playerProfiles").doc(user.uid);
    const storedUser = await userRef.get();
    const accountPhotoURL = typeof storedUser.data()?.photoURL === "string"
      ? storedUser.data()?.photoURL
      : typeof user.picture === "string"
        ? user.picture
        : null;
    const photoURL = getProfileAvatarSrc(profile.avatarId) ?? accountPhotoURL;

    await getFirebaseAdminAuth().updateUser(user.uid, { displayName: profile.displayName });

    const batch = firestore.batch();
    batch.set(userRef, {
      displayName: profile.displayName,
      avatarId: profile.avatarId,
      birthDate: profile.birthDate,
      university: profile.university || null,
      favoriteSpecialty: profile.favoriteSpecialty,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    batch.set(playerProfileRef, {
      displayName: profile.displayName,
      photoURL,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    await batch.commit();

    return NextResponse.json({
      ok: true,
      profile: { ...profile, photoURL },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Revise os dados informados e tente novamente." }, { status: 400 });
    }
    console.error("Falha ao atualizar perfil", error);
    return NextResponse.json({ error: "Não foi possível atualizar seu perfil agora." }, { status: 500 });
  }
}
