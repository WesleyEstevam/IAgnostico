import { Settings, UserPlus } from "lucide-react";
import { requirePermission } from "@/core/admin/admin-service";
import { getApplicationSettings } from "@/core/admin/application-settings-service";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requirePermission("settings.manage");
  const settings = await getApplicationSettings();
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <header><div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Operação da plataforma</div><h1 className="mt-3 text-4xl font-black">Configurações</h1><p className="mt-1 font-bold text-muted-foreground">Gerencie parâmetros gerais que não pertencem a planos, SEO ou atendimento.</p></header>
    <section className="grid gap-3 sm:grid-cols-2"><article className="card-pop flex items-center gap-4 p-5"><Settings className="h-8 w-8 text-primary" /><div><p className="font-extrabold">Ambiente</p><p className="text-sm font-bold text-muted-foreground">{settings.productName} · {settings.locale}</p></div></article><article className="card-pop flex items-center gap-4 p-5"><UserPlus className="h-8 w-8 text-primary" /><div><p className="font-extrabold">Novos cadastros</p><p className="text-sm font-bold text-muted-foreground">{settings.registrationsEnabled ? "Abertos" : "Temporariamente fechados"}</p></div></article></section>
    <SettingsForm settings={settings} />
  </main>;
}
