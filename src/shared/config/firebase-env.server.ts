import "server-only";
import { z } from "zod";

const adminFirebaseSchema = z.object({
  projectId: z.string().min(1),
  clientEmail: z.string().email(),
  privateKey: z.string().min(1),
});

export function getFirebaseAdminConfig() {
  const parsed = adminFirebaseSchema.safeParse({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });

  if (!parsed.success) {
    throw new Error("Firebase Admin não configurado. Preencha as variáveis FIREBASE_ADMIN_* em .env.local.");
  }

  return parsed.data;
}
