"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CountdownProps = {
  especialidade: string;
};

export function Countdown({ especialidade }: CountdownProps) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"3" | "2" | "1" | "começou">("3");
  const audioContextRef = useRef<AudioContext | null>(null);

  const tocarBipe = useCallback(
    (frequencia: number, duracao = 0.13, atraso = 0) => {
      const AudioContextClass =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

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
    },
    [],
  );

  useEffect(() => {
    tocarBipe(520);

    const timers = [
      window.setTimeout(() => {
        setEtapa("2");
        tocarBipe(620);
      }, 1000),
      window.setTimeout(() => {
        setEtapa("1");
        tocarBipe(720);
      }, 2000),
      window.setTimeout(() => {
        setEtapa("começou");
        tocarBipe(900, 0.18);
        tocarBipe(1120, 0.22, 0.2);
      }, 3000),
      window.setTimeout(() => {
        router.replace(
          `/caso?especialidade=${encodeURIComponent(especialidade)}`,
        );
      }, 4300),
    ];

    return () => {
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
      </div>
    </main>
  );
}
