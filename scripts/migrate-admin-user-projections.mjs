import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) throw new Error("Preencha as variáveis FIREBASE_ADMIN_* em .env.local.");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, "migrate-admin-users");
const auth = getAuth(app);
const firestore = getFirestore(app);

function normalize(value) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9@.+_-]/g, " ").replace(/\s+/g, " ").trim();
}

function keywords(values) {
  const result = new Set();
  values.forEach((original) => {
    const value = normalize(original);
    if (!value) return;
    new Set([value, ...value.split(" ")]).forEach((part) => {
      for (let length = 2; length <= Math.min(part.length, 50); length += 1) result.add(part.slice(0, length));
    });
  });
  return [...result].slice(0, 300);
}

let pageToken;
let migrated = 0;
do {
  const page = await auth.listUsers(400, pageToken);
  const refs = page.users.map((user) => firestore.collection("users").doc(user.uid));
  const existing = refs.length ? await firestore.getAll(...refs) : [];
  const batch = firestore.batch();
  page.users.forEach((user, index) => {
    const current = existing[index]?.data() ?? {};
    const displayName = typeof current.displayName === "string" && current.displayName.trim() ? current.displayName : user.displayName || "Jogador";
    const data = {
      displayName,
      displayNameNormalized: normalize(displayName),
      email: user.email ?? current.email ?? null,
      phone: user.phoneNumber ?? current.phone ?? null,
      photoURL: user.photoURL ?? current.photoURL ?? null,
      provider: user.providerData[0]?.providerId ?? "password",
      accountStatus: user.disabled ? "disabled" : "active",
      searchKeywords: keywords([displayName, user.email, user.phoneNumber, user.uid]),
      lastAccessAt: user.metadata.lastSignInTime ? Timestamp.fromDate(new Date(user.metadata.lastSignInTime)) : null,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (!existing[index]?.exists) {
      Object.assign(data, {
        plan: "free",
        createdAt: user.metadata.creationTime ? Timestamp.fromDate(new Date(user.metadata.creationTime)) : FieldValue.serverTimestamp(),
      });
    }
    batch.set(refs[index], data, { merge: true });
  });
  await batch.commit();
  migrated += page.users.length;
  pageToken = page.pageToken;
} while (pageToken);

console.log(`Projeção administrativa atualizada para ${migrated} usuários.`);
