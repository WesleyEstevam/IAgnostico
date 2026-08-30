import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Trilha sonora de fundo gerada via Web Audio API:
 * - drone tenso (duas ondas levemente desafinadas)
 * - pulso de batimento cardíaco
 * - bip de monitor cardíaco
 * Sem arquivos de áudio, loop infinito e volume baixo.
 */
export function useEmergencyAmbience() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<Array<{ stop: (t?: number) => void }>>([]);
  const timersRef = useRef<number[]>([]);

  const teardown = useCallback(() => {
    timersRef.current.forEach((t) => clearInterval(t));
    timersRef.current = [];
    nodesRef.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* noop */
      }
    });
    nodesRef.current = [];
    const ctx = ctxRef.current;
    ctxRef.current = null;
    masterRef.current = null;
    if (ctx) void ctx.close().catch(() => undefined);
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(() => {
    if (ctxRef.current) return;
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);

    // --- Drone tenso ---
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.07;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 420;
    droneGain.connect(droneFilter).connect(master);

    [55, 55.6, 82.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 2 ? "triangle" : "sawtooth";
      osc.frequency.value = freq;
      osc.connect(droneGain);
      osc.start();
      nodesRef.current.push(osc);
    });

    // LFO abrindo/fechando o filtro (sensação de tensão respirando)
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 180;
    lfo.connect(lfoAmt).connect(droneFilter.frequency);
    lfo.start();
    nodesRef.current.push(lfo);

    // --- Batimento cardíaco ---
    const thump = (at: number, vol: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(78, at);
      osc.frequency.exponentialRampToValueAtTime(38, at + 0.18);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
      osc.connect(g).connect(master);
      osc.start(at);
      osc.stop(at + 0.35);
    };

    // --- Bip de monitor ---
    const beep = (at: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 1180;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.035, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
      osc.connect(g).connect(master);
      osc.start(at);
      osc.stop(at + 0.15);
    };

    const beat = () => {
      const c = ctxRef.current;
      if (!c) return;
      const t = c.currentTime + 0.05;
      thump(t, 0.28);
      thump(t + 0.28, 0.16);
      beep(t);
    };

    beat();
    const id = window.setInterval(beat, 1150);
    timersRef.current.push(id);

    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    }
    window.setTimeout(teardown, 450);
    setPlaying(false);
  }, [teardown]);

  const toggle = useCallback(() => {
    if (ctxRef.current) stop();
    else start();
  }, [start, stop]);

  return { playing, start, stop, toggle };
}
