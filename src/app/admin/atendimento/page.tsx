import Link from "next/link";
import { AlertTriangle, Clock3, Headphones, Inbox, Search } from "lucide-react";
import { requirePermission } from "@/core/admin/admin-service";
import { listSupportTickets } from "@/core/admin/support-service";
import { CreateTicketForm } from "./support-forms";
import { SupportSettingsForm } from "./support-forms";
import { getSupportSettingsForAdmin } from "@/core/admin/support-settings-service";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Bahia",
  dateStyle: "short",
  timeStyle: "short",
});
const statuses: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em atendimento",
  waiting_user: "Aguardando usuário",
  resolved: "Resolvido",
  closed: "Encerrado",
};
const priorities: Record<string, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};
const categories: Record<string, string> = {
  technical: "Problema técnico",
  billing: "Cobrança",
  account: "Conta e acesso",
  gameplay: "Caso clínico / jogo",
  other: "Outro",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("support.read");
  const params = await searchParams;
  const read = (key: string) => (typeof params[key] === "string" ? params[key] : "");
  const [result, settings] = await Promise.all([
    listSupportTickets({
      status: read("status"),
      priority: read("prioridade"),
      category: read("categoria"),
      assigned: read("responsavel"),
      search: read("busca"),
      page: Number(read("pagina")) || 1,
    }),
    getSupportSettingsForAdmin(),
  ]);
  const pageHref = (page: number) => {
    const query = new URLSearchParams();
    for (const key of ["status", "prioridade", "categoria", "responsavel", "busca"])
      if (read(key)) query.set(key, read(key));
    query.set("pagina", String(page));
    return `/admin/atendimento?${query}`;
  };
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
          Central de suporte
        </div>
        <h1 className="mt-3 text-4xl font-black">Atendimento</h1>
        <p className="mt-1 font-bold text-muted-foreground">
          Organize solicitações, responda jogadores e acompanhe cada chamado até a resolução.
        </p>
      </header>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Novos", value: result.metrics.open, icon: Inbox },
          { label: "Em atendimento", value: result.metrics.inProgress, icon: Headphones },
          { label: "Aguardando usuário", value: result.metrics.waiting, icon: Clock3 },
          { label: "Urgentes", value: result.metrics.urgent, icon: AlertTriangle },
        ].map(({ label, value, icon: Icon }) => (
          <article key={label} className="card-pop p-4">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-2 text-2xl font-black">{value}</p>
            <p className="text-xs font-extrabold uppercase text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>
      <SupportSettingsForm
        subjects={settings.subjects}
      />
      <CreateTicketForm />
      <form className="card-pop grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_11rem_10rem_12rem_13rem_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            name="busca"
            defaultValue={read("busca")}
            placeholder="Assunto, usuário, e-mail ou ID"
            className="h-11 w-full rounded-xl border-2 border-border bg-background pl-10 pr-3 text-sm font-bold outline-none focus:border-primary"
          />
        </label>
        <select
          name="status"
          defaultValue={read("status")}
          className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm font-bold"
        >
          <option value="">Todos os status</option>
          {Object.entries(statuses).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="prioridade"
          defaultValue={read("prioridade")}
          className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm font-bold"
        >
          <option value="">Prioridades</option>
          {Object.entries(priorities).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="categoria"
          defaultValue={read("categoria")}
          className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm font-bold"
        >
          <option value="">Categorias</option>
          {Object.entries(categories).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="responsavel"
          defaultValue={read("responsavel")}
          className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm font-bold"
        >
          <option value="">Todos os responsáveis</option>
          <option value="unassigned">Não atribuídos</option>
          {result.agents.map((agent) => (
            <option key={agent.uid} value={agent.uid}>
              {agent.name}
            </option>
          ))}
        </select>
        <button className="btn-pop h-11 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)]">
          Filtrar
        </button>
      </form>
      {result.truncated && (
        <p className="rounded-xl bg-xp/15 px-4 py-3 text-sm font-bold">
          Exibindo os 1.000 chamados atualizados mais recentemente.
        </p>
      )}
      <section className="card-pop overflow-hidden">
        <div className="hidden grid-cols-[minmax(15rem,1fr)_10rem_10rem_11rem_10rem] gap-4 border-b-2 border-border bg-muted/50 px-5 py-3 text-xs font-extrabold uppercase text-muted-foreground md:grid">
          <span>Chamado</span>
          <span>Status</span>
          <span>Prioridade</span>
          <span>Responsável</span>
          <span>Atualização</span>
        </div>
        {result.tickets.length ? (
          <div className="divide-y-2 divide-border">
            {result.tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/atendimento/${ticket.id}`}
                className="grid gap-3 p-5 transition hover:bg-muted/40 md:grid-cols-[minmax(15rem,1fr)_10rem_10rem_11rem_10rem] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-extrabold">{ticket.subject}</p>
                  <p className="truncate text-xs font-bold text-muted-foreground">
                    {ticket.requesterName} · {categories[ticket.category] ?? ticket.category}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {ticket.protocol || `#${ticket.id}`}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-primary">
                  {statuses[ticket.status] ?? ticket.status}
                </span>
                <span
                  className={`text-xs font-extrabold ${ticket.priority === "urgent" ? "text-destructive" : ticket.priority === "high" ? "text-streak" : "text-muted-foreground"}`}
                >
                  {priorities[ticket.priority] ?? ticket.priority}
                </span>
                <span className="truncate text-xs font-bold">
                  {ticket.assignedName ?? "Não atribuído"}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {ticket.updatedAt ? dateFormatter.format(new Date(ticket.updatedAt)) : "Sem data"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid place-items-center px-5 py-16 text-center">
            <Headphones className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-extrabold">Nenhum chamado encontrado</p>
            <p className="text-sm font-bold text-muted-foreground">
              Abra um chamado manual ou revise os filtros.
            </p>
          </div>
        )}
      </section>
      <nav className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted-foreground">
          Página {result.page} de {result.totalPages}
        </p>
        <div className="flex gap-2">
          {result.page > 1 && (
            <Link
              href={pageHref(result.page - 1)}
              className="btn-pop bg-muted px-4 py-2 text-xs shadow-[var(--shadow-pop-muted)]"
            >
              Anterior
            </Link>
          )}
          {result.page < result.totalPages && (
            <Link
              href={pageHref(result.page + 1)}
              className="btn-pop bg-primary px-4 py-2 text-xs text-primary-foreground shadow-[var(--shadow-pop)]"
            >
              Próxima
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
