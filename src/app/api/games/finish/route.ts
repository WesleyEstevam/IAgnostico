import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { finishGameSession, GameSessionForbiddenError, GameSessionNotFoundError } from "@/core/cases/case-service";
import { isAllowedRequestOrigin } from "@/shared/security/request-origin";

const finishSchema = z.object({
  gameId: z.string().uuid(),
  hypothesis: z.string().max(500),
  reason: z.enum(["tempo", "diagnostico"]),
});

export async function POST(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  try {
    const input = finishSchema.parse(await request.json());
    return NextResponse.json(await finishGameSession(user.uid, input.gameId, input.hypothesis, input.reason));
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Dados do resultado inválidos." }, { status: 400 });
    if (error instanceof GameSessionForbiddenError) return NextResponse.json({ error: "Partida não autorizada." }, { status: 403 });
    if (error instanceof GameSessionNotFoundError) return NextResponse.json({ error: "Partida não encontrada." }, { status: 404 });
    console.error("Falha ao finalizar caso", error);
    return NextResponse.json({ error: "Não foi possível salvar o resultado." }, { status: 500 });
  }
}
