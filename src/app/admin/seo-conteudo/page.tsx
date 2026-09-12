import { Globe2, SearchCheck } from "lucide-react";
import { requirePermission } from "@/core/admin/admin-service";
import { getSiteContent } from "@/core/admin/site-content-service";
import { ContentForm } from "./content-form";

export default async function SeoContentPage() {
  await requirePermission("settings.manage");
  const content = await getSiteContent();
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"><header><div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Aquisição orgânica</div><h1 className="mt-3 text-4xl font-black">SEO e conteúdo</h1><p className="mt-1 font-bold text-muted-foreground">Controle como a IAgnóstico aparece nos buscadores e os principais textos da landing page.</p></header><section className="grid gap-3 sm:grid-cols-2"><article className="card-pop flex items-center gap-4 p-5"><SearchCheck className="h-8 w-8 text-primary" /><div><p className="font-extrabold">Indexação</p><p className="text-sm font-bold text-muted-foreground">{content.allowIndexing ? "Permitida" : "Bloqueada"}</p></div></article><article className="card-pop flex items-center gap-4 p-5"><Globe2 className="h-8 w-8 text-primary" /><div className="min-w-0"><p className="font-extrabold">URL canônica</p><p className="truncate text-sm font-bold text-muted-foreground">{content.canonicalUrl}</p></div></article></section><ContentForm content={content} /></main>;
}
