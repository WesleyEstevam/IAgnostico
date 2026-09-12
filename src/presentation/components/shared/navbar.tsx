"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Logo } from "./logo";
import {
  getAuthSnapshot,
  getServerAuthSnapshot,
  clearAuthSession,
  refreshAuthSession,
  subscribeToAuth,
} from "@/presentation/auth/auth-store";

export function Navbar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );

  useEffect(() => {
    void refreshAuthSession();
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      clearAuthSession();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {isAuthenticated && (
          <div
            aria-label={`${isAuthenticated.shifts.current} de ${isAuthenticated.shifts.max} plantões disponíveis`}
            className="flex items-center gap-2 rounded-2xl border-2 border-primary/25 bg-primary/10 px-2 py-2 text-primary sm:px-3"
          >
            <span className="hidden text-xs font-extrabold uppercase tracking-wide lg:inline">
              Plantões
            </span>
            <span className="shift-wave flex gap-1" aria-hidden="true">
              {Array.from({ length: isAuthenticated.shifts.current }, (_, index) => index + 1).map(
                (plantao) => (
                  <span
                    key={plantao}
                    className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground shadow-[0_2px_0_0_var(--primary-dark)]"
                  >
                    ✚
                  </span>
                ),
              )}
            </span>
            <span className="text-xs font-extrabold">
              {isAuthenticated.shifts.current}/{isAuthenticated.shifts.max}
            </span>
          </div>
        )}
        {!isAuthenticated && <span className="w-24" aria-hidden="true" />}
        <Logo className="absolute left-1/2 -translate-x-1/2 max-sm:[&_img]:h-9" />
        {isAuthenticated ? (
          <div className="flex items-center">
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-border bg-card px-1.5 py-1.5 transition-colors hover:bg-muted sm:px-2 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 bg-cover bg-center text-xs font-extrabold text-primary"
                  style={
                    isAuthenticated.user.photoURL
                      ? { backgroundImage: `url(${isAuthenticated.user.photoURL})` }
                      : undefined
                  }
                >
                  {!isAuthenticated.user.photoURL &&
                    (
                      isAuthenticated.user.displayName?.[0] ??
                      isAuthenticated.user.email?.[0] ??
                      "J"
                    ).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate text-xs font-extrabold sm:block">
                  {isAuthenticated.user.displayName ?? isAuthenticated.user.email ?? "Jogador"}
                </span>
                <span
                  aria-hidden="true"
                  className="hidden text-[10px] text-muted-foreground transition-transform group-open:rotate-180 sm:inline"
                >
                  ▼
                </span>
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-44 rounded-2xl border border-border bg-card p-2 shadow-xl">
                <div className="border-b border-border px-3 py-2">
                  <p className="max-w-40 truncate text-xs font-extrabold">
                    {isAuthenticated.user.displayName ?? "Jogador"}
                  </p>
                  {isAuthenticated.user.email && (
                    <p className="max-w-40 truncate text-[11px] text-muted-foreground">
                      {isAuthenticated.user.email}
                    </p>
                  )}
                </div>
                <Link
                  href="/perfil"
                  className="mt-1 block rounded-xl px-3 py-2 text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Meu perfil
                </Link>
                <Link
                  href="/evolucao"
                  className="block rounded-xl px-3 py-2 text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Minha evolução
                </Link>
                <Link
                  href="/ranking"
                  className="block rounded-xl px-3 py-2 text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Ranking
                </Link>
                {isAuthenticated.user.role !== "player" && (
                  <Link
                    href="/admin"
                    className="block rounded-xl px-3 py-2 text-xs font-extrabold text-primary hover:bg-primary/10"
                  >
                    Painel administrativo
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  disabled={loggingOut}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60"
                >
                  {loggingOut ? "Saindo..." : "Sair"}
                </button>
              </div>
            </details>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex btn-pop bg-muted text-foreground text-xs shadow-[var(--shadow-pop-muted)]"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="btn-pop bg-primary text-primary-foreground text-xs shadow-[var(--shadow-pop)]"
            >
              Começar grátis
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
