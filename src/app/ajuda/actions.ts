"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getPublicSupportSettings } from "@/core/admin/support-settings-service";
import {
  cleanPlainText,
  createPublicSupportTicket,
  enforceSupportRateLimit,
  uploadSupportAttachment,
  verifyTurnstile,
} from "@/core/support/public-support-service";

export type PublicSupportState = { error?: string; success?: string; protocol?: string };
const schema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{8,20}$/)
    .or(z.literal("")),
  subjectId: z.string().trim().min(1).max(60),
  message: z.string().trim().min(10).max(1000),
  turnstile: z.string().max(2048),
});

export async function submitPublicSupportAction(
  _state: PublicSupportState,
  formData: FormData,
): Promise<PublicSupportState> {
  try {
    const user = await getCurrentFirebaseUser();
    let identity = {
      uid: "",
      firstName: cleanPlainText(String(formData.get("firstName") ?? "")),
      lastName: cleanPlainText(String(formData.get("lastName") ?? "")),
      email: cleanPlainText(String(formData.get("email") ?? "")).toLowerCase(),
      phone: cleanPlainText(String(formData.get("phone") ?? "")),
    };
    if (user) {
      const profile =
        (await getFirebaseAdminFirestore().collection("users").doc(user.uid).get()).data() ?? {};
      const name = cleanPlainText(
        typeof profile.displayName === "string" ? profile.displayName : (user.name ?? "Jogador"),
      );
      const parts = name.split(/\s+/);
      identity = {
        uid: user.uid,
        firstName: parts.shift() || "Jogador",
        lastName: parts.join(" ") || "Não informado",
        email: typeof profile.email === "string" ? profile.email : (user.email ?? ""),
        phone: typeof profile.phone === "string" ? profile.phone : "",
      };
    }
    const parsed = schema.safeParse({
      ...identity,
      subjectId: formData.get("subjectId"),
      message: cleanPlainText(String(formData.get("message") ?? "")),
      turnstile: formData.get("cf-turnstile-response"),
    });
    if (!parsed.success)
      return {
        error:
          "Revise os campos. A mensagem deve ter entre 10 e 1.000 caracteres e o telefone precisa ser válido.",
      };
    if (!user && !parsed.data.phone) return { error: "Informe um celular válido." };
    const settings = await getPublicSupportSettings();
    const subject = settings.subjects.find((item) => item.id === parsed.data.subjectId);
    if (!subject) return { error: "Selecione um assunto válido." };
    const requestHeaders = await headers();
    const remoteIp =
      requestHeaders.get("cf-connecting-ip") ??
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "";
    const hostname = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "")
      .split(":")[0]
      .toLowerCase();
    await verifyTurnstile(parsed.data.turnstile, remoteIp, hostname);
    await enforceSupportRateLimit(`${remoteIp}|${parsed.data.email}`);
    const attachmentValue = formData.get("attachment");
    const attachment = await uploadSupportAttachment(
      attachmentValue instanceof File ? attachmentValue : null,
    );
    const protocol = await createPublicSupportTicket({
      requester: { ...parsed.data, uid: identity.uid },
      subjectId: subject.id,
      subjectLabel: subject.label,
      message: parsed.data.message,
      attachment,
    });
    return { success: "Solicitação aberta com sucesso.", protocol };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não foi possível abrir a solicitação.",
    };
  }
}
