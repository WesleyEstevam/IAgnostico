import "server-only";

import { cache } from "react";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export type SiteContent = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  canonicalUrl: string;
  socialImageUrl: string;
  logoSquareUrl: string;
  allowIndexing: boolean;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  socialProof: string;
  featuresEyebrow: string;
  featuresTitle: string;
  featuresDescription: string;
  gamificationTitle: string;
  gamificationDescription: string;
  communityTitle: string;
  communityDescription: string;
  testimonialsTitle: string;
  pricingTitle: string;
  pricingDescription: string;
  footerText: string;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  seoTitle: "IAgnóstico | Casos clínicos com inteligência artificial",
  seoDescription: "Treine raciocínio clínico com pacientes simulados por IA, exames, diagnósticos e feedback para estudantes de medicina.",
  seoKeywords: ["casos clínicos", "medicina", "raciocínio clínico", "inteligência artificial", "estudantes de medicina"],
  canonicalUrl: "https://iagnostico.com.br",
  socialImageUrl: "/iagnostico-logo-green-transparente.png",
  logoSquareUrl: "/icon.png",
  allowIndexing: true,
  heroTitle: "Treine raciocínio clínico",
  heroHighlight: "todos os dias.",
  heroDescription: "Converse com pacientes simulados por IA, peça exames, formule hipóteses e evolua como em um jogo. Feito para estudantes de medicina, internos e residência.",
  primaryCta: "Começar gratuitamente",
  secondaryCta: "Ver caso demo",
  socialProof: "+5.000 estudantes treinando agora",
  featuresEyebrow: "Como funciona",
  featuresTitle: "Treine diagnósticos clínicos com IA",
  featuresDescription: "Cada caso é uma missão. Cada acerto, um passo a mais rumo à residência.",
  gamificationTitle: "Estude porque você quer.",
  gamificationDescription: "XP, níveis, streaks diários e conquistas por especialidade. A meta clínica vira hábito sem você perceber.",
  communityTitle: "Compita com sua turma.",
  communityDescription: "Ranking por universidade, especialidade e ligas semanais. Ninguém quer perder o topo da turma.",
  testimonialsTitle: "O que dizem os estudantes",
  pricingTitle: "Comece grátis. Evolua quando quiser.",
  pricingDescription: "Sem complicação. Cancele quando quiser.",
  footerText: "© 2026 IAgnóstico · feito por estudantes, para estudantes.",
};

function readString(data: FirebaseFirestore.DocumentData | undefined, key: keyof SiteContent) {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value : DEFAULT_SITE_CONTENT[key] as string;
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const snapshot = await getFirebaseAdminFirestore().collection("siteContent").doc("landing").get();
  const data = snapshot.data();
  return {
    ...Object.fromEntries(Object.keys(DEFAULT_SITE_CONTENT).filter((key) => !["seoKeywords", "allowIndexing"].includes(key)).map((key) => [key, readString(data, key as keyof SiteContent)])),
    seoKeywords: Array.isArray(data?.seoKeywords) ? data.seoKeywords.filter((item: unknown): item is string => typeof item === "string").slice(0, 20) : DEFAULT_SITE_CONTENT.seoKeywords,
    allowIndexing: typeof data?.allowIndexing === "boolean" ? data.allowIndexing : DEFAULT_SITE_CONTENT.allowIndexing,
  } as SiteContent;
});

export async function updateSiteContent(content: SiteContent, actorUid: string) {
  const firestore = getFirebaseAdminFirestore();
  const reference = firestore.collection("siteContent").doc("landing");
  const previous = await reference.get();
  const batch = firestore.batch();
  batch.set(reference, { ...content, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorUid }, { merge: true });
  batch.create(firestore.collection("adminAuditLogs").doc(), { actorUid, action: "site_content.updated", targetType: "siteContent", targetId: "landing", before: previous.exists ? previous.data() : null, after: content, createdAt: FieldValue.serverTimestamp() });
  await batch.commit();
}
