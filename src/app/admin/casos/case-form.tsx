"use client";

import { useActionState } from "react";
import { createCaseAction, type CaseFormState } from "./actions";

const initialState: CaseFormState = {};
const fieldClass = "w-full rounded-xl border-2 border-border bg-muted/20 px-3 py-2.5 text-sm font-bold outline-none focus:border-primary";

export function CaseForm() {
  const [state, action, pending] = useActionState(createCaseAction, initialState);

  return <form action={action} className="card-pop space-y-5 p-5 sm:p-7">
    <div><h2 className="text-xl font-extrabold">Novo caso clínico</h2><p className="text-sm font-bold text-muted-foreground">O caso será criado como rascunho.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="text-sm font-extrabold">Especialidade<select name="specialty" className={`${fieldClass} mt-1.5`}><option value="cardiologia">Cardiologia</option><option value="clinica-geral">Clínica Geral</option><option value="infectologia">Infectologia</option></select></label>
      <label className="text-sm font-extrabold">Dificuldade<select name="difficulty" className={`${fieldClass} mt-1.5`}><option value="facil">Fácil</option><option value="intermediario">Intermediário</option><option value="dificil">Difícil</option></select></label>
      <label className="text-sm font-extrabold">Cenário<input name="setting" required defaultValue="Emergência" className={`${fieldClass} mt-1.5`} /></label>
    </div>
    <label className="block text-sm font-extrabold">Título<input name="title" required placeholder="Ex.: Mulher, 42 anos · dor torácica súbita" className={`${fieldClass} mt-1.5`} /></label>
    <label className="block text-sm font-extrabold">Resumo clínico<textarea name="summary" required rows={3} className={`${fieldClass} mt-1.5`} /></label>
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="text-sm font-extrabold">Nome do paciente<input name="patientName" required className={`${fieldClass} mt-1.5`} /></label>
      <label className="text-sm font-extrabold">Idade<input name="patientAge" type="number" min="1" max="120" required className={`${fieldClass} mt-1.5`} /></label>
      <label className="text-sm font-extrabold">Avatar<input name="patientAvatar" required defaultValue="🧑" maxLength={8} className={`${fieldClass} mt-1.5`} /></label>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-extrabold">Fala inicial do paciente<textarea name="opening" required rows={3} className={`${fieldClass} mt-1.5`} /></label>
      <label className="text-sm font-extrabold">Pista após a pergunta<textarea name="clue" required rows={3} className={`${fieldClass} mt-1.5`} /></label>
    </div>
    <label className="block text-sm font-extrabold">Resposta genérica do paciente<textarea name="fallbackReply" required rows={2} defaultValue="Posso tentar explicar melhor, doutor(a), mas estou preocupado com esses sintomas." className={`${fieldClass} mt-1.5`} /></label>
    <label className="block text-sm font-extrabold">Exames <span className="font-bold text-muted-foreground">— um por linha: Nome | Resultado</span><textarea name="exams" required rows={5} placeholder={'ECG | Ritmo sinusal\nTroponina | Elevada'} className={`${fieldClass} mt-1.5 font-mono`} /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-extrabold">Duração em minutos<input name="durationMinutes" type="number" min="2" max="30" required defaultValue="8" className={`${fieldClass} mt-1.5`} /></label>
      <label className="text-sm font-extrabold">XP máximo<input name="maxXp" type="number" min="50" max="1000" required defaultValue="200" className={`${fieldClass} mt-1.5`} /></label>
    </div>
    <label className="block text-sm font-extrabold">Diagnóstico esperado<input name="diagnosis" required className={`${fieldClass} mt-1.5`} /></label>
    <label className="block text-sm font-extrabold">Respostas corretas <span className="font-bold text-muted-foreground">— separadas por vírgula</span><textarea name="diagnosisAliases" required rows={2} className={`${fieldClass} mt-1.5`} /></label>
    <label className="block text-sm font-extrabold">Respostas “chegou perto” <span className="font-bold text-muted-foreground">— separadas por vírgula</span><textarea name="partialDiagnosisAliases" rows={2} className={`${fieldClass} mt-1.5`} /></label>
    <label className="block text-sm font-extrabold">Feedback educacional<textarea name="feedback" required rows={4} className={`${fieldClass} mt-1.5`} /></label>
    <label className="block text-sm font-extrabold">Referências <span className="font-bold text-muted-foreground">— URLs, uma por linha</span><textarea name="sourceRefs" required rows={3} className={`${fieldClass} mt-1.5`} /></label>
    {state.error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">{state.success}</p>}
    <button disabled={pending} className="btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">{pending ? "Salvando…" : "Salvar como rascunho"}</button>
  </form>;
}
