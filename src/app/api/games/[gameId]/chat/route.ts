import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import {
  chatWithPatient,
  PatientChatClosedError,
  PatientChatForbiddenError,
  PatientChatLimitError,
  PatientChatNotFoundError,
} from "@/core/cases/patient-chat-service";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  try {
    const { gameId } = await params;
    if (!z.string().uuid().safeParse(gameId).success) {
      return NextResponse.json({ error: "Partida inválida." }, { status: 400 });
    }
    const input = chatSchema.parse(await request.json());
    return NextResponse.json(await chatWithPatient(user.uid, gameId, input.message));
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Digite uma pergunta de até 500 caracteres." }, { status: 400 });
    if (error instanceof PatientChatForbiddenError) return NextResponse.json({ error: "Partida não autorizada." }, { status: 403 });
    if (error instanceof PatientChatNotFoundError) return NextResponse.json({ error: "Partida não encontrada." }, { status: 404 });
    if (error instanceof PatientChatClosedError) return NextResponse.json({ error: "Este caso já foi encerrado." }, { status: 409 });
    if (error instanceof PatientChatLimitError) return NextResponse.json({ error: "Você atingiu o limite de perguntas deste caso." }, { status: 429 });
    console.error("Falha no chat do paciente", error);
    return NextResponse.json({ error: "O paciente não conseguiu responder agora." }, { status: 500 });
  }
}
