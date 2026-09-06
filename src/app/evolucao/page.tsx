import { redirect } from "next/navigation";
import { Navbar } from "@/presentation/components/shared/navbar";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getPlayerProgress } from "@/core/player/player-progress-service";

const specialtyColors = ["bg-destructive", "bg-primary", "bg-info", "bg-xp", "bg-streak"];

export default async function Evolution() {
  const user = await getCurrentFirebaseUser();
  if (!user) redirect("/login");
  const progress = await getPlayerProgress(user.uid);
  const { stats, weekly, weeklyXp, weekDelta, bySpecialty, history } = progress;
  const number = new Intl.NumberFormat("pt-BR");
  const strongest = bySpecialty[0];
  const focus = bySpecialty.length > 1 ? bySpecialty.at(-1) : undefined;

  return <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <div className="inline-flex rounded-full bg-info/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-info">Sua jornada</div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Você está evoluindo 🚀</h1>
        <p className="font-bold text-muted-foreground">
          {weekDelta === null ? "Continue jogando para comparar sua evolução semanal." : `${weekDelta >= 0 ? "+" : ""}${weekDelta}% de acerto vs. semana passada.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Casos resolvidos", value: number.format(stats.casesPlayed), icon: "🩺", tone: "bg-primary/10 text-primary" },
          { label: "Acerto médio", value: `${stats.averageAccuracy}%`, icon: "🎯", tone: "bg-info/10 text-info" },
          { label: "XP esta semana", value: number.format(weeklyXp), icon: "★", tone: "bg-xp/15 text-xp-foreground" },
          { label: "Streak atual", value: `${stats.streak} ${stats.streak === 1 ? "dia" : "dias"}`, icon: "🔥", tone: "bg-streak/15 text-streak" },
        ].map((stat) => <div key={stat.label} className="card-pop p-5">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${stat.tone}`}>{stat.icon}</div>
          <div className="mt-3 text-3xl font-extrabold">{stat.value}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</div>
        </div>)}
      </div>

      <section className="card-pop p-6">
        <div className="mb-6 flex items-end justify-between">
          <div><h2 className="text-xl font-extrabold">Evolução semanal</h2><p className="text-sm font-bold text-muted-foreground">Acerto por dia (%)</p></div>
          <div className="text-3xl font-extrabold text-primary">{weekDelta === null ? "—" : `${weekDelta >= 0 ? "+" : ""}${weekDelta}%`}</div>
        </div>
        <div className="flex h-56 items-end justify-between gap-3">
          {weekly.map((day) => <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-[10px] font-extrabold text-muted-foreground">{day.cases ? `${day.accuracy}%` : "—"}</div>
            <div className="w-full rounded-t-xl bg-gradient-to-t from-primary/70 to-primary shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.15)]" style={{ height: day.cases ? `${Math.max(day.accuracy, 4)}%` : "4px", opacity: day.cases ? 1 : 0.18 }} />
            <div className="text-xs font-extrabold text-muted-foreground">{day.label}</div>
          </div>)}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="card-pop p-6 lg:col-span-2">
          <h2 className="mb-5 text-xl font-extrabold">Desempenho por especialidade</h2>
          {bySpecialty.length ? <div className="space-y-4">
            {bySpecialty.map((specialty, index) => <div key={specialty.name}>
              <div className="mb-1.5 flex justify-between text-sm font-extrabold"><span>{specialty.name} <small className="text-muted-foreground">({specialty.cases})</small></span><span className="text-muted-foreground">{specialty.accuracy}%</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${specialtyColors[index % specialtyColors.length]} shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.15)]`} style={{ width: `${specialty.accuracy}%` }} /></div>
            </div>)}
          </div> : <p className="py-10 text-center font-bold text-muted-foreground">Conclua seu primeiro caso para visualizar o desempenho.</p>}
        </div>

        <div className="space-y-5">
          <div className="card-pop border-primary/30 bg-primary/5 p-5">
            <div className="mb-3 flex items-center gap-2"><span className="text-2xl">💪</span><h3 className="font-extrabold">Ponto forte</h3></div>
            <p className="text-sm font-bold">{strongest ? `${strongest.name} · ${strongest.accuracy}% de acerto` : "Continue treinando para descobrir seu ponto forte."}</p>
          </div>
          <div className="card-pop border-streak/30 bg-streak/5 p-5">
            <div className="mb-3 flex items-center gap-2"><span className="text-2xl">🎯</span><h3 className="font-extrabold">Foco recomendado</h3></div>
            <p className="text-sm font-bold">{focus ? `${focus.name} · pratique novos casos nesta área` : "Jogue em mais especialidades para receber uma recomendação."}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold">Histórico de casos</h2>
        <div className="card-pop divide-y-2 divide-border p-2">
          {history.length ? history.map((item) => <div key={item.id} className="flex items-center gap-4 px-4 py-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${item.correct ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>{item.correct ? "✓" : "✗"}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold">{item.caseTitle}</div><div className="text-xs font-bold text-muted-foreground">{item.specialty} · {item.date}</div></div>
            <div className="text-sm font-extrabold text-xp-foreground">★ +{item.xp}</div>
          </div>) : <p className="px-4 py-10 text-center font-bold text-muted-foreground">Nenhum caso concluído ainda.</p>}
        </div>
      </section>
    </main>
  </div>;
}
