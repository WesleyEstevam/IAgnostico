"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicPlan } from "@/core/admin/plan-admin-service";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function PricingSection({ plans, ctaHref, authenticated, title, description }: { plans: PublicPlan[]; ctaHref: string; authenticated: boolean; title: string; description: string }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const activePlans = plans.filter((plan) => plan.active);
  const annualDiscount = Math.max(0, ...activePlans.filter((plan) => plan.priceCents > 0).map((plan) => plan.annualDiscountPercent));
  return <section id="planos" className="mx-auto max-w-5xl scroll-mt-8 px-4 py-20 sm:px-6">
    <div className="text-center"><h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h2><p className="mt-3 text-muted-foreground">{description}</p></div>
    <div className="mt-12 flex justify-center"><div className="inline-grid grid-cols-2 rounded-2xl border-2 border-border bg-muted p-1.5 font-extrabold">
      <button type="button" onClick={() => setBilling("monthly")} aria-pressed={billing === "monthly"} className={`rounded-xl px-6 py-2.5 text-sm transition ${billing === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Mensal</button>
      <div className="relative"><span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[10px] font-black uppercase text-primary-foreground shadow-sm">Economize até {annualDiscount}%</span><button type="button" onClick={() => setBilling("annual")} aria-pressed={billing === "annual"} className={`rounded-xl px-6 py-2.5 text-sm transition ${billing === "annual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Anual</button></div>
    </div></div>
    <div className={`mt-10 grid gap-5 ${activePlans.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-lg"}`}>
      {activePlans.map((plan) => {
        const isFree = plan.priceCents === 0;
        const annualPrice = Math.round(plan.priceCents * 12 * (100 - plan.annualDiscountPercent) / 100);
        const shownPrice = billing === "annual" && !isFree ? annualPrice : plan.priceCents;
        return <div key={plan.id} id={plan.id === "pro" ? "plano-pro" : undefined} className={`card-pop card-jelly relative scroll-mt-8 overflow-hidden p-8 ${plan.highlighted ? "border-primary/40 bg-gradient-to-br from-accent/40 to-card" : ""}`}>
          {plan.badge && <div className="absolute right-4 top-4 rounded-full bg-xp px-3 py-1 text-[10px] font-extrabold uppercase text-xp-foreground animate-pop-badge">{plan.badge}</div>}
          <div className={`text-sm font-extrabold uppercase tracking-wider ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`}>{plan.name}</div>
          <div className="mt-2 text-4xl font-extrabold">{money.format(shownPrice / 100)}{!isFree && <span className="text-base text-muted-foreground">/{billing === "annual" ? "ano" : "mês"}</span>}</div>
          {isFree ? <p className="mt-1 text-sm font-bold text-muted-foreground">para sempre</p> : billing === "annual" ? <p className="mt-1 text-sm font-bold text-primary">{plan.annualDiscountPercent}% de desconto · equivalente a {money.format(annualPrice / 1200)}/mês</p> : <p className="mt-1 text-sm font-bold text-muted-foreground">Cobrança mensal</p>}
          <p className="mt-2 text-sm font-bold text-muted-foreground">{plan.description}</p>
          <ul className="mt-6 space-y-2 text-sm font-bold">{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
          <Link href={ctaHref} className={`mt-8 btn-pop w-full ${plan.highlighted ? "bg-primary text-primary-foreground shadow-[var(--shadow-pop)]" : "bg-muted text-foreground shadow-[var(--shadow-pop-muted)]"}`}>{authenticated && isFree ? "Acessar dashboard" : plan.ctaLabel}</Link>
        </div>;
      })}
    </div>
  </section>;
}
