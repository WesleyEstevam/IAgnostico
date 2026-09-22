"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, RefreshCw, Save, ShieldCheck } from "lucide-react";
import type { AsaasPublicSettings } from "@/core/payments/payment-settings-service";
import { syncAsaasWebhookAction, updateAsaasSettingsAction, type AsaasActionState } from "./actions";

const field = "mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary";
export function AsaasForm({ settings, webhookUrl }: { settings: AsaasPublicSettings; webhookUrl: string }) {
  const [state, action, pending] = useActionState(updateAsaasSettingsAction, {} as AsaasActionState);
  const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [router, state.success]);
  return <div className="space-y-6"><form action={action} className="space-y-6">
    <section className="card-pop space-y-5 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><KeyRound className="h-5 w-5" /></span><div><h2 className="text-xl font-black">Credenciais da API</h2><p className="text-sm font-bold text-muted-foreground">As credenciais são lidas apenas no servidor e nunca retornam ao navegador.</p></div></div><label className="flex items-start justify-between gap-4 rounded-2xl border-2 border-border bg-muted/20 p-4"><span><span className="block font-extrabold">Habilitar pagamentos pelo Asaas</span><span className="mt-1 block text-xs font-bold text-muted-foreground">Mantenha desativado enquanto estiver configurando e testando o checkout.</span></span><input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="mt-1 h-5 w-5 accent-primary" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-extrabold">Ambiente<select name="environment" defaultValue={settings.environment} className={field}><option value="sandbox">Sandbox — testes</option><option value="production">Produção — cobranças reais</option></select></label><label className="text-sm font-extrabold">API Key<input name="apiKey" type="password" autoComplete="new-password" placeholder={settings.apiKeyConfigured ? "Já configurada — preencha para substituir" : "$aact_..."} className={field} /><small className="mt-1 block text-xs text-muted-foreground">A chave atual nunca é exibida.</small></label><label className="text-sm font-extrabold sm:col-span-2">Token de autenticação do webhook<input name="webhookToken" type="password" autoComplete="new-password" placeholder={settings.webhookTokenConfigured ? "Já configurado — preencha para substituir" : "Deixe vazio para gerar automaticamente"} className={field} /></label></div></section>
    <section className="card-pop space-y-4 p-5 sm:p-6"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-primary" /><div><h2 className="font-black">Endpoint do webhook</h2><p className="text-xs font-bold text-muted-foreground">Cadastre esta URL no Asaas e use o mesmo token configurado acima.</p></div></div><code className="block overflow-x-auto rounded-xl bg-muted px-4 py-3 text-xs font-bold">{webhookUrl}</code><p className="text-xs font-bold text-muted-foreground">Eventos necessários: cobranças, assinaturas e Pix Automático. O processamento é idempotente.</p></section>
    {state.error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-extrabold text-destructive">{state.error}</p>}{state.success && <p role="status" className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-extrabold text-primary">{state.success}</p>}<button disabled={pending} className="btn-pop gap-2 bg-primary px-6 text-xs text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar integração</button>
  </form><WebhookSyncForm enabled={settings.apiKeyConfigured && settings.webhookTokenConfigured} /></div>;
}

function WebhookSyncForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(syncAsaasWebhookAction, {} as AsaasActionState);
  const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [router, state.success]);
  return <form action={action} className="card-pop flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black">Sincronização automática</h2><p className="text-xs font-bold text-muted-foreground">Cria ou atualiza o webhook na conta Asaas usando a URL e o token protegidos.</p>{state.error && <p role="alert" className="mt-2 text-xs font-extrabold text-destructive">{state.error}</p>}{state.success && <p role="status" className="mt-2 text-xs font-extrabold text-primary">{state.success}</p>}</div><button disabled={!enabled || pending} className="btn-pop shrink-0 gap-2 bg-muted px-4 text-xs shadow-[var(--shadow-pop-muted)] disabled:opacity-50">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Sincronizar webhook</button></form>;
}
