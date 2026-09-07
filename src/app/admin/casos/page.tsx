import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/core/admin/admin-service";
import { listClinicalCasesForAdmin } from "@/core/admin/clinical-case-admin-service";
import { Navbar } from "@/presentation/components/shared/navbar";
import { CaseForm } from "./case-form";
import { changeCaseStatusAction } from "./actions";

const specialtyLabels = { cardiologia: "Cardiologia", "clinica-geral": "Clínica Geral", infectologia: "Infectologia" };
const statusLabels = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };

export default async function AdminCasesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/dashboard");
  const cases = await listClinicalCasesForAdmin();
  const totals = cases.reduce((result, item) => ({ ...result, [item.status]: (result[item.status] ?? 0) + 1 }), {} as Record<string, number>);

  return <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
      <div><div className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Administração</div><h1 className="mt-3 text-4xl font-extrabold">Casos clínicos</h1><p className="font-bold text-muted-foreground">{cases.length} casos · {totals.published ?? 0} publicados · {totals.draft ?? 0} rascunhos</p></div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
        <CaseForm />
        <section className="card-pop max-h-[80svh] overflow-y-auto p-3">
          <h2 className="sticky top-0 z-10 bg-card px-3 py-3 text-xl font-extrabold">Catálogo</h2>
          <div className="divide-y-2 divide-border">
            {cases.map((item) => <article key={item.id} className="space-y-3 px-3 py-4">
              <div className="flex items-start justify-between gap-3"><div><p className="font-extrabold leading-tight">{item.title}</p><p className="mt-1 text-xs font-bold text-muted-foreground">{specialtyLabels[item.specialty]} · {item.difficulty} · {item.diagnosis}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${item.status === "published" ? "bg-primary/15 text-primary" : item.status === "draft" ? "bg-xp/20 text-xp-foreground" : "bg-muted text-muted-foreground"}`}>{statusLabels[item.status]}</span></div>
              <div className="flex flex-wrap gap-2">
                {item.status !== "published" && <form action={changeCaseStatusAction.bind(null, item.id, "published")}><button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-extrabold text-primary-foreground">Publicar</button></form>}
                {item.status === "published" && <form action={changeCaseStatusAction.bind(null, item.id, "draft")}><button className="rounded-lg bg-muted px-3 py-1.5 text-xs font-extrabold">Retirar do jogo</button></form>}
                {item.status !== "archived" && <form action={changeCaseStatusAction.bind(null, item.id, "archived")}><button className="rounded-lg px-3 py-1.5 text-xs font-extrabold text-destructive hover:bg-destructive/10">Arquivar</button></form>}
              </div>
            </article>)}
          </div>
        </section>
      </div>
    </main>
  </div>;
}
