import Link from "next/link";
import { Logo } from "./logo";

export function Navbar() {
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
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex btn-pop bg-muted text-foreground text-xs shadow-[var(--shadow-pop-muted)]">
            Entrar
          </Link>
          <Link href="/dashboard" className="btn-pop bg-primary text-primary-foreground text-xs shadow-[var(--shadow-pop)]">
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
