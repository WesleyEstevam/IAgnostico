import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3]?.trim().toLowerCase() || "admin";
if (!email || !["superadmin", "admin", "support"].includes(role)) throw new Error("Uso: npm run grant:admin -- usuario@exemplo.com [superadmin|admin|support]");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) throw new Error("Preencha as variáveis FIREBASE_ADMIN_* em .env.local.");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
const user = await getAuth(app).getUserByEmail(email);
const firestore = getFirestore(app);
const userRef = firestore.collection("users").doc(user.uid);
const current = await userRef.get();
const batch = firestore.batch();
batch.set(userRef, { role, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
batch.create(firestore.collection("adminAuditLogs").doc(), {
  actorUid: "bootstrap-script",
  action: "staff.role_changed",
  targetType: "user",
  targetId: user.uid,
  before: { role: current.data()?.role ?? null },
  after: { role },
  createdAt: FieldValue.serverTimestamp(),
});
await batch.commit();
console.log(`Papel ${role} concedido a ${email}.`);
