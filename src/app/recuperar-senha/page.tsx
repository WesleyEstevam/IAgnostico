import Image from "next/image";
import Link from "next/link";
import { PasswordResetForm } from "./password-reset-form";

export default function PasswordResetPage() {
  return <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-[#52bd03] to-[#347c00] px-5 py-16 sm:px-8">
    <Link href="/login" className="absolute left-5 top-5 z-10 text-sm font-extrabold text-white/80 hover:text-white">← Voltar ao login</Link>
    <section className="card-pop relative z-10 w-full max-w-lg border-white/30 bg-background p-6 shadow-2xl sm:p-10">
      <Image src="/iagnostico-logo-green-transparente.png" width={2035} height={773} alt="IAgnóstico" className="mx-auto h-24 w-auto object-contain" priority />
      <h1 className="mt-6 text-center text-4xl font-extrabold tracking-tight">Recupere sua senha</h1>
      <p className="mt-2 text-center font-bold text-muted-foreground">Enviaremos um link seguro para o seu e-mail.</p>
      <PasswordResetForm />
    </section>
  </main>;
}
