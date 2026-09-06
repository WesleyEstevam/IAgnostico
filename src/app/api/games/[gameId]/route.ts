import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { ClinicalCaseNotFoundError, getPublicGameCase } from "@/core/cases/clinical-case-service";

export async function GET(_request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  const { gameId } = await params;
  if (!z.string().uuid().safeParse(gameId).success) return NextResponse.json({ error: "Partida inválida." }, { status: 400 });

  try {
    return NextResponse.json(await getPublicGameCase(user.uid, gameId));
  } catch (error) {
    if (error instanceof ClinicalCaseNotFoundError) return NextResponse.json({ error: "Caso não encontrado ou já encerrado." }, { status: 404 });
    console.error("Falha ao carregar caso", error);
    return NextResponse.json({ error: "Não foi possível carregar o caso." }, { status: 500 });
  }
}
