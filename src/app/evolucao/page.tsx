
import { Navbar } from "@/presentation/components/shared/navbar";

const weekly = [40, 55, 48, 70, 62, 85, 92];
const days = ["S", "T", "Q", "Q", "S", "S", "D"];

const bySpec = [
  { n: "Cardiologia", v: 92, c: "bg-destructive" },
  { n: "Infectologia", v: 85, c: "bg-primary" },
  { n: "Pneumologia", v: 78, c: "bg-info" },
  { n: "Neurologia", v: 64, c: "bg-xp" },
  { n: "Gastro", v: 52, c: "bg-streak" },
  { n: "Endócrino", v: 38, c: "bg-muted-foreground" },
];

const history = [
  { d: "Hoje", c: "Mulher, 32, dispneia súbita", s: "Pneumologia", ok: true, xp: 200 },
  { d: "Hoje", c: "Homem, 54, dor torácica", s: "Cardiologia", ok: true, xp: 180 },
  { d: "Ontem", c: "Criança, 5, febre + rash", s: "Infectologia", ok: false, xp: 60 },
  { d: "Ontem", c: "Idoso, 72, confusão aguda", s: "Neurologia", ok: true, xp: 220 },
  { d: "2d", c: "Mulher, 28, dor abdominal", s: "Gastro", ok: true, xp: 150 },
];

export default function Evolution() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div>
          <div className="inline-flex rounded-full bg-info/15 text-info px-3 py-1 text-xs font-bold uppercase tracking-wider">Sua jornada</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Você está evoluindo 🚀</h1>
          <p className="text-muted-foreground font-bold">+18% de acerto vs. semana passada. Continue assim.</p>
        </div>

        {/* Big stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { l: "Casos resolvidos", v: "147", e: "🩺", t: "bg-primary/10 text-primary" },
            { l: "Acerto médio", v: "87%", e: "🎯", t: "bg-info/10 text-info" },
            { l: "XP esta semana", v: "1.640", e: "★", t: "bg-xp/15 text-xp-foreground" },
            { l: "Streak atual", v: "12 dias", e: "🔥", t: "bg-streak/15 text-streak" },
          ].map((s, i) => (
            <div key={i} className="card-pop p-5">
              <div className={`h-12 w-12 rounded-2xl grid place-items-center text-2xl ${s.t}`}>{s.e}</div>
              <div className="mt-3 text-3xl font-extrabold">{s.v}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Weekly chart */}
        <section className="card-pop p-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-xl">Evolução semanal</h3>
              <p className="text-sm text-muted-foreground font-bold">Acerto por dia (%)</p>
            </div>
            <div className="text-3xl font-extrabold text-primary">+18%</div>
          </div>
          <div className="h-56 flex items-end justify-between gap-3">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-[10px] font-extrabold text-muted-foreground">{v}%</div>
                <div className="w-full rounded-t-xl bg-gradient-to-t from-primary/70 to-primary shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.15)] transition-all" style={{ height: `${v}%` }} />
                <div className="text-xs font-extrabold text-muted-foreground">{days[i]}</div>
              </div>
            ))}
          </div>
        </section>

        {/* By specialty + strengths */}
        <section className="grid lg:grid-cols-3 gap-5">
          <div className="card-pop p-6 lg:col-span-2">
            <h3 className="font-extrabold text-xl mb-5">Desempenho por especialidade</h3>
            <div className="space-y-4">
              {bySpec.map((s) => (
                <div key={s.n}>
                  <div className="flex justify-between text-sm font-extrabold mb-1.5">
                    <span>{s.n}</span><span className="text-muted-foreground">{s.v}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${s.c} shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.15)]`} style={{ width: `${s.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card-pop p-5 bg-primary/5 border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💪</span>
                <h4 className="font-extrabold">Pontos fortes</h4>
              </div>
              <ul className="space-y-2 text-sm font-bold">
                <li className="flex items-center gap-2"><span className="text-primary">●</span> Anamnese estruturada</li>
                <li className="flex items-center gap-2"><span className="text-primary">●</span> Cardio · 92% acerto</li>
                <li className="flex items-center gap-2"><span className="text-primary">●</span> Diagnóstico rápido</li>
              </ul>
            </div>
            <div className="card-pop p-5 bg-streak/5 border-streak/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎯</span>
                <h4 className="font-extrabold">Foco da semana</h4>
              </div>
              <ul className="space-y-2 text-sm font-bold">
                <li className="flex items-center gap-2"><span className="text-streak">●</span> Endócrino · revisar DM</li>
                <li className="flex items-center gap-2"><span className="text-streak">●</span> Pedir menos exames</li>
                <li className="flex items-center gap-2"><span className="text-streak">●</span> Diagnóstico diferencial</li>
              </ul>
            </div>
          </div>
        </section>

        {/* History */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h3 className="font-extrabold text-2xl">Histórico de casos</h3>
            <button className="text-sm font-extrabold text-primary">Ver tudo →</button>
          </div>
          <div className="card-pop p-2 divide-y-2 divide-border">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className={`h-10 w-10 rounded-xl grid place-items-center text-lg ${h.ok ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                  {h.ok ? "✓" : "✗"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm truncate">{h.c}</div>
                  <div className="text-xs text-muted-foreground font-bold">{h.s} · {h.d}</div>
                </div>
                <div className="text-sm font-extrabold text-xp-foreground">★ +{h.xp}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
