import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { RegisterForm } from "./register-form";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getApplicationSettings } from "@/core/admin/application-settings-service";
import { getPlanShiftLimits } from "@/core/admin/plan-admin-service";

export default async function RegisterPage() {
  const [user, settings, limits] = await Promise.all([
    getCurrentFirebaseUser(),
    getApplicationSettings(),
    getPlanShiftLimits(),
  ]);
  if (user) redirect("/dashboard");

  return <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-[#52bd03] to-[#347c00] px-5 py-16 sm:px-8">
    <Link href="/" className="absolute left-5 top-5 z-10 text-sm font-extrabold text-white/80 hover:text-white">← Voltar</Link>
    <section className="card-pop relative z-10 w-full max-w-lg border-white/30 bg-background p-6 shadow-2xl sm:p-10">
      <Image src="/iagnostico-logo-green-transparente.png" width={2035} height={773} alt="IAgnóstico" className="mx-auto h-24 w-auto object-contain" priority />
      {settings.registrationsEnabled ? <>
        <h1 className="mt-6 text-center text-4xl font-extrabold tracking-tight">Crie sua conta</h1>
        <p className="mt-2 text-center font-bold text-muted-foreground">Comece com {limits.free} plantões gratuitos.</p>
        <RegisterForm />
        <p className="mt-7 text-center text-sm font-bold text-muted-foreground">Já tem conta? <Link href="/login" className="text-primary hover:underline">Entrar</Link></p>
      </> : <div className="py-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary"><LockKeyhole className="h-8 w-8" /></span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Inscrições temporariamente fechadas</h1>
        <p className="mt-3 font-bold text-muted-foreground">Novos cadastros estão pausados no momento. Se você já possui uma conta, pode entrar normalmente.</p>
        <Link href="/login" className="btn-pop mt-7 bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">Entrar na minha conta</Link>
      </div>}
    </section>
  </main>;
}
