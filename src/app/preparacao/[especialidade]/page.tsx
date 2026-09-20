import { Countdown } from "./countdown";

const especialidades = [
  "cardiologia",
  "clinica-geral",
  "infectologia",
  "pediatria",
  "ginecologia-obstetricia",
  "anestesiologia",
  "ortopedia",
  "radiologia",
  "oncologia",
  "dermatologia",
  "aleatorio",
] as const;

type Especialidade = (typeof especialidades)[number];

export function generateStaticParams() {
  return especialidades.map((especialidade) => ({ especialidade }));
}

export default async function PreparacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ especialidade: string }>;
  searchParams: Promise<{ dificuldade?: string }>;
}) {
  const { especialidade: valorRecebido } = await params;
  const { dificuldade: dificuldadeRecebida } = await searchParams;
  const especialidade: Especialidade = especialidades.includes(
    valorRecebido as Especialidade,
  )
    ? (valorRecebido as Especialidade)
    : "aleatorio";

  const dificuldade = ["facil", "intermediario", "dificil"].includes(dificuldadeRecebida ?? "")
    ? (dificuldadeRecebida as "facil" | "intermediario" | "dificil")
    : "intermediario";

  return <Countdown especialidade={especialidade} dificuldade={dificuldade} />;
}
