import { useCallback, useEffect, useRef } from "react";

function getAudioContextClass() {
  return window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

export function useChatBubbleSound() {
  const contextRef = useRef<AudioContext | null>(null);

  const unlock = useCallback(() => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    if (context.state === "suspended") void context.resume();
  }, []);

  const play = useCallback(() => {
    unlock();
    const context = contextRef.current;
    if (!context || context.state !== "running") return;

    const startAt = context.currentTime + 0.015;
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const overtoneGain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(360, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(740, startAt + 0.11);
    oscillator.frequency.exponentialRampToValueAtTime(520, startAt + 0.24);

    overtone.type = "sine";
    overtone.frequency.setValueAtTime(720, startAt);
    overtone.frequency.exponentialRampToValueAtTime(1080, startAt + 0.1);
    overtoneGain.gain.value = 0.018;

    filter.type = "lowpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.7;

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.09, startAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.045, startAt + 0.11);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.28);

    oscillator.connect(filter);
    overtone.connect(overtoneGain).connect(filter);
    filter.connect(gain).connect(context.destination);
    oscillator.start(startAt);
    overtone.start(startAt);
    oscillator.stop(startAt + 0.3);
    overtone.stop(startAt + 0.2);
  }, [unlock]);

  useEffect(() => {
    return () => {
      const context = contextRef.current;
      contextRef.current = null;
      if (context) void context.close().catch(() => undefined);
    };
  }, []);

  return { play, unlock };
}
