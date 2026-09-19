"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, MessageSquareReply, Plus, Save } from "lucide-react";
import type { TicketPriority, TicketStatus } from "@/core/admin/support-service";
import {
  createTicketAction,
  replyTicketAction,
  updateSupportSettingsAction,
  updateTicketAction,
  type SupportActionState,
} from "./actions";
import type { SupportSubject } from "@/core/admin/support-settings-service";

const field =
  "mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary";
function Feedback({ state }: { state: SupportActionState }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="text-sm font-extrabold text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm font-extrabold text-primary">
          {state.success}
        </p>
      )}
    </>
  );
}

export function CreateTicketForm() {
  const [state, action, pending] = useActionState(createTicketAction, {} as SupportActionState);
  const router = useRouter();
  useEffect(() => {
    if (state.ticketId) router.push(`/admin/atendimento/${state.ticketId}`);
  }, [router, state.ticketId]);
  return (
    <details className="card-pop">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-extrabold">
        <span className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Abrir chamado manualmente
        </span>
        <span className="text-xs text-muted-foreground">Suporte, cobrança ou conta</span>
      </summary>
      <form action={action} className="grid gap-4 border-t-2 border-border p-5 sm:grid-cols-2">
        <label className="text-sm font-extrabold">
          Nome do usuário
          <input name="requesterName" required className={field} />
        </label>
        <label className="text-sm font-extrabold">
          E-mail
          <input name="requesterEmail" type="email" className={field} />
        </label>
        <label className="text-sm font-extrabold sm:col-span-2">
          UID do usuário (opcional)
          <input name="requesterUid" className={field} />
        </label>
        <label className="text-sm font-extrabold sm:col-span-2">
          Assunto
          <input name="subject" required minLength={5} maxLength={140} className={field} />
        </label>
        <label className="text-sm font-extrabold">
          Categoria
          <select name="category" defaultValue="technical" className={field}>
            <option value="technical">Problema técnico</option>
            <option value="billing">Cobrança</option>
            <option value="account">Conta e acesso</option>
            <option value="gameplay">Caso clínico / jogo</option>
            <option value="other">Outro</option>
          </select>
        </label>
        <label className="text-sm font-extrabold">
          Prioridade
          <select name="priority" defaultValue="normal" className={field}>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </label>
        <label className="text-sm font-extrabold sm:col-span-2">
          Descrição
          <textarea
            name="description"
            required
            minLength={10}
            rows={5}
            className={`${field} h-auto py-3`}
          />
        </label>
        <div className="space-y-3 sm:col-span-2">
          <Feedback state={state} />
          <button
            disabled={pending}
            className="btn-pop gap-2 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60"
          >
            {pending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Criar chamado
          </button>
        </div>
      </form>
    </details>
  );
}

export function TicketManagementForm({
  ticketId,
  status,
  priority,
  assignedTo,
  agents,
}: {
  ticketId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string;
  agents: Array<{ uid: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(
    updateTicketAction.bind(null, ticketId),
    {} as SupportActionState,
  );
  return (
    <form action={action} className="card-pop space-y-4 p-5">
      <h2 className="text-lg font-extrabold">Gerenciar chamado</h2>
      <label className="text-sm font-extrabold">
        Status
        <select name="status" defaultValue={status} className={field}>
          <option value="open">Aberto</option>
          <option value="in_progress">Em atendimento</option>
          <option value="waiting_user">Aguardando usuário</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Encerrado</option>
        </select>
      </label>
      <label className="text-sm font-extrabold">
        Prioridade
        <select name="priority" defaultValue={priority} className={field}>
          <option value="low">Baixa</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </label>
      <label className="text-sm font-extrabold">
        Responsável
        <select name="assignedTo" defaultValue={assignedTo} className={field}>
          <option value="">Não atribuído</option>
          {agents.map((agent) => (
            <option key={agent.uid} value={agent.uid}>
              {agent.name}
            </option>
          ))}
        </select>
      </label>
      <Feedback state={state} />
      <button
        disabled={pending}
        className="btn-pop gap-2 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar alterações
      </button>
    </form>
  );
}

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(
    replyTicketAction.bind(null, ticketId),
    {} as SupportActionState,
  );
  return (
    <form action={action} className="card-pop space-y-4 p-5">
      <div>
        <h2 className="text-lg font-extrabold">Responder</h2>
        <p className="text-xs font-bold text-muted-foreground">
          Uma resposta pública deixa o chamado aguardando o usuário.
        </p>
      </div>
      <textarea
        name="body"
        required
        minLength={2}
        maxLength={4000}
        rows={6}
        placeholder="Digite a resposta ou uma observação interna..."
        className={`${field} h-auto py-3`}
      />
      <label className="flex items-center gap-2 text-sm font-extrabold">
        <input type="checkbox" name="internal" className="h-4 w-4 accent-primary" />
        Salvar como nota interna
      </label>
      <Feedback state={state} />
      <button
        disabled={pending}
        className="btn-pop gap-2 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60"
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquareReply className="h-4 w-4" />
        )}
        Registrar mensagem
      </button>
    </form>
  );
}

export function SupportSettingsForm({
  subjects,
}: {
  subjects: SupportSubject[];
}) {
  const [state, action, pending] = useActionState(
    updateSupportSettingsAction,
    {} as SupportActionState,
  );
  return (
    <details className="card-pop">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-extrabold">
        <span>Configurações do atendimento</span>
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] uppercase text-primary">Assuntos do formulário</span>
      </summary>
      <form action={action} className="grid gap-4 border-t-2 border-border p-5 sm:grid-cols-2">
        <label className="text-sm font-extrabold sm:col-span-2">
          Assuntos disponíveis
          <textarea
            name="subjects"
            defaultValue={subjects.map((item) => item.label).join("\n")}
            required
            rows={7}
            className={`${field} h-auto py-3`}
          />
          <small className="mt-1 block text-xs text-muted-foreground">
            Um assunto por linha. A ordem será usada no formulário do jogador.
          </small>
        </label>
        <div className="space-y-3 sm:col-span-2">
          <Feedback state={state} />
          <button
            disabled={pending}
            className="btn-pop gap-2 bg-primary px-5 text-xs text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60"
          >
            {pending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar configurações
          </button>
        </div>
      </form>
    </details>
  );
}
