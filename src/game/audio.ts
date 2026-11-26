/**
 * Procedural Zen Web Audio synthesizer + Calm Ambient Music engine for Pocket Orbit.
 * Lightweight, zero external audio files, works offline across Android WebViews & browsers.
 */
export class SpaceAudio {
  private ctx: AudioContext | null = null;
  private sfxMuted = false;
  private musicMuted = false;
  private lastGravityHum = 0;

  // Ambient music scheduler state
  private musicMasterGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicPlaying = false;
  private musicStep = 0;
  private backgroundSuspended = false;

  setMuted(muted: boolean): void {
    this.sfxMuted = muted;
  }

  isMuted(): boolean {
    return this.sfxMuted;
  }

  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    if (muted) {
      this.stopMusic();
    } else if (this.ctx && !this.backgroundSuspended) {
      this.startMusic();
    }
  }

  isMusicMuted(): boolean {
    return this.musicMuted;
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
      if (this.ctx && !this.musicMuted && !this.musicPlaying && !this.backgroundSuspended) {
        this.startMusic();
      }
    } catch {
      // Gracefully ignore audio initialization failures on restricted WebViews
    }
  }

  /** Pause ambient music when app/tab goes to background to conserve battery */
  suspendForBackground(): void {
    this.backgroundSuspended = true;
    this.stopMusic();
  }

  /** Resume ambient music when returning to foreground if enabled */
  resumeFromBackground(): void {
    this.backgroundSuspended = false;
    if (this.ctx && !this.musicMuted) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.startMusic();
    }
  }

  /** Gentle generative pentatonic ambient space-zen music loop */
  startMusic(): void {
    if (this.musicMuted || this.musicPlaying || this.backgroundSuspended) return;
    if (!this.ctx) return;

    this.musicPlaying = true;

    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.055, now + 1.4);
    master.connect(this.ctx.destination);
    this.musicMasterGain = master;

    const scheduleStep = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicMasterGain || this.musicMuted) return;

      const t = this.ctx.currentTime;
      const step = this.musicStep++;

      // Warm celestial progression (Dmaj9 -> Bm7 -> Gmaj7 -> A6sus4)
      const bassNotes = [146.83, 123.47, 98.0, 110.0]; // D3, B2, G2, A2
      const padChords: number[][] = [
        [293.66, 369.99, 440.0], // D4, F#4, A4
        [246.94, 293.66, 369.99], // B3, D4, F#4
        [196.0, 293.66, 369.99], // G3, D4, F#4
        [220.0, 293.66, 329.63], // A3, D4, E4
      ];
      const chimeNotes = [587.33, 659.25, 739.99, 880.0, 587.33, 493.88, 659.25, 440.0];

      // Trigger a soft warm harmonic pad every 2 steps (~4.8s)
      if (step % 2 === 0) {
        const chordIdx = Math.floor(step / 2) % padChords.length;
        const bass = bassNotes[chordIdx];
        const chord = padChords[chordIdx];

        this.playAmbientVoice(bass, t, 5.2, 0.34, 'sine');
        chord.forEach((freq, idx) => {
          this.playAmbientVoice(freq, t + idx * 0.14, 4.9, 0.16, 'sine');
        });
      }

      // Trigger a quiet floating bell note every step (~2.4s)
      const melodyFreq = chimeNotes[step % chimeNotes.length];
      this.playAmbientVoice(melodyFreq, t + 0.35, 2.8, 0.11, 'triangle');
    };

    scheduleStep();
    this.musicTimer = window.setInterval(scheduleStep, 2400);
  }

  private playAmbientVoice(
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number,
    type: OscillatorType
  ): void {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(920, startTime);

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.32);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.musicMasterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicMasterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        const g = this.musicMasterGain;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        window.setTimeout(() => {
          try {
            g.disconnect();
          } catch {
            // ignore
          }
        }, 300);
      } catch {
        // ignore
      }
      this.musicMasterGain = null;
    }
  }

  /** Soft filtered tone when shifting between inner (higher, brisk) and outer (lower, calm) orbits */
  playShift(toInner: boolean): void {
    if (this.sfxMuted) return;
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
    if (this.sfxMuted) return;
    this.unlock();
    if (!this.ctx) return;

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
    if (this.sfxMuted) return;
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
    if (this.sfxMuted) return;
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
    if (this.sfxMuted) return;
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
    if (this.sfxMuted) return;
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

  /** Shimmering sci-fi warp whoosh when teleporting through a Wormhole Gate */
  playWarpGate(): void {
    if (this.sfxMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.28);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(640, now);
    osc2.frequency.exponentialRampToValueAtTime(1480, now + 0.16);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.32);
    osc2.stop(now + 0.32);
  }

  /** Crisp solar flare telegraph chirp */
  playSolarFlareWarn(): void {
    if (this.sfxMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.linearRampToValueAtTime(760, now + 0.14);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  /** Scorching plasma eruption sweep when solar flare goes active */
  playSolarFlareBlast(): void {
    if (this.sfxMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(92, now + 0.38);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(55, now + 0.38);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(780, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 0.44);
    sub.stop(now + 0.44);
  }

  /** Resonant boss polarity-flip / phase transition chord */
  playBossPhase(): void {
    if (this.sfxMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const freqs = [293.66, 220.0, 440.0, 587.33];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const start = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.095, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.44);
    });
  }

  /** Time-dilation pitch drop for Slow-Mo Chrono Pulse booster */
  playChronoSlow(): void {
    if (this.sfxMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(165, now + 0.36);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.13, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  /** Magnetic shimmer pulse for Star Magnet booster */
  playMagnetPulse(): void {
    if (this.sfxMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const freqs = [392.0, 523.25, 783.99];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const start = this.ctx.currentTime + idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);
      osc.frequency.exponentialRampToValueAtTime(f * 1.12, start + 0.22);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.28);
    });
  }
}

export const spaceAudio = new SpaceAudio();
