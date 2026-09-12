import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { listAdminUsers } from "@/core/admin/admin-user-service";
import { requirePermission } from "@/core/admin/admin-service";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Fortaleza", dateStyle: "short" });
function date(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Não informado";
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("users.read");
  const params = await searchParams;
  const read = (key: string) => typeof params[key] === "string" ? params[key] : "";
  const result = await listAdminUsers({ search: read("busca"), plan: read("plano"), status: read("status"), sort: read("ordem"), page: Number(read("pagina")) || 1 });
  const pageHref = (page: number) => {
    const query = new URLSearchParams();
    if (read("busca")) query.set("busca", read("busca"));
    if (read("plano")) query.set("plano", read("plano"));
    if (read("status")) query.set("status", read("status"));
    if (read("ordem")) query.set("ordem", read("ordem"));
    query.set("pagina", String(page));
    return `/admin/usuarios?${query}`;
  };

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <header><div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Administração</div><h1 className="mt-3 text-4xl font-black">Usuários</h1><p className="mt-1 font-bold text-muted-foreground">{result.total} jogadores encontrados</p></header>
    <form className="card-pop grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_11rem_11rem_12rem_auto]">
      <label className="relative"><span className="sr-only">Buscar usuário</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input name="busca" defaultValue={read("busca")} minLength={2} placeholder="Nome, e-mail, telefone ou ID" className="h-11 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 text-sm font-bold outline-none focus:border-primary" /></label>
      <select name="plano" defaultValue={read("plano")} aria-label="Filtrar por plano" className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm font-bold"><option value="">Todos os planos</option><option value="free">Gratuito</option><option value="pro">Pro</option></select>
      <select name="status" defaultValue={read("status")} aria-label="Filtrar por status" className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm font-bold"><option value="">Todos os status</option><option value="active">Ativos</option><option value="disabled">Desativados</option></select>
      <select name="ordem" defaultValue={result.filters.sort} aria-label="Ordenar usuários" className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm font-bold"><option value="recent">Mais recentes</option><option value="oldest">Mais antigos</option><option value="name">Nome</option><option value="xp">Maior XP</option></select>
      <button className="btn-pop h-11 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)]">Aplicar</button>
    </form>

    <section className="card-pop overflow-hidden">
      <div className="hidden grid-cols-[minmax(13rem,1.4fr)_8rem_8rem_7rem_8rem] gap-4 border-b-2 border-border bg-muted/50 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground md:grid">
        <span>Jogador</span><span>Plano</span><span>Status</span><span>Progresso</span><span>Cadastro</span>
      </div>
      {result.users.length ? <div className="divide-y-2 divide-border">{result.users.map((user) => <Link key={user.uid} href={`/admin/usuarios/${user.uid}`} className="grid gap-3 p-5 transition hover:bg-muted/40 md:grid-cols-[minmax(13rem,1.4fr)_8rem_8rem_7rem_8rem] md:items-center md:gap-4">
        <div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 bg-cover bg-center font-black text-primary" style={user.photoURL ? { backgroundImage: `url(${user.photoURL})` } : undefined}>{!user.photoURL && (user.displayName[0] ?? "J").toUpperCase()}</span><div className="min-w-0"><p className="truncate font-extrabold">{user.displayName}</p><p className="truncate text-xs font-bold text-muted-foreground">{user.email ?? "Sem e-mail"}</p><p className="truncate text-[10px] text-muted-foreground">{user.uid}</p></div></div>
        <div><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${user.plan === "pro" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{user.plan === "pro" ? "Pro" : "Gratuito"}</span></div>
        <div className="text-xs font-extrabold"><span className={user.accountStatus === "active" ? "text-primary" : "text-destructive"}>●</span> {user.accountStatus === "active" ? "Ativo" : "Desativado"}</div>
        <div className="text-sm font-extrabold">{user.xp} XP<p className="text-[10px] text-muted-foreground">Nível {user.level}</p></div>
        <div className="text-xs font-bold text-muted-foreground">{date(user.createdAt)}</div>
      </Link>)}</div> : <div className="grid place-items-center px-5 py-16 text-center"><UserRound className="h-10 w-10 text-muted-foreground/40" /><p className="mt-3 font-extrabold">Nenhum usuário encontrado</p><p className="text-sm font-bold text-muted-foreground">Revise os filtros ou execute a migração de busca.</p></div>}
    </section>

    <nav aria-label="Paginação" className="flex items-center justify-between"><p className="text-sm font-bold text-muted-foreground">Página {result.page} de {result.totalPages}</p><div className="flex gap-2">{result.page > 1 && <Link href={pageHref(result.page - 1)} className="btn-pop bg-muted px-4 py-2 text-xs shadow-[var(--shadow-pop-muted)]">Anterior</Link>}{result.page < result.totalPages && <Link href={pageHref(result.page + 1)} className="btn-pop bg-primary px-4 py-2 text-xs text-primary-foreground shadow-[var(--shadow-pop)]">Próxima</Link>}</div></nav>
  </main>;
}
