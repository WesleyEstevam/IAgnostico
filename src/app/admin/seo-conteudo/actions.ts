"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { updateSiteContent } from "@/core/admin/site-content-service";
import { getFirebaseAdminStorage } from "@/infrastructure/firebase/admin";
import { randomUUID } from "node:crypto";

export type ContentActionState = { success?: string; error?: string };
const required = (max: number) => z.string().trim().min(3).max(max);
const schema = z.object({
  seoTitle: required(70), seoDescription: required(170), seoKeywords: required(500), canonicalUrl: z.string().trim().url(), socialImageUrl: z.string().trim().min(1).max(1000), logoSquareUrl: z.string().trim().min(1).max(1000), allowIndexing: z.enum(["on"]).optional(),
  heroTitle: required(80), heroHighlight: required(80), heroDescription: required(300), primaryCta: required(40), secondaryCta: required(40), socialProof: required(100),
  featuresEyebrow: required(40), featuresTitle: required(100), featuresDescription: required(220), gamificationTitle: required(100), gamificationDescription: required(250), communityTitle: required(100), communityDescription: required(250), testimonialsTitle: required(100), pricingTitle: required(100), pricingDescription: required(180), footerText: required(140),
});

export async function updateSiteContentAction(_state: ContentActionState, formData: FormData): Promise<ContentActionState> {
  try {
    const staff = await requirePermission("settings.manage");
    const values = Object.fromEntries(formData);
    const parsed = schema.safeParse(values);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revise o conteúdo informado." };
    const data = parsed.data;
    const logoSquareUrl = await uploadSeoImage(formData.get("logoSquareFile"), "logo-square", data.logoSquareUrl);
    const socialImageUrl = await uploadSeoImage(formData.get("socialImageFile"), "social-cover", data.socialImageUrl);
    const keywords = data.seoKeywords.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    await updateSiteContent({ ...data, logoSquareUrl, socialImageUrl, seoKeywords: keywords, allowIndexing: data.allowIndexing === "on" }, staff.user.uid);
    revalidatePath("/");
    revalidatePath("/admin/seo-conteudo");
    return { success: "SEO e conteúdo atualizados na landing page." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível atualizar o conteúdo." }; }
}

const acceptedTypes = new Map([["image/png", "png"], ["image/jpeg", "jpg"], ["image/webp", "webp"]]);
async function uploadSeoImage(value: FormDataEntryValue | null, name: string, currentValue: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return typeof currentValue === "string" ? currentValue : "";
  const extension = acceptedTypes.get(value.type);
  if (!extension) throw new Error("Envie imagens em PNG, JPEG ou WebP.");
  if (value.size > 3 * 1024 * 1024) throw new Error("Cada imagem deve ter no máximo 3 MB.");
  const bucket = getFirebaseAdminStorage().bucket();
  const path = `seo/${name}-${Date.now()}.${extension}`;
  const token = randomUUID();
  await bucket.file(path).save(Buffer.from(await value.arrayBuffer()), { resumable: false, contentType: value.type, metadata: { cacheControl: "public,max-age=31536000,immutable", metadata: { firebaseStorageDownloadTokens: token } } });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}
