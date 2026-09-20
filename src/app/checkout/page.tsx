import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Navbar } from "@/presentation/components/shared/navbar";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getFirebaseAdminFirestore } from "@/infrastructure/firebase/admin";
import { getCheckoutPlan } from "@/core/payments/billing-service";
import type { BillingCycle } from "@/core/payments/payment-gateway";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentFirebaseUser(); if (!user) redirect("/login?next=/checkout");
  const params = await searchParams; const planId = typeof params.plano === "string" ? params.plano : "pro"; const cycle: BillingCycle = params.ciclo === "annual" ? "annual" : "monthly";
  let checkout; try { checkout = await getCheckoutPlan(planId, cycle); } catch { redirect("/#planos"); }
  const profile = await getFirebaseAdminFirestore().collection("users").doc(user.uid).get(); const data = profile.data();
  return <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background"><Navbar /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"><Link href="/#planos" className="inline-flex items-center gap-2 text-sm font-extrabold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Voltar aos planos</Link><header className="my-7"><div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase text-primary"><ShieldCheck className="h-4 w-4" />Checkout seguro</div><h1 className="mt-3 text-4xl font-black sm:text-5xl">Assine o plano {checkout.plan.name}</h1><p className="mt-2 font-bold text-muted-foreground">Finalize sua assinatura {cycle === "annual" ? "anual" : "mensal"} por cartão ou Pix Automático.</p></header><CheckoutForm plan={checkout.plan} cycle={cycle} initialAmountCents={checkout.amountCents} profile={{ name: typeof data?.displayName === "string" ? data.displayName : user.name ?? "", email: typeof data?.email === "string" ? data.email : user.email ?? "", phone: typeof data?.phone === "string" ? data.phone : "" }} /></main></div>;
}
