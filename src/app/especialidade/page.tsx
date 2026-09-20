import Link from "next/link";
import { Lock } from "lucide-react";
import { Navbar } from "@/presentation/components/shared/navbar";
import { CardDealSound } from "@/presentation/components/sound/card-deal-sound";
import { PRO_PLAN_CTA_HREF } from "@/shared/constants/plans";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { hasActiveProAccess } from "@/core/payments/billing-service";
import { DifficultyPicker } from "./difficulty-picker";

const especialidadesGratuitas = [
  {
    id: "cardiologia",
    nome: "Cardiologia",
    descricao: "Coração, circulação e emergências cardiovasculares.",
    icone: "❤️",
    cor: "bg-destructive/15",
  },
  {
    id: "clinica-geral",
    nome: "Clínica Geral",
    descricao: "Casos variados para exercitar o raciocínio completo.",
    icone: "🩺",
    cor: "bg-info/15",
  },
  {
    id: "infectologia",
    nome: "Infectologia",
    descricao: "Infecções, síndromes febris e doenças transmissíveis.",
    icone: "🦠",
    cor: "bg-primary/15",
  },
  {
    id: "aleatorio",
    nome: "Aleatório",
    descricao: "Deixe o plantão escolher seu próximo desafio.",
    icone: "🎲",
    cor: "bg-xp/20",
  },
] as const;

const especialidadesPro = [
  { id: "pediatria", nome: "Pediatria", descricao: "Saúde, desenvolvimento e urgências na infância.", icone: "🧸" },
  { id: "ginecologia-obstetricia", nome: "Ginecologia e Obstetrícia", descricao: "Saúde da mulher, gestação e assistência ao parto.", icone: "🤰" },
  { id: "anestesiologia", nome: "Anestesiologia", descricao: "Avaliação perioperatória, anestesia e controle da dor.", icone: "💉" },
  { id: "ortopedia", nome: "Ortopedia", descricao: "Traumas e doenças dos ossos, músculos e articulações.", icone: "🦴" },
  { id: "radiologia", nome: "Radiologia", descricao: "Interpretação de imagens e investigação diagnóstica.", icone: "🩻" },
  { id: "oncologia", nome: "Oncologia", descricao: "Diagnóstico, tratamento e acompanhamento do câncer.", icone: "🎗️" },
  { id: "dermatologia", nome: "Dermatologia", descricao: "Doenças da pele, cabelos, unhas e mucosas.", icone: "🔬" },
] as const;

export default async function EspecialidadePage() {
  const user = await getCurrentFirebaseUser();
  const profile = user ? await getFirebaseAdminFirestore().collection("users").doc(user.uid).get() : null;
  const hasProAccess = user && profile ? await hasActiveProAccess(user.uid, profile.data()) : false;
  return (
    <div className="min-h-screen bg-background">
      <CardDealSound />
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="text-center">
          <div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
            Novo plantão
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Escolha sua especialidade
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-bold text-muted-foreground">
            Qual área você quer treinar agora?
          </p>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-extrabold">Disponíveis no plano gratuito</h2>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">Liberadas</span>
          </div>
          <div className="stagger grid gap-4 sm:grid-cols-2">
            {especialidadesGratuitas.map((especialidade) => (
              <DifficultyPicker
                key={especialidade.id}
                specialtyId={especialidade.id}
                specialtyName={especialidade.nome}
                className="card-pop card-jelly group flex min-h-40 items-center gap-5 p-5 text-left sm:p-6"
              >
                <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl text-4xl ${especialidade.cor}`}>
                  {especialidade.icone}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold">{especialidade.nome}</h2>
                  <p className="mt-1 text-sm font-bold text-muted-foreground">
                    {especialidade.descricao}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-primary">
                    Jogar agora <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </DifficultyPicker>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-extrabold">Especialidades do plano Pro</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3 w-3" /> Bloqueadas
            </span>
          </div>
          <div className="stagger grid gap-4 sm:grid-cols-2">
            {especialidadesPro.map((especialidade) => (
              hasProAccess ? (
                <DifficultyPicker
                  key={especialidade.nome}
                  specialtyId={especialidade.id}
                  specialtyName={especialidade.nome}
                  className="card-pop card-jelly group relative flex min-h-40 items-center gap-5 overflow-hidden border-primary/25 p-5 text-left sm:p-6"
                >
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">Pro</span>
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-border/70 text-4xl opacity-65">{especialidade.icone}</div>
                  <div className="min-w-0 flex-1 pr-8">
                    <h3 className="text-xl font-extrabold text-muted-foreground">{especialidade.nome}</h3>
                    <p className="mt-1 text-sm font-bold text-muted-foreground/80">{especialidade.descricao}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide">Jogar agora <span className="transition-transform group-hover:translate-x-1">→</span></span>
                  </div>
                </DifficultyPicker>
              ) : (
                <Link
                  key={especialidade.nome}
                  href={PRO_PLAN_CTA_HREF}
                  aria-label={`${especialidade.nome}, disponível no plano Pro. Ver assinatura.`}
                  className="card-pop group relative flex min-h-40 items-center gap-5 overflow-hidden border-border bg-muted/60 p-5 text-left text-muted-foreground grayscale transition hover:-translate-y-1 hover:grayscale-[70%] hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 sm:p-6"
                >
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">
                  <Lock className="h-3 w-3" /> Pro
                </span>
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-border/70 text-4xl opacity-65">
                  {especialidade.icone}
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <h3 className="text-xl font-extrabold text-muted-foreground">{especialidade.nome}</h3>
                  <p className="mt-1 text-sm font-bold text-muted-foreground/80">{especialidade.descricao}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide">
                    Ver plano Pro <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
                </Link>
              )
            ))}
          </div>
        </section>

        <Link
          href="/dashboard"
          className="mx-auto mt-8 text-sm font-extrabold text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Voltar ao dashboard
        </Link>
      </main>
    </div>
  );
}
