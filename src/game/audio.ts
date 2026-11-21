/**
 * Procedural Zen Web Audio synthesizer for Pocket Orbit.
 * Lightweight, zero external assets, graceful fallback for older mobile browsers.
 */
export class SpaceAudio {
  private ctx: AudioContext | null = null;
  private muted = false;
  private lastGravityHum = 0;

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  unlock(): void {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Gracefully ignore audio initialization failures on restricted WebViews
    }
  }

  /** Soft filtered tone when shifting between inner (higher, brisk) and outer (lower, calm) orbits */
  playShift(toInner: boolean): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (toInner) {
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.14);
    } else {
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(215, now + 0.16);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  /** Pentatonic celesta chime on collecting a star */
  playStar(starIndex: number): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    // D major pentatonic ascent: D5, E5, F#5, A5, D6
    const scale = [587.33, 659.25, 739.99, 880.0, 1174.66];
    const freq = scale[Math.min(starIndex, scale.length - 1)];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const overGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.13, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

    overGain.gain.setValueAtTime(0.0001, now);
    overGain.gain.linearRampToValueAtTime(0.035, now + 0.012);
    overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    overtone.connect(overGain);
    overGain.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.54);
    overtone.stop(now + 0.34);
  }

  /** Ethereal harmonic bloom when wormhole opens */
  playPortalOpen(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const start = this.ctx.currentTime + i * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.085, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.48);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  }

  /** Subtle resonant hum while passing through a moon's gravity well */
  playGravityHum(isBoost: boolean): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastGravityHum < 0.36) return;
    this.lastGravityHum = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const base = isBoost ? 142 : 96;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.linearRampToValueAtTime(isBoost ? 168 : 84, now + 0.16);
    osc.frequency.linearRampToValueAtTime(base, now + 0.32);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /** Muted tactile thud on orbital debris impact */
  playCrash(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.32);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(78, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.34);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

    osc.connect(gain);
    sub.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 0.38);
    sub.stop(now + 0.38);
  }

  /** Warm ascending chord on wormhole traversal */
  playVictory(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((f, idx) => {
      if (!this.ctx) return;
      const start = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.11, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.62);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.64);
    });
  }
}

export const spaceAudio = new SpaceAudio();
