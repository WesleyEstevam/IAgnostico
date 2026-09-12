import { Activity, CalendarDays, Crown, UserPlus, Users } from "lucide-react";
import { requirePermission } from "@/core/admin/admin-service";
import { getAdminDashboardMetrics } from "@/core/admin/admin-dashboard-service";

export default async function AdminDashboardPage() {
  await requirePermission("dashboard.read");
  const metrics = await getAdminDashboardMetrics();
  const cards = [
    { label: "Usuários cadastrados", value: metrics.totalUsers, icon: Users, tone: "bg-info/15 text-info" },
    { label: "Novos hoje", value: metrics.newToday, icon: UserPlus, tone: "bg-primary/15 text-primary" },
    { label: "Novos nesta semana", value: metrics.newThisWeek, icon: CalendarDays, tone: "bg-xp/20 text-xp-foreground" },
    { label: "Novos neste mês", value: metrics.newThisMonth, icon: CalendarDays, tone: "bg-streak/15 text-streak" },
    { label: "Plano gratuito", value: metrics.freeUsers, icon: Users, tone: "bg-muted text-muted-foreground" },
    { label: "Plano Pro", value: metrics.paidUsers, icon: Crown, tone: "bg-primary/15 text-primary" },
    { label: "Consultas concluídas", value: metrics.consultations, icon: Activity, tone: "bg-info/15 text-info" },
  ];
  return <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <header><div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Visão geral</div><h1 className="mt-3 text-4xl font-black">Painel administrativo</h1><p className="mt-1 font-bold text-muted-foreground">Indicadores reais da plataforma, consultados diretamente no Firestore.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="card-pop p-5"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-3xl font-black">{new Intl.NumberFormat("pt-BR").format(value)}</p><h2 className="mt-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{label}</h2></article>)}</section>
  </main>;
}
