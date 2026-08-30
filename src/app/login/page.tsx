import Link from "next/link";
import { Logo } from "@/presentation/components/shared/logo";

export default function LoginPage() {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-[#52bd03] to-[#347c00] p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

        <Logo className="relative z-10 text-white" />

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 text-6xl">🩺</div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Continue evoluindo seu raciocínio clínico.
          </h1>
          <p className="mt-5 max-w-lg text-lg font-bold text-white/80">
            Retome seus plantões, preserve seu streak e acompanhe sua evolução.
          </p>
        </div>

        <p className="relative z-10 text-sm font-bold text-white/70">
          Treine hoje. Diagnostique melhor amanhã.
        </p>
      </section>

      <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Logo />
            <Link href="/" className="text-sm font-extrabold text-muted-foreground hover:text-foreground">
              ← Voltar
            </Link>
          </div>

          <div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
            Bem-vindo de volta
          </div>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight">Entre na sua conta</h2>
          <p className="mt-2 font-bold text-muted-foreground">
            Seu próximo caso clínico está esperando.
          </p>

          <div className="mt-8 grid gap-3">
            <button type="button" className="btn-pop w-full border-2 border-border bg-card text-foreground shadow-[var(--shadow-pop-muted)]">
              <span className="mr-3 text-lg font-extrabold text-info">G</span>
              Continuar com Google
            </button>
            <button type="button" className="btn-pop w-full border-2 border-border bg-card text-foreground shadow-[var(--shadow-pop-muted)]">
              <span className="mr-3 text-xl">●</span>
              Continuar com Apple
            </button>
          </div>

          <div className="my-7 flex items-center gap-4">
            <div className="h-0.5 flex-1 bg-border" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">ou</span>
            <div className="h-0.5 flex-1 bg-border" />
          </div>

          <form className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold">E-mail</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
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
                className="w-full rounded-2xl border-2 border-border bg-muted/30 px-4 py-3.5 font-bold outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </label>

            <Link href="/dashboard" className="btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
              Entrar
            </Link>
          </form>

          <p className="mt-7 text-center text-sm font-bold text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/dashboard" className="text-primary hover:underline">Começar gratuitamente</Link>
          </p>

          <Link href="/" className="mx-auto mt-8 hidden w-fit text-sm font-extrabold text-muted-foreground hover:text-foreground lg:block">
            ← Voltar para a página inicial
          </Link>
        </div>
      </section>
    </main>
  );
}
