"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Check, LoaderCircle, Save, UserRound } from "lucide-react";
import { refreshAuthSession } from "@/presentation/auth/auth-store";
import {
  FAVORITE_SPECIALTIES,
  PROFILE_AVATARS,
  type FavoriteSpecialtyId,
  type ProfileAvatarId,
} from "@/shared/constants/profile";

type ProfileFormProps = {
  initialDisplayName: string;
  email: string;
  initialAvatarId: ProfileAvatarId | null;
  accountPhotoURL: string | null;
  initialBirthDate: string;
  initialUniversity: string;
  initialFavoriteSpecialty: FavoriteSpecialtyId | null;
};

export function ProfileForm({
  initialDisplayName,
  email,
  initialAvatarId,
  accountPhotoURL,
  initialBirthDate,
  initialUniversity,
  initialFavoriteSpecialty,
}: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarId, setAvatarId] = useState<ProfileAvatarId | null>(initialAvatarId);
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [university, setUniversity] = useState(initialUniversity);
  const [favoriteSpecialty, setFavoriteSpecialty] = useState<FavoriteSpecialtyId | null>(initialFavoriteSpecialty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedAvatar = PROFILE_AVATARS.find((avatar) => avatar.id === avatarId);
  const initials = (displayName.trim()[0] ?? email[0] ?? "J").toUpperCase();

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          avatarId,
          birthDate: birthDate || null,
          university: university.trim() || null,
          favoriteSpecialty,
        }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error ?? "Não foi possível salvar as alterações.");

      await refreshAuthSession();
      router.refresh();
      setMessage("Perfil atualizado com sucesso!");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveProfile} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
      <section className="card-pop p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">Informações pessoais</h2>
            <p className="text-sm font-bold text-muted-foreground">Como você será reconhecido durante os plantões.</p>
          </div>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold">Nome do jogador</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              minLength={2}
              maxLength={50}
              required
              autoComplete="name"
              className="h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold">E-mail</span>
            <input
              value={email}
              readOnly
              aria-describedby="email-help"
              className="h-12 w-full cursor-not-allowed rounded-2xl border-2 border-border bg-muted px-4 font-bold text-muted-foreground"
            />
            <span id="email-help" className="mt-2 block text-xs font-bold text-muted-foreground">
              O e-mail de acesso não pode ser alterado nesta versão.
            </span>
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold">Data de nascimento</span>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                min="1900-01-01"
                max={new Date().toISOString().slice(0, 10)}
                autoComplete="bday"
                className="h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold">Especialidade favorita</span>
              <select
                value={favoriteSpecialty ?? ""}
                onChange={(event) => setFavoriteSpecialty((event.target.value || null) as FavoriteSpecialtyId | null)}
                className="h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Ainda não escolhi</option>
                {FAVORITE_SPECIALTIES.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>{specialty.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold">Universidade</span>
            <input
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
              maxLength={120}
              autoComplete="organization"
              placeholder="Ex.: Universidade Federal da Bahia"
              className="h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-bold outline-none transition placeholder:font-medium focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>

      <section className="card-pop p-5 sm:p-7 lg:row-span-2">
        <h2 className="text-xl font-extrabold">Seu avatar</h2>
        <p className="mt-1 text-sm font-bold text-muted-foreground">Escolha quem vai representar você no IAgnóstico.</p>

        <div className="mx-auto my-6 grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-primary/25 bg-primary/10 shadow-[0_5px_0_0_color-mix(in_srgb,var(--primary)_35%,transparent)]">
          {selectedAvatar ? (
            <Image src={selectedAvatar.src} alt={selectedAvatar.label} width={128} height={128} className="h-full w-full object-contain" priority />
          ) : accountPhotoURL ? (
            <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${accountPhotoURL})` }} role="img" aria-label="Foto atual da conta" />
          ) : (
            <span className="text-4xl font-black text-primary">{initials}</span>
          )}
        </div>

        <div role="radiogroup" aria-label="Escolha um avatar" className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-2">
          <button
            type="button"
            role="radio"
            aria-checked={avatarId === null}
            onClick={() => setAvatarId(null)}
            className={`relative grid aspect-square place-items-center overflow-hidden rounded-2xl border-2 bg-muted transition hover:-translate-y-1 ${avatarId === null ? "border-primary ring-4 ring-primary/15" : "border-border"}`}
            title={accountPhotoURL ? "Foto da conta" : "Usar iniciais"}
          >
            {accountPhotoURL ? (
              <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${accountPhotoURL})` }} />
            ) : (
              <span className="text-2xl font-black text-primary">{initials}</span>
            )}
            {avatarId === null && <CheckBadge />}
          </button>
          {PROFILE_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              role="radio"
              aria-checked={avatarId === avatar.id}
              onClick={() => setAvatarId(avatar.id)}
              className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-primary/5 transition hover:-translate-y-1 ${avatarId === avatar.id ? "border-primary ring-4 ring-primary/15" : "border-border"}`}
              title={avatar.label}
            >
              <Image src={avatar.src} alt={avatar.label} fill sizes="120px" className="object-contain" />
              {avatarId === avatar.id && <CheckBadge />}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={saving || displayName.trim().length < 2}
          className="btn-pop inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-[var(--shadow-pop)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
        <p aria-live="polite" className={`text-sm font-extrabold ${error ? "text-destructive" : "text-primary"}`}>
          {error ?? message}
        </p>
      </div>
    </form>
  );
}

function CheckBadge() {
  return (
    <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
      <Check className="h-4 w-4" strokeWidth={4} />
    </span>
  );
}
