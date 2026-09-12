"use client";

import { useActionState } from "react";
import { LoaderCircle, Save, ShieldAlert } from "lucide-react";
import type { UserActionState } from "./actions";
import { createPasswordResetAction, updateUserPlanAction, updateUserProfileAction, updateUserStatusAction } from "./actions";

const initialState: UserActionState = {};
const fieldClass = "mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary";

function Feedback({ state }: { state: UserActionState }) {
  return <>{state.error && <p role="alert" className="text-sm font-extrabold text-destructive">{state.error}</p>}{state.success && <p role="status" className="text-sm font-extrabold text-primary">{state.success}</p>}</>;
}

function SubmitButton({ pending, children, destructive = false }: { pending: boolean; children: React.ReactNode; destructive?: boolean }) {
  return <button disabled={pending} className={`btn-pop gap-2 px-5 text-xs disabled:opacity-60 ${destructive ? "bg-destructive text-destructive-foreground shadow-[0_4px_0_0_color-mix(in_srgb,var(--destructive)_75%,black)]" : "bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"}`}>{pending && <LoaderCircle className="h-4 w-4 animate-spin" />}{children}</button>;
}

export function UserProfileForm({ uid, user }: { uid: string; user: { displayName: string; phone: string | null; university: string | null; birthDate: string | null; gender: string | null } }) {
  const [state, action, pending] = useActionState(updateUserProfileAction.bind(null, uid), initialState);
  return <form action={action} className="card-pop space-y-5 p-5 sm:p-6">
    <div><h2 className="text-xl font-extrabold">Dados cadastrais</h2><p className="text-sm font-bold text-muted-foreground">Alterações são registradas na auditoria.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-extrabold">Nome completo<input name="displayName" defaultValue={user.displayName} required minLength={2} maxLength={60} className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Telefone<input name="phone" defaultValue={user.phone ?? ""} placeholder="+5571999999999" className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Data de nascimento<input type="date" name="birthDate" defaultValue={user.birthDate ?? ""} className={fieldClass} /></label>
      <label className="text-sm font-extrabold">Gênero (opcional)<select name="gender" defaultValue={user.gender ?? ""} className={fieldClass}><option value="">Não informado</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="outro">Outro</option><option value="nao-informar">Prefere não informar</option></select></label>
      <label className="text-sm font-extrabold sm:col-span-2">Universidade<input name="university" defaultValue={user.university ?? ""} maxLength={120} className={fieldClass} /></label>
    </div>
    <Feedback state={state} />
    <SubmitButton pending={pending}><Save className="h-4 w-4" />Salvar dados</SubmitButton>
  </form>;
}

export function UserPlanForm({ uid, plan }: { uid: string; plan: "free" | "pro" }) {
  const [state, action, pending] = useActionState(updateUserPlanAction.bind(null, uid), initialState);
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Confirma a alteração manual do plano deste usuário?")) event.preventDefault(); }} className="card-pop space-y-4 p-5">
    <div><h2 className="text-lg font-extrabold">Plano</h2><p className="text-xs font-bold text-muted-foreground">Uso manual para suporte e testes até a integração Asaas.</p></div>
    <select name="plan" defaultValue={plan} className={fieldClass}><option value="free">Gratuito · 3 plantões</option><option value="pro">Pro · 10 plantões</option></select>
    <Feedback state={state} /><SubmitButton pending={pending}>Alterar plano</SubmitButton>
  </form>;
}

export function UserSecurityForms({ uid, disabled }: { uid: string; disabled: boolean }) {
  const [statusState, statusAction, statusPending] = useActionState(updateUserStatusAction.bind(null, uid), initialState);
  const [resetState, resetAction, resetPending] = useActionState(createPasswordResetAction.bind(null, uid), initialState);
  return <section className="card-pop space-y-5 p-5">
    <div><h2 className="flex items-center gap-2 text-lg font-extrabold"><ShieldAlert className="h-5 w-5 text-streak" />Segurança</h2><p className="text-xs font-bold text-muted-foreground">Ações sensíveis exigem confirmação.</p></div>
    <form action={statusAction} onSubmit={(event) => { if (!window.confirm(disabled ? "Confirma a reativação desta conta?" : "Confirma a desativação desta conta? O acesso será bloqueado.")) event.preventDefault(); }} className="space-y-3">
      <input type="hidden" name="disabled" value={disabled ? "false" : "true"} /><Feedback state={statusState} /><SubmitButton pending={statusPending} destructive={!disabled}>{disabled ? "Reativar conta" : "Desativar conta"}</SubmitButton>
    </form>
    <div className="border-t border-border pt-5">
      <form action={resetAction} className="space-y-3"><Feedback state={resetState} /><SubmitButton pending={resetPending}>Gerar link de redefinição</SubmitButton></form>
      {resetState.resetLink && <div className="mt-3 rounded-xl bg-muted p-3"><p className="text-xs font-extrabold">Link temporário</p><a href={resetState.resetLink} className="mt-1 block break-all text-xs font-bold text-primary underline">{resetState.resetLink}</a></div>}
    </div>
  </section>;
}
