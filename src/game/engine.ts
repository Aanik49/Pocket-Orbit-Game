import {
  GameScreen,
  HazardKind,
  HudSnapshot,
  LevelConfig,
  OrbitLane,
  PlanetPalette,
} from '../types';
import { spaceAudio } from './audio';
import { getLevelById } from './levels';

interface ActiveStar {
  orbit: OrbitLane;
  angle: number;
  speed: number;
  collected: boolean;
  bobPhase: number;
}

interface ActiveHazard {
  orbit: OrbitLane;
  angle: number;
  speed: number;
  type: HazardKind;
  size: number;
  spin: number;
}

interface ActiveMoon {
  orbitRadiusMult: number;
  angle: number;
  speed: number;
  wellRadiusMult: number;
  speedBoost: number;
  radialTug: number;
  color: string;
}

interface ActivePortal {
  orbit: OrbitLane;
  angle: number;
  speed: number;
  active: boolean;
  pulse: number;
  openAnim: number;
}

interface BgStar {
  nx: number; // normalized 0..1
  ny: number;
  r: number;
  alpha: number;
  phase: number;
}

interface TrailPoint {
  x: number;
  y: number;
  orbit: OrbitLane;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
}

interface Shockwave {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface EngineCallbacks {
  onHudChange: (snapshot: HudSnapshot) => void;
  onGameOver: () => void;
  onVictory: (result: {
    levelId: number;
    flightTime: number;
    shiftCount: number;
    starsEarned: number;
  }) => void;
}

const MAX_PARTICLES = 72;
const MAX_SHOCKWAVES = 10;
const TAU = Math.PI * 2;

/**
 * Isolated 60fps Canvas2D Orbital Engine for Pocket Orbit.
 * Designed for low battery drain & smooth performance from older Android WebViews (KitKat+) to modern displays:
 * - Zero ctx.shadowBlur calls (uses crisp concentric alpha rings instead)
 * - Object-pooled particles and shockwaves (no GC churn during flight)
 * - Subtle, low-distraction background starfield so gravity mechanics stay center stage
 * - Clamped delta time, hitstop, and visibility-change pause protection
 */
export class OrbitEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;

  private width = 390;
  private height = 844;
  private dpr = 1;
  private lowPower = false;
  private reducedMotion = false;

  // Dynamic orbital geometry
  private centerX = 195;
  private centerY = 422;
  private planetRadius = 40;
  private innerRadius = 86;
  private outerRadius = 148;

  private screen: GameScreen = 'TITLE';
  private level: LevelConfig = getLevelById(1);

  // Satellite state
  private satTargetOrbit: OrbitLane = 1;
  private satCurrentRadius = 148;
  private satAngle = -Math.PI / 2;
  private satSquash = 0;
  private satTrail: TrailPoint[] = [];
  private satInGravityWell = false;
  private satGravityMode: 'none' | 'boost' | 'drag' = 'none';
  private satWarpProgress = 0; // > 0 when spiraling cleanly into wormhole
  private satWarpStartX = 0;
  private satWarpStartY = 0;

  // Level entities
  private stars: ActiveStar[] = [];
  private hazards: ActiveHazard[] = [];
  private moons: ActiveMoon[] = [];
  private portal: ActivePortal = {
    orbit: 0,
    angle: 0,
    speed: 0,
    active: false,
    pulse: 0,
    openAnim: 0,
  };

  // Run telemetry
  private starsCollected = 0;
  private flightTime = 0;
  private shiftCount = 0;
  private hitstopTimer = 0;
  private impactFlash = 0;
  private cameraShake = 0;
  private planetRotation = 0;
  private elapsedClock = 0;
  private pendingModalTimer: number | null = null;

