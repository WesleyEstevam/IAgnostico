"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { refreshAuthSession } from "@/presentation/auth/auth-store";
import { PRO_PLAN_CTA_HREF } from "@/shared/constants/plans";

type CountdownProps = {
  especialidade: string;
};

export function Countdown({ especialidade }: CountdownProps) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"3" | "2" | "1" | "começou">("3");
  const [errorMessage, setErrorMessage] = useState<string>();
  const audioContextRef = useRef<AudioContext | null>(null);

  const tocarBipe = useCallback((frequencia: number, duracao = 0.13, atraso = 0) => {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    void context.resume();

    const inicio = context.currentTime + atraso;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequencia, inicio);
    gain.gain.setValueAtTime(0.0001, inicio);
    gain.gain.exponentialRampToValueAtTime(0.22, inicio + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(inicio);
    oscillator.stop(inicio + duracao + 0.02);
  }, []);

  useEffect(() => {
    let cancelled = false;
    tocarBipe(520);

    const timers: number[] = [
      window.setTimeout(() => {
        setEtapa("2");
        tocarBipe(620);
      }, 1000),
      window.setTimeout(() => {
        setEtapa("1");
        tocarBipe(720);
      }, 2000),
      window.setTimeout(() => {
        const start = async () => {
          const storageKey = `iagnostico:shift-request:${especialidade}`;
          const requestId = window.sessionStorage.getItem(storageKey) ?? crypto.randomUUID();
          window.sessionStorage.setItem(storageKey, requestId);

          try {
            const response = await fetch("/api/shifts/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ specialty: especialidade, requestId }),
            });
            const payload = (await response.json()) as { error?: string; gameId?: string };
            if (!response.ok || !payload.gameId)
              throw new Error(payload.error ?? "Não foi possível iniciar o plantão.");
            if (cancelled) return;

            window.sessionStorage.removeItem(storageKey);
            setEtapa("começou");
            tocarBipe(900, 0.18);
            tocarBipe(1120, 0.22, 0.2);
            await refreshAuthSession();
            timers.push(
              window.setTimeout(() => {
                router.replace(
                  `/caso?especialidade=${encodeURIComponent(especialidade)}&partida=${encodeURIComponent(payload.gameId!)}`,
                );
              }, 1300),
            );
          } catch (error) {
            if (!cancelled)
              setErrorMessage(
                error instanceof Error ? error.message : "Não foi possível iniciar o plantão.",
              );
          }
        };
        void start();
      }, 3000),
    ];

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context) void context.close();
    };
  }, [especialidade, router, tocarBipe]);

  const comecou = etapa === "começou";

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-gradient-to-br from-primary via-[#52bd03] to-[#347c00] px-6 text-center text-primary-foreground">
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />

      <div className="relative z-10">
        {errorMessage ? (
          <div className="animate-bounce-in mx-auto max-w-md rounded-3xl bg-white p-7 text-foreground shadow-2xl">
            <div className="relative mx-auto -mb-2 -mt-5 h-52 w-64 sm:h-60 sm:w-72">
              <Image
                src="/plantao-amimir-personagem.png"
                width={1402}
                height={1122}
                alt="Personagem médico dormindo no chão após um plantão cansativo"
                className="absolute inset-0 h-full w-full object-contain object-bottom"
                priority
              />
              <Image src="/plantao-tres-z.png" width={1536} height={1024} alt="" aria-hidden="true" className="amimir-z-layer absolute left-1 top-7 h-16 w-24 object-contain sm:left-2 sm:top-8 sm:h-20 sm:w-28" />
              <Image src="/plantao-amimir-balao.png" width={1635} height={962} alt="" aria-hidden="true" className="amimir-bubble-layer absolute right-0 top-0 h-20 w-44 object-contain sm:h-24 sm:w-52" />
            </div>
            <h1 className="mt-3 text-2xl font-extrabold">Seu plantão acabou</h1>
            <p className="mt-2 font-bold text-muted-foreground">{errorMessage}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href={PRO_PLAN_CTA_HREF} className="btn-pop w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
                Continuar com o plano Pro
              </Link>
              <button
                type="button"
                onClick={() => router.replace("/dashboard")}
                className="btn-pop w-full bg-muted text-foreground shadow-[var(--shadow-pop-muted)]"
              >
                Voltar ao dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-8 text-xs font-extrabold uppercase tracking-[0.28em] text-white/75">
              Prepare-se para o plantão
            </p>

            <div
              key={etapa}
              className={
                comecou
                  ? "animate-bounce-in text-4xl font-extrabold tracking-tight sm:text-6xl"
                  : "animate-bounce-in text-[10rem] font-extrabold leading-none drop-shadow-[0_10px_0_rgba(0,0,0,0.15)] sm:text-[13rem]"
              }
              role="status"
              aria-live="assertive"
            >
              {comecou ? "O plantão começou!" : etapa}
            </div>

            <div className="mx-auto mt-10 h-2 w-40 overflow-hidden rounded-full bg-black/15">
              <div
                className={`h-full rounded-full bg-white transition-all duration-700 ${
                  etapa === "3"
                    ? "w-1/4"
                    : etapa === "2"
                      ? "w-2/4"
                      : etapa === "1"
                        ? "w-3/4"
                        : "w-full"
                }`}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
