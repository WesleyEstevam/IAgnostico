"use client";

import Link from "next/link";
import { Navbar } from "@/presentation/components/shared/navbar";
import { useEffect, useState } from "react";
import { useEmergencyAmbience } from "@/presentation/hooks/use-emergency-ambience";

type Msg = { who: "patient" | "you"; text: string };

const CASE_DURATION_SECONDS = 8 * 60;

const initialMsgs: Msg[] = [
  { who: "patient", text: "Doutor(a), estou com uma falta de ar que começou de repente hoje cedo… 😟" },
  { who: "you", text: "Há quanto tempo exatamente começou? Está associado a dor?" },
  { who: "patient", text: "Faz umas 3 horas. Sinto uma pontada no lado direito do peito quando respiro fundo." },
];

export default function CasePage() {
  const [msgs, setMsgs] = useState<Msg[]>(initialMsgs);
  const [input, setInput] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(CASE_DURATION_SECONDS);
  const [finishedReason, setFinishedReason] = useState<"tempo" | "diagnostico" | null>(null);
  const { playing, start, stop, toggle } = useEmergencyAmbience();

  // Navegadores exigem um gesto do usuário para liberar áudio
  useEffect(() => {
    if (finishedReason) return;

    const kick = () => start();
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("keydown", kick, { once: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
  }, [finishedReason, start]);

  useEffect(() => {
    if (finishedReason) return;

    const deadline = Date.now() + CASE_DURATION_SECONDS * 1000;
    const timer = window.setInterval(() => {
      const nextValue = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsRemaining(nextValue);

      if (nextValue === 0) {
        window.clearInterval(timer);
        stop();
        setFinishedReason("tempo");
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [finishedReason, stop]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { who: "you", text: input }, { who: "patient", text: "Hmm… deixa eu pensar. Acho que sim, doutor." }]);
    setInput("");
  };

  const finishCase = () => {
    stop();
    setFinishedReason("diagnostico");
  };

  const formattedTime = `${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}`;
  const correctDiagnosis = /tromboembolismo|embolia pulmonar|\btep\b/i.test(hypothesis);
  const xpEarned = correctDiagnosis ? 200 : hypothesis.trim() ? 40 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Case header */}
        <div className="card-pop p-5 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-info/15 grid place-items-center text-4xl">👩</div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Caso #128 · Pneumologia · Emergência</div>
                <h1 className="text-2xl font-extrabold tracking-tight">Mulher, 32 anos, dispneia súbita</h1>
                <p className="text-sm text-muted-foreground font-bold">Sem comorbidades. Uso de ACO. Voo intercontinental há 2 dias.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Desligar trilha sonora" : "Ligar trilha sonora"}
                title={playing ? "Trilha de emergência: ligada" : "Trilha de emergência: desligada"}
                className="rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-extrabold hover:border-primary transition-colors"
              >
                {playing ? "🔊 Trilha ON" : "🔇 Trilha OFF"}
              </button>
              <div
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold tabular-nums ${
                  secondsRemaining <= 60
                    ? "bg-destructive/15 text-destructive animate-pulse"
                    : "bg-streak/15 text-streak"
                }`}
                role="timer"
                aria-label={`Tempo restante: ${formattedTime}`}
              >
                ⏱ {formattedTime}
              </div>
              <div className="rounded-full bg-xp/20 text-xp-foreground px-3 py-1.5 text-xs font-extrabold">★ +200 XP</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Chat */}
          <div className="lg:col-span-2 card-pop p-0 overflow-hidden flex flex-col h-[640px]">
            <div className="px-5 py-3 border-b-2 border-border flex items-center gap-3 bg-muted/40">
              <div className="h-9 w-9 rounded-full bg-info grid place-items-center text-info-foreground font-extrabold">P</div>
              <div>
                <div className="font-extrabold text-sm">Paciente · Ana, 32</div>
                <div className="text-[11px] text-primary font-bold">● online · respondendo</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.who === "you" ? "justify-end" : ""}`}>
                  {m.who === "patient" && <div className="h-8 w-8 rounded-full bg-info grid place-items-center text-xs text-info-foreground font-extrabold">P</div>}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm font-medium ${m.who === "you" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t-2 border-border bg-card flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Pergunte ao paciente…"
                className="flex-1 rounded-2xl border-2 border-border bg-muted/30 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
              />
              <button onClick={send} className="btn-pop bg-primary text-primary-foreground shadow-[var(--shadow-pop)] text-sm">Enviar</button>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Exams */}
            <div className="card-pop p-5">
              <h3 className="font-extrabold mb-3 flex items-center gap-2">🧪 Solicitar exames</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { n: "Hemograma", c: "info" },
                  { n: "D-dímero", c: "primary", hot: true },
                  { n: "Rx tórax", c: "info" },
                  { n: "Angio-TC", c: "primary" },
                  { n: "Gasometria", c: "info" },
                  { n: "ECG", c: "info" },
                ].map((x, i) => (
                  <button key={i} className={`relative rounded-xl border-2 border-border bg-card px-3 py-2.5 text-xs font-extrabold hover:border-primary hover:bg-accent transition-colors`}>
                    {x.hot && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-streak animate-pulse" />}
                    {x.n}
                  </button>
                ))}
              </div>
              <button className="mt-3 w-full text-xs font-extrabold text-info">+ Adicionar outros</button>
            </div>

            {/* Hypothesis */}
            <div className="card-pop p-5">
              <h3 className="font-extrabold mb-3 flex items-center gap-2">🎯 Hipótese diagnóstica</h3>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                rows={4}
                placeholder="Ex: Tromboembolismo pulmonar pós-voo, em uso de ACO…"
                className="w-full rounded-xl border-2 border-border bg-muted/30 p-3 text-sm font-medium focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={finishCase}
                className="mt-3 btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] text-sm"
              >
                Enviar diagnóstico
              </button>
            </div>

            <Link href="/dashboard" className="block text-center text-sm font-extrabold text-muted-foreground hover:text-foreground">
              ← Sair do caso
            </Link>
          </div>
        </div>
      </main>

      {finishedReason && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-foreground/70 p-4 backdrop-blur-md">
          <section
            className="card-pop animate-bounce-in w-full max-w-2xl overflow-hidden border-0 bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            <div className={`p-7 text-center sm:p-9 ${correctDiagnosis ? "bg-primary text-primary-foreground" : "bg-streak text-white"}`}>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 text-4xl">
                {correctDiagnosis ? "✓" : finishedReason === "tempo" ? "⏱" : "🧠"}
              </div>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80">
                Caso encerrado
              </p>
              <h2 id="result-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">
                {correctDiagnosis
                  ? "Diagnóstico correto!"
                  : finishedReason === "tempo"
                    ? "O tempo acabou"
                    : "Vamos revisar o caso"}
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-xp/15 p-4 text-center">
                  <div className="text-2xl font-extrabold text-xp-foreground">★ +{xpEarned}</div>
                  <div className="mt-1 text-xs font-bold uppercase text-muted-foreground">XP ganho</div>
                </div>
                <div className="rounded-2xl bg-info/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-info">{formattedTime}</div>
                  <div className="mt-1 text-xs font-bold uppercase text-muted-foreground">Tempo restante</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border-2 border-primary/25 bg-primary/5 p-5">
                <h3 className="flex items-center gap-2 font-extrabold">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">🧠</span>
                  Feedback do caso
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                  {correctDiagnosis
                    ? "Excelente. A dispneia súbita, a dor pleurítica, o uso de anticoncepcional e o voo recente sustentam tromboembolismo pulmonar como hipótese principal."
                    : hypothesis.trim()
                      ? "A hipótese principal era tromboembolismo pulmonar. Os principais indícios eram dispneia súbita, dor pleurítica, uso de anticoncepcional e imobilidade associada ao voo recente."
                      : "Você não enviou uma hipótese antes do encerramento. Neste caso, os fatores de risco e a apresentação súbita apontavam para tromboembolismo pulmonar."}
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/especialidade"
                  className="btn-pop bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"
                >
                  Novo plantão
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-pop bg-muted text-foreground shadow-[var(--shadow-pop-muted)]"
                >
                  Voltar ao dashboard
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
