import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error("Uso: npm run grant:admin -- usuario@exemplo.com");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) throw new Error("Preencha as variáveis FIREBASE_ADMIN_* em .env.local.");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
const user = await getAuth(app).getUserByEmail(email);
await getFirestore(app).collection("users").doc(user.uid).set({ role: "admin", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
console.log(`Acesso administrativo concedido a ${email}.`);
