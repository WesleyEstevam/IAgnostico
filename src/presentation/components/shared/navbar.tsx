"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Logo } from "./logo";
import {
  getAuthSnapshot,
  getServerAuthSnapshot,
  subscribeToAuth,
} from "@/presentation/auth/auth-store";

export function Navbar() {
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-muted-foreground">
          <Link href="/" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground">Home</Link>
          <Link href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground">Dashboard</Link>
          <Link href="/caso" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground">Casos</Link>
          <Link href="/evolucao" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground">Evolução</Link>
        </nav>
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            aria-label="3 de 3 plantões disponíveis"
            className="flex items-center gap-3 rounded-2xl border-2 border-primary/25 bg-primary/10 px-3 py-2 text-primary transition-transform hover:-translate-y-0.5"
          >
            <span className="hidden text-xs font-extrabold uppercase tracking-wide sm:inline">Plantões</span>
            <span className="flex gap-1" aria-hidden="true">
              {[1, 2, 3].map((plantao) => (
                <span key={plantao} className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground shadow-[0_2px_0_0_var(--primary-dark)]">
                  ✚
                </span>
              ))}
            </span>
            <span className="text-xs font-extrabold">3/3</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex btn-pop bg-muted text-foreground text-xs shadow-[var(--shadow-pop-muted)]">
              Entrar
            </Link>
            <Link href="/dashboard" className="btn-pop bg-primary text-primary-foreground text-xs shadow-[var(--shadow-pop)]">
              Começar grátis
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
