import Link from "next/link";
import { Navbar } from "@/presentation/components/shared/navbar";
import { Logo } from "@/presentation/components/shared/logo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary blob" />
        <div className="absolute top-20 -right-32 h-96 w-96 rounded-full bg-info blob" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-pop-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Novo · Casos com IA generativa
            </div>
            <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]">
              Treine raciocínio clínico
              <span className="block text-primary">todos os dias.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Converse com pacientes simulados por IA, peça exames, formule hipóteses e evolua como em um jogo. Feito para estudantes de medicina, internos e residência.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-pop bg-primary text-primary-foreground text-base shadow-[var(--shadow-pop)] animate-glow-pulse">
                Começar gratuitamente
              </Link>
              <Link href="/caso" className="btn-pop bg-card border-2 border-border text-foreground text-base shadow-[var(--shadow-pop-muted)]">
                Ver caso demo
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["#58CC02","#1CB0F6","#FFC800","#FF9600"].map((c,i)=>(
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background" style={{background:c}}/>
                ))}
              </div>
              <span><b className="text-foreground">+12.000</b> estudantes treinando agora</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-primary/20 blur-3xl" />
            <div className="relative animate-float rounded-[2.5rem] bg-card border-2 border-border p-4 shadow-2xl">
              <div className="rounded-[2rem] bg-gradient-to-b from-accent/40 to-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-streak/20 grid place-items-center text-streak font-extrabold">🔥</div>
                    <span className="font-extrabold">12</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-xp/20 grid place-items-center text-xp-foreground font-extrabold">★</div>
                    <span className="font-extrabold">2.840 XP</span>
                  </div>
                </div>

                <div className="card-pop p-4 mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Caso #128 · Cardiologia</div>
                  <div className="mt-1 font-extrabold">Homem, 54, dor torácica</div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-primary" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">75%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-9 w-9 rounded-full bg-info grid place-items-center text-info-foreground font-extrabold">P</div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm max-w-[80%]">
                      Comecei a sentir aperto no peito subindo escadas, doutor…
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground max-w-[80%]">
                      Há quanto tempo isso começou?
                    </div>
                  </div>
                </div>

                <button className="btn-pop w-full mt-4 bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
                  Solicitar exame
                </button>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -left-6 top-20 card-pop p-3 animate-float" style={{animationDelay:"0.5s"}}>
              <div className="text-2xl animate-wiggle">🏆</div>
              <div className="text-[10px] font-extrabold uppercase">+50 XP</div>
            </div>
            <div className="absolute -right-4 bottom-20 card-pop p-3 animate-float" style={{animationDelay:"1.5s"}}>
              <div className="text-2xl animate-wiggle">🩺</div>
              <div className="text-[10px] font-extrabold uppercase">Nível 14</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex rounded-full bg-info/15 text-info px-3 py-1 text-xs font-bold uppercase tracking-wider">Como funciona</div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">Treine diagnósticos clínicos com IA</h2>
          <p className="mt-3 text-muted-foreground">Cada caso é uma missão. Cada acerto, um passo a mais rumo à residência.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5 stagger">
          {[
            { emoji: "💬", title: "Converse com o paciente", desc: "Anamnese guiada por IA, em linguagem natural. O paciente reage ao seu raciocínio.", tone: "info" },
            { emoji: "🧪", title: "Solicite exames", desc: "Escolha entre laboratoriais e imagens. Cada pedido importa no seu score final.", tone: "primary" },
            { emoji: "🎯", title: "Formule a hipótese", desc: "Receba feedback inteligente, com explicação clínica e referências.", tone: "xp" },
          ].map((f, i) => (
            <div key={i} className="card-pop card-jelly p-6">
              <div className={`h-14 w-14 rounded-2xl grid place-items-center text-3xl animate-wiggle ${f.tone==="info"?"bg-info/15":f.tone==="xp"?"bg-xp/20":"bg-accent"}`}>{f.emoji}</div>
              <h3 className="mt-4 text-xl font-extrabold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GAMIFICATION */}
      <section className="bg-accent/30 border-y-2 border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex rounded-full bg-xp/25 text-xp-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">Gamificação</div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">Estude porque você <span className="text-primary">quer</span>.</h2>
            <p className="mt-4 text-muted-foreground text-lg">XP, níveis, streaks diários e conquistas por especialidade. A meta clínica vira hábito sem você perceber.</p>
            <ul className="mt-6 space-y-3">
              {["🔥 Streaks diários que viciam","⭐ XP por raciocínio correto","🏅 Conquistas por especialidade","📈 Curva de evolução visual"].map((s,i)=>(
                <li key={i} className="flex items-center gap-3 font-bold">{s}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4 stagger">
            {[
              { v: "🔥 12", l: "Dias de streak", bg: "bg-streak/15", c: "text-streak" },
              { v: "★ 2.840", l: "XP total", bg: "bg-xp/20", c: "text-xp-foreground" },
              { v: "Nv 14", l: "Diagnosta", bg: "bg-info/15", c: "text-info" },
              { v: "87%", l: "Acerto médio", bg: "bg-primary/15", c: "text-primary" },
            ].map((s,i)=>(
              <div key={i} className={`card-pop card-jelly p-6 ${s.bg}`}>
                <div className={`text-3xl font-extrabold animate-tick ${s.c}`}>{s.v}</div>
                <div className="mt-1 text-sm font-bold text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RANKING */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="card-pop p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg">🏆 Ranking semanal</h3>
              <span className="text-xs font-bold text-muted-foreground">USP · Med</span>
            </div>
            <div className="space-y-2 stagger">
              {[
                { n: "Lara M.", xp: 1820, p: 1, c: "bg-xp" },
                { n: "Você", xp: 1640, p: 2, c: "bg-info", me: true },
                { n: "Pedro V.", xp: 1510, p: 3, c: "bg-streak" },
                { n: "Júlia R.", xp: 1240, p: 4, c: "bg-muted-foreground" },
                { n: "Caio A.", xp: 980, p: 5, c: "bg-muted-foreground" },
              ].map((u,i)=>(
                <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${u.me?"bg-info/10 border-2 border-info/40":"bg-muted/40"}`}>
                  <div className={`h-8 w-8 rounded-lg grid place-items-center text-sm font-extrabold text-white ${u.c}`}>{u.p}</div>
                  <div className="flex-1 font-bold">{u.n}</div>
                  <div className="text-sm font-extrabold text-xp-foreground">★ {u.xp}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="inline-flex rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">Comunidade</div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">Compita com sua turma.</h2>
            <p className="mt-4 text-muted-foreground text-lg">Ranking por universidade, especialidade e ligas semanais. Ninguém quer perder o topo da turma.</p>
            <Link href="/dashboard" className="mt-6 inline-flex btn-pop bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">Entrar na liga</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight">O que dizem os estudantes</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-5 stagger">
          {[
            { n:"Marina S.", u:"6º ano · UFMG", t:"Mudou meu jeito de estudar pra residência. Vicia.", c:"#58CC02" },
            { n:"Rafael T.", u:"Interno · UNIFESP", t:"Cada caso parece uma fase de jogo. Já bati streak de 45 dias.", c:"#1CB0F6" },
            { n:"Bia L.", u:"4º ano · USP", t:"Finalmente um app que ensina raciocínio, não decoreba.", c:"#FFC800" },
          ].map((t,i)=>(
            <div key={i} className="card-pop card-jelly p-6">
              <div className="text-2xl mb-3 animate-wiggle">💬</div>
              <p className="font-bold text-lg leading-snug">“{t.t}”</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full" style={{background:t.c}}/>
                <div>
                  <div className="font-extrabold text-sm">{t.n}</div>
                  <div className="text-xs text-muted-foreground font-bold">{t.u}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Comece grátis. Evolua quando quiser.</h2>
          <p className="mt-3 text-muted-foreground">Sem cartão de crédito. Sem complicação.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="card-pop card-jelly p-8">
            <div className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Free</div>
            <div className="mt-2 text-4xl font-extrabold">R$ 0</div>
            <p className="mt-1 text-sm text-muted-foreground font-bold">para sempre</p>
            <ul className="mt-6 space-y-2 text-sm font-bold">
              <li>✓ 3 casos por dia</li>
              <li>✓ XP, streak e ranking</li>
              <li>✓ 4 especialidades</li>
            </ul>
            <Link href="/dashboard" className="mt-8 btn-pop w-full bg-muted text-foreground shadow-[var(--shadow-pop-muted)]">Começar grátis</Link>
          </div>
          <div className="card-pop card-jelly p-8 relative overflow-hidden border-primary/40 bg-gradient-to-br from-accent/40 to-card">
            <div className="absolute top-4 right-4 rounded-full bg-xp text-xp-foreground px-3 py-1 text-[10px] font-extrabold uppercase animate-pop-badge">Mais popular</div>
            <div className="text-sm font-extrabold uppercase tracking-wider text-primary">Pro</div>
            <div className="mt-2 text-4xl font-extrabold">R$ 49,90<span className="text-base text-muted-foreground">/mês</span></div>
            <p className="mt-1 text-sm text-muted-foreground font-bold">cancele quando quiser</p>
            <ul className="mt-6 space-y-2 text-sm font-bold">
              <li>✓ Casos ilimitados</li>
              <li>✓ Todas as especialidades</li>
              <li>✓ Feedback avançado da IA</li>
              <li>✓ Trilha personalizada de residência</li>
              <li>✓ Modo OSCE</li>
            </ul>
            <Link href="/dashboard" className="mt-8 btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">Assinar Pro</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="card-pop p-10 text-center bg-gradient-to-br from-primary to-[#46A302] border-primary text-primary-foreground">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Mais um caso. Só mais um.</h2>
          <p className="mt-3 text-primary-foreground/90">Seu próximo plantão começa aqui.</p>
          <Link href="/dashboard" className="mt-6 inline-flex btn-pop bg-card text-primary text-base shadow-[0_4px_0_0_rgba(0,0,0,0.15)]">Treinar agora</Link>
        </div>
      </section>

      <footer className="border-t-2 border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground font-bold">© 2026 IAgnóstico · feito por estudantes, para estudantes.</p>
        </div>
      </footer>
    </div>
  );
}
