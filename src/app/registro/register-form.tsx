"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { getFirebaseAuth } from "@/infrastructure/firebase/client";
import { refreshAuthSession } from "@/presentation/auth/auth-store";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));
    setPending(true);
    setErrorMessage(undefined);

    try {
      const auth = await getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      try {
        await sendEmailVerification(credential.user, { url: `${window.location.origin}/login?verified=1` });
      } catch (verificationError) {
        console.error("Não foi possível enviar a verificação de e-mail", verificationError);
      }
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível criar sua sessão.");
      await signOut(auth);
      await refreshAuthSession();
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      setErrorMessage(code === "auth/email-already-in-use" ? "Este e-mail já possui uma conta." : error instanceof Error ? error.message : "Não foi possível criar sua conta.");
    } finally {
      setPending(false);
    }
  }

  return <form className="mt-8 space-y-5" onSubmit={submitRegistration}>
    <label className="block"><span className="mb-2 block text-sm font-extrabold">Nome</span><input name="name" autoComplete="name" required disabled={pending} className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none focus:border-primary" /></label>
    <label className="block"><span className="mb-2 block text-sm font-extrabold">E-mail</span><input type="email" name="email" autoComplete="email" required disabled={pending} className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none focus:border-primary" /></label>
    <label className="block"><span className="mb-2 block text-sm font-extrabold">Senha</span><input type="password" name="password" autoComplete="new-password" minLength={6} required disabled={pending} className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none focus:border-primary" /></label>
    {errorMessage && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">{errorMessage}</p>}
    <button type="submit" disabled={pending} className="btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">{pending ? "Criando conta..." : "Criar conta grátis"}</button>
  </form>;
}
