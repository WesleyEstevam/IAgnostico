import Link from "next/link";
import Image from "next/image";
import { LoginActions } from "./login-actions";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-[#52bd03] to-[#347c00] px-5 py-16 sm:px-8">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

      <Link
        href="/"
        className="absolute left-5 top-5 z-10 text-sm font-extrabold text-white/80 hover:text-white sm:left-8 sm:top-8"
      >
        ← Voltar
      </Link>

      <section className="card-pop relative z-10 w-full max-w-lg border-white/30 bg-background p-6 shadow-2xl sm:p-10">
        <Image
          src="/iagnostico-logo-green-transparente.png"
          width={2035}
          height={773}
          alt="IAgnóstico"
          loading="eager"
          fetchPriority="high"
          className="mx-auto h-24 w-auto object-contain sm:h-28"
        />
        <h1 className="mt-6 text-center text-4xl font-extrabold tracking-tight">Entre na sua conta</h1>
        <p className="mt-2 text-center font-bold text-muted-foreground">
          Seu próximo caso clínico está esperando.
        </p>

        <LoginActions />

        <p className="mt-7 text-center text-sm font-bold text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/dashboard" className="text-primary hover:underline">Começar gratuitamente</Link>
        </p>
      </section>
    </main>
  );
}
