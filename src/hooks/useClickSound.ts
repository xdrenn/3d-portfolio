import { useCallback, useRef } from "react";

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

const DEFAULT_FREQUENCY = 1800;
const START_GAIN = 0.04;
const END_GAIN = 0.0001;
const FADE_SECONDS = 0.04;
const DURATION_SECONDS = 0.05;

export function useClickSound() {
  const audioContext = useRef<AudioContext | null>(null);

  return useCallback((frequency = DEFAULT_FREQUENCY) => {
    try {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!AudioContextClass) return;

      audioContext.current ??= new AudioContextClass();
      const context = audioContext.current;
      const now = context.currentTime;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(START_GAIN, now);
      gain.gain.exponentialRampToValueAtTime(END_GAIN, now + FADE_SECONDS);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(now + DURATION_SECONDS);
    } catch {
      return;
    }
  }, []);
}
