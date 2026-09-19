"use client";

import { useActionState } from "react";
import { Building2, Globe2, LoaderCircle, Megaphone, Save, ShieldCheck } from "lucide-react";
import type { ApplicationSettings } from "@/core/admin/application-settings-service";
import { updateApplicationSettingsAction, type SettingsActionState } from "./actions";

const field = "mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary";

export function SettingsForm({ settings }: { settings: ApplicationSettings }) {
  const [state, action, pending] = useActionState(updateApplicationSettingsAction, {} as SettingsActionState);
  return <form action={action} className="space-y-6">
    <section className="card-pop space-y-5 p-5 sm:p-6">
      <SectionTitle icon={Building2} title="Identidade operacional" description="Dados institucionais usados pelo sistema. Os campos de SEO e imagens continuam no módulo SEO e conteúdo." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do produto" name="productName" defaultValue={settings.productName} maxLength={80} />
        <Field label="Razão social / nome legal" name="legalName" defaultValue={settings.legalName} maxLength={160} />
        <Field label="E-mail público de suporte" name="supportEmail" type="email" defaultValue={settings.supportEmail} maxLength={160} />
        <label className="text-sm font-extrabold">Idioma padrão<select name="locale" defaultValue={settings.locale} className={field}><option value="pt-BR">Português (Brasil)</option></select></label>
      </div>
    </section>
    <section className="card-pop space-y-5 p-5 sm:p-6">
      <SectionTitle icon={Globe2} title="Domínios e região" description="Referências públicas da aplicação. As variáveis de ambiente continuam responsáveis pelo roteamento do deploy." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="URL da plataforma" name="publicUrl" type="url" defaultValue={settings.publicUrl} maxLength={300} />
        <Field label="URL do painel administrativo" name="adminUrl" type="url" defaultValue={settings.adminUrl} maxLength={300} />
        <label className="text-sm font-extrabold sm:col-span-2">Fuso horário padrão<select name="timezone" defaultValue={settings.timezone} className={field}><option value="America/Bahia">Bahia (UTC−3)</option><option value="America/Fortaleza">Fortaleza (UTC−3)</option><option value="America/Sao_Paulo">São Paulo (UTC−3)</option></select></label>
      </div>
    </section>
    <section className="card-pop space-y-5 p-5 sm:p-6">
      <SectionTitle icon={ShieldCheck} title="Acesso à plataforma" description="Controle operacional para novas contas. Usuários já cadastrados continuam conseguindo entrar." />
      <Toggle name="registrationsEnabled" defaultChecked={settings.registrationsEnabled} title="Permitir novos cadastros" description="Quando desativado, a página de registro informa que as inscrições estão temporariamente fechadas e a API impede a criação do perfil." />
    </section>
    <section className="card-pop space-y-5 p-5 sm:p-6">
      <SectionTitle icon={Megaphone} title="Aviso global" description="Mensagem curta exibida no topo de todas as telas da plataforma e do painel." />
      <Toggle name="announcementEnabled" defaultChecked={settings.announcementEnabled} title="Publicar aviso" description="Ative somente quando a mensagem estiver pronta." />
      <label className="block text-sm font-extrabold">Mensagem<textarea name="announcementText" defaultValue={settings.announcementText} maxLength={180} rows={3} className={`${field} h-auto py-3`} /><small className="mt-1 block text-xs text-muted-foreground">Máximo de 180 caracteres.</small></label>
    </section>
    <section className="card-pop space-y-5 p-5 sm:p-6">
      <SectionTitle icon={Globe2} title="Redes sociais" description="Links institucionais opcionais, preparados para uso no rodapé e comunicações." />
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Instagram" name="instagramUrl" type="url" defaultValue={settings.instagramUrl} maxLength={300} required={false} /><Field label="LinkedIn" name="linkedinUrl" type="url" defaultValue={settings.linkedinUrl} maxLength={300} required={false} /><Field label="YouTube" name="youtubeUrl" type="url" defaultValue={settings.youtubeUrl} maxLength={300} required={false} /></div>
    </section>
    {state.error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-extrabold text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-extrabold text-primary">{state.success}</p>}
    <button disabled={pending} className="btn-pop gap-2 bg-primary px-6 text-xs text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{pending ? "Salvando..." : "Salvar configurações"}</button>
  </form>;
}

function Field({ label, name, defaultValue, type = "text", maxLength, required = true }: { label: string; name: string; defaultValue: string; type?: string; maxLength: number; required?: boolean }) {
  return <label className="text-sm font-extrabold">{label}<input name={name} type={type} defaultValue={defaultValue} maxLength={maxLength} required={required} className={field} /></label>;
}
function Toggle({ name, defaultChecked, title, description }: { name: string; defaultChecked: boolean; title: string; description: string }) {
  return <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border-2 border-border bg-muted/20 p-4"><span><span className="block font-extrabold">{title}</span><span className="mt-1 block text-xs font-bold text-muted-foreground">{description}</span></span><input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-5 w-5 shrink-0 accent-primary" /></label>;
}
function SectionTitle({ icon: Icon, title, description }: { icon: typeof Building2; title: string; description: string }) {
  return <div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></span><div><h2 className="text-xl font-black">{title}</h2><p className="text-sm font-bold text-muted-foreground">{description}</p></div></div>;
}
