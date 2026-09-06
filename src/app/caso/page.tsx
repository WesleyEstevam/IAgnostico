"use client";

import Link from "next/link";
import { Navbar } from "@/presentation/components/shared/navbar";
import { useEffect, useRef, useState } from "react";
import { useEmergencyAmbience } from "@/presentation/hooks/use-emergency-ambience";
import { refreshAuthSession } from "@/presentation/auth/auth-store";

type Msg = { who: "patient" | "you"; text: string };
type CaseResult = {
  reason: "tempo" | "diagnostico";
  evaluation: "correct" | "partial" | "incorrect";
  correct: boolean;
  xpEarned: number;
  remainingSeconds: number;
  feedback: string;
};
type ClinicalCase = {
  id: string;
  specialtyLabel: string;
  difficulty: "facil" | "intermediario" | "dificil";
  title: string;
  setting: string;
  summary: string;
  patient: { name: string; age: number; avatar: string };
  initialMessages: Msg[];
  fallbackReply: string;
  exams: Array<{ name: string; result: string; highlighted?: boolean }>;
  durationSeconds: number;
  remainingSeconds: number;
  maxXp: number;
};

export default function CasePage() {
  const [clinicalCase, setClinicalCase] = useState<ClinicalCase>();
  const [loadError, setLoadError] = useState<string>();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [revealedExams, setRevealedExams] = useState<Set<string>>(() => new Set());
  const [input, setInput] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [finishedReason, setFinishedReason] = useState<"tempo" | "diagnostico" | null>(null);
  const [result, setResult] = useState<CaseResult>();
  const [savingResult, setSavingResult] = useState(false);
  const [resultError, setResultError] = useState<string>();
  const hypothesisRef = useRef(hypothesis);
  const finishRef = useRef<(reason: "tempo" | "diagnostico") => void>(() => undefined);
  const savingRef = useRef(false);
  const { playing, start, stop, toggle } = useEmergencyAmbience();

  useEffect(() => {
    const gameId = new URLSearchParams(window.location.search).get("partida");
    const controller = new AbortController();
    const load = async () => {
      try {
        if (!gameId) throw new Error("Esta partida não foi encontrada. Volte ao dashboard e inicie um novo plantão.");
        const response = await fetch(`/api/games/${encodeURIComponent(gameId)}`, { signal: controller.signal });
        const payload = (await response.json()) as ClinicalCase & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Não foi possível carregar o caso.");
        setClinicalCase(payload);
        setMsgs(payload.initialMessages);
        setSecondsRemaining(payload.remainingSeconds);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Não foi possível carregar o caso.");
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    hypothesisRef.current = hypothesis;
  });

  const persistResult = async (reason: "tempo" | "diagnostico") => {
    if (savingRef.current || result) return;
    const gameId = new URLSearchParams(window.location.search).get("partida");
    savingRef.current = true;
    setFinishedReason(reason);
    setSavingResult(true);
    setResultError(undefined);
    stop();

    if (!gameId) {
      setResultError("Esta partida não foi encontrada. Volte ao dashboard e inicie um novo plantão.");
      savingRef.current = false;
      setSavingResult(false);
      return;
    }

    try {
      const response = await fetch("/api/games/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, hypothesis: hypothesisRef.current, reason }),
      });
      const payload = (await response.json()) as CaseResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível salvar o resultado.");
      setResult(payload);
      setSecondsRemaining(payload.remainingSeconds);
      await refreshAuthSession();
    } catch (error) {
      setResultError(error instanceof Error ? error.message : "Não foi possível salvar o resultado.");
    } finally {
      savingRef.current = false;
      setSavingResult(false);
    }
  };

  useEffect(() => {
    finishRef.current = (reason) => { void persistResult(reason); };
  });

  // Navegadores exigem um gesto do usuário para liberar áudio
  useEffect(() => {
    if (finishedReason || !clinicalCase) return;

    const kick = () => start();
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("keydown", kick, { once: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
  }, [clinicalCase, finishedReason, start]);

  useEffect(() => {
    if (finishedReason || !clinicalCase) return;

    if (clinicalCase.remainingSeconds === 0) {
      finishRef.current("tempo");
      return;
    }
    const deadline = Date.now() + clinicalCase.remainingSeconds * 1000;
    const timer = window.setInterval(() => {
      const nextValue = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsRemaining(nextValue);

      if (nextValue === 0) {
        window.clearInterval(timer);
        finishRef.current("tempo");
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [clinicalCase, finishedReason]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { who: "you", text: input }, { who: "patient", text: clinicalCase?.fallbackReply ?? "Não sei informar." }]);
    setInput("");
  };

  const finishCase = () => {
    void persistResult("diagnostico");
  };

  const formattedTime = `${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}`;
  const resultTime = result
    ? `${String(Math.floor(result.remainingSeconds / 60)).padStart(2, "0")}:${String(result.remainingSeconds % 60).padStart(2, "0")}`
    : formattedTime;

  if (!clinicalCase) return <div className="min-h-screen bg-background">
    <Navbar />
    <main className="grid min-h-[calc(100svh-4rem)] place-items-center px-4">
      <div className="card-pop max-w-md p-8 text-center">
        <div className="text-5xl">{loadError ? "🩺" : "⏳"}</div>
        <h1 className="mt-4 text-2xl font-extrabold">{loadError ? "Não foi possível abrir o caso" : "Preparando o caso clínico"}</h1>
        <p className="mt-2 font-bold text-muted-foreground">{loadError ?? "Carregando os dados do paciente com segurança…"}</p>
        {loadError && <Link href="/dashboard" className="btn-pop mt-6 bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">Voltar ao dashboard</Link>}
      </div>
    </main>
  </div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Case header */}
        <div className="card-pop p-5 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-info/15 grid place-items-center text-4xl">{clinicalCase.patient.avatar}</div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{clinicalCase.specialtyLabel} · {clinicalCase.setting} · {clinicalCase.difficulty}</div>
                <h1 className="text-2xl font-extrabold tracking-tight">{clinicalCase.title}</h1>
                <p className="text-sm text-muted-foreground font-bold">{clinicalCase.summary}</p>
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
              <div className="rounded-full bg-xp/20 text-xp-foreground px-3 py-1.5 text-xs font-extrabold">★ +{clinicalCase.maxXp} XP</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Chat */}
          <div className="lg:col-span-2 card-pop p-0 overflow-hidden flex flex-col h-[640px]">
            <div className="px-5 py-3 border-b-2 border-border flex items-center gap-3 bg-muted/40">
              <div className="h-9 w-9 rounded-full bg-info grid place-items-center text-info-foreground font-extrabold">P</div>
              <div>
                <div className="font-extrabold text-sm">Paciente · {clinicalCase.patient.name}, {clinicalCase.patient.age}</div>
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
                {clinicalCase.exams.map((exam) => (
                  <button key={exam.name} type="button" onClick={() => setRevealedExams((current) => new Set(current).add(exam.name))} className="relative rounded-xl border-2 border-border bg-card px-3 py-2.5 text-xs font-extrabold transition-colors hover:border-primary hover:bg-accent">
                    {exam.highlighted && !revealedExams.has(exam.name) && <span className="absolute -right-1.5 -top-1.5 h-3 w-3 animate-pulse rounded-full bg-streak" />}
                    {exam.name}
                  </button>
                ))}
              </div>
              {revealedExams.size > 0 && <div className="mt-3 space-y-2 border-t border-border pt-3">
                {clinicalCase.exams.filter((exam) => revealedExams.has(exam.name)).map((exam) => <p key={exam.name} className="rounded-xl bg-muted p-3 text-xs font-bold"><span className="text-info">{exam.name}:</span> {exam.result}</p>)}
              </div>}
            </div>

            {/* Hypothesis */}
            <div className="card-pop p-5">
              <h3 className="font-extrabold mb-3 flex items-center gap-2">🎯 Hipótese diagnóstica</h3>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                rows={4}
                placeholder="Digite sua principal hipótese diagnóstica…"
                className="w-full rounded-xl border-2 border-border bg-muted/30 p-3 text-sm font-medium focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={finishCase}
                disabled={savingResult || Boolean(result)}
                className="mt-3 btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] text-sm"
              >
                {savingResult ? "Salvando resultado..." : resultError ? "Tentar salvar novamente" : "Enviar diagnóstico"}
              </button>
              {resultError && <p role="alert" className="mt-3 text-sm font-bold text-destructive">{resultError}</p>}
            </div>

            <Link href="/dashboard" className="block text-center text-sm font-extrabold text-muted-foreground hover:text-foreground">
              ← Sair do caso
            </Link>
          </div>
        </div>
      </main>

      {result && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-foreground/70 p-4 backdrop-blur-md">
          <section
            className="card-pop animate-bounce-in w-full max-w-2xl overflow-hidden border-0 bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            <div className={`p-7 text-center text-white sm:p-9 ${result.evaluation === "correct" ? "bg-primary" : result.evaluation === "partial" ? "bg-info" : "bg-streak"}`}>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 text-4xl">
                {result.evaluation === "correct" ? "✓" : result.evaluation === "partial" ? "🎯" : result.reason === "tempo" ? "⏱" : "🧠"}
              </div>
              <div className="mt-5 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-white/35 bg-white/20 px-5 py-2 text-sm font-extrabold uppercase tracking-[0.16em] shadow-lg backdrop-blur-sm">
                  <span aria-hidden="true">{result.evaluation === "correct" ? "✓" : result.evaluation === "partial" ? "◐" : "✕"}</span>
                  {result.evaluation === "correct" ? "Resposta correta" : result.evaluation === "partial" ? "Chegou perto" : "Resposta incorreta"}
                </span>
              </div>
              <h2 id="result-title" className="mt-2 text-3xl font-extrabold sm:text-4xl">
                {result.evaluation === "correct"
                  ? "Diagnóstico correto!"
                  : result.evaluation === "partial"
                    ? "Você chegou perto!"
                  : result.reason === "tempo"
                    ? "O tempo acabou"
                    : "Vamos revisar o caso"}
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-xp/15 p-4 text-center">
                  <div className="text-2xl font-extrabold text-xp-foreground">★ +{result.xpEarned}</div>
                  <div className="mt-1 text-xs font-bold uppercase text-muted-foreground">XP ganho</div>
                </div>
                <div className="rounded-2xl bg-info/10 p-4 text-center">
                  <div className="text-2xl font-extrabold text-info">{resultTime}</div>
                  <div className="mt-1 text-xs font-bold uppercase text-muted-foreground">Tempo restante</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border-2 border-primary/25 bg-primary/5 p-5">
                <h3 className="flex items-center gap-2 font-extrabold">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">🧠</span>
                  Feedback do caso
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                  {result.feedback}
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
