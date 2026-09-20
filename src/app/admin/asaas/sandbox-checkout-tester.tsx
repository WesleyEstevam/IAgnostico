"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import type { PublicPlan } from "@/core/admin/plan-admin-service";
import { CheckoutForm } from "@/app/checkout/checkout-form";

export function SandboxCheckoutTester({ plan, profile, enabled }: { plan: PublicPlan; profile: { name: string; email: string; phone: string }; enabled: boolean }) {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const amount = cycle === "annual" ? Math.round(plan.priceCents * 12 * (100 - plan.annualDiscountPercent) / 100) : plan.priceCents;
  return <section className="space-y-5"><header className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-xp/20 text-xp-foreground"><FlaskConical className="h-6 w-6" /></span><div><h2 className="text-2xl font-black">Checkout de teste</h2><p className="text-sm font-bold text-muted-foreground">Experimente cartão e Pix Automático sem alterar o plano da conta administrativa.</p></div></header>{enabled ? <><div className="flex justify-center"><div className="inline-grid grid-cols-2 rounded-2xl border-2 border-border bg-muted p-1.5"><button type="button" onClick={() => setCycle("monthly")} className={`rounded-xl px-5 py-2 text-sm font-extrabold ${cycle === "monthly" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Mensal</button><button type="button" onClick={() => setCycle("annual")} className={`rounded-xl px-5 py-2 text-sm font-extrabold ${cycle === "annual" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Anual</button></div></div><CheckoutForm key={cycle} plan={plan} cycle={cycle} initialAmountCents={amount} profile={profile} apiEndpoint="/api/admin/asaas/test-checkout" trackPendingCheckout={false} /></> : <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center font-bold text-muted-foreground">Ative o Asaas em ambiente Sandbox e salve as credenciais para liberar o checkout de teste.</div>}</section>;
}
