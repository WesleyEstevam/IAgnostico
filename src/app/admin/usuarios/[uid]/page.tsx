import Link from "next/link";
import { ArrowLeft, CalendarDays, GraduationCap, Mail, Phone, Stethoscope, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePermission } from "@/core/admin/admin-service";
import { getAdminUserDetails } from "@/core/admin/admin-user-service";
import { UserPlanForm, UserProfileForm, UserSecurityForms } from "./user-management-forms";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Fortaleza", dateStyle: "short", timeStyle: "short" });
const specialties: Record<string, string> = { cardiologia: "Cardiologia", "clinica-geral": "Clínica Geral", infectologia: "Infectologia", pediatria: "Pediatria", "ginecologia-obstetricia": "Ginecologia e Obstetrícia", anestesiologia: "Anestesiologia", ortopedia: "Ortopedia", radiologia: "Radiologia", oncologia: "Oncologia", dermatologia: "Dermatologia" };
function date(value: string | null) { return value ? dateTimeFormatter.format(new Date(value)) : "Não informado"; }

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ uid: string }> }) {
  await requirePermission("users.read");
  const { uid } = await params;
  let user;
  try {
    user = await getAdminUserDetails(uid);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "auth/user-not-found") notFound();
    console.error("Falha ao carregar detalhes do usuário no painel administrativo.", error);
    throw error;
  }

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <Link href="/admin/usuarios" className="inline-flex items-center gap-2 text-sm font-extrabold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Voltar para usuários</Link>
    <header className="card-pop flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
      <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary/15 bg-cover bg-center text-2xl font-black text-primary" style={user.photoURL ? { backgroundImage: `url(${user.photoURL})` } : undefined}>{!user.photoURL && (user.displayName[0] ?? "J").toUpperCase()}</span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-3xl font-black">{user.displayName}</h1><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${user.accountStatus === "active" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>{user.accountStatus === "active" ? "Ativo" : "Desativado"}</span></div><p className="mt-1 break-all text-sm font-bold text-muted-foreground">{user.email ?? "Sem e-mail"} · {user.uid}</p></div>
      <div className="rounded-2xl bg-primary/10 px-5 py-3 text-center"><p className="text-xs font-extrabold uppercase text-primary">Plano atual</p><p className="text-xl font-black text-primary">{user.plan === "pro" ? "Pro" : "Gratuito"}</p></div>
    </header>

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[{ label: "XP total", value: user.stats.xp, icon: Trophy }, { label: "Nível", value: user.stats.level, icon: Trophy }, { label: "Casos", value: user.stats.casesPlayed, icon: Stethoscope }, { label: "Acerto médio", value: `${user.stats.averageAccuracy}%`, icon: Trophy }].map(({ label, value, icon: Icon }) => <article key={label} className="card-pop p-4"><Icon className="h-5 w-5 text-primary" /><p className="mt-2 text-2xl font-black">{value}</p><p className="text-xs font-extrabold uppercase text-muted-foreground">{label}</p></article>)}
    </section>

    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
      <div className="space-y-6">
        <UserProfileForm uid={uid} user={user} />
        <section className="card-pop p-5 sm:p-6"><h2 className="text-xl font-extrabold">Informações da conta</h2><div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <p className="flex gap-3"><Mail className="h-5 w-5 text-primary" /><span><b>E-mail</b><br />{user.email ?? "Não informado"}</span></p>
          <p className="flex gap-3"><Phone className="h-5 w-5 text-primary" /><span><b>Telefone</b><br />{user.phone ?? "Não informado"}</span></p>
          <p className="flex gap-3"><GraduationCap className="h-5 w-5 text-primary" /><span><b>Universidade</b><br />{user.university ?? "Não informada"}</span></p>
          <p className="flex gap-3"><Stethoscope className="h-5 w-5 text-primary" /><span><b>Especialidade favorita</b><br />{specialties[user.favoriteSpecialty ?? ""] ?? "Não informada"}</span></p>
          <p className="flex gap-3"><CalendarDays className="h-5 w-5 text-primary" /><span><b>Cadastro</b><br />{date(user.createdAt)}</span></p>
          <p className="flex gap-3"><CalendarDays className="h-5 w-5 text-primary" /><span><b>Último acesso</b><br />{date(user.lastAccessAt)}</span></p>
        </div></section>
        <section className="card-pop overflow-hidden"><div className="border-b-2 border-border p-5"><h2 className="text-xl font-extrabold">Partidas recentes</h2></div>{user.games.length ? <div className="divide-y-2 divide-border">{user.games.map((game) => <article key={game.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_9rem_7rem] sm:items-center"><div><p className="font-extrabold">{game.title}</p><p className="text-xs font-bold text-muted-foreground">{specialties[game.specialty] ?? game.specialty} · {date(game.completedAt)}</p></div><span className="text-xs font-extrabold uppercase text-muted-foreground">{game.evaluation ?? game.status}</span><span className="font-extrabold text-primary">+{game.xp} XP</span></article>)}</div> : <p className="p-8 text-center font-bold text-muted-foreground">Nenhuma partida concluída.</p>}</section>
      </div>
      <aside className="space-y-6"><UserPlanForm uid={uid} plan={user.plan} /><UserSecurityForms uid={uid} disabled={user.accountStatus === "disabled"} /><section className="card-pop p-5"><h2 className="text-lg font-extrabold">Plantões</h2><p className="mt-2 text-3xl font-black text-primary">{user.shifts.current}/{user.shifts.max}</p><p className="text-xs font-bold text-muted-foreground">Saldo armazenado atualmente</p></section></aside>
    </div>
  </main>;
}
