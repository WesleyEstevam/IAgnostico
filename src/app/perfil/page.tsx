import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { ProfileForm } from "@/presentation/components/profile/profile-form";
import { Navbar } from "@/presentation/components/shared/navbar";
import { isFavoriteSpecialtyId, isProfileAvatarId } from "@/shared/constants/profile";

export default async function ProfilePage() {
  const user = await getCurrentFirebaseUser();
  if (!user) redirect("/login?next=/perfil");

  const profile = await getFirebaseAdminFirestore().collection("users").doc(user.uid).get();
  const data = profile.data();
  const email = user.email ?? (typeof data?.email === "string" ? data.email : "");
  const displayName = typeof data?.displayName === "string" && data.displayName.trim()
    ? data.displayName
    : user.name ?? email.split("@")[0] ?? "Jogador";
  const accountPhotoURL = typeof data?.photoURL === "string"
    ? data.photoURL
    : typeof user.picture === "string"
      ? user.picture
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>
        <div className="mb-8">
          <div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Área do jogador</div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Meu Perfil</h1>
          <p className="mt-2 max-w-2xl font-bold text-muted-foreground">Atualize suas informações e escolha o avatar que vai acompanhar sua evolução.</p>
        </div>
        <ProfileForm
          initialDisplayName={displayName}
          email={email}
          initialAvatarId={isProfileAvatarId(data?.avatarId) ? data.avatarId : null}
          accountPhotoURL={accountPhotoURL}
          initialBirthDate={typeof data?.birthDate === "string" ? data.birthDate : ""}
          initialUniversity={typeof data?.university === "string" ? data.university : ""}
          initialFavoriteSpecialty={isFavoriteSpecialtyId(data?.favoriteSpecialty) ? data.favoriteSpecialty : null}
        />
      </main>
    </div>
  );
}