  // Pre-allocated pools & calm starfield
  private bgStars: BgStar[] = [];
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];

  // RAF lifecycle
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private destroyed = false;
  private lastHudKey = '';

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Could not initialize 2D canvas context');
    }
    this.ctx = context;
    this.callbacks = callbacks;

    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.initPools();
    this.initStarfield();
    this.resize();
    this.loadLevel(1, 'TITLE');
  }

  private initPools(): void {
    this.particles = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      decay: 2,
      size: 2,
      color: '#FFFFFF',
    }));

    this.shockwaves = Array.from({ length: MAX_SHOCKWAVES }, () => ({
      active: false,
      x: 0,
      y: 0,
      radius: 0,
      maxRadius: 32,
      alpha: 0,
      color: '#38BDF8',
    }));
  }

  private initStarfield(): void {
    // Whisper-quiet minimalist starfield: 42 delicate dust points, almost still
    this.bgStars = [];
    for (let i = 0; i < 42; i++) {
      const s1 = Math.sin(i * 91.7 + 13.3) * 43758.5453;
      const s2 = Math.sin(i * 47.3 + 71.1) * 43758.5453;
      const s3 = Math.sin(i * 23.9 + 5.7) * 43758.5453;
      const nx = s1 - Math.floor(s1);
      const ny = s2 - Math.floor(s2);
      const sz = s3 - Math.floor(s3);
      this.bgStars.push({
        nx,
        ny,
        r: 0.55 + sz * 1.05,
        alpha: 0.14 + sz * 0.28,
        phase: sz * TAU,
      });
    }
  }

  setLowPower(enabled: boolean): void {
    if (this.lowPower === enabled) return;
    this.lowPower = enabled;
    this.resize();
  }

  resize(): void {
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    this.width = Math.max(280, rect.width);
    this.height = Math.max(400, rect.height);

    // Cap DPR at 1 in battery-saver mode, max 2 otherwise
    const maxDpr = this.lowPower ? 1 : 2;
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Center the orbital system cleanly with generous breathing room for HUD
    this.centerX = this.width / 2;
    this.centerY = this.height * 0.5;

    // Fit outer orbit + outer moon comfortably inside the smallest viewport dimension
    const safeMin = Math.min(this.width * 0.92, this.height * 0.72);
    const prevOuter = this.outerRadius || 148;
    this.outerRadius = Math.max(108, Math.min(215, safeMin * 0.36));
    this.innerRadius = this.outerRadius * 0.6;
    this.planetRadius = this.outerRadius * 0.285;

    // Rescale current satellite radius proportionally so resize never snaps awkwardly
    if (prevOuter > 0) {
      const ratio = this.satCurrentRadius / prevOuter;
      this.satCurrentRadius = Math.max(this.innerRadius * 0.85, Math.min(this.outerRadius * 1.15, ratio * this.outerRadius));
    }
  }

  start(): void {
    if (this.rafId !== null || this.destroyed) return;
    this.lastTimestamp = performance.now();
    const tick = (now: number) => {
      if (this.destroyed) return;
      const rawDt = (now - this.lastTimestamp) / 1000;
      this.lastTimestamp = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      this.update(dt);
      this.render();
      this.rafId = window.requestAnimationFrame(tick);
    };
    this.rafId = window.requestAnimationFrame(tick);
  }

  pauseLoop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resumeLoop(): void {
    if (this.destroyed || this.rafId !== null) return;
    this.resize();
    this.start();
  }

  destroy(): void {
    this.destroyed = true;
    this.pauseLoop();
    this.clearPendingModal();
  }

  private clearPendingModal(): void {
    if (this.pendingModalTimer !== null) {
      window.clearTimeout(this.pendingModalTimer);
      this.pendingModalTimer = null;
    }
  }

  setScreen(screen: GameScreen): void {
    this.screen = screen;
    if (screen === 'PLAYING') {
      this.lastTimestamp = performance.now();
    }
  }

  loadLevel(levelId: number, targetScreen: GameScreen): void {
    this.clearPendingModal();
    this.level = getLevelById(levelId);
    this.screen = targetScreen;

    this.satTargetOrbit = this.level.startOrbit;
    this.satCurrentRadius = this.level.startOrbit === 0 ? this.innerRadius : this.outerRadius;
    this.satAngle = this.level.startAngle;
    this.satSquash = 0;
    this.satTrail = [];
    this.satInGravityWell = false;
    this.satGravityMode = 'none';
    this.satWarpProgress = 0;

    this.stars = this.level.stars.map((s, idx) => ({
      orbit: s.orbit,
      angle: s.angle,
      speed: s.speed ?? 0,
      collected: false,
      bobPhase: idx * 1.7,
    }));

    this.hazards = this.level.hazards.map((h, idx) => ({
      orbit: h.orbit,
      angle: h.angle,
      speed: h.speed,
      type: h.type,
      size: h.size,
      spin: idx * 1.1,
    }));

    this.moons = this.level.moons.map((m) => ({
      orbitRadiusMult: m.orbitRadiusMult,
      angle: m.angle,
      speed: m.speed,
      wellRadiusMult: m.wellRadiusMult,
      speedBoost: m.speedBoost,
      radialTug: m.radialTug,
      color: m.color,
    }));

    this.portal = {
      orbit: this.level.portal.orbit,
      angle: this.level.portal.angle,
      speed: this.level.portal.speed ?? 0,
      active: false,
      pulse: 0,
      openAnim: 0,
    };

    this.starsCollected = 0;
    this.flightTime = 0;
    this.shiftCount = 0;
    this.hitstopTimer = 0;
    this.impactFlash = 0;
    this.cameraShake = 0;

    for (let i = 0; i < this.particles.length; i++) this.particles[i].active = false;
    for (let i = 0; i < this.shockwaves.length; i++) this.shockwaves[i].active = false;

    this.lastHudKey = '';
    this.emitHudIfNeeded();
  }

  /** Primary gameplay input: shift between inner (fast) and outer (slow) orbit */
  shiftOrbit(): void {
    if (this.screen !== 'PLAYING' || this.satWarpProgress > 0 || this.hitstopTimer > 0) return;

    this.satTargetOrbit = this.satTargetOrbit === 0 ? 1 : 0;
    this.satSquash = 1.0;
    this.shiftCount++;

    const toInner = this.satTargetOrbit === 0;
    spaceAudio.playShift(toInner);

    const sx = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    const sy = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
    const accent = toInner ? '#FBBF24' : '#38BDF8';

    this.spawnShockwave(sx, sy, 32, accent);

    const particleCount = this.lowPower ? 5 : 9;
    const thrustDir = toInner ? this.satAngle : this.satAngle + Math.PI;
    for (let i = 0; i < particleCount; i++) {
      const spread = (Math.random() - 0.5) * 1.25;
      const spd = 42 + Math.random() * 58;
      this.spawnParticle(
        sx,
        sy,
        Math.cos(thrustDir + spread) * spd,
        Math.sin(thrustDir + spread) * spd,
        2.5 + Math.random() * 1.1,
        1.8 + Math.random() * 1.4,
        toInner ? '#FDE68A' : '#BAE6FD'
      );
    }

    this.emitHudIfNeeded();
  }

  private emitHudIfNeeded(): void {
    const key = `${this.level.id}|${this.starsCollected}|${this.stars.length}|${this.portal.active ? 1 : 0}|${this.satTargetOrbit}|${this.satInGravityWell ? 1 : 0}|${this.satGravityMode}|${this.shiftCount}`;
    if (key === this.lastHudKey) return;
    this.lastHudKey = key;

    this.callbacks.onHudChange({
      levelId: this.level.id,
      starsCollected: this.starsCollected,
      totalStars: this.stars.length,
      portalActive: this.portal.active,
      portalOrbit: this.portal.orbit,
      targetOrbit: this.satTargetOrbit,
      inGravityWell: this.satInGravityWell,
      gravityMode: this.satGravityMode,
      shiftCount: this.shiftCount,
    });
  }

  private spawnParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    decay: number,
    size: number,
    color: string
  ): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.life = 1;
        p.decay = decay;
        p.size = size;
        p.color = color;
        return;
      }
    }
  }

  private spawnBurst(x: number, y: number, color: string, count: number): void {
    const n = this.lowPower ? Math.ceil(count * 0.55) : count;
    for (let i = 0; i < n; i++) {
      const ang = (TAU * i) / n + (Math.random() - 0.5) * 0.35;
      const spd = 38 + Math.random() * 88;
      this.spawnParticle(
        x,
        y,
        Math.cos(ang) * spd,
        Math.sin(ang) * spd,
        1.7 + Math.random() * 0.9,
        1.9 + Math.random() * 1.9,
        color
      );
    }
  }

  private spawnShockwave(x: number, y: number, maxRadius: number, color: string): void {
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) {
        sw.active = true;
        sw.x = x;
        sw.y = y;
        sw.radius = 6;
        sw.maxRadius = maxRadius;
        sw.alpha = 0.72;
        sw.color = color;
        return;
      }
    }
  }

  private updateEffects(dt: number): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - Math.min(0.9, dt * 1.8);
      p.vy *= 1 - Math.min(0.9, dt * 1.8);
      p.life -= p.decay * dt;
      if (p.life <= 0) p.active = false;
    }

    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      sw.radius += (sw.maxRadius - sw.radius) * Math.min(1, dt * 10);
      sw.alpha -= dt * 2.0;
      if (sw.alpha <= 0) sw.active = false;
    }

    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 32);
    }
    if (this.impactFlash > 0) {
      this.impactFlash = Math.max(0, this.impactFlash - dt * 4.2);
    }
  }

  private recordTrail(x: number, y: number): void {
    const maxLen = this.lowPower ? 12 : 24;
    this.satTrail.push({ x, y, orbit: this.satTargetOrbit });
    if (this.satTrail.length > maxLen) {
      this.satTrail.shift();
    }
  }

  private update(dt: number): void {
    this.elapsedClock += dt;
    this.planetRotation += dt * 0.16;
    this.updateEffects(dt);

    // Calm live demo orbit on the Title Screen
    if (this.screen === 'TITLE') {
      const prevBucket = Math.floor(this.flightTime / 3.4);
      this.flightTime += dt;
      const nextBucket = Math.floor(this.flightTime / 3.4);
      if (nextBucket !== prevBucket) {
        this.satTargetOrbit = this.satTargetOrbit === 0 ? 1 : 0;
        this.satSquash = 0.65;
      }

      const targetR = this.satTargetOrbit === 0 ? this.innerRadius : this.outerRadius;
      this.satCurrentRadius += (targetR - this.satCurrentRadius) * Math.min(1, dt * 9);
      const speed = this.satTargetOrbit === 0 ? this.level.innerSpeed * 0.72 : this.level.outerSpeed * 0.78;
      this.satAngle += speed * dt;
      this.satSquash = Math.max(0, this.satSquash - dt * 3.2);

      for (let i = 0; i < this.moons.length; i++) {
        this.moons[i].angle += this.moons[i].speed * 0.65 * dt;
      }

      const sx = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
      const sy = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
      this.recordTrail(sx, sy);
      return;
    }

    if (this.screen !== 'PLAYING') return;

    // Brief tactile hitstop on collision before debris scatters
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
      return;
    }

    // Smooth warp-in sequence when entering the open wormhole
    if (this.satWarpProgress > 0) {
      this.satWarpProgress = Math.min(1, this.satWarpProgress + dt * 3.8);
      this.portal.pulse += dt * 7;
      if (this.satWarpProgress >= 1) {
        this.screen = 'VICTORY';
        this.callbacks.onVictory({
          levelId: this.level.id,
          flightTime: this.flightTime,
          shiftCount: this.shiftCount,
          starsEarned: this.stars.length,
        });
      }
      return;
    }

    this.flightTime += dt;
    if (this.satSquash > 0) {
      this.satSquash = Math.max(0, this.satSquash - dt * 3.6);
    }

    // 1. Moons & Gravity Wells
    let speedMultiplier = 1.0;
    let radialOffset = 0;
    let inWell = false;
    let gravMode: 'none' | 'boost' | 'drag' = 'none';

    const curSatX = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    const curSatY = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;

    for (let i = 0; i < this.moons.length; i++) {
      const m = this.moons[i];
      m.angle += m.speed * dt;
      const mRad = this.outerRadius * m.orbitRadiusMult;
      const mx = this.centerX + Math.cos(m.angle) * mRad;
      const my = this.centerY + Math.sin(m.angle) * mRad;
      const wellPx = this.outerRadius * m.wellRadiusMult;

      const dist = Math.hypot(curSatX - mx, curSatY - my);
      if (dist < wellPx) {
        inWell = true;
        const pull = 1 - dist / wellPx; // 0 at edge, 1 at center
        const smoothPull = 0.42 + 0.58 * pull;
        speedMultiplier *= 1 + (m.speedBoost - 1) * smoothPull;
        radialOffset += m.radialTug * this.outerRadius * pull;
        gravMode = m.speedBoost >= 1 ? 'boost' : 'drag';
        spaceAudio.playGravityHum(m.speedBoost >= 1);
      }
    }

    this.satInGravityWell = inWell;
    this.satGravityMode = gravMode;

    // 2. Spring interpolation between inner & outer rings (plus lunar radial pull)
    const baseTargetR = (this.satTargetOrbit === 0 ? this.innerRadius : this.outerRadius) + radialOffset;
    this.satCurrentRadius += (baseTargetR - this.satCurrentRadius) * Math.min(1, dt * 13);

    // 3. Keplerian angular speed (close = fast, far = slow) modulated by gravity wells
    const baseSpeed = this.satTargetOrbit === 0 ? this.level.innerSpeed : this.level.outerSpeed;
    this.satAngle += baseSpeed * speedMultiplier * dt;

    const satX = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    const satY = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
    this.recordTrail(satX, satY);

    // 4. Collectible stars
    const starPickupRadius = Math.max(20, this.outerRadius * 0.155);
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.collected) continue;
      if (s.speed !== 0) s.angle += s.speed * dt;
      s.bobPhase += dt * 2.8;

      const sr = s.orbit === 0 ? this.innerRadius : this.outerRadius;
      const sx = this.centerX + Math.cos(s.angle) * sr;
      const sy = this.centerY + Math.sin(s.angle) * sr;

      if (Math.hypot(satX - sx, satY - sy) < starPickupRadius) {
        s.collected = true;
        this.starsCollected++;
        spaceAudio.playStar(this.starsCollected - 1);
        this.spawnBurst(sx, sy, '#FDE047', 14);
        this.spawnShockwave(sx, sy, 36, '#FDE047');

        if (this.starsCollected >= this.stars.length && !this.portal.active) {
          this.portal.active = true;
          this.portal.openAnim = 1;
          spaceAudio.playPortalOpen();
          const pr = this.portal.orbit === 0 ? this.innerRadius : this.outerRadius;
          const px = this.centerX + Math.cos(this.portal.angle) * pr;
          const py = this.centerY + Math.sin(this.portal.angle) * pr;
          this.spawnBurst(px, py, '#34D399', 18);
          this.spawnShockwave(px, py, 54, '#34D399');
        }
      }
    }

    // 5. Space Junk Hazards & forgiving hitbox collision
    const satHitRadius = Math.max(6.5, this.outerRadius * 0.048);
    const sizeScale = this.outerRadius / 148;
    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      h.angle += h.speed * dt;
      h.spin += dt * 1.15;

      const hr = h.orbit === 0 ? this.innerRadius : this.outerRadius;
      const hx = this.centerX + Math.cos(h.angle) * hr;
      const hy = this.centerY + Math.sin(h.angle) * hr;
      const hazardHitRadius = h.size * sizeScale * 0.72;

      if (Math.hypot(satX - hx, satY - hy) < satHitRadius + hazardHitRadius) {
        this.triggerCollision(satX, satY);
        return;
      }
    }

    // 6. Goal Wormhole Portal
    if (this.portal.speed !== 0) {
      this.portal.angle += this.portal.speed * dt;
    }
    this.portal.pulse += dt * 3.4;
    if (this.portal.openAnim > 0) {
      this.portal.openAnim = Math.max(0, this.portal.openAnim - dt * 1.8);
    }

    if (this.portal.active) {
      const pr = this.portal.orbit === 0 ? this.innerRadius : this.outerRadius;
      const px = this.centerX + Math.cos(this.portal.angle) * pr;
      const py = this.centerY + Math.sin(this.portal.angle) * pr;
      const portalHitRadius = Math.max(22, this.outerRadius * 0.165);

      if (Math.hypot(satX - px, satY - py) < portalHitRadius) {
        this.satWarpProgress = 0.01;
        this.satWarpStartX = satX;
        this.satWarpStartY = satY;
        spaceAudio.playVictory();
        this.spawnBurst(px, py, '#34D399', 22);
        this.spawnBurst(px, py, '#38BDF8', 12);
        this.spawnShockwave(px, py, 64, '#34D399');
        return;
      }
    }

    this.emitHudIfNeeded();
  }

  private triggerCollision(x: number, y: number): void {
    this.hitstopTimer = 0.055; // crisp 55ms impact freeze
    this.impactFlash = 0.85;
    this.cameraShake = this.reducedMotion ? 0 : 10;
    spaceAudio.playCrash();
    this.spawnBurst(x, y, '#FB7185', 22);
    this.spawnBurst(x, y, '#FDE68A', 10);
    this.spawnShockwave(x, y, 48, '#FB7185');

    this.screen = 'GAMEOVER';
    this.clearPendingModal();
    this.pendingModalTimer = window.setTimeout(() => {
      if (!this.destroyed && this.screen === 'GAMEOVER') {
        this.callbacks.onGameOver();
      }
    }, 290);
  }

  // =========================================================================
  // MINIMALIST ZEN RENDERER (No shadowBlur overhead, crisp vector geometry)
  // =========================================================================

  private render(): void {
    const ctx = this.ctx;
    ctx.save();

    if (this.cameraShake > 0.2) {
      const dx = (Math.random() - 0.5) * this.cameraShake;
      const dy = (Math.random() - 0.5) * this.cameraShake;
      ctx.translate(dx, dy);
    }

    const palette = this.level.planetPalette;

    // 1. Calm deep nocturnal cosmos backdrop
    const bgGrad = ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      this.planetRadius * 0.5,
      this.centerX,
      this.centerY,
      Math.max(this.width, this.height) * 0.72
    );
    bgGrad.addColorStop(0, palette.bgInner);
    bgGrad.addColorStop(0.55, '#090E1D');
    bgGrad.addColorStop(1, '#050814');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Subtle, barely breathing background starfield (keeps total focus on gravity)
    const breatheTime = this.reducedMotion ? 0 : this.elapsedClock * 0.55;
    for (let i = 0; i < this.bgStars.length; i++) {
      const st = this.bgStars[i];
      const mod = this.reducedMotion ? 1 : 0.82 + 0.18 * Math.sin(breatheTime + st.phase);
      ctx.fillStyle = `rgba(226, 232, 240, ${(st.alpha * mod).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(st.nx * this.width, st.ny * this.height, st.r, 0, TAU);
      ctx.fill();
    }

    // 3. Moons & Gravity Wells (rendered behind orbital tracks for clear depth hierarchy)
    this.drawMoons();

    // 4. Concentric Inner (Fast / Warm Amber) & Outer (Slow / Cool Cerulean) Tracks
    this.drawOrbitTrack(this.innerRadius, this.satTargetOrbit === 0, '#FBBF24');
    this.drawOrbitTrack(this.outerRadius, this.satTargetOrbit === 1, '#38BDF8');

    // 5. Central Minimalist Planet
    this.drawPlanet(palette);

    // 6. Goal Wormhole Portal
    this.drawPortal();

    // 7. Collectible Stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.collected) continue;
      const r = s.orbit === 0 ? this.innerRadius : this.outerRadius;
      const sx = this.centerX + Math.cos(s.angle) * r;
      const sy = this.centerY + Math.sin(s.angle) * r;
      const bobScale = this.reducedMotion ? 1 : 1 + Math.sin(s.bobPhase) * 0.08;
      this.drawStar(sx, sy, bobScale);
    }

    // 8. Space Junk Hazards
    const sizeScale = this.outerRadius / 148;
    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      const r = h.orbit === 0 ? this.innerRadius : this.outerRadius;
      const hx = this.centerX + Math.cos(h.angle) * r;
      const hy = this.centerY + Math.sin(h.angle) * r;
      this.drawHazard(hx, hy, h, sizeScale);
    }

    // 9. Satellite Trail & Satellite Craft
    if (this.screen !== 'GAMEOVER' || this.hitstopTimer > 0) {
      this.drawTrail();
      this.drawSatellite();
    }

    // 10. Pooled Shockwaves & Particles
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Subtle impact flash overlay on collision
    if (this.impactFlash > 0.01 && !this.reducedMotion) {
      ctx.fillStyle = `rgba(251, 113, 133, ${(this.impactFlash * 0.14).toFixed(3)})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  private drawMoons(): void {
    const ctx = this.ctx;
    const satX = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    const satY = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;

    for (let i = 0; i < this.moons.length; i++) {
      const m = this.moons[i];
      const mRad = this.outerRadius * m.orbitRadiusMult;
      const mx = this.centerX + Math.cos(m.angle) * mRad;
      const my = this.centerY + Math.sin(m.angle) * mRad;
      const wellPx = this.outerRadius * m.wellRadiusMult;
      const isBoost = m.speedBoost >= 1;
      const dist = Math.hypot(satX - mx, satY - my);
      const engaged = this.screen === 'PLAYING' && dist < wellPx;

      ctx.save();

      // Delicate faint orbital path of the moon
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.09)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, mRad, 0, TAU);
      ctx.stroke();

      // Soft gravity well fill
      const wellGrad = ctx.createRadialGradient(mx, my, 4, mx, my, wellPx);
      if (isBoost) {
        wellGrad.addColorStop(0, engaged ? 'rgba(167, 139, 250, 0.28)' : 'rgba(167, 139, 250, 0.19)');
        wellGrad.addColorStop(0.65, 'rgba(139, 92, 246, 0.06)');
        wellGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      } else {
        wellGrad.addColorStop(0, engaged ? 'rgba(96, 165, 250, 0.28)' : 'rgba(96, 165, 250, 0.18)');
        wellGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.06)');
        wellGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      }
      ctx.fillStyle = wellGrad;
      ctx.beginPath();
      ctx.arc(mx, my, wellPx, 0, TAU);
      ctx.fill();

      // Crisp dashed well boundary
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = engaged
        ? isBoost
          ? 'rgba(216, 180, 254, 0.72)'
          : 'rgba(147, 197, 253, 0.72)'
        : isBoost
          ? 'rgba(167, 139, 250, 0.28)'
          : 'rgba(96, 165, 250, 0.28)';
      ctx.lineWidth = engaged ? 1.5 : 1.1;
      ctx.beginPath();
      ctx.arc(mx, my, wellPx, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle inner concentric harmonic ring showing direction (boost vs drag)
      ctx.strokeStyle = isBoost ? 'rgba(196, 181, 253, 0.16)' : 'rgba(147, 197, 253, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mx, my, wellPx * 0.55, 0, TAU);
      ctx.stroke();

      // Gravity tether line when actively pulling the satellite
      if (engaged) {
        ctx.strokeStyle = isBoost ? 'rgba(216, 180, 254, 0.65)' : 'rgba(147, 197, 253, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(satX, satY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Moon halo (cheap alpha circle, zero shadowBlur)
      const moonR = Math.max(7.5, this.outerRadius * 0.062);
      ctx.fillStyle = isBoost ? 'rgba(196, 181, 253, 0.22)' : 'rgba(147, 197, 253, 0.22)';
      ctx.beginPath();
      ctx.arc(mx, my, moonR * 1.65, 0, TAU);
      ctx.fill();

      // Moon core sphere with subtle crescent shade
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(mx, my, moonR, 0, TAU);
      ctx.fill();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.arc(mx + moonR * 0.24, my + moonR * 0.22, moonR * 0.78, 0, TAU);
      ctx.fill();

      ctx.restore();
    }
  }

  private drawOrbitTrack(radius: number, isActive: boolean, activeHex: string): void {
    const ctx = this.ctx;
    ctx.save();

    if (isActive) {
      ctx.strokeStyle = activeHex;
      ctx.globalAlpha = 0.11;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
      ctx.stroke();
    }

    ctx.globalAlpha = isActive ? 0.72 : 0.28;
    ctx.strokeStyle = isActive ? activeHex : '#94A3B8';
    ctx.lineWidth = isActive ? 1.9 : 1.2;
    ctx.setLineDash([6, 9]);
    ctx.lineDashOffset = this.reducedMotion ? 0 : -this.planetRotation * (isActive ? 46 : 18);
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  private drawPlanet(palette: PlanetPalette): void {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const pr = this.planetRadius;

    ctx.save();

    // Soft atmospheric halo
    const halo = ctx.createRadialGradient(cx, cy, pr * 0.82, cx, cy, pr * 1.62);
    halo.addColorStop(0, palette.glow);
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, pr * 1.62, 0, TAU);
    ctx.fill();

    // Back planetary ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.34);
    ctx.strokeStyle = palette.ring;
    ctx.lineWidth = Math.max(3.5, pr * 0.11);
    ctx.beginPath();
    ctx.ellipse(0, 0, pr * 1.54, pr * 0.36, 0, Math.PI, TAU);
    ctx.stroke();
    ctx.restore();

    // Planet body
    const sphereGrad = ctx.createLinearGradient(cx - pr, cy - pr, cx + pr, cy + pr);
    sphereGrad.addColorStop(0, palette.rim);
    sphereGrad.addColorStop(0.46, palette.core);
    sphereGrad.addColorStop(1, palette.mid);

    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, TAU);
    ctx.fill();

    // Clipped subtle atmospheric bands & twilight shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, TAU);
    ctx.clip();

    const drift = this.reducedMotion ? 0 : Math.sin(this.planetRotation) * (pr * 0.14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.13)';
    ctx.beginPath();
    ctx.ellipse(cx - pr * 0.12 + drift, cy - pr * 0.3, pr * 0.72, pr * 0.13, -0.18, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx + pr * 0.16 - drift, cy + pr * 0.27, pr * 0.62, pr * 0.11, -0.18, 0, TAU);
    ctx.fill();

    ctx.fillStyle = 'rgba(4, 8, 20, 0.28)';
    ctx.beginPath();
    ctx.arc(cx + pr * 0.3, cy + pr * 0.26, pr * 0.98, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Front planetary ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.34);
    ctx.strokeStyle = palette.ring;
    ctx.lineWidth = Math.max(3.5, pr * 0.11);
    ctx.beginPath();
    ctx.ellipse(0, 0, pr * 1.54, pr * 0.36, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawPortal(): void {
    const ctx = this.ctx;
    const pr = this.portal.orbit === 0 ? this.innerRadius : this.outerRadius;
    const px = this.centerX + Math.cos(this.portal.angle) * pr;
    const py = this.centerY + Math.sin(this.portal.angle) * pr;
    const scale = this.outerRadius / 148;

    ctx.save();
    ctx.translate(px, py);

    if (!this.portal.active) {
      // Quiet dormant wormhole ring
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.38)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 14.5 * scale, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.24)';
      ctx.beginPath();
      ctx.arc(0, 0, 4 * scale, 0, TAU);
      ctx.fill();
    } else {
      const pulseScale = this.reducedMotion ? 1 : 1 + Math.sin(this.portal.pulse) * 0.11;
      const glowR = 27 * scale * pulseScale;

      const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, glowR);
      glow.addColorStop(0, 'rgba(52, 211, 153, 0.78)');
      glow.addColorStop(0.55, 'rgba(16, 185, 129, 0.24)');
      glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, TAU);
      ctx.fill();

      ctx.rotate(this.portal.pulse * 0.75);
      ctx.strokeStyle = '#6EE7B7';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 15 * scale, 0, Math.PI * 1.45);
      ctx.stroke();

      ctx.strokeStyle = '#ECFDF5';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 9.2 * scale, Math.PI * 0.45, Math.PI * 1.82);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawStar(x: number, y: number, scale: number): void {
    const ctx = this.ctx;
    const s = scale * (this.outerRadius / 148);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    // Lightweight golden aura rings (no shadowBlur)
    ctx.fillStyle = 'rgba(253, 224, 71, 0.14)';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, TAU);
    ctx.fill();

    ctx.fillStyle = 'rgba(253, 224, 71, 0.24)';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.fill();

    // Crisp 4-point zenith star
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    const outerR = 9.8;
    const innerR = 3.6;
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();

    // White pinpoint core
    ctx.fillStyle = '#FEF9C3';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawHazard(x: number, y: number, h: ActiveHazard, scale: number): void {
    const ctx = this.ctx;
    const sz = h.size * scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(h.spin);

    // Soft danger halo
    ctx.fillStyle = 'rgba(251, 113, 133, 0.14)';
    ctx.beginPath();
    ctx.arc(0, 0, sz + 4.5 * scale, 0, TAU);
    ctx.fill();

    if (h.type === 'asteroid') {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const pts = 7;
      for (let i = 0; i < pts; i++) {
        const ang = (i * TAU) / pts;
        const rad = sz * (i % 2 === 0 ? 1.0 : 0.74);
        if (i === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (h.type === 'panel') {
      const w = sz * 1.72;
      const hh = sz * 0.8;
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-w / 2, -hh / 2, w, hh);
      ctx.strokeRect(-w / 2, -hh / 2, w, hh);

      ctx.strokeStyle = 'rgba(251, 113, 133, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w * 0.17, -hh / 2);
      ctx.lineTo(-w * 0.17, hh / 2);
      ctx.moveTo(w * 0.17, -hh / 2);
      ctx.lineTo(w * 0.17, hh / 2);
      ctx.stroke();
    } else {
      // Derelict orbital buoy (diamond beacon)
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.96);
      ctx.lineTo(sz * 0.85, 0);
      ctx.lineTo(0, sz * 0.96);
      ctx.lineTo(-sz * 0.85, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.24, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawTrail(): void {
    const len = this.satTrail.length;
    if (len < 2) return;
    const ctx = this.ctx;
    const color = this.satTargetOrbit === 0 ? '#FBBF24' : '#38BDF8';

    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 1; i < len; i++) {
      const p0 = this.satTrail[i - 1];
      const p1 = this.satTrail[i];
      const ratio = i / len;

      ctx.strokeStyle = color;
      ctx.globalAlpha = ratio * 0.42;
      ctx.lineWidth = ratio * 4.8;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawSatellite(): void {
    const ctx = this.ctx;
    const scale = this.outerRadius / 148;

    let sx = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    let sy = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
    let drawScale = scale;

    if (this.satWarpProgress > 0) {
      const pr = this.portal.orbit === 0 ? this.innerRadius : this.outerRadius;
      const px = this.centerX + Math.cos(this.portal.angle) * pr;
      const py = this.centerY + Math.sin(this.portal.angle) * pr;
      const ease = 1 - Math.pow(1 - this.satWarpProgress, 3);
      sx = this.satWarpStartX + (px - this.satWarpStartX) * ease;
      sy = this.satWarpStartY + (py - this.satWarpStartY) * ease;
      drawScale = scale * Math.max(0.05, 1 - ease * 0.92);
    }

    const tangentAngle = this.satAngle + Math.PI / 2 + this.satWarpProgress * 5.2;
    const accent = this.satTargetOrbit === 0 ? '#FBBF24' : '#38BDF8';

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(tangentAngle);

    const stretchX = (1 - this.satSquash * 0.2) * drawScale;
    const stretchY = (1 + this.satSquash * 0.25) * drawScale;
    ctx.scale(stretchX, stretchY);

    // Lightweight craft glow ring
    ctx.fillStyle = this.satTargetOrbit === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, TAU);
    ctx.fill();

    // Solar wings
    ctx.fillStyle = accent;
    ctx.fillRect(-12.5, -2.6, 25, 5.2);

    // Minimalist capsule hull (manual rounded rect for universal KitKat/WebView compatibility)
    this.fillRoundedRect(ctx, -4.6, -7.8, 9.2, 15.6, 3.8, '#F8FAFC');

    // Nose indicator dot
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, -3.8, 2.2, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  /** Manual rounded-rect path so older Android WebViews without ctx.roundRect render identically */
  private fillRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillStyle: string
  ): void {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
}
