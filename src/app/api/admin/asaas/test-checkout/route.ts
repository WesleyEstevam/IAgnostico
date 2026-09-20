import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/core/admin/admin-service";
import { checkoutRequestSchema } from "@/core/payments/checkout-validation";
import { createCheckout } from "@/core/payments/billing-service";
import { isAllowedRequestOrigin } from "@/shared/security/request-origin";

export async function POST(request: NextRequest) {
  if (!isAllowedRequestOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  try {
    const staff = await requirePermission("settings.manage");
    const parsed = checkoutRequestSchema.parse(await request.json());
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const remoteIp = forwarded || request.headers.get("x-real-ip") || "127.0.0.1";
    return NextResponse.json(await createCheckout({ uid: staff.user.uid, ...parsed, remoteIp, testMode: true }));
  } catch (error) {
    console.error("Falha segura no checkout Sandbox", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Não foi possível executar o teste." }, { status: 400 });
  }
}
