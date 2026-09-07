"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleAuthProvider, OAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, type UserCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/infrastructure/firebase/client";
import { refreshAuthSession } from "@/presentation/auth/auth-store";
import { apiResponseError, readApiResponse } from "@/presentation/http/read-api-response";

function readableAuthError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(code)) return "E-mail ou senha incorretos.";
  if (code === "auth/popup-closed-by-user") return "O login foi cancelado.";
  if (code === "auth/too-many-requests") return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  return error instanceof Error ? error.message : "Não foi possível entrar. Tente novamente.";
}

export function LoginActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const finishAuthentication = async (credential: UserCredential) => {
    const idToken = await credential.user.getIdToken();
    const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
    const payload = await readApiResponse<{ error: string }>(response);
    if (!response.ok) throw apiResponseError(response, payload.error);
    if (!Object.keys(payload).length) throw new Error("O servidor não confirmou a criação da sessão. Consulte os logs da função /api/auth/session na Vercel.");
    await signOut(await getFirebaseAuth());
    await refreshAuthSession();
    const destination = searchParams.get("next");
    router.replace(destination?.startsWith("/") && !destination.startsWith("//") ? destination : "/dashboard");
    router.refresh();
  };

  const runLogin = async (login: () => Promise<UserCredential>) => {
    setPending(true);
    setErrorMessage(undefined);
    try { await finishAuthentication(await login()); }
    catch (error) { setErrorMessage(readableAuthError(error)); }
    finally { setPending(false); }
  };

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    void runLogin(async () => signInWithEmailAndPassword(await getFirebaseAuth(), email, password));
  };

  const socialLogin = (provider: GoogleAuthProvider | OAuthProvider) => {
    void runLogin(async () => signInWithPopup(await getFirebaseAuth(), provider));
  };

  return <>
    {searchParams.get("reset") === "sent" && <p role="status" className="mt-6 rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">Enviamos as instruções para redefinir sua senha.</p>}
    <div className="mt-8 grid gap-3">
      <button type="button" disabled={pending} onClick={() => socialLogin(new GoogleAuthProvider())} className="btn-pop w-full border-2 border-border bg-card text-foreground shadow-[var(--shadow-pop-muted)] disabled:opacity-60"><span className="mr-3 text-lg font-extrabold text-info">G</span>Continuar com Google</button>
      <button type="button" disabled={pending} onClick={() => socialLogin(new OAuthProvider("apple.com"))} className="btn-pop w-full border-2 border-border bg-card text-foreground shadow-[var(--shadow-pop-muted)] disabled:opacity-60"><span className="mr-3 text-xl">●</span>Continuar com Apple</button>
    </div>
    <div className="my-7 flex items-center gap-4"><div className="h-0.5 flex-1 bg-border" /><span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">ou</span><div className="h-0.5 flex-1 bg-border" /></div>
    <form className="space-y-5" onSubmit={submitLogin}>
      <label className="block"><span className="mb-2 block text-sm font-extrabold">E-mail</span><input type="email" name="email" autoComplete="email" placeholder="voce@exemplo.com" required disabled={pending} className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary" /></label>
      <label className="block"><span className="mb-2 flex items-center justify-between text-sm font-extrabold">Senha<Link href="/recuperar-senha" className="text-xs text-primary hover:underline">Esqueci minha senha</Link></span><input type="password" name="password" autoComplete="current-password" placeholder="Digite sua senha" required disabled={pending} className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary" /></label>
      {errorMessage && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">{errorMessage}</p>}
      <button type="submit" disabled={pending} className="btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">{pending ? "Entrando..." : "Entrar"}</button>
    </form>
  </>;
}
