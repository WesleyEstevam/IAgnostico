"use client";

import { useEffect } from "react";

export function CardDealSound() {
  useEffect(() => {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    let hasPlayed = false;

    const createPaperNoise = (startAt: number, pitch: number) => {
      const duration = 0.075;
      const buffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * duration),
        context.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      let seed = Math.floor(pitch * 97);

      for (let index = 0; index < samples.length; index += 1) {
        seed = (seed * 16807) % 2147483647;
        const noise = (seed / 2147483647) * 2 - 1;
        const envelope = Math.sin((Math.PI * index) / samples.length);
        samples[index] = noise * envelope;
      }

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      source.buffer = buffer;
      source.playbackRate.value = pitch;
      filter.type = "bandpass";
      filter.frequency.value = 1850;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.13, startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      source.connect(filter).connect(gain).connect(context.destination);
      source.start(startAt);
      source.stop(startAt + duration + 0.02);
    };

    const play = async () => {
      if (hasPlayed) return;

      await context.resume();
      if (context.state !== "running") return;

      hasPlayed = true;
      const startAt = context.currentTime + 0.04;
      [0.05, 0.12, 0.19, 0.26].forEach((delay, index) => {
        createPaperNoise(startAt + delay, 0.92 + index * 0.045);
      });
    };

    const delayedStart = window.setTimeout(() => void play(), 80);
    const unlockAudio = () => void play();

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.clearTimeout(delayedStart);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      void context.close();
    };
  }, []);

  return null;
}
