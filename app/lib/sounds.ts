let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playTaskCompleteSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two-tone ascending chime
    const frequencies = [523.25, 659.25]; // C5, E5
    const duration = 0.12;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + i * duration);
      gain.gain.linearRampToValueAtTime(0.15, now + i * duration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * duration + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * duration);
      osc.stop(now + i * duration + duration);
    });
  } catch {
    // Silently fail if Web Audio API is unavailable
  }
}
