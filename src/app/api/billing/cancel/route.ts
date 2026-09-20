import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { cancelPlayerSubscription } from "@/core/payments/billing-service";
import { isAllowedRequestOrigin } from "@/shared/security/request-origin";

const schema = z.object({ mode: z.enum(["period_end", "refund"]) });
export async function POST(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  const user = await getCurrentFirebaseUser(); if (!user) return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  try { const { mode } = schema.parse(await request.json()); return NextResponse.json(await cancelPlayerSubscription(user.uid, mode)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível cancelar a assinatura." }, { status: 400 }); }
}
