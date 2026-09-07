import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { clinicalCasesV2, validateClinicalCases } from "./clinical-case-catalog-v2.mjs";

validateClinicalCases(clinicalCasesV2);

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) throw new Error("Preencha as variáveis FIREBASE_ADMIN_* em .env.local.");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
const firestore = getFirestore(app);
const existing = await firestore.collection("clinicalCases").get();
const batch = firestore.batch();

for (const document of existing.docs) {
  const version = document.data().catalogVersion;
  if (typeof version === "string" && version.startsWith("mvp-")) batch.delete(document.ref);
}

for (const clinicalCase of clinicalCasesV2) {
  const { id, ...data } = clinicalCase;
  batch.set(firestore.collection("clinicalCases").doc(id), {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

await batch.commit();

const verification = await firestore.collection("clinicalCases").where("catalogVersion", "==", "mvp-2").get();
const published = verification.docs.filter((document) => document.data().status === "published");
const counts = published.reduce((result, document) => {
  const specialty = document.data().specialty;
  result[specialty] = (result[specialty] ?? 0) + 1;
  return result;
}, {});
if (published.length !== 85) throw new Error(`A publicação terminou com ${published.length} casos MVP ativos, em vez de 85.`);
console.log("Catálogo MVP-2 publicado e verificado.", { total: published.length, ...counts });
