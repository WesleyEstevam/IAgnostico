"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/infrastructure/firebase/client";

export function PasswordResetForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    setPending(true);
    setErrorMessage(undefined);

    try {
      await sendPasswordResetEmail(await getFirebaseAuth(), email, { url: `${window.location.origin}/login` });
      router.replace("/login?reset=sent");
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      setErrorMessage(code === "auth/invalid-email" ? "Digite um endereço de e-mail válido." : "Não foi possível enviar o e-mail. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return <form className="mt-8 space-y-5" onSubmit={submit}>
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold">E-mail</span>
      <input type="email" name="email" autoComplete="email" placeholder="voce@exemplo.com" required disabled={pending} className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none focus:border-primary" />
    </label>
    {errorMessage && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">{errorMessage}</p>}
    <button type="submit" disabled={pending} className="btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">{pending ? "Enviando..." : "Enviar link de recuperação"}</button>
  </form>;
}
