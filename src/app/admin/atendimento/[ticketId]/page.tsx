import Link from "next/link";
import { ArrowLeft, CalendarDays, FileText, Mail, Phone, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePermission } from "@/core/admin/admin-service";
import { getSupportTicket } from "@/core/admin/support-service";
import { TicketManagementForm, TicketReplyForm } from "../support-forms";

const formatter = new Intl.DateTimeFormat("pt-BR", {
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
const categories: Record<string, string> = {
  technical: "Problema técnico",
  billing: "Cobrança",
  account: "Conta e acesso",
  gameplay: "Caso clínico / jogo",
  other: "Outro",
};

export default async function TicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  await requirePermission("support.read");
  const { ticketId } = await params;
  const ticket = await getSupportTicket(ticketId);
  if (!ticket) notFound();
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/atendimento"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para atendimento
      </Link>
      <header className="card-pop p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-extrabold uppercase text-primary">
            {statuses[ticket.status] ?? ticket.status}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-extrabold uppercase text-muted-foreground">
            {categories[ticket.category] ?? ticket.category}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-black">{ticket.subject}</h1>
        <p className="mt-2 break-all text-xs font-bold text-muted-foreground">
          {ticket.protocol || `Chamado #${ticket.id}`}
        </p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_22rem]">
        <div className="space-y-6">
          <section className="card-pop p-5">
            <h2 className="text-lg font-extrabold">Solicitação inicial</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
          </section>
          <section className="card-pop overflow-hidden">
            <div className="border-b-2 border-border p-5">
              <h2 className="text-xl font-extrabold">Histórico</h2>
            </div>
            <div className="space-y-4 p-5">
              {ticket.messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[90%] rounded-2xl p-4 ${message.internal ? "border-2 border-xp/40 bg-xp/10" : message.authorType === "staff" ? "ml-auto bg-primary/10" : "bg-muted"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-extrabold">
                      {message.authorName}
                      {message.internal ? " · Nota interna" : ""}
                    </p>
                    <time className="text-[10px] font-bold text-muted-foreground">
                      {message.createdAt
                        ? formatter.format(new Date(message.createdAt))
                        : "Sem data"}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p>
                  {message.attachment?.url && (
                    <a
                      href={message.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-primary underline"
                    >
                      <FileText className="h-4 w-4" />
                      {message.attachment.name || "Abrir anexo"}
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
          <TicketReplyForm ticketId={ticket.id} />
        </div>
        <aside className="space-y-6">
          <TicketManagementForm
            ticketId={ticket.id}
            status={ticket.status}
            priority={ticket.priority}
            assignedTo={ticket.assignedTo}
            agents={ticket.agents}
          />
          <section className="card-pop space-y-4 p-5">
            <h2 className="text-lg font-extrabold">Solicitante</h2>
            <p className="flex gap-3 text-sm">
              <UserRound className="h-5 w-5 text-primary" />
              <span>
                <b>{ticket.requesterName}</b>
                <br />
                {ticket.requesterUid || "Sem UID informado"}
              </span>
            </p>
            <p className="flex gap-3 text-sm">
              <Mail className="h-5 w-5 text-primary" />
              <span>{ticket.requesterEmail || "Sem e-mail informado"}</span>
            </p>
            <p className="flex gap-3 text-sm">
              <Phone className="h-5 w-5 text-primary" />
              <span>{ticket.requesterPhone || "Sem celular informado"}</span>
            </p>
            <p className="flex gap-3 text-sm">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>
                Criado em
                <br />
                <b>
                  {ticket.createdAt ? formatter.format(new Date(ticket.createdAt)) : "Sem data"}
                </b>
              </span>
            </p>
            {ticket.requesterUid && (
              <Link
                href={`/admin/usuarios/${ticket.requesterUid}`}
                className="btn-pop w-full bg-muted px-4 py-2 text-xs shadow-[var(--shadow-pop-muted)]"
              >
                Ver perfil do usuário
              </Link>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
