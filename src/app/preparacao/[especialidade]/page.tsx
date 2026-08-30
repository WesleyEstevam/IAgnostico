import { Countdown } from "./countdown";

const especialidades = [
  "cardiologia",
  "clinica-geral",
  "infectologia",
  "aleatorio",
] as const;

type Especialidade = (typeof especialidades)[number];

export function generateStaticParams() {
  return especialidades.map((especialidade) => ({ especialidade }));
}

export default async function PreparacaoPage({
  params,
}: {
  params: Promise<{ especialidade: string }>;
}) {
  const { especialidade: valorRecebido } = await params;
  const especialidade: Especialidade = especialidades.includes(
    valorRecebido as Especialidade,
  )
    ? (valorRecebido as Especialidade)
    : "aleatorio";

  return <Countdown especialidade={especialidade} />;
}
