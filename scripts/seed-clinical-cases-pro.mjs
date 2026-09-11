import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { clinicalCasesPro, validateClinicalCasesPro } from "./clinical-case-catalog-pro.mjs";

validateClinicalCasesPro(clinicalCasesPro);

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) throw new Error("Preencha as variáveis FIREBASE_ADMIN_* em .env.local.");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, "seed-pro");
const firestore = getFirestore(app);
const existing = await firestore.collection("clinicalCases").where("catalogVersion", "==", "pro-1").get();
const batch = firestore.batch();
existing.docs.forEach((document) => batch.delete(document.ref));
clinicalCasesPro.forEach(({ id, ...clinicalCase }) => batch.set(firestore.collection("clinicalCases").doc(id), {
  ...clinicalCase,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
}));
await batch.commit();

const verification = await firestore.collection("clinicalCases").where("catalogVersion", "==", "pro-1").get();
if (verification.size !== 105) throw new Error(`A publicação terminou com ${verification.size} casos Pro, em vez de 105.`);
console.log("Catálogo Pro publicado e verificado.", { total: verification.size });
