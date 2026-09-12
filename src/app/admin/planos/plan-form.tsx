"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Plus, Save, X } from "lucide-react";
import type { PublicPlan } from "@/core/admin/plan-admin-service";
import { updatePlanAction, type PlanActionState } from "./actions";

const fieldClass = "mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary";

export function PlanForm({ plan, isNew = false }: { plan: PublicPlan; isNew?: boolean }) {
  const [state, action, pending] = useActionState(updatePlanAction, {} as PlanActionState);
  return <form action={action} className="card-pop space-y-5 p-5 sm:p-6">
    <input type="hidden" name="mode" value={isNew ? "create" : "update"} />
    {isNew ? <label className="text-sm font-extrabold">Identificador do plano<input name="id" defaultValue={plan.id} required pattern="[a-z0-9-]{2,40}" placeholder="pro-premium" className={fieldClass} /><small className="mt-1 block text-xs text-muted-foreground">Use letras minúsculas, números e hífen. Não poderá ser alterado depois.</small></label> : <input type="hidden" name="id" value={plan.id} />}
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wider text-primary">Plano {plan.id}</p><h2 className="text-2xl font-black">{plan.name}</h2></div><span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${plan.active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{plan.active ? "Visível" : "Oculto"}</span></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-extrabold">Nome<input name="name" defaultValue={plan.name} required maxLength={40} className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Preço (R$)<input name="price" type="number" min="0" max="9999" step="0.01" defaultValue={(plan.priceCents / 100).toFixed(2)} required className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Complemento do preço<input name="priceSuffix" defaultValue={plan.priceSuffix} placeholder="/mês" maxLength={30} className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Plantões por dia<input name="dailyShifts" type="number" min="1" max="100" defaultValue={plan.dailyShifts} required className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Desconto anual (%)<input name="annualDiscountPercent" type="number" min="0" max="90" defaultValue={plan.annualDiscountPercent} required className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Ordem de exibição<input name="order" type="number" min="0" max="100" defaultValue={plan.order} required className={fieldClass} /></label>
      <label className="text-sm font-extrabold sm:col-span-2">Descrição<input name="description" defaultValue={plan.description} required maxLength={140} className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Texto do botão<input name="ctaLabel" defaultValue={plan.ctaLabel} required maxLength={40} className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Selo<input name="badge" defaultValue={plan.badge} placeholder="Mais popular" maxLength={30} className={fieldClass} /></label>
      <label className="text-sm font-extrabold sm:col-span-2">Benefícios, um por linha<textarea name="features" defaultValue={plan.features.join("\n")} required rows={6} className={`${fieldClass} h-auto py-3`} /></label>
    </div>
    <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm font-extrabold"><input type="checkbox" name="active" defaultChecked={plan.active} className="h-4 w-4 accent-primary" />Exibir na landing page</label><label className="flex items-center gap-2 text-sm font-extrabold"><input type="checkbox" name="highlighted" defaultChecked={plan.highlighted} className="h-4 w-4 accent-primary" />Destacar plano</label></div>
    {state.error && <p role="alert" className="text-sm font-extrabold text-destructive">{state.error}</p>}{state.success && <p role="status" className="text-sm font-extrabold text-primary">{state.success}</p>}
    <button disabled={pending} className="btn-pop gap-2 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isNew ? "Adicionar plano" : "Salvar plano"}</button>
  </form>;
}

const newPlan: PublicPlan = { id: "", name: "", priceCents: 0, priceSuffix: "/mês", description: "", features: [], ctaLabel: "Assinar", badge: "", highlighted: false, active: true, dailyShifts: 10, annualDiscountPercent: 15, order: 2 };

export function AddPlan() {
  const [open, setOpen] = useState(false);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="btn-pop gap-2 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)]"><Plus className="h-4 w-4" />Adicionar novo plano</button>;
  return <div className="space-y-3"><div className="flex justify-end"><button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-xs font-extrabold text-muted-foreground hover:text-foreground"><X className="h-4 w-4" />Fechar cadastro</button></div><PlanForm plan={newPlan} isNew /></div>;
}
