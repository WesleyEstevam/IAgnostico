import { CreditCard, ShieldCheck } from "lucide-react";
import { requirePermission } from "@/core/admin/admin-service";
import { getAsaasSettingsForAdmin } from "@/core/payments/payment-settings-service";
import { getApplicationSettings } from "@/core/admin/application-settings-service";
import { AsaasForm } from "./asaas-form";
import { SandboxCheckoutTester } from "./sandbox-checkout-tester";
import { getPublicPlans } from "@/core/admin/plan-admin-service";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";

export default async function AsaasPage() {
  const staff = await requirePermission("settings.manage");
  const [settings, application, plans, profile] = await Promise.all([getAsaasSettingsForAdmin(), getApplicationSettings(), getPublicPlans(), getFirebaseAdminFirestore().collection("users").doc(staff.user.uid).get()]);
  const testPlan = plans.find((plan) => plan.id === "pro" && plan.active && plan.priceCents > 0) ?? plans.find((plan) => plan.active && plan.priceCents > 0);
  const data = profile.data();
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"><header><div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Gateway de pagamentos</div><h1 className="mt-3 text-4xl font-black">Asaas</h1><p className="mt-1 font-bold text-muted-foreground">Configure o primeiro provedor da camada de pagamentos do IAgnóstico.</p></header><section className="grid gap-3 sm:grid-cols-2"><article className="card-pop flex items-center gap-4 p-5"><CreditCard className="h-8 w-8 text-primary" /><div><p className="font-extrabold">Ambiente</p><p className="text-sm font-bold text-muted-foreground">{settings.environment === "production" ? "Produção" : "Sandbox"}</p></div></article><article className="card-pop flex items-center gap-4 p-5"><ShieldCheck className="h-8 w-8 text-primary" /><div><p className="font-extrabold">Status</p><p className="text-sm font-bold text-muted-foreground">{settings.enabled && settings.apiKeyConfigured ? "Integração habilitada" : "Configuração pendente"}</p></div></article></section><AsaasForm settings={settings} webhookUrl={`${application.publicUrl.replace(/\/$/, "")}/api/webhooks/asaas`} />{testPlan && <SandboxCheckoutTester plan={testPlan} enabled={settings.environment === "sandbox" && settings.enabled && settings.apiKeyConfigured} profile={{ name: typeof data?.displayName === "string" ? data.displayName : staff.user.name ?? "Administrador", email: typeof data?.email === "string" ? data.email : staff.user.email ?? "", phone: typeof data?.phone === "string" ? data.phone : "" }} />}</main>;
}
