import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { createCheckout } from "@/core/payments/billing-service";
import { isAllowedRequestOrigin } from "@/shared/security/request-origin";
import { checkoutRequestSchema } from "@/core/payments/checkout-validation";

export async function POST(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  try {
    const parsed = checkoutRequestSchema.parse(await request.json());
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const remoteIp = forwarded || request.headers.get("x-real-ip") || "127.0.0.1";
    const result = await createCheckout({ uid: user.uid, ...parsed, remoteIp });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Falha segura ao iniciar checkout", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Não foi possível iniciar o pagamento." }, { status: 400 });
  }
}
