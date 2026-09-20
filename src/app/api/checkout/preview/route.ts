import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { previewCheckout } from "@/core/payments/billing-service";

const schema = z.object({ planId: z.string().regex(/^[a-z0-9-]{2,40}$/), cycle: z.enum(["monthly", "annual"]), couponCode: z.string().trim().max(30) });
export async function POST(request: NextRequest) {
  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  try {
    const parsed = schema.parse(await request.json());
    const summary = await previewCheckout(parsed.planId, parsed.cycle, parsed.couponCode);
    return NextResponse.json({ originalAmountCents: summary.originalAmountCents, discountCents: summary.discountCents, finalAmountCents: summary.finalAmountCents, couponCode: summary.code });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Cupom inválido." }, { status: 400 }); }
}
