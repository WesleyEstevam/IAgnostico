import Link from "next/link";
import { Navbar } from "@/presentation/components/shared/navbar";
import { CardDealSound } from "@/presentation/components/sound/card-deal-sound";

const especialidades = [
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

export default function EspecialidadePage() {
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

        <div className="stagger mt-10 grid gap-4 sm:grid-cols-2">
          {especialidades.map((especialidade) => (
            <Link
              key={especialidade.id}
              href={`/preparacao/${especialidade.id}`}
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
            </Link>
          ))}
        </div>

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
