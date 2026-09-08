export const PROFILE_AVATARS = [
  { id: "aurora", label: "Dra. Aurora", src: "/avatars/doctor-aurora.png" },
  { id: "caio", label: "Dr. Caio", src: "/avatars/doctor-caio.png" },
  { id: "lia", label: "Dra. Lia", src: "/avatars/doctor-lia.png" },
  { id: "theo", label: "Dr. Theo", src: "/avatars/doctor-theo.png" },
] as const;

export const PROFILE_AVATAR_IDS = PROFILE_AVATARS.map((avatar) => avatar.id) as [
  ProfileAvatarId,
  ...ProfileAvatarId[],
];

export type ProfileAvatarId = (typeof PROFILE_AVATARS)[number]["id"];

export function isProfileAvatarId(value: unknown): value is ProfileAvatarId {
  return PROFILE_AVATARS.some((avatar) => avatar.id === value);
}

export function getProfileAvatarSrc(value: unknown) {
  return PROFILE_AVATARS.find((avatar) => avatar.id === value)?.src ?? null;
}

export const FAVORITE_SPECIALTIES = [
  { id: "cardiologia", label: "Cardiologia" },
  { id: "clinica-geral", label: "Clínica Geral" },
  { id: "infectologia", label: "Infectologia" },
] as const;

export const FAVORITE_SPECIALTY_IDS = FAVORITE_SPECIALTIES.map((specialty) => specialty.id) as [
  FavoriteSpecialtyId,
  ...FavoriteSpecialtyId[],
];

export type FavoriteSpecialtyId = (typeof FAVORITE_SPECIALTIES)[number]["id"];

export function isFavoriteSpecialtyId(value: unknown): value is FavoriteSpecialtyId {
  return FAVORITE_SPECIALTIES.some((specialty) => specialty.id === value);
}
