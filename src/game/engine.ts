import {
  GameOverReason,
  GameScreen,
  HazardKind,
  HudSnapshot,
  LevelConfig,
  LevelLoadout,
  OrbitLane,
  PlanetPalette,
  SatelliteId,
} from '../types';
import { spaceAudio } from './audio';
import { getLevelById } from './levels';
import { getSatelliteById } from './satellites';

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
  deflectCooldown: number;
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
  nx: number;
  ny: number;
  r: number;
  alpha: number;
  phase: number;
  isStarShape: boolean;
  tint: string;
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
  rot: number;
  vrot: number;
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
  onGameOver: (
    reason: GameOverReason,
    runStats: { orbitalStars: number; shifts: number }
  ) => void;
  onVictory: (result: {
    levelId: number;
    flightTime: number;
    shiftCount: number;
    starsEarned: number;
    orbitalStars: number;
  }) => void;
}

const MAX_PARTICLES = 72;
const MAX_SHOCKWAVES = 10;
const TAU = Math.PI * 2;

/**
 * Isolated 60fps Canvas2D Paper-Craft Orbital Engine for Pocket Orbit.
 * Supports:
 * - 4 distinct satellites: Classic Craft, Tinny (compact), Heavy (outer-orbit immune), Nano Stopper (tiny + timer off)
 * - Optional run-long Shield power-up protecting from all obstacles on both orbits
 * - Sector 3+ countdown timer with crisp timeout handling
 * - Zero ctx.shadowBlur calls & pooled particles for smooth Android performance
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

  // Active loadout state
  private satelliteId: SatelliteId = 'default';
  private shieldActive = false;
  private timerDisabled = false;
  private timeRemaining: number | null = null;

  // Satellite state
  private satTargetOrbit: OrbitLane = 1;
  private satCurrentRadius = 148;
  private satAngle = -Math.PI / 2;
  private satSquash = 0;
  private satTrail: TrailPoint[] = [];
  private satInGravityWell = false;
  private satGravityMode: 'none' | 'boost' | 'drag' = 'none';
  private satWarpProgress = 0;
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

  // Pre-allocated pools, starfield & cached paper patterns
  private bgStars: BgStar[] = [];
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private creamPaperPattern: CanvasPattern | null = null;
  private navyPaperPattern: CanvasPattern | null = null;

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
    this.initPaperPatterns();
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
      color: '#F3C24F',
      rot: 0,
      vrot: 0,
    }));

    this.shockwaves = Array.from({ length: MAX_SHOCKWAVES }, () => ({
      active: false,
      x: 0,
      y: 0,
      radius: 0,
      maxRadius: 32,
      alpha: 0,
      color: '#F3C24F',
    }));
  }

  private initPaperPatterns(): void {
    if (typeof document === 'undefined') return;

    const creamTile = document.createElement('canvas');
    creamTile.width = 160;
    creamTile.height = 160;
    const cctx = creamTile.getContext('2d');
    if (cctx) {
      cctx.fillStyle = '#F5EFE2';
      cctx.fillRect(0, 0, 160, 160);
      for (let i = 0; i < 110; i++) {
        const s1 = Math.sin(i * 73.1 + 11.7) * 43758.5453;
        const s2 = Math.sin(i * 39.7 + 53.3) * 43758.5453;
        const s3 = Math.sin(i * 19.3 + 7.1) * 43758.5453;
        const x = (s1 - Math.floor(s1)) * 160;
        const y = (s2 - Math.floor(s2)) * 160;
        const sz = s3 - Math.floor(s3);
        cctx.fillStyle =
          i % 4 === 0
            ? 'rgba(130, 102, 72, 0.24)'
            : i % 2 === 0
              ? 'rgba(176, 148, 112, 0.2)'
              : 'rgba(204, 178, 142, 0.18)';
        cctx.beginPath();
        cctx.arc(x, y, 0.55 + sz * 1.05, 0, TAU);
        cctx.fill();
      }
      this.creamPaperPattern = this.ctx.createPattern(creamTile, 'repeat');
    }

    const navyTile = document.createElement('canvas');
    navyTile.width = 160;
    navyTile.height = 160;
    const nctx = navyTile.getContext('2d');
    if (nctx) {
      nctx.clearRect(0, 0, 160, 160);
      for (let i = 0; i < 85; i++) {
        const s1 = Math.sin(i * 61.3 + 29.1) * 43758.5453;
        const s2 = Math.sin(i * 43.9 + 17.5) * 43758.5453;
        const s3 = Math.sin(i * 27.1 + 3.9) * 43758.5453;
        const x = (s1 - Math.floor(s1)) * 160;
        const y = (s2 - Math.floor(s2)) * 160;
        const sz = s3 - Math.floor(s3);
        nctx.fillStyle = i % 2 === 0 ? 'rgba(255, 248, 232, 0.032)' : 'rgba(9, 12, 24, 0.085)';
        nctx.beginPath();
        nctx.arc(x, y, 0.5 + sz * 0.85, 0, TAU);
        nctx.fill();
      }
      this.navyPaperPattern = this.ctx.createPattern(navyTile, 'repeat');
    }
  }

  private initStarfield(): void {
    this.bgStars = [];
    const starTints = ['#F3C24F', '#E6B85C', '#F8E3A3', '#D4A553'];
    for (let i = 0; i < 34; i++) {
      const s1 = Math.sin(i * 91.7 + 13.3) * 43758.5453;
      const s2 = Math.sin(i * 47.3 + 71.1) * 43758.5453;
      const s3 = Math.sin(i * 23.9 + 5.7) * 43758.5453;
      const nx = s1 - Math.floor(s1);
      const ny = s2 - Math.floor(s2);
      const sz = s3 - Math.floor(s3);
      this.bgStars.push({
        nx,
        ny,
        r: i < 12 ? 3.2 + sz * 3.2 : 0.75 + sz * 1.05,
        alpha: i < 12 ? 0.55 + sz * 0.3 : 0.18 + sz * 0.24,
        phase: sz * TAU,
        isStarShape: i < 12,
        tint: starTints[i % starTints.length],
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
    const rect = parent
      ? parent.getBoundingClientRect()
      : { width: window.innerWidth, height: window.innerHeight };
    this.width = Math.max(280, rect.width);
    this.height = Math.max(400, rect.height);

    const maxDpr = this.lowPower ? 1 : 2;
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.centerX = this.width / 2;
    this.centerY = this.height * 0.5;

    const safeMin = Math.min(this.width * 0.92, this.height * 0.72);
    const prevOuter = this.outerRadius || 148;
    this.outerRadius = Math.max(108, Math.min(215, safeMin * 0.36));
    this.innerRadius = this.outerRadius * 0.6;
    this.planetRadius = this.outerRadius * 0.295;

    if (prevOuter > 0) {
      const ratio = this.satCurrentRadius / prevOuter;
      this.satCurrentRadius = Math.max(
        this.innerRadius * 0.85,
        Math.min(this.outerRadius * 1.15, ratio * this.outerRadius)
      );
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

  loadLevel(levelId: number, targetScreen: GameScreen, loadout?: LevelLoadout): void {
    this.clearPendingModal();
    this.level = getLevelById(levelId);
    this.screen = targetScreen;

    this.satelliteId = loadout?.satelliteId ?? 'default';
    this.shieldActive = Boolean(loadout?.shieldActive);

    const satDef = getSatelliteById(this.satelliteId);
    this.timerDisabled = this.level.timeLimit !== null && satDef.disablesTimer;
    this.timeRemaining =
      this.level.timeLimit !== null && !this.timerDisabled ? this.level.timeLimit : null;

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
      deflectCooldown: 0,
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
    const accent = toInner ? '#F3C24F' : '#9EC0DA';

    this.spawnShockwave(sx, sy, 32, accent);

    const particleCount = this.lowPower ? 5 : 9;
    const thrustDir = toInner ? this.satAngle : this.satAngle + Math.PI;
    for (let i = 0; i < particleCount; i++) {
      const spread = (Math.random() - 0.5) * 1.25;
      const spd = 40 + Math.random() * 54;
      this.spawnParticle(
        sx,
        sy,
        Math.cos(thrustDir + spread) * spd,
        Math.sin(thrustDir + spread) * spd,
        2.4 + Math.random() * 1.1,
        2.2 + Math.random() * 1.6,
        toInner ? '#F6D372' : '#FAF3E6'
      );
    }

    this.emitHudIfNeeded();
  }

  private emitHudIfNeeded(): void {
    const timerBucket =
      this.timeRemaining === null ? -1 : Math.ceil(this.timeRemaining * 5);
    const key = `${this.level.id}|${this.starsCollected}|${this.stars.length}|${this.portal.active ? 1 : 0}|${this.satTargetOrbit}|${this.satInGravityWell ? 1 : 0}|${this.satGravityMode}|${this.shiftCount}|${timerBucket}|${this.timerDisabled ? 1 : 0}|${this.shieldActive ? 1 : 0}|${this.satelliteId}`;
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
      timeLimit: this.level.timeLimit,
      timeRemaining: this.timeRemaining,
      timerDisabled: this.timerDisabled,
      shieldActive: this.shieldActive,
      satelliteId: this.satelliteId,
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
        p.rot = Math.random() * TAU;
        p.vrot = (Math.random() - 0.5) * 7;
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
        2.3 + Math.random() * 2.1,
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
        sw.alpha = 0.78;
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
      p.rot += p.vrot * dt;
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
    const maxLen = this.lowPower ? 14 : 26;
    this.satTrail.push({ x, y, orbit: this.satTargetOrbit });
    if (this.satTrail.length > maxLen) {
      this.satTrail.shift();
    }
  }

  private update(dt: number): void {
    this.elapsedClock += dt;
    this.planetRotation += dt * 0.16;
    this.updateEffects(dt);

    if (this.screen === 'TITLE') {
      this.flightTime += dt;
      return;
    }

    if (this.screen !== 'PLAYING') return;

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
          orbitalStars: this.starsCollected,
        });
      }
      return;
    }

    this.flightTime += dt;
    if (this.satSquash > 0) {
      this.satSquash = Math.max(0, this.satSquash - dt * 3.6);
    }

    // 0. Sector 3+ Countdown Timer (disabled automatically when Nano Stopper is equipped)
    if (this.timeRemaining !== null) {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
      if (this.timeRemaining <= 0) {
        const satX = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
        const satY = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
        this.triggerFailure('timeout', satX, satY);
        return;
      }
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
        const pull = 1 - dist / wellPx;
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
    const starPickupRadius = Math.max(23, this.outerRadius * 0.17);
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
        this.spawnBurst(sx, sy, '#F3C24F', 14);
        this.spawnShockwave(sx, sy, 36, '#FFF1AD');

        if (this.starsCollected >= this.stars.length && !this.portal.active) {
          this.portal.active = true;
          this.portal.openAnim = 1;
          spaceAudio.playPortalOpen();
          const pr = this.portal.orbit === 0 ? this.innerRadius : this.outerRadius;
          const px = this.centerX + Math.cos(this.portal.angle) * pr;
          const py = this.centerY + Math.sin(this.portal.angle) * pr;
          this.spawnBurst(px, py, '#FFF3D1', 18);
          this.spawnShockwave(px, py, 56, '#F3C24F');
        }
      }
    }

    // 5. Space Junk Hazards & Satellite / Shield collision rules
    const satDef = getSatelliteById(this.satelliteId);
    const satHitRadius = Math.max(4.0, this.outerRadius * 0.042 * satDef.hitboxScale);
    const sizeScale = this.outerRadius / 148;

    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      h.angle += h.speed * dt;
      h.spin += dt * 1.15;
      if (h.deflectCooldown > 0) {
        h.deflectCooldown = Math.max(0, h.deflectCooldown - dt);
      }

      const hr = h.orbit === 0 ? this.innerRadius : this.outerRadius;
      const hx = this.centerX + Math.cos(h.angle) * hr;
      const hy = this.centerY + Math.sin(h.angle) * hr;
      const hazardHitRadius = h.size * sizeScale * 0.64;

      if (Math.hypot(satX - hx, satY - hy) < satHitRadius + hazardHitRadius) {
        // Shield protects from ALL obstacles on both orbits
        if (this.shieldActive) {
          if (h.deflectCooldown <= 0) {
            h.deflectCooldown = 0.55;
            this.spawnBurst(hx, hy, '#9EC0DA', 10);
            this.spawnShockwave(satX, satY, 34, '#A8D8F0');
            spaceAudio.playShift(false);
          }
          continue;
        }

        // Heavy satellite protects from obstacles on the OUTER orbit (orbit === 1), inner orbit still fails
        if (satDef.outerImmune && h.orbit === 1) {
          if (h.deflectCooldown <= 0) {
            h.deflectCooldown = 0.55;
            this.spawnBurst(hx, hy, '#F3C24F', 10);
            this.spawnShockwave(satX, satY, 34, '#F3C24F');
            spaceAudio.playShift(true);
          }
          continue;
        }

        this.triggerFailure('collision', satX, satY);
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
      const portalHitRadius = Math.max(24, this.outerRadius * 0.18);

      if (Math.hypot(satX - px, satY - py) < portalHitRadius) {
        this.satWarpProgress = 0.01;
        this.satWarpStartX = satX;
        this.satWarpStartY = satY;
        spaceAudio.playVictory();
        this.spawnBurst(px, py, '#F3C24F', 22);
        this.spawnBurst(px, py, '#FAF3E6', 12);
        this.spawnShockwave(px, py, 64, '#FFF3D1');
        return;
      }
    }

    this.emitHudIfNeeded();
  }

  private triggerFailure(reason: GameOverReason, x: number, y: number): void {
    this.hitstopTimer = 0.055;
    this.impactFlash = 0.85;
    this.cameraShake = this.reducedMotion ? 0 : 10;
    spaceAudio.playCrash();
    this.spawnBurst(x, y, reason === 'timeout' ? '#F3C24F' : '#C23B58', 20);
    this.spawnBurst(x, y, '#FAF3E6', 12);
    this.spawnShockwave(x, y, 48, '#C75C3B');

    this.screen = 'GAMEOVER';
    const capturedStars = this.starsCollected;
    const capturedShifts = this.shiftCount;
    this.emitHudIfNeeded();

    this.clearPendingModal();
    this.pendingModalTimer = window.setTimeout(() => {
      if (!this.destroyed && this.screen === 'GAMEOVER') {
        this.callbacks.onGameOver(reason, {
          orbitalStars: capturedStars,
          shifts: capturedShifts,
        });
      }
    }, 290);
  }

  // =========================================================================
  // PAPER-CRAFT DIORAMA RENDERER
  // =========================================================================

  private render(): void {
    const ctx = this.ctx;
    ctx.save();

    if (this.screen === 'TITLE') {
      this.renderLobbyBackdrop(ctx);
      ctx.restore();
      return;
    }

    if (this.cameraShake > 0.2) {
      const dx = (Math.random() - 0.5) * this.cameraShake;
      const dy = (Math.random() - 0.5) * this.cameraShake;
      ctx.translate(dx, dy);
    }

    const palette = this.level.planetPalette;

    // 1. Matte midnight construction-paper backdrop
    const bgGrad = ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      this.planetRadius * 0.4,
      this.centerX,
      this.centerY,
      Math.max(this.width, this.height) * 0.78
    );
    bgGrad.addColorStop(0, palette.bgInner);
    bgGrad.addColorStop(0.6, '#20263F');
    bgGrad.addColorStop(1, '#191E33');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    if (!this.lowPower && this.navyPaperPattern) {
      ctx.fillStyle = this.navyPaperPattern;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Calm gold-foil background stars & fine dust
    const breatheTime = this.reducedMotion ? 0 : this.elapsedClock * 0.5;
    for (let i = 0; i < this.bgStars.length; i++) {
      const st = this.bgStars[i];
      const sx = st.nx * this.width;
      const sy = st.ny * this.height;
      if (
        st.isStarShape &&
        Math.hypot(sx - this.centerX, sy - this.centerY) < this.outerRadius * 1.15
      ) {
        continue;
      }
      const mod = this.reducedMotion ? 1 : 0.88 + 0.12 * Math.sin(breatheTime + st.phase);
      ctx.save();
      ctx.globalAlpha = st.alpha * mod;
      if (st.isStarShape) {
        this.drawFivePointPaperStar(ctx, sx, sy, st.r, st.tint, '#FFF4C2', '#B58428', false);
      } else {
        ctx.fillStyle = '#EAE0C8';
        ctx.beginPath();
        ctx.arc(sx, sy, st.r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Moons & Stitched Gravity Wells
    this.drawMoons();

    // 4. Stitched Parchment Concentric Tracks
    this.drawOrbitTrack(this.innerRadius, this.satTargetOrbit === 0, '#F3C24F');
    this.drawOrbitTrack(this.outerRadius, this.satTargetOrbit === 1, '#E8D5B5');

    // 5. Layered Wavy Hand-Cut Construction-Paper Planet
    this.drawPlanet(palette);

    // 6. Concentric Layered Cutout Goal Portal
    this.drawPortal();

    // 7. Gold-Foil Origami Collectible Stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.collected) continue;
      const r = s.orbit === 0 ? this.innerRadius : this.outerRadius;
      const sx = this.centerX + Math.cos(s.angle) * r;
      const sy = this.centerY + Math.sin(s.angle) * r;
      const bobScale = this.reducedMotion ? 1 : 1 + Math.sin(s.bobPhase) * 0.07;
      this.drawStar(sx, sy, bobScale);
    }

    // 8. Crumpled Paper Asteroids & Paper-Cut Comets
    const sizeScale = this.outerRadius / 148;
    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      const r = h.orbit === 0 ? this.innerRadius : this.outerRadius;
      const hx = this.centerX + Math.cos(h.angle) * r;
      const hy = this.centerY + Math.sin(h.angle) * r;
      this.drawHazard(hx, hy, h, sizeScale);
    }

    // 9. Crimson Paper Ribbon Trail & Origami Paper Satellite
    if (this.screen !== 'GAMEOVER' || this.hitstopTimer > 0) {
      this.drawTrail();
      this.drawSatellite();
    }

    // 10. Pooled Stitched Shockwaves & Paper Confetti Particles
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(-p.size * 0.75, -p.size * 0.55, p.size * 1.5, p.size * 1.1);
      ctx.restore();
    }

    if (this.impactFlash > 0.01 && !this.reducedMotion) {
      ctx.fillStyle = `rgba(199, 92, 59, ${(this.impactFlash * 0.16).toFixed(3)})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  /**
   * Warm speckled handmade cream paper backdrop matching the exact Pocket Orbit Lobby mockup:
   * top-right double twine arc, left/right floating felt clouds with ochre shadows,
   * bottom-left peeking ringed ochre planet, bottom-right terracotta orbital loop + cloud,
   * and scattered warm ochre / burnt-terracotta paper stars.
   */
  private renderLobbyBackdrop(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#F5EFE2';
    ctx.fillRect(0, 0, this.width, this.height);
    if (!this.lowPower && this.creamPaperPattern) {
      ctx.fillStyle = this.creamPaperPattern;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Soft warm paper edge shading
    const edgeGrad = ctx.createRadialGradient(
      this.centerX,
      this.height * 0.48,
      Math.min(this.width, this.height) * 0.28,
      this.centerX,
      this.height * 0.48,
      Math.max(this.width, this.height) * 0.8
    );
    edgeGrad.addColorStop(0, 'rgba(255, 250, 240, 0)');
    edgeGrad.addColorStop(1, 'rgba(196, 172, 136, 0.18)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    const scale = Math.min(1.18, Math.max(0.72, Math.min(this.width, this.height) / 520));
    const bob = this.reducedMotion ? 0 : Math.sin(this.elapsedClock * 0.85) * 3 * scale;

    ctx.save();

    // 1. Top-right double orbital twine arc sweeping behind the Sound button
    ctx.strokeStyle = 'rgba(130, 108, 86, 0.5)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(this.width * 1.03, -this.height * 0.04, 152 * scale, Math.PI * 0.48, Math.PI * 1.02);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(130, 108, 86, 0.42)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.arc(this.width * 1.03, -this.height * 0.04, 128 * scale, Math.PI * 0.48, Math.PI * 1.02);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Left-edge small floating felt cloud (upper-left)
    this.drawStitchedCloud(
      ctx,
      this.width * 0.065,
      this.height * 0.175 + bob * 0.45,
      30 * scale,
      '#FAF8F4',
      '#D6D2CA'
    );

    // 3. Left-edge larger cloud with warm ochre shadow ribbon beneath it
    ctx.save();
    ctx.fillStyle = '#D99E4E';
    ctx.beginPath();
    ctx.ellipse(
      this.width * 0.01,
      this.height * 0.295 + bob * 0.6,
      54 * scale,
      18 * scale,
      -0.38,
      0,
      TAU
    );
    ctx.fill();
    ctx.restore();
    this.drawStitchedCloud(
      ctx,
      this.width * 0.025,
      this.height * 0.275 + bob * 0.6,
      50 * scale,
      '#FAF8F4',
      '#D6D2CA'
    );

    // 4. Right-edge floating felt cloud with warm ochre shadow ribbon beneath it
    ctx.save();
    ctx.fillStyle = '#E0A656';
    ctx.beginPath();
    ctx.ellipse(
      this.width * 0.96,
      this.height * 0.282 - bob * 0.5,
      58 * scale,
      16 * scale,
      0.16,
      0,
      TAU
    );
    ctx.fill();
    ctx.restore();
    this.drawStitchedCloud(
      ctx,
      this.width * 0.965,
      this.height * 0.262 - bob * 0.5,
      54 * scale,
      '#FAF8F4',
      '#D6D2CA'
    );

    // 5. Bottom-left peeking ringed ochre planet with tilted double elliptical rings
    const blX = this.width * 0.005;
    const blY = this.height * 0.79;
    const blR = 54 * scale;

    ctx.save();
    ctx.translate(blX, blY);
    ctx.rotate(0.46);
    // Double orbital rings
    ctx.strokeStyle = 'rgba(130, 108, 86, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, blR * 2.15, blR * 0.95, 0, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(130, 108, 86, 0.36)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, blR * 1.72, blR * 0.74, 0, 0, TAU);
    ctx.stroke();

    // Ochre planet shadow + layered golden cardstock body
    ctx.fillStyle = 'rgba(39, 50, 79, 0.14)';
    ctx.beginPath();
    ctx.arc(3, 5, blR, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#D49A4A';
    ctx.beginPath();
    ctx.arc(0, 4 * scale, blR, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#E5B25D';
    ctx.beginPath();
    ctx.arc(-2 * scale, -2 * scale, blR * 0.96, 0, TAU);
    ctx.fill();
    ctx.restore();

    // 6. Bottom-right peeking terracotta orbital ribbon + overlapping white felt cloud
    ctx.save();
    ctx.translate(this.width * 1.03, this.height * 0.805);
    ctx.rotate(-0.26);
    // Shadow
    ctx.strokeStyle = 'rgba(39, 50, 79, 0.16)';
    ctx.lineWidth = 17 * scale;
    ctx.beginPath();
    ctx.ellipse(2, 6, 98 * scale, 48 * scale, 0, 0, TAU);
    ctx.stroke();

    // Terracotta outer orbital band
    ctx.strokeStyle = '#C75C3B';
    ctx.lineWidth = 15 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, 98 * scale, 48 * scale, 0, 0, TAU);
    ctx.stroke();

    // Warm sunlit inner rim highlight
    ctx.strokeStyle = '#DF7B52';
    ctx.lineWidth = 5 * scale;
    ctx.beginPath();
    ctx.ellipse(0, -1, 95 * scale, 45 * scale, 0, Math.PI * 0.7, Math.PI * 1.45);
    ctx.stroke();
    ctx.restore();

    this.drawStitchedCloud(
      ctx,
      this.width * 0.895,
      this.height * 0.802 + bob * 0.4,
      42 * scale,
      '#FAF8F4',
      '#D6D2CA'
    );

    // 7. Scattered warm ochre & burnt-terracotta 5-point paper stars in the exact mockup spots
    const decoStars = [
      { x: this.width * 0.915, y: this.height * 0.16, r: 9.5 * scale, c: '#C75C3B' },
      { x: this.width * 0.135, y: this.height * 0.705, r: 9.5 * scale, c: '#C89E68' },
      { x: this.width * 0.185, y: this.height * 0.85, r: 7.2 * scale, c: '#F3C24F' },
      { x: this.width * 0.185, y: this.height * 0.94, r: 10.5 * scale, c: '#E5AE52' },
      { x: this.width * 0.84, y: this.height * 0.888, r: 8.5 * scale, c: '#C75C3B' },
    ];
    for (let i = 0; i < decoStars.length; i++) {
      const ds = decoStars[i];
      this.drawFivePointPaperStar(
        ctx,
        ds.x,
        ds.y,
        ds.r,
        ds.c,
        '#FFF5D6',
        'rgba(39,50,79,0.2)',
        true
      );
    }

    ctx.restore();
  }

  private drawStitchedCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    fillHex: string,
    stitchHex: string
  ): void {
    const buildCloudPath = (ox: number, oy: number, s: number) => {
      ctx.beginPath();
      ctx.moveTo(ox - s * 0.82, oy + s * 0.24);
      ctx.quadraticCurveTo(ox - s * 1.02, oy + s * 0.24, ox - s * 0.96, oy + s * 0.02);
      ctx.quadraticCurveTo(ox - s * 0.9, oy - s * 0.22, ox - s * 0.58, oy - s * 0.2);
      ctx.quadraticCurveTo(ox - s * 0.44, oy - s * 0.62, ox - s * 0.02, oy - s * 0.58);
      ctx.quadraticCurveTo(ox + s * 0.38, oy - s * 0.54, ox + s * 0.46, oy - s * 0.22);
      ctx.quadraticCurveTo(ox + s * 0.92, oy - s * 0.24, ox + s * 0.94, oy + s * 0.04);
      ctx.quadraticCurveTo(ox + s * 0.96, oy + s * 0.24, ox + s * 0.72, oy + s * 0.24);
      ctx.closePath();
    };

    ctx.save();
    buildCloudPath(x + 2, y + 4, size);
    ctx.fillStyle = 'rgba(39, 50, 79, 0.1)';
    ctx.fill();

    buildCloudPath(x, y, size);
    ctx.fillStyle = fillHex;
    ctx.fill();

    buildCloudPath(x, y, size * 0.88);
    ctx.strokeStyle = stitchHex;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3.5, 3.5]);
    ctx.stroke();
    ctx.setLineDash([]);
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

      ctx.strokeStyle = 'rgba(232, 222, 200, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, mRad, 0, TAU);
      ctx.stroke();

      const wellGrad = ctx.createRadialGradient(mx, my, 4, mx, my, wellPx);
      if (isBoost) {
        wellGrad.addColorStop(
          0,
          engaged ? 'rgba(206, 180, 232, 0.24)' : 'rgba(206, 180, 232, 0.13)'
        );
        wellGrad.addColorStop(1, 'rgba(206, 180, 232, 0)');
      } else {
        wellGrad.addColorStop(
          0,
          engaged ? 'rgba(158, 192, 218, 0.24)' : 'rgba(158, 192, 218, 0.13)'
        );
        wellGrad.addColorStop(1, 'rgba(158, 192, 218, 0)');
      }
      ctx.fillStyle = wellGrad;
      ctx.beginPath();
      ctx.arc(mx, my, wellPx, 0, TAU);
      ctx.fill();

      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = engaged
        ? '#FAF3E6'
        : isBoost
          ? 'rgba(234, 224, 212, 0.56)'
          : 'rgba(218, 226, 235, 0.52)';
      ctx.lineWidth = engaged ? 1.7 : 1.25;
      ctx.beginPath();
      ctx.arc(mx, my, wellPx, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      if (engaged) {
        ctx.strokeStyle = isBoost ? 'rgba(243, 194, 79, 0.78)' : 'rgba(158, 192, 218, 0.8)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(satX, satY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const moonR = Math.max(9.5, this.outerRadius * 0.075);

      ctx.fillStyle = 'rgba(8, 11, 24, 0.42)';
      ctx.beginPath();
      ctx.arc(mx + 2.5, my + 4, moonR, 0, TAU);
      ctx.fill();

      ctx.fillStyle = m.color || '#BCBEC7';
      ctx.beginPath();
      ctx.arc(mx, my, moonR, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, moonR, 0, TAU);
      ctx.clip();

      ctx.fillStyle = 'rgba(42, 48, 66, 0.22)';
      ctx.beginPath();
      ctx.arc(mx + moonR * 0.26, my + moonR * 0.26, moonR * 0.94, 0, TAU);
      ctx.fill();

      ctx.fillStyle = 'rgba(72, 78, 96, 0.46)';
      ctx.beginPath();
      ctx.arc(mx - moonR * 0.34, my - moonR * 0.16, moonR * 0.26, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(mx + moonR * 0.22, my + moonR * 0.28, moonR * 0.22, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(mx + moonR * 0.26, my - moonR * 0.32, moonR * 0.13, 0, TAU);
      ctx.fill();

      ctx.restore();
      ctx.restore();
    }
  }

  private drawOrbitTrack(radius: number, isActive: boolean, activeHex: string): void {
    const ctx = this.ctx;
    ctx.save();

    if (isActive) {
      ctx.strokeStyle = activeHex;
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
      ctx.stroke();
    }

    ctx.globalAlpha = isActive ? 0.88 : 0.44;
    ctx.strokeStyle = isActive ? activeHex : '#D8C7AB';
    ctx.lineWidth = isActive ? 2.1 : 1.4;
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = this.reducedMotion ? 0 : -this.planetRotation * (isActive ? 38 : 14);
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
    const strata =
      palette.strata && palette.strata.length >= 4
        ? palette.strata
        : ['#F3E7D3', '#D9C3E0', '#F2AD63', '#B8D8A6', '#F08A7B', '#7998CD', '#EBB98B'];

    ctx.save();

    ctx.fillStyle = 'rgba(8, 11, 24, 0.38)';
    ctx.beginPath();
    ctx.ellipse(cx + pr * 0.62 + 3, cy - pr * 0.32 + 5, pr * 0.45, pr * 0.38, 0.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = strata[2] || palette.mid;
    ctx.beginPath();
    ctx.ellipse(cx + pr * 0.56, cy - pr * 0.34, pr * 0.42, pr * 0.34, 0.4, 0, TAU);
    ctx.fill();

    ctx.fillStyle = strata[3] || palette.core;
    ctx.beginPath();
    ctx.ellipse(cx - pr * 0.52, cy + pr * 0.44, pr * 0.42, pr * 0.32, -0.35, 0, TAU);
    ctx.fill();

    ctx.fillStyle = 'rgba(8, 10, 22, 0.48)';
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 7, pr * 1.01, 0, TAU);
    ctx.fill();

    ctx.fillStyle = strata[0];
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, TAU);
    ctx.clip();

    const drift = this.reducedMotion ? 0 : Math.sin(this.planetRotation * 0.85) * pr * 0.08;
    const bandCount = strata.length;

    for (let i = 1; i < bandCount; i++) {
      const t = i / bandCount;
      const yBase = cy - pr + t * (pr * 2.02);
      const amp = pr * (0.14 + (i % 2) * 0.06);
      const phase = i * 1.45 + drift * 0.03;

      ctx.fillStyle = 'rgba(16, 20, 38, 0.24)';
      ctx.beginPath();
      ctx.moveTo(cx - pr * 1.2, yBase - 2.5 + Math.sin(phase) * amp);
      ctx.bezierCurveTo(
        cx - pr * 0.45,
        yBase - 2.5 - Math.cos(phase) * amp * 1.25,
        cx + pr * 0.38,
        yBase - 2.5 + Math.sin(phase + 1.4) * amp * 1.25,
        cx + pr * 1.2,
        yBase - 2.5 - Math.sin(phase) * amp * 0.8
      );
      ctx.lineTo(cx + pr * 1.2, cy + pr * 1.2);
      ctx.lineTo(cx - pr * 1.2, cy + pr * 1.2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = strata[i];
      ctx.beginPath();
      ctx.moveTo(cx - pr * 1.2, yBase + Math.sin(phase) * amp);
      ctx.bezierCurveTo(
        cx - pr * 0.45,
        yBase - Math.cos(phase) * amp * 1.25,
        cx + pr * 0.38,
        yBase + Math.sin(phase + 1.4) * amp * 1.25,
        cx + pr * 1.2,
        yBase - Math.sin(phase) * amp * 0.8
      );
      ctx.lineTo(cx + pr * 1.2, cy + pr * 1.2);
      ctx.lineTo(cx - pr * 1.2, cy + pr * 1.2);
      ctx.closePath();
      ctx.fill();
    }

    const rimShade = ctx.createRadialGradient(
      cx - pr * 0.28,
      cy - pr * 0.28,
      pr * 0.2,
      cx,
      cy,
      pr * 1.05
    );
    rimShade.addColorStop(0, 'rgba(255, 252, 240, 0.14)');
    rimShade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    rimShade.addColorStop(1, 'rgba(14, 18, 36, 0.26)');
    ctx.fillStyle = rimShade;
    ctx.fillRect(cx - pr, cy - pr, pr * 2, pr * 2);

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
    ctx.rotate(this.portal.angle + Math.PI * 0.25);

    if (!this.portal.active) {
      ctx.strokeStyle = 'rgba(232, 217, 190, 0.44)';
      ctx.lineWidth = 1.7;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 15.5 * scale, 10.5 * scale, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(232, 217, 190, 0.24)';
      ctx.beginPath();
      ctx.arc(0, 0, 3.6 * scale, 0, TAU);
      ctx.fill();
    } else {
      const pulseScale = this.reducedMotion ? 1 : 1 + Math.sin(this.portal.pulse) * 0.08;
      ctx.scale(pulseScale, pulseScale);

      const glow = ctx.createRadialGradient(0, 0, 6 * scale, 0, 0, 29 * scale);
      glow.addColorStop(0, 'rgba(255, 241, 186, 0.52)');
      glow.addColorStop(0.55, 'rgba(243, 194, 79, 0.2)');
      glow.addColorStop(1, 'rgba(243, 194, 79, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 29 * scale, 0, TAU);
      ctx.fill();

      ctx.fillStyle = 'rgba(8, 10, 22, 0.42)';
      ctx.beginPath();
      ctx.ellipse(2.5 * scale, 3.5 * scale, 19 * scale, 12.5 * scale, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#FFF3D1';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18.5 * scale, 12.2 * scale, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#F3C24F';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14.5 * scale, 9.2 * scale, 0, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = '#FFF8E0';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11.4 * scale, 7.1 * scale, 0, 0, TAU);
      ctx.stroke();

      ctx.fillStyle = '#1E243B';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9.8 * scale, 5.8 * scale, 0, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawFivePointPaperStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outerR: number,
    mainHex: string,
    highlightHex: string,
    shadowHex: string,
    withCutoutShadow: boolean
  ): void {
    const innerR = outerR * 0.44;
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });
    }

    if (withCutoutShadow) {
      ctx.fillStyle = 'rgba(10, 14, 28, 0.34)';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const px = pts[i].x + 2;
        const py = pts[i].y + 3;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = mainHex;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
      else ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = highlightHex;
    for (let i = 0; i < 10; i += 2) {
      const next = pts[(i + 1) % 10];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(pts[i].x, pts[i].y);
      ctx.lineTo(next.x, next.y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = shadowHex;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = 1; i < 10; i += 2) {
      ctx.moveTo(x, y);
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }

  private drawStar(x: number, y: number, scale: number): void {
    const ctx = this.ctx;
    const s = scale * (this.outerRadius / 148);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    ctx.fillStyle = 'rgba(243, 194, 79, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, 14.5, 0, TAU);
    ctx.fill();

    this.drawFivePointPaperStar(
      ctx,
      0,
      0,
      11.5,
      '#F3C24F',
      'rgba(255, 245, 196, 0.65)',
      'rgba(176, 122, 24, 0.45)',
      true
    );

    ctx.restore();
  }

  private drawHazard(x: number, y: number, h: ActiveHazard, scale: number): void {
    const ctx = this.ctx;
    const sz = h.size * scale;

    ctx.save();
    ctx.translate(x, y);

    if (h.type === 'panel') {
      const travelDir = h.speed >= 0 ? h.angle + Math.PI / 2 : h.angle - Math.PI / 2;
      ctx.rotate(travelDir);

      ctx.save();
      ctx.translate(2.5, 4);
      ctx.fillStyle = 'rgba(8, 10, 22, 0.42)';
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.78, 0, TAU);
      ctx.moveTo(0, -sz * 0.75);
      ctx.lineTo(-sz * 2.45, 0);
      ctx.lineTo(0, sz * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#F5E3BE';
      ctx.beginPath();
      ctx.moveTo(sz * 0.15, -sz * 0.78);
      ctx.lineTo(-sz * 2.35, -sz * 0.56);
      ctx.lineTo(-sz * 1.45, -sz * 0.14);
      ctx.lineTo(-sz * 2.65, 0.08 * sz);
      ctx.lineTo(-sz * 1.5, sz * 0.28);
      ctx.lineTo(-sz * 2.15, sz * 0.65);
      ctx.lineTo(sz * 0.15, sz * 0.78);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#E8A848';
      ctx.beginPath();
      ctx.moveTo(sz * 0.1, -sz * 0.56);
      ctx.lineTo(-sz * 1.45, -sz * 0.34);
      ctx.lineTo(-sz * 1.0, 0);
      ctx.lineTo(-sz * 1.55, sz * 0.34);
      ctx.lineTo(sz * 0.1, sz * 0.56);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#8F8073';
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.78, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#B1A294';
      ctx.beginPath();
      ctx.moveTo(-sz * 0.45, -sz * 0.48);
      ctx.lineTo(sz * 0.42, -sz * 0.45);
      ctx.lineTo(sz * 0.1, sz * 0.25);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(240, 146, 118, 0.75)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.82, 0, TAU);
      ctx.stroke();
    } else if (h.type === 'asteroid') {
      ctx.rotate(h.spin);

      const pts: Array<{ x: number; y: number }> = [];
      const count = 8;
      const mults = [1.05, 0.82, 1.0, 0.88, 1.06, 0.78, 0.96, 0.84];
      for (let i = 0; i < count; i++) {
        const ang = (i * TAU) / count;
        const r = sz * mults[i];
        pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
      }

      ctx.fillStyle = 'rgba(8, 10, 22, 0.45)';
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const px = pts[i].x + 2.5;
        const py = pts[i].y + 4;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#9E9185';
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();
      ctx.fill();

      const cxOff = sz * 0.08;
      const cyOff = -sz * 0.06;
      const facetFills = [
        '#B8ABA0',
        '#7E7267',
        '#A99C8F',
        '#695F56',
        '#8E8176',
        '#C0B4A8',
        '#786C62',
        '#9A8D81',
      ];
      for (let i = 0; i < count; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % count];
        ctx.fillStyle = facetFills[i];
        ctx.beginPath();
        ctx.moveTo(cxOff, cyOff);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(227, 128, 104, 0.62)';
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.rotate(h.spin);

      ctx.fillStyle = 'rgba(8, 10, 22, 0.44)';
      ctx.beginPath();
      ctx.moveTo(2.5, -sz * 1.0 + 4);
      ctx.lineTo(sz * 0.88 + 2.5, 4);
      ctx.lineTo(2.5, sz * 1.0 + 4);
      ctx.lineTo(-sz * 0.88 + 2.5, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#D47152';
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.0);
      ctx.lineTo(0, sz * 1.0);
      ctx.lineTo(-sz * 0.88, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#AD4D32';
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.0);
      ctx.lineTo(sz * 0.88, 0);
      ctx.lineTo(0, sz * 1.0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(250, 243, 230, 0.78)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([2.5, 2.5]);
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.62);
      ctx.lineTo(sz * 0.54, 0);
      ctx.lineTo(0, sz * 0.62);
      ctx.lineTo(-sz * 0.54, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private drawTrail(): void {
    const len = this.satTrail.length;
    if (len < 3) return;
    const ctx = this.ctx;
    const satDef = getSatelliteById(this.satelliteId);
    const scale = (this.outerRadius / 148) * (0.75 + satDef.sizeScale * 0.25);

    const leftPts: Array<{ x: number; y: number }> = [];
    const rightPts: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < len; i++) {
      const p = this.satTrail[i];
      const prev = this.satTrail[Math.max(0, i - 1)];
      const next = this.satTrail[Math.min(len - 1, i + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      const ratio = i / (len - 1);
      const flutter = Math.sin(i * 0.55 - this.elapsedClock * 5) * 1.2 * (1 - ratio);
      const halfW = (0.7 + ratio * 3.8) * scale;
      leftPts.push({ x: p.x + nx * (halfW + flutter), y: p.y + ny * (halfW + flutter) });
      rightPts.push({ x: p.x - nx * (halfW - flutter), y: p.y - ny * (halfW - flutter) });
    }

    const buildRibbonPath = (ox: number, oy: number) => {
      ctx.beginPath();
      ctx.moveTo(leftPts[0].x + ox, leftPts[0].y + oy);
      for (let i = 1; i < len; i++) {
        ctx.lineTo(leftPts[i].x + ox, leftPts[i].y + oy);
      }
      for (let i = len - 1; i >= 0; i--) {
        ctx.lineTo(rightPts[i].x + ox, rightPts[i].y + oy);
      }
      ctx.closePath();
    };

    // Distinct paper ribbon tint per satellite class
    let ribbonHex = this.satTargetOrbit === 0 ? '#D4465C' : '#B83453';
    if (this.satelliteId === 'tinny') {
      ribbonHex = '#5EB892';
    } else if (this.satelliteId === 'heavy') {
      ribbonHex = '#E3A43B';
    } else if (this.satelliteId === 'nano_stopper') {
      ribbonHex = '#A588D8';
    }

    ctx.save();
    buildRibbonPath(2, 3.5);
    ctx.fillStyle = 'rgba(8, 10, 22, 0.32)';
    ctx.fill();

    buildRibbonPath(0, 0);
    ctx.fillStyle = ribbonHex;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 240, 232, 0.36)';
    ctx.lineWidth = 1.1 * scale;
    ctx.beginPath();
    for (let i = 1; i < len; i++) {
      const p = this.satTrail[i];
      if (i === 1) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    ctx.restore();
  }

  private drawSatellite(): void {
    const ctx = this.ctx;
    const satDef = getSatelliteById(this.satelliteId);
    const scale = (this.outerRadius / 148) * satDef.sizeScale;

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

    ctx.save();
    ctx.translate(sx, sy);

    // Full-obstacle Shield Bubble (renders in world space around craft)
    if (this.shieldActive && this.satWarpProgress === 0) {
      const baseBubbleR = Math.max(15, 20.5 * (this.outerRadius / 148) * (0.78 + satDef.sizeScale * 0.22));
      ctx.save();
      ctx.fillStyle = 'rgba(130, 208, 244, 0.16)';
      ctx.beginPath();
      ctx.arc(0, 0, baseBubbleR, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = '#9EDDF7';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = -this.elapsedClock * 18;
      ctx.beginPath();
      ctx.arc(0, 0, baseBubbleR, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.rotate(tangentAngle);

    const stretchX = (1 - this.satSquash * 0.18) * drawScale;
    const stretchY = (1 + this.satSquash * 0.22) * drawScale;
    ctx.scale(stretchX, stretchY);

    // Heavy satellite golden armor arc indicator when cruising on the protected outer orbit
    if (satDef.outerImmune && this.satTargetOrbit === 1 && this.satWarpProgress === 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(243, 194, 79, 0.85)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 17, -Math.PI * 0.88, -Math.PI * 0.12);
      ctx.stroke();
      ctx.restore();
    }

    // Paper cutout drop shadow
    ctx.save();
    ctx.translate(2.4, 3.8);
    ctx.fillStyle = 'rgba(8, 10, 22, 0.42)';
    ctx.fillRect(-15.5, -4, 31, 8);
    this.fillRoundedRect(ctx, -5.2, -9, 10.4, 18, 3.6, 'rgba(8, 10, 22, 0.42)');
    ctx.restore();

    // Palette per satellite variant
    let wingTop = '#A8C8DF';
    let wingBottom = '#7E9FBE';
    let hullMain = '#F5C4B6';
    let hullLight = '#FAF3E6';
    let knotColor = '#C23B58';

    if (this.satelliteId === 'tinny') {
      wingTop = '#A8DFC4';
      wingBottom = '#6BAE8E';
      hullMain = '#F6DF9C';
      hullLight = '#FFF8E2';
      knotColor = '#5EB892';
    } else if (this.satelliteId === 'heavy') {
      wingTop = '#F2C763';
      wingBottom = '#C28F2B';
      hullMain = '#637FA8';
      hullLight = '#92B0D4';
      knotColor = '#E3A43B';
    } else if (this.satelliteId === 'nano_stopper') {
      wingTop = '#D7C2F2';
      wingBottom = '#9F84C9';
      hullMain = '#F7E7C6';
      hullLight = '#FFFBF0';
      knotColor = '#A588D8';
    }

    // Left & right folded origami solar wings
    ctx.fillStyle = wingTop;
    ctx.fillRect(-15.5, -4, 10.5, 4);
    ctx.fillRect(5, -4, 10.5, 4);
    ctx.fillStyle = wingBottom;
    ctx.fillRect(-15.5, 0, 10.5, 4);
    ctx.fillRect(5, 0, 10.5, 4);

    // Wing crease lines
    ctx.strokeStyle = 'rgba(39, 50, 79, 0.35)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(-10.5, -4);
    ctx.lineTo(-10.5, 4);
    ctx.moveTo(10.5, -4);
    ctx.lineTo(10.5, 4);
    ctx.stroke();

    // Folded capsule hull
    this.fillRoundedRect(ctx, -5.2, -8.8, 10.4, 17.6, 3.4, hullMain);
    this.fillRoundedRect(ctx, -4.4, -7.8, 4.4, 15.6, 2.2, hullLight);

    // Heavy armor trim stripe
    if (this.satelliteId === 'heavy') {
      ctx.fillStyle = '#F3C24F';
      ctx.fillRect(-5.2, -1.2, 10.4, 2.6);
    }

    // Nose indicator dot
    ctx.fillStyle = this.satTargetOrbit === 0 ? '#F3C24F' : '#4D78A8';
    ctx.beginPath();
    ctx.arc(0, -3.8, 2.4, 0, TAU);
    ctx.fill();

    // Tail ribbon knot
    ctx.fillStyle = knotColor;
    ctx.fillRect(-2.4, 7.6, 4.8, 2.2);

    ctx.restore();
  }

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
