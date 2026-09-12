import Link from "next/link";
import { BadgeDollarSign, CircleAlert, CreditCard, Users } from "lucide-react";
import { requirePermission } from "@/core/admin/admin-service";
import { getPlansAdminOverview } from "@/core/admin/plan-admin-service";
import { AddPlan, PlanForm } from "./plan-form";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Bahia", dateStyle: "short" });
const statusLabels: Record<string, string> = { active: "Ativa", trialing: "Período de teste", past_due: "Pagamento pendente", canceled: "Cancelada", manual: "Concessão manual" };

export default async function AdminPlansPage() {
  await requirePermission("plans.manage");
  const { plans, subscriptions, metrics } = await getPlansAdminOverview();
  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
    <header><div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Comercial</div><h1 className="mt-3 text-4xl font-black">Planos e assinaturas</h1><p className="mt-1 font-bold text-muted-foreground">Gerencie a oferta exibida na landing page e acompanhe os jogadores Pro.</p></header>
    <section className="grid gap-3 sm:grid-cols-3">{[{ label: "Usuários Pro", value: metrics.proUsers, icon: Users }, { label: "Assinaturas ativas", value: metrics.active, icon: BadgeDollarSign }, { label: "Exigem atenção", value: metrics.attention, icon: CircleAlert }].map(({ label, value, icon: Icon }) => <article key={label} className="card-pop p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-2 text-3xl font-black">{value}</p><p className="text-xs font-extrabold uppercase text-muted-foreground">{label}</p></article>)}</section>
    <section><div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black">Oferta pública</h2><p className="text-sm font-bold text-muted-foreground">Ao salvar, o conteúdo é atualizado automaticamente em iagnostico.com.br.</p></div><AddPlan /></div><div className="grid items-start gap-5 xl:grid-cols-2">{plans.map((plan) => <PlanForm key={plan.id} plan={plan} />)}</div></section>
    <section className="card-pop overflow-hidden"><div className="flex items-center gap-3 border-b-2 border-border p-5"><CreditCard className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-extrabold">Assinaturas Pro</h2><p className="text-xs font-bold text-muted-foreground">Inclui assinaturas do gateway e concessões manuais.</p></div></div>
      {subscriptions.length ? <div className="divide-y-2 divide-border">{subscriptions.map((item) => <Link key={item.uid} href={`/admin/usuarios/${item.uid}`} className="grid gap-2 px-5 py-4 transition hover:bg-muted/40 sm:grid-cols-[1fr_12rem_8rem] sm:items-center"><div><p className="font-extrabold">{item.displayName}</p><p className="text-xs font-bold text-muted-foreground">{item.email ?? item.uid}</p></div><span className="text-xs font-extrabold text-primary">{statusLabels[item.status] ?? item.status}</span><span className="text-xs font-bold text-muted-foreground">{item.updatedAt ? dateFormatter.format(new Date(item.updatedAt)) : "Sem data"}</span></Link>)}</div> : <p className="p-10 text-center font-bold text-muted-foreground">Nenhum usuário Pro encontrado.</p>}
    </section>
  </main>;
}
