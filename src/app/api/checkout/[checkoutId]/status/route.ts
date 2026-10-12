import { NextResponse, type NextRequest } from "next/server";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { AsaasGateway } from "@/infrastructure/payments/asaas-gateway";
import { getAsaasCredentials } from "@/core/payments/payment-settings-service";
import { processPaymentEvent, processPixAuthorization } from "@/core/payments/payment-event-service";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: NextRequest, context: { params: Promise<{ checkoutId: string }> }) {
  const user = await getCurrentFirebaseUser();
  if (!user) return NextResponse.json({ error: "Faça login para consultar o pagamento." }, { status: 401, headers });
  const { checkoutId } = await context.params;
  if (!/^[a-f0-9]{32}$/.test(checkoutId)) return NextResponse.json({ error: "Checkout não encontrado." }, { status: 404, headers });
  try {
    const document = await getFirebaseAdminFirestore().collection("checkoutSessions").doc(checkoutId).get();
    const checkout = document.data();
    if (!document.exists || checkout?.uid !== user.uid || checkout.testMode === true) {
      return NextResponse.json({ error: "Checkout não encontrado." }, { status: 404, headers });
    }
    if (checkout.paymentConfirmed === true || checkout.status === "paid") {
      return NextResponse.json({ paid: true }, { headers });
    }
    // Reconcile a delayed/missing webhook using authenticated provider data.
    const settings = await getAsaasCredentials();
    if (settings.environment !== checkout.environment || typeof checkout.providerSubscriptionId !== "string") {
      return NextResponse.json({ paid: false }, { headers });
    }
    const gateway = new AsaasGateway();
    if (checkout.method === "pix_automatic") {
      const authorization = await gateway.getPixAuthorization(checkout.providerSubscriptionId);
      if (authorization.status === "ACTIVE") {
        await processPixAuthorization("PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED", authorization);
      }
    } else {
      const payments = await gateway.getSubscriptionPayments(checkout.providerSubscriptionId);
      const payment = payments.find((item) => ["CONFIRMED", "RECEIVED"].includes(String(item.status)) && item.deleted !== true);
      if (payment) await processPaymentEvent(`PAYMENT_${payment.status}`, { ...payment, externalReference: checkoutId });
    }
    const updated = (await document.ref.get()).data();
    return NextResponse.json({ paid: updated?.paymentConfirmed === true || updated?.status === "paid" }, { headers });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar o pagamento." }, { status: 503, headers });
  }
}
