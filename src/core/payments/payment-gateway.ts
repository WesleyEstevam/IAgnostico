import "server-only";

export type BillingCycle = "monthly" | "annual";
export type PaymentMethod = "credit_card" | "pix_automatic";

export type BillingIdentity = {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  postalCode: string;
  addressNumber: string;
  addressComplement: string;
};

export type CardData = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
};

export type GatewaySubscriptionInput = {
  customerId: string;
  amountCents: number;
  cycle: BillingCycle;
  description: string;
  externalReference: string;
  identity: BillingIdentity;
  remoteIp: string;
};

export type GatewayCheckoutResult = {
  providerSubscriptionId: string;
  providerPaymentId: string | null;
  status: string;
  qrCodePayload?: string;
  qrCodeImage?: string;
  expiresAt?: string;
};

export interface PaymentGateway {
  readonly provider: string;
  createCustomer(input: BillingIdentity & { externalReference: string }): Promise<string>;
  createCardSubscription(input: GatewaySubscriptionInput & { card: CardData }): Promise<GatewayCheckoutResult>;
  createPixAutomaticSubscription(input: GatewaySubscriptionInput): Promise<GatewayCheckoutResult>;
  cancelSubscription(providerSubscriptionId: string, method: PaymentMethod): Promise<void>;
  refundPayment(providerPaymentId: string): Promise<void>;
}
