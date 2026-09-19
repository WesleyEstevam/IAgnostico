import Link from "next/link";
import { ArrowLeft, Headphones, ShieldCheck } from "lucide-react";
import { Navbar } from "@/presentation/components/shared/navbar";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getPublicSupportSettings } from "@/core/admin/support-settings-service";
import { SupportRequestForm } from "./support-request-form";

export const metadata = {
  title: "Ajuda e suporte",
  description: "Abra uma solicitação de atendimento para a equipe IAgnóstico.",
};
export default async function HelpPage() {
  const [user, settings] = await Promise.all([
    getCurrentFirebaseUser(),
    getPublicSupportSettings(),
  ]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={user ? "/dashboard" : "/"}
          className="mb-7 inline-flex items-center gap-2 text-sm font-extrabold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Headphones className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-4xl font-black sm:text-5xl">Como podemos ajudar?</h1>
          <p className="mt-3 font-bold text-muted-foreground">
            Envie sua solicitação para a equipe IAgnóstico. Você receberá um protocolo para
            acompanhar o atendimento.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-primary">
            <ShieldCheck className="h-4 w-4" />
            Seus dados são processados com segurança.
          </p>
        </header>
        <SupportRequestForm
          authenticated={Boolean(user)}
          subjects={settings.subjects}
          siteKey={settings.siteKey}
        />
      </main>
    </div>
  );
}
