import "server-only";

import type { BillingIdentity, GatewayCheckoutResult, GatewaySubscriptionInput, PaymentGateway, PaymentMethod, CardData } from "@/core/payments/payment-gateway";
import { getAsaasCredentials, saveAsaasAccountSummary } from "@/core/payments/payment-settings-service";

type JsonObject = Record<string, unknown>;

export class AsaasGateway implements PaymentGateway {
  readonly provider = "asaas";

  constructor(private readonly allowDisabledSandbox = false) {}

  private async request(path: string, init: RequestInit = {}): Promise<JsonObject> {
    const settings = await getAsaasCredentials();
    if (!settings.apiKey) throw new Error("A API Key do Asaas ainda não foi configurada.");
    if (!settings.enabled && !(this.allowDisabledSandbox && settings.environment === "sandbox")) {
      throw new Error("A integração Asaas ainda não está habilitada no painel administrativo.");
    }
    const baseUrl = settings.environment === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", access_token: settings.apiKey, "User-Agent": "IAgnostico/1.0", ...init.headers },
      signal: AbortSignal.timeout(65000),
    });
    const text = await response.text();
    let payload: JsonObject = {};
    try { payload = text ? JSON.parse(text) as JsonObject : {}; } catch { payload = {}; }
    if (!response.ok) {
      const errors = Array.isArray(payload.errors) ? payload.errors as Array<{ description?: string }> : [];
      throw new Error(errors[0]?.description || `O Asaas recusou a operação (${response.status}).`);
    }
    return payload;
  }

  async createCustomer(input: BillingIdentity & { externalReference: string }) {
    const payload = await this.request("/customers", { method: "POST", body: JSON.stringify({ name: input.name, cpfCnpj: input.cpfCnpj, email: input.email, mobilePhone: input.mobilePhone, postalCode: input.postalCode, addressNumber: input.addressNumber, complement: input.addressComplement || undefined, externalReference: input.externalReference, notificationDisabled: true }) });
    if (typeof payload.id !== "string") throw new Error("O Asaas não retornou o identificador do cliente.");
    return payload.id;
  }

  async createCardSubscription(input: GatewaySubscriptionInput & { card: CardData }): Promise<GatewayCheckoutResult> {
    const payload = await this.request("/subscriptions", { method: "POST", body: JSON.stringify({ customer: input.customerId, billingType: "CREDIT_CARD", value: input.amountCents / 100, nextDueDate: today(), cycle: input.cycle === "annual" ? "YEARLY" : "MONTHLY", description: input.description, externalReference: input.externalReference, creditCard: input.card, creditCardHolderInfo: { name: input.identity.name, email: input.identity.email, cpfCnpj: input.identity.cpfCnpj, postalCode: input.identity.postalCode, addressNumber: input.identity.addressNumber, addressComplement: input.identity.addressComplement || undefined, mobilePhone: input.identity.mobilePhone }, remoteIp: input.remoteIp }) });
    if (typeof payload.id !== "string") throw new Error("O Asaas não retornou o identificador da assinatura.");
    return { providerSubscriptionId: payload.id, providerPaymentId: typeof payload.payment === "string" ? payload.payment : null, status: typeof payload.status === "string" ? payload.status : "PENDING" };
  }

  async createPixAutomaticSubscription(input: GatewaySubscriptionInput): Promise<GatewayCheckoutResult> {
    const immediateExpiration = new Date(Date.now() + 30 * 60_000).toISOString();
    const payload = await this.request("/pix/automatic/authorizations", { method: "POST", body: JSON.stringify({ frequency: input.cycle === "annual" ? "ANNUALLY" : "MONTHLY", contractId: input.externalReference.slice(0, 35), startDate: today(), value: input.amountCents / 100, description: input.description.slice(0, 35), customerId: input.customerId, paymentCreationMode: "SUBSCRIPTION", retryPolicy: "ALLOW_THREE_IN_SEVEN_DAYS", immediateQrCode: { expirationSeconds: 30 * 60 } }) });
    if (typeof payload.id !== "string") throw new Error("O Asaas não retornou a autorização do Pix Automático.");
    const qr = payload.immediateQrCode && typeof payload.immediateQrCode === "object" ? payload.immediateQrCode as JsonObject : {};
    return { providerSubscriptionId: payload.id, providerPaymentId: typeof qr.paymentId === "string" ? qr.paymentId : null, status: typeof payload.status === "string" ? payload.status : "PENDING", qrCodePayload: typeof qr.payload === "string" ? qr.payload : typeof qr.copyPaste === "string" ? qr.copyPaste : undefined, qrCodeImage: typeof qr.encodedImage === "string" ? qr.encodedImage : undefined, expiresAt: typeof qr.expirationDate === "string" ? qr.expirationDate : immediateExpiration };
  }

  async cancelSubscription(id: string, method: PaymentMethod) {
    await this.request(method === "pix_automatic" ? `/pix/automatic/authorizations/${encodeURIComponent(id)}` : `/subscriptions/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async refundPayment(id: string) {
    await this.request(`/payments/${encodeURIComponent(id)}/refund`, { method: "POST", body: "{}" });
  }
}

function today() { return new Date().toISOString().slice(0, 10); }

export async function getPaymentGateway(provider = "asaas", options?: { allowDisabledSandbox?: boolean }): Promise<PaymentGateway> {
  if (provider === "asaas") return new AsaasGateway(options?.allowDisabledSandbox === true);
  throw new Error("Provedor de pagamento não suportado.");
}

export async function syncAsaasWebhook(webhookUrl: string, email: string) {
  const settings = await getAsaasCredentials();
  if (!settings.apiKey || !settings.webhookToken) throw new Error("Salve a API Key e o token do webhook antes de sincronizar.");
  const baseUrl = settings.environment === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
  const call = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${baseUrl}${path}`, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", access_token: settings.apiKey, "User-Agent": "IAgnostico/1.0", ...init.headers }, signal: AbortSignal.timeout(30000) });
    const text = await response.text(); let payload: JsonObject = {}; try { payload = text ? JSON.parse(text) as JsonObject : {}; } catch { payload = {}; }
    if (!response.ok) { const errors = Array.isArray(payload.errors) ? payload.errors as Array<{ description?: string }> : []; throw new Error(errors[0]?.description || `Não foi possível sincronizar o webhook (${response.status}).`); }
    return payload;
  };
  const [list, commercialInfo, accountStatus, accountNumber] = await Promise.all([
    call("/webhooks?limit=100"),
    call("/myAccount/commercialInfo/"),
    call("/myAccount/status/"),
    call("/myAccount/accountNumber"),
  ]);
  const webhooks = Array.isArray(list.data) ? list.data as JsonObject[] : [];
  const current = webhooks.find((item) => item.url === webhookUrl);
  const body = { name: "IAgnóstico", url: webhookUrl, email, enabled: true, interrupted: false, apiVersion: 3, authToken: settings.webhookToken, sendType: "SEQUENTIALLY", events: ["PAYMENT_CREATED", "PAYMENT_UPDATED", "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_OVERDUE", "PAYMENT_DELETED", "PAYMENT_RESTORED", "PAYMENT_REFUNDED", "PAYMENT_PARTIALLY_REFUNDED", "PAYMENT_REFUND_IN_PROGRESS", "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED", "PAYMENT_AWAITING_RISK_ANALYSIS", "PAYMENT_APPROVED_BY_RISK_ANALYSIS", "PAYMENT_REPROVED_BY_RISK_ANALYSIS", "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CREATED", "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED", "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED", "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_EXPIRED", "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED"] };
  const result = await call(current && typeof current.id === "string" ? `/webhooks/${encodeURIComponent(current.id)}` : "/webhooks", { method: current ? "PUT" : "POST", body: JSON.stringify(body) });
  const rawDocument = typeof commercialInfo.cpfCnpj === "string" ? commercialInfo.cpfCnpj.replace(/\D/g, "") : "";
  const maskedDocument = rawDocument.length > 4 ? `${"•".repeat(rawDocument.length - 4)}${rawDocument.slice(-4)}` : rawDocument;
  const numberParts = [accountNumber.agency, accountNumber.account, accountNumber.accountDigit]
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map(String);
  const status = [accountStatus.general, accountStatus.commercialInfo, accountStatus.bankAccountInfo, accountStatus.documentation]
    .find((value) => typeof value === "string");
  const account = {
    name: typeof commercialInfo.companyName === "string" ? commercialInfo.companyName : typeof commercialInfo.name === "string" ? commercialInfo.name : "Conta Asaas",
    email: typeof commercialInfo.email === "string" ? commercialInfo.email : "",
    document: maskedDocument,
    accountNumber: typeof accountNumber.accountNumber === "string" ? accountNumber.accountNumber : numberParts.join(" / "),
    status: typeof status === "string" ? status : "Conectada",
  };
  await saveAsaasAccountSummary(account);
  return {
    webhookId: typeof result.id === "string" ? result.id : typeof current?.id === "string" ? current.id : "sincronizado",
    account,
  };
}
