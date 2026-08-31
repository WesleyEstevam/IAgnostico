"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { authenticate } from "@/presentation/auth/auth-store";

export function LoginActions() {
  const router = useRouter();

  const finishAuthentication = () => {
    authenticate();
    router.push("/dashboard");
  };

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    finishAuthentication();
  };

  return (
    <>
      <div className="mt-8 grid gap-3">
        <button
          type="button"
          onClick={finishAuthentication}
          className="btn-pop w-full border-2 border-border bg-card text-foreground shadow-[var(--shadow-pop-muted)]"
        >
          <span className="mr-3 text-lg font-extrabold text-info">G</span>
          Continuar com Google
        </button>
        <button
          type="button"
          onClick={finishAuthentication}
          className="btn-pop w-full border-2 border-border bg-card text-foreground shadow-[var(--shadow-pop-muted)]"
        >
          <span className="mr-3 text-xl">●</span>
          Continuar com Apple
        </button>
      </div>

      <div className="my-7 flex items-center gap-4">
        <div className="h-0.5 flex-1 bg-border" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">ou</span>
        <div className="h-0.5 flex-1 bg-border" />
      </div>

      <form className="space-y-5" onSubmit={submitLogin}>
        <label className="block">
          <span className="mb-2 block text-sm font-extrabold">E-mail</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            required
            className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-between text-sm font-extrabold">
            Senha
            <Link href="#" className="text-xs text-primary hover:underline">Esqueci minha senha</Link>
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
            className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
        </label>

        <button type="submit" className="btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
          Entrar
        </button>
      </form>
    </>
  );
}
