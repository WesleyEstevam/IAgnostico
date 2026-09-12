import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import {
  NoShiftsAvailableError,
  PlayerProfileNotFoundError,
  ProPlanRequiredError,
  startShift,
} from "@/core/shifts/shift-service";
import { ClinicalCaseNotFoundError } from "@/core/cases/clinical-case-service";
import { isAllowedRequestOrigin } from "@/shared/security/request-origin";

const startShiftSchema = z.object({
  specialty: z.enum(["cardiologia", "clinica-geral", "infectologia", "pediatria", "ginecologia-obstetricia", "anestesiologia", "ortopedia", "radiologia", "oncologia", "dermatologia", "aleatorio"]),
  requestId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  try {
    const input = startShiftSchema.parse(await request.json());
    return NextResponse.json(await startShift(user.uid, input.specialty, input.requestId));
  } catch (error) {
    if (error instanceof NoShiftsAvailableError) {
      return NextResponse.json(
        { error: "Hoje foi um dia cansativo. Descanse e retorne para o serviço amanhã" },
        { status: 409 },
      );
    }
    if (error instanceof PlayerProfileNotFoundError) {
      return NextResponse.json({ error: "Perfil do jogador não encontrado." }, { status: 404 });
    }
    if (error instanceof ProPlanRequiredError) {
      return NextResponse.json({ error: "Esta especialidade está disponível apenas no plano Pro." }, { status: 403 });
    }
    if (error instanceof ClinicalCaseNotFoundError) {
      return NextResponse.json({ error: "Ainda não há casos publicados para esta especialidade." }, { status: 503 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados do plantão inválidos." }, { status: 400 });
    }
    console.error("Falha ao iniciar plantão", error);
    return NextResponse.json({ error: "Não foi possível iniciar o plantão." }, { status: 500 });
  }
}
