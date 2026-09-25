type AudioContextConstructor = typeof AudioContext;

/** Race-only effects synthesized in Web Audio so no extra media assets are needed. */
class RaceAudio {
  private context: AudioContext | null = null;

  private getContext() {
    if (typeof window === 'undefined') return null;
    const Context = (window.AudioContext ||
      (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext) as
      | AudioContextConstructor
      | undefined;
    if (!Context) return null;
    if (!this.context) this.context = new Context();
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  private tone(frequency: number, duration: number, volume: number, delay = 0) {
    const context = this.getContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  playOvertake() {
    this.tone(780, 0.09, 0.1);
    this.tone(1120, 0.18, 0.12, 0.07);
  }

  playFinish() {
    this.tone(523.25, 0.22, 0.08);
    this.tone(659.25, 0.22, 0.08, 0.13);
    this.tone(783.99, 0.42, 0.1, 0.26);
  }

  stopAll() {
    // All effects are short-lived oscillators and stop by themselves.
  }
}

export const raceAudio = new RaceAudio();
