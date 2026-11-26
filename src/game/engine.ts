import {
  BoosterKind,
  GameOverReason,
  GameScreen,
  HazardKind,
  HudSnapshot,
  LevelConfig,
  LevelLoadout,
  OrbitLane,
  PlanetPalette,
  SatelliteId,
  TrailId,
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
  magnetic: boolean;
  pulled: boolean;
  x: number;
  y: number;
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

interface ActiveSolarFlare {
  orbit: OrbitLane;
  period: number;
  telegraphDuration: number;
  activeDuration: number;
  timer: number;
  state: 'idle' | 'telegraph' | 'active';
  alternating: boolean;
  sweepAngle: number;
}

interface ActiveWormholeGate {
  id: string;
  orbit: OrbitLane;
  angle: number;
  targetOrbit: OrbitLane;
  targetAngle: number;
  color: string;
  cooldown: number;
}

interface ActiveDebrisRing {
  radius: number;
  maxRadius: number;
  speed: number;
  gapAngle: number;
  gapHalfWidth: number;
  deflected: boolean;
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
  onBoosterUsed: (kind: BoosterKind) => void;
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
  private trailId: TrailId = 'classic';
  private shieldActive = false;
  private chronoAvailable = false;
  private chronoUsed = false;
  private chronoRemaining = 0;
  private magnetAvailable = false;
  private magnetUsed = false;
  private magnetRemaining = 0;
  private timerDisabled = false;
  private timeRemaining: number | null = null;

  // Satellite state
  private satTargetOrbit: OrbitLane = 1;
  private satCurrentRadius = 148;
  private satAngle = -Math.PI / 2;
  private orbitDirection: 1 | -1 = 1;
  private satSquash = 0;
  private satTrail: TrailPoint[] = [];
  private satInGravityWell = false;
  private satGravityMode: 'none' | 'boost' | 'drag' = 'none';
  private satWarpProgress = 0;
  private satWarpStartX = 0;
  private satWarpStartY = 0;
  private phaseInvulnTimer = 0;
  private warpGraceTimer = 0;

  // Level entities
  private stars: ActiveStar[] = [];
  private hazards: ActiveHazard[] = [];
  private moons: ActiveMoon[] = [];
  private solarFlares: ActiveSolarFlare[] = [];
  private wormholeGates: ActiveWormholeGate[] = [];
  private debrisRings: ActiveDebrisRing[] = [];
  private portal: ActivePortal = {
    orbit: 0,
    angle: 0,
    speed: 0,
    active: false,
    pulse: 0,
    openAnim: 0,
  };

  // Multi-phase Boss state
  private bossPhase = 0;
  private bossTotalPhases = 0;
  private bossAlert: string | null = null;
  private bossAlertTimer = 0;
  private bossRingTimer = 0;
  private polarityFlipCountdown = 0;
  private polarityFlipTriggered = false;

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

  // Pre-allocated pools, starfield & cosmic space backdrop sprite
  private bgStars: BgStar[] = [];
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private cosmicBgImage: HTMLImageElement | null = null;
  private cosmicBgLoaded = false;

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
    this.initCosmicBackdrop();
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

  private initCosmicBackdrop(): void {
    if (typeof Image === 'undefined') return;
    const img = new Image();
    img.onload = () => {
      this.cosmicBgLoaded = true;
    };
    img.src = './assets/cosmic/lobby-bg.png';
    this.cosmicBgImage = img;
  }

  private initStarfield(): void {
    this.bgStars = [];
    const starTints = ['#FFF6A8', '#7CEBFF', '#FFFFFF', '#FFD84D', '#B6E6FF'];
    for (let i = 0; i < 48; i++) {
      const s1 = Math.sin(i * 91.7 + 13.3) * 43758.5453;
      const s2 = Math.sin(i * 47.3 + 71.1) * 43758.5453;
      const s3 = Math.sin(i * 23.9 + 5.7) * 43758.5453;
      const nx = s1 - Math.floor(s1);
      const ny = s2 - Math.floor(s2);
      const sz = s3 - Math.floor(s3);
      this.bgStars.push({
        nx,
        ny,
        r: i < 14 ? 3.4 + sz * 3.6 : 1.0 + sz * 1.6,
        alpha: i < 14 ? 0.65 + sz * 0.32 : 0.35 + sz * 0.45,
        phase: sz * TAU,
        isStarShape: i < 14,
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
    this.trailId = loadout?.trailId ?? 'classic';
    this.shieldActive = Boolean(loadout?.shieldActive);
    this.chronoAvailable = Boolean(loadout?.chronoAvailable);
    this.chronoUsed = false;
    this.chronoRemaining = 0;
    this.magnetAvailable = Boolean(loadout?.magnetAvailable);
    this.magnetUsed = false;
    this.magnetRemaining = 0;

    const satDef = getSatelliteById(this.satelliteId);
    this.timerDisabled = this.level.timeLimit !== null && satDef.disablesTimer;
    this.timeRemaining =
      this.level.timeLimit !== null && !this.timerDisabled ? this.level.timeLimit : null;

    this.satTargetOrbit = this.level.startOrbit;
    this.satCurrentRadius = this.level.startOrbit === 0 ? this.innerRadius : this.outerRadius;
    this.satAngle = this.level.startAngle;
    this.orbitDirection = 1;
    this.satSquash = 0;
    this.satTrail = [];
    this.satInGravityWell = false;
    this.satGravityMode = 'none';
    this.satWarpProgress = 0;
    this.phaseInvulnTimer = 0;
    this.warpGraceTimer = 0;

    this.stars = this.level.stars.map((s, idx) => {
      const r = s.orbit === 0 ? this.innerRadius : this.outerRadius;
      return {
        orbit: s.orbit,
        angle: s.angle,
        speed: s.speed ?? 0,
        collected: false,
        bobPhase: idx * 1.7,
        magnetic: Boolean(s.magnetic),
        pulled: false,
        x: this.centerX + Math.cos(s.angle) * r,
        y: this.centerY + Math.sin(s.angle) * r,
      };
    });

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

    this.solarFlares = (this.level.solarFlares ?? []).map((f) => ({
      orbit: f.orbit,
      period: f.period,
      telegraphDuration: f.telegraphDuration,
      activeDuration: f.activeDuration,
      timer: f.initialDelay,
      state: 'idle',
      alternating: Boolean(f.alternating),
      sweepAngle: 0,
    }));

    this.wormholeGates = (this.level.wormholeGates ?? []).map((g) => ({
      id: g.id,
      orbit: g.orbit,
      angle: g.angle,
      targetOrbit: g.targetOrbit,
      targetAngle: g.targetAngle,
      color: g.color ?? '#3CF2FF',
      cooldown: 0,
    }));

    this.debrisRings = [];

    // Initialize Multi-Phase Boss Encounter if present
    if (this.level.boss) {
      this.bossPhase = 1;
      this.bossTotalPhases = this.level.boss.phases;
      this.bossAlert = `${this.level.boss.title} · Phase 1/${this.level.boss.phases}`;
      this.bossAlertTimer = 2.4;
      this.bossRingTimer = this.level.boss.ringInterval ?? 5.0;
      this.polarityFlipCountdown = 0;
      this.polarityFlipTriggered = false;
    } else {
      this.bossPhase = 0;
      this.bossTotalPhases = 0;
      this.bossAlert = null;
      this.bossAlertTimer = 0;
      this.bossRingTimer = 0;
      this.polarityFlipCountdown = 0;
      this.polarityFlipTriggered = false;
    }

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

  /** Activate Slow-Mo Chrono Pulse booster (3.5s world slow-down to 42%) */
  activateChronoPulse(): void {
    if (
      this.screen !== 'PLAYING' ||
      !this.chronoAvailable ||
      this.chronoUsed ||
      this.chronoRemaining > 0 ||
      this.satWarpProgress > 0
    ) {
      return;
    }

    this.chronoUsed = true;
    this.chronoRemaining = 3.5;
    spaceAudio.playChronoSlow();

    const sx = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    const sy = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
    this.spawnShockwave(sx, sy, 92, '#6CE5FF');
    this.spawnBurst(sx, sy, '#9CF4FF', 16);

    this.callbacks.onBoosterUsed('chrono');
    this.emitHudIfNeeded();
  }

  /** Activate Star Magnet booster (6s arena-wide magnetic star vacuum) */
  activateStarMagnet(): void {
    if (
      this.screen !== 'PLAYING' ||
      !this.magnetAvailable ||
      this.magnetUsed ||
      this.magnetRemaining > 0 ||
      this.satWarpProgress > 0
    ) {
      return;
    }

    this.magnetUsed = true;
    this.magnetRemaining = 6.0;
    spaceAudio.playMagnetPulse();

    const sx = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    const sy = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
    this.spawnShockwave(sx, sy, 110, '#FF7BF2');
    this.spawnBurst(sx, sy, '#FFE45C', 16);

    this.callbacks.onBoosterUsed('magnet');
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
    const satDef = getSatelliteById(this.satelliteId);

    // Phase Dasher grants brief invulnerability window on every shift
    if (satDef.phaseDashSeconds && satDef.phaseDashSeconds > 0) {
      this.phaseInvulnTimer = satDef.phaseDashSeconds;
      this.spawnShockwave(sx, sy, 46, '#C57BFF');
    } else {
      const accent = toInner ? '#F3C24F' : '#9EC0DA';
      this.spawnShockwave(sx, sy, 32, accent);
    }

    // Trigger Magnetic Star Clusters near the shift point to curve smoothly toward the craft!
    const magneticTriggerDist = this.outerRadius * 1.05;
    for (let i = 0; i < this.stars.length; i++) {
      const st = this.stars[i];
      if (st.collected || !st.magnetic || st.pulled) continue;
      if (Math.hypot(st.x - sx, st.y - sy) < magneticTriggerDist) {
        st.pulled = true;
        this.spawnShockwave(st.x, st.y, 28, '#FF88F5');
        this.spawnBurst(st.x, st.y, '#7CEBFF', 6);
      }
    }

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
        satDef.phaseDashSeconds ? '#D8A3FF' : toInner ? '#F6D372' : '#FAF3E6'
      );
    }

    this.emitHudIfNeeded();
  }

  private emitHudIfNeeded(): void {
    const timerBucket =
      this.timeRemaining === null ? -1 : Math.ceil(this.timeRemaining * 5);
    const chronoBucket = Math.ceil(this.chronoRemaining * 5);
    const magnetBucket = Math.ceil(this.magnetRemaining * 5);

    let flareWarningLane: OrbitLane | null = null;
    let flareActiveLane: OrbitLane | null = null;
    for (let i = 0; i < this.solarFlares.length; i++) {
      const f = this.solarFlares[i];
      if (f.state === 'active') flareActiveLane = f.orbit;
      else if (f.state === 'telegraph') flareWarningLane = f.orbit;
    }

    const activeAlert = this.bossAlertTimer > 0 ? this.bossAlert : null;
    const phaseActive = this.phaseInvulnTimer > 0;

    const key = `${this.level.id}|${this.starsCollected}|${this.stars.length}|${this.portal.active ? 1 : 0}|${this.satTargetOrbit}|${this.satInGravityWell ? 1 : 0}|${this.satGravityMode}|${this.shiftCount}|${timerBucket}|${this.timerDisabled ? 1 : 0}|${this.shieldActive ? 1 : 0}|${this.satelliteId}|${chronoBucket}|${this.chronoUsed ? 1 : 0}|${magnetBucket}|${this.magnetUsed ? 1 : 0}|${phaseActive ? 1 : 0}|${flareWarningLane}|${flareActiveLane}|${this.orbitDirection}|${this.bossPhase}|${activeAlert ?? ''}`;
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
      chronoRemaining: this.chronoRemaining,
      chronoUsed: this.chronoUsed,
      magnetRemaining: this.magnetRemaining,
      magnetUsed: this.magnetUsed,
      phaseInvulnActive: phaseActive,
      flareWarningLane,
      flareActiveLane,
      orbitReversed: this.orbitDirection === -1,
      bossPhase: this.bossPhase,
      bossTotalPhases: this.bossTotalPhases,
      bossAlert: activeAlert,
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
    this.planetRotation += dt * 0.16 * this.orbitDirection;
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

    // Active In-Run Booster timers (real-time countdown)
    if (this.chronoRemaining > 0) {
      this.chronoRemaining = Math.max(0, this.chronoRemaining - dt);
    }
    if (this.magnetRemaining > 0) {
      this.magnetRemaining = Math.max(0, this.magnetRemaining - dt);
    }
    if (this.phaseInvulnTimer > 0) {
      this.phaseInvulnTimer = Math.max(0, this.phaseInvulnTimer - dt);
    }
    if (this.warpGraceTimer > 0) {
      this.warpGraceTimer = Math.max(0, this.warpGraceTimer - dt);
    }
    if (this.bossAlertTimer > 0) {
      this.bossAlertTimer = Math.max(0, this.bossAlertTimer - dt);
    }

    // Slow-Mo Chrono Pulse reduces world simulation speed to 42% while keeping lane shifts snappy
    const worldScale = this.chronoRemaining > 0 ? 0.42 : 1.0;
    const simDt = dt * worldScale;

    this.flightTime += dt;
    if (this.satSquash > 0) {
      this.satSquash = Math.max(0, this.satSquash - dt * 3.6);
    }

    // 0. Sector 3+ Countdown Timer (slowed by Chrono Pulse, disabled by Nano Stopper)
    if (this.timeRemaining !== null) {
      this.timeRemaining = Math.max(0, this.timeRemaining - simDt);
      if (this.timeRemaining <= 0) {
        const satX = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
        const satY = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;
        this.triggerFailure('timeout', satX, satY);
        return;
      }
    }

    // 0.5 Boss Polarity Flip Telegraph Countdown & Expanding Debris Ring Spawner
    if (this.level.boss) {
      if (this.polarityFlipCountdown > 0) {
        this.polarityFlipCountdown -= simDt;
        if (this.polarityFlipCountdown <= 0) {
          this.polarityFlipCountdown = 0;
          this.orbitDirection = this.orbitDirection === 1 ? -1 : 1;
          this.bossAlert = 'ORBIT REVERSED!';
          this.bossAlertTimer = 2.0;
          spaceAudio.playBossPhase();
          this.spawnShockwave(this.centerX, this.centerY, this.outerRadius * 1.15, '#D27BFF');
          this.spawnBurst(this.centerX, this.centerY, '#7CEBFF', 16);
        }
      }

      const hasDebrisRingEvent = this.level.boss.events.includes('debris_ring');
      if (hasDebrisRingEvent && this.bossPhase >= 2) {
        this.bossRingTimer -= simDt;
        if (this.bossRingTimer <= 0) {
          this.bossRingTimer = this.level.boss.ringInterval ?? 4.8;
          this.spawnBossDebrisRing();
        }
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
      m.angle += m.speed * simDt;
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

    // 2. Spring interpolation between inner & outer rings (stays snappy even in slow-mo)
    const baseTargetR = (this.satTargetOrbit === 0 ? this.innerRadius : this.outerRadius) + radialOffset;
    this.satCurrentRadius += (baseTargetR - this.satCurrentRadius) * Math.min(1, dt * 13);

    // 3. Keplerian angular speed modulated by gravity wells, boss polarity direction, and chrono pulse
    const baseSpeed = this.satTargetOrbit === 0 ? this.level.innerSpeed : this.level.outerSpeed;
    const craftChronoScale = this.chronoRemaining > 0 ? 0.58 : 1.0;
    const bossPhasePace = this.bossPhase >= 3 ? 1.08 : this.bossPhase === 2 ? 1.04 : 1.0;
    this.satAngle +=
      baseSpeed * speedMultiplier * this.orbitDirection * bossPhasePace * craftChronoScale * dt;

    let satX = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
    let satY = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;

    // 3.5 Wormhole Gates (bidirectional teleport to opposite side of the orbit)
    const gateTriggerR = Math.max(18, this.outerRadius * 0.13);
    for (let i = 0; i < this.wormholeGates.length; i++) {
      const g = this.wormholeGates[i];
      if (g.cooldown > 0) {
        g.cooldown = Math.max(0, g.cooldown - dt);
        continue;
      }

      const rA = g.orbit === 0 ? this.innerRadius : this.outerRadius;
      const ax = this.centerX + Math.cos(g.angle) * rA;
      const ay = this.centerY + Math.sin(g.angle) * rA;

      const rB = g.targetOrbit === 0 ? this.innerRadius : this.outerRadius;
      const bx = this.centerX + Math.cos(g.targetAngle) * rB;
      const by = this.centerY + Math.sin(g.targetAngle) * rB;

      let warped = false;
      let outOrbit: OrbitLane = g.targetOrbit;
      let outAngle = g.targetAngle;
      let inX = ax;
      let inY = ay;
      let outX = bx;
      let outY = by;

      if (Math.hypot(satX - ax, satY - ay) < gateTriggerR) {
        warped = true;
      } else if (Math.hypot(satX - bx, satY - by) < gateTriggerR) {
        warped = true;
        outOrbit = g.orbit;
        outAngle = g.angle;
        inX = bx;
        inY = by;
        outX = ax;
        outY = ay;
      }

      if (warped) {
        g.cooldown = 1.45;
        this.satTargetOrbit = outOrbit;
        this.satCurrentRadius = outOrbit === 0 ? this.innerRadius : this.outerRadius;
        this.satAngle = outAngle;
        this.satTrail = [];
        this.warpGraceTimer = 0.45;

        satX = this.centerX + Math.cos(this.satAngle) * this.satCurrentRadius;
        satY = this.centerY + Math.sin(this.satAngle) * this.satCurrentRadius;

        spaceAudio.playWarpGate();
        this.spawnShockwave(inX, inY, 44, g.color);
        this.spawnBurst(inX, inY, g.color, 10);
        this.spawnShockwave(outX, outY, 50, '#FFFFFF');
        this.spawnBurst(outX, outY, g.color, 14);
        break;
      }
    }

    this.recordTrail(satX, satY);

    // 4. Collectible Stars (with Magnetic Clusters, Magnet Probe craft, & Star Magnet booster)
    const satDef = getSatelliteById(this.satelliteId);
    const basePickupR = Math.max(23, this.outerRadius * 0.17);
    const starPickupRadius = basePickupR * (satDef.magnetRangeMult ?? 1.0);
    const passivePullRadius =
      this.magnetRemaining > 0
        ? this.outerRadius * 2.6
        : satDef.magnetRangeMult && satDef.magnetRangeMult > 1.3
          ? this.outerRadius * 0.62
          : 0;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.collected) continue;
      if (s.speed !== 0 && !s.pulled) s.angle += s.speed * simDt;
      s.bobPhase += dt * 2.8;

      if (!s.pulled) {
        const sr = s.orbit === 0 ? this.innerRadius : this.outerRadius;
        s.x = this.centerX + Math.cos(s.angle) * sr;
        s.y = this.centerY + Math.sin(s.angle) * sr;

        if (passivePullRadius > 0 && Math.hypot(satX - s.x, satY - s.y) < passivePullRadius) {
          s.pulled = true;
        }
      } else {
        const pullLerp = Math.min(1, dt * (this.magnetRemaining > 0 ? 8.0 : 6.4));
        s.x += (satX - s.x) * pullLerp;
        s.y += (satY - s.y) * pullLerp;
      }

      if (Math.hypot(satX - s.x, satY - s.y) < starPickupRadius) {
        s.collected = true;
        this.starsCollected++;
        spaceAudio.playStar(this.starsCollected - 1);
        this.spawnBurst(s.x, s.y, s.magnetic ? '#FF90F0' : '#F3C24F', 14);
        this.spawnShockwave(s.x, s.y, 36, '#FFF1AD');

        // Advance Multi-Phase Boss Encounters on star collection milestones
        this.checkBossPhaseTransition();

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

    const isInvulnerable = this.phaseInvulnTimer > 0 || this.warpGraceTimer > 0;

    // 5. Space Junk Hazards & Satellite / Shield collision rules
    const satHitRadius = Math.max(4.0, this.outerRadius * 0.042 * satDef.hitboxScale);
    const sizeScale = this.outerRadius / 148;

    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      h.angle += h.speed * simDt;
      h.spin += simDt * 1.15;
      if (h.deflectCooldown > 0) {
        h.deflectCooldown = Math.max(0, h.deflectCooldown - dt);
      }

      const hr = h.orbit === 0 ? this.innerRadius : this.outerRadius;
      const hx = this.centerX + Math.cos(h.angle) * hr;
      const hy = this.centerY + Math.sin(h.angle) * hr;
      const hazardHitRadius = h.size * sizeScale * 0.64;

      if (Math.hypot(satX - hx, satY - hy) < satHitRadius + hazardHitRadius) {
        if (this.shieldActive || isInvulnerable) {
          if (h.deflectCooldown <= 0) {
            h.deflectCooldown = 0.55;
            this.spawnBurst(hx, hy, this.phaseInvulnTimer > 0 ? '#D48BFF' : '#9EC0DA', 10);
            this.spawnShockwave(satX, satY, 34, this.phaseInvulnTimer > 0 ? '#D48BFF' : '#A8D8F0');
            spaceAudio.playShift(false);
          }
          continue;
        }

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

    // 5.5 Periodic Solar Flare Sweeps
    for (let i = 0; i < this.solarFlares.length; i++) {
      const f = this.solarFlares[i];
      f.timer -= simDt;
      f.sweepAngle += simDt * (f.state === 'active' ? 6.5 : 2.2);

      if (f.timer <= 0) {
        if (f.state === 'idle') {
          f.state = 'telegraph';
          f.timer = f.telegraphDuration;
          spaceAudio.playSolarFlareWarn();
        } else if (f.state === 'telegraph') {
          f.state = 'active';
          f.timer = f.activeDuration;
          spaceAudio.playSolarFlareBlast();
          const fr = f.orbit === 0 ? this.innerRadius : this.outerRadius;
          this.spawnShockwave(this.centerX, this.centerY, fr, '#FF6824');
        } else {
          f.state = 'idle';
          const idleTime = Math.max(1.8, f.period - f.telegraphDuration - f.activeDuration);
          f.timer = idleTime;
          if (f.alternating) {
            f.orbit = f.orbit === 0 ? 1 : 0;
          }
        }
      }

      if (f.state === 'active') {
        const flareR = f.orbit === 0 ? this.innerRadius : this.outerRadius;
        const onFlareLane = Math.abs(this.satCurrentRadius - flareR) < this.outerRadius * 0.13;
        if (onFlareLane) {
          const immuneOuter = satDef.outerImmune && f.orbit === 1;
          if (!this.shieldActive && !isInvulnerable && !immuneOuter) {
            this.triggerFailure('flare', satX, satY);
            return;
          }
        }
      }
    }

    // 5.6 Boss Expanding Debris Rings (dodge through the glowing safe-gap arc or shield/phase!)
    for (let i = this.debrisRings.length - 1; i >= 0; i--) {
      const ring = this.debrisRings[i];
      ring.radius += ring.speed * simDt;
      if (ring.radius >= ring.maxRadius) {
        this.debrisRings.splice(i, 1);
        continue;
      }

      const ringThickness = Math.max(7, this.outerRadius * 0.055);
      if (Math.abs(this.satCurrentRadius - ring.radius) < ringThickness + satHitRadius) {
        // Check whether satellite angle falls inside the wide safe passage gap
        let angDiff = ((this.satAngle - ring.gapAngle + Math.PI) % TAU) - Math.PI;
        if (angDiff < -Math.PI) angDiff += TAU;
        const inSafeGap = Math.abs(angDiff) <= ring.gapHalfWidth;

        if (!inSafeGap) {
          const immuneOuter =
            satDef.outerImmune &&
            Math.abs(this.satCurrentRadius - this.outerRadius) < this.outerRadius * 0.16;
          if (this.shieldActive || isInvulnerable || immuneOuter) {
            if (!ring.deflected) {
              ring.deflected = true;
              this.spawnBurst(satX, satY, '#7CEBFF', 10);
              this.spawnShockwave(satX, satY, 36, '#7CEBFF');
            }
          } else {
            this.triggerFailure('collision', satX, satY);
            return;
          }
        }
      }
    }

    // 6. Goal Wormhole Portal
    if (this.portal.speed !== 0) {
      this.portal.angle += this.portal.speed * simDt;
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

  private spawnBossDebrisRing(): void {
    // Place the wide safe gap slightly ahead of the player so skilled timing or lane choice always works
    const leadAngle = this.satAngle + this.orbitDirection * (0.85 + Math.random() * 0.65);
    this.debrisRings.push({
      radius: this.planetRadius * 1.05,
      maxRadius: this.outerRadius * 1.32,
      speed: this.outerRadius * 0.36,
      gapAngle: leadAngle,
      gapHalfWidth: 0.72, // ~82 degrees wide safe passage window
      deflected: false,
    });
    spaceAudio.playSolarFlareWarn();
    this.spawnShockwave(this.centerX, this.centerY, this.planetRadius * 1.6, '#FF6838');
  }

  private checkBossPhaseTransition(): void {
    const boss = this.level.boss;
    if (!boss || this.bossPhase >= boss.phases) return;

    const total = this.stars.length;
    let targetPhase = 1;
    if (boss.phases === 2) {
      if (this.starsCollected >= Math.ceil(total / 2)) targetPhase = 2;
    } else {
      if (this.starsCollected >= Math.max(2, total - 1)) targetPhase = 3;
      else if (this.starsCollected >= 1) targetPhase = 2;
    }

    if (targetPhase <= this.bossPhase) return;
    this.bossPhase = targetPhase;
    spaceAudio.playBossPhase();
    this.spawnShockwave(this.centerX, this.centerY, this.outerRadius * 1.2, '#FF5C38');

    // Trigger signature boss twist for this phase
    if (
      boss.events.includes('polarity_flip') &&
      !this.polarityFlipTriggered &&
      this.bossPhase >= (boss.polarityFlipPhase ?? 2)
    ) {
      this.polarityFlipTriggered = true;
      this.polarityFlipCountdown = 1.35;
      this.bossAlert = `PHASE ${this.bossPhase}/${boss.phases} · POLARITY FLIP INCOMING!`;
      this.bossAlertTimer = 2.6;
    } else if (boss.events.includes('debris_ring')) {
      this.bossAlert = `PHASE ${this.bossPhase}/${boss.phases} · EXPANDING DEBRIS RING!`;
      this.bossAlertTimer = 2.6;
      this.bossRingTimer = 0.6; // Fire first ring shortly after phase shift
    } else if (boss.events.includes('solar_surge')) {
      this.bossAlert = `PHASE ${this.bossPhase}/${boss.phases} · SOLAR SURGE!`;
      this.bossAlertTimer = 2.5;
      if (this.solarFlares.length === 0) {
        this.solarFlares.push({
          orbit: this.satTargetOrbit,
          period: 5.2,
          telegraphDuration: 1.3,
          activeDuration: 1.05,
          timer: 0.7,
          state: 'idle',
          alternating: true,
          sweepAngle: 0,
        });
      }
    } else {
      this.bossAlert = `${boss.title} · PHASE ${this.bossPhase}/${boss.phases}`;
      this.bossAlertTimer = 2.2;
    }
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
  // COSMIC GLOSSY SCI-FI ARCADE RENDERER
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

    // 1. Deep royal-blue cosmic nebula base gradient
    const bgGrad = ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      this.planetRadius * 0.5,
      this.centerX,
      this.centerY,
      Math.max(this.width, this.height) * 0.82
    );
    bgGrad.addColorStop(0, '#1A34A8');
    bgGrad.addColorStop(0.55, '#0E1D73');
    bgGrad.addColorStop(1, '#070D3E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Composite the cosmic ringed-planets & space-station skyline softly behind the orbital arena
    if (this.cosmicBgLoaded && this.cosmicBgImage) {
      const img = this.cosmicBgImage;
      const iw = img.naturalWidth || 504;
      const ih = img.naturalHeight || 958;
      const coverScale = Math.max(this.width / iw, this.height / ih);
      const dw = iw * coverScale;
      const dh = ih * coverScale;
      const dx = (this.width - dw) * 0.5;
      const dy = (this.height - dh) * 0.5;

      ctx.save();
      ctx.globalAlpha = this.lowPower ? 0.42 : 0.62;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // Luminous royal-indigo arena focus veil so central planet & orbits pop cleanly
      const arenaVeil = ctx.createRadialGradient(
        this.centerX,
        this.centerY,
        this.planetRadius * 0.6,
        this.centerX,
        this.centerY,
        this.outerRadius * 1.9
      );
      arenaVeil.addColorStop(0, 'rgba(13, 28, 118, 0.72)');
      arenaVeil.addColorStop(0.65, 'rgba(10, 20, 92, 0.58)');
      arenaVeil.addColorStop(1, 'rgba(7, 13, 62, 0.25)');
      ctx.fillStyle = arenaVeil;
      ctx.fillRect(0, 0, this.width, this.height);

      // Subtle bottom dark readability scrim for HUD caption text
      const bottomScrim = ctx.createLinearGradient(0, this.height * 0.78, 0, this.height);
      bottomScrim.addColorStop(0, 'rgba(7, 11, 46, 0)');
      bottomScrim.addColorStop(1, 'rgba(7, 11, 46, 0.68)');
      ctx.fillStyle = bottomScrim;
      ctx.fillRect(0, this.height * 0.78, this.width, this.height * 0.22);
    }

    // 2. Twinkling cosmic stars & luminous bokeh motes
    const twinkleTime = this.reducedMotion ? 0 : this.elapsedClock * 1.5;
    for (let i = 0; i < this.bgStars.length; i++) {
      const st = this.bgStars[i];
      const sx = st.nx * this.width;
      const sy = st.ny * this.height;
      const distCenter = Math.hypot(sx - this.centerX, sy - this.centerY);
      if (st.isStarShape && distCenter < this.outerRadius * 1.12) {
        continue;
      }
      const mod = this.reducedMotion ? 1 : 0.72 + 0.28 * Math.sin(twinkleTime + st.phase);
      ctx.save();
      ctx.globalAlpha = st.alpha * mod;
      if (st.isStarShape) {
        if (i % 2 === 0) {
          this.drawFourPointSparkle(ctx, sx, sy, st.r * 1.35, st.tint);
        } else {
          this.drawGlowingStarShape(ctx, sx, sy, st.r * 0.95, '#FFF5A8', '#FFBC1F', false);
        }
      } else {
        // Soft luminous space dust dot
        const dotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, st.r * 2.4);
        dotGrad.addColorStop(0, '#FFFFFF');
        dotGrad.addColorStop(0.45, st.tint);
        dotGrad.addColorStop(1, 'rgba(124, 235, 255, 0)');
        ctx.fillStyle = dotGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, st.r * 2.4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Moons & Glowing Cosmic Gravity Wells
    this.drawMoons();

    // 4. Glowing Golden Active Orbit & Luminous Silver-Blue Inactive Orbit
    this.drawOrbitTrack(this.innerRadius, this.satTargetOrbit === 0);
    this.drawOrbitTrack(this.outerRadius, this.satTargetOrbit === 1);

    // 4.2 Periodic Solar Flare Telegraph / Active Plasma Sweeps
    this.drawSolarFlares();

    // 4.4 Boss Expanding Debris Rings (with highlighted emerald safe-passage arc)
    this.drawBossDebrisRings();

    // 4.6 Paired Wormhole Teleport Gates
    this.drawWormholeGates();

    // 5. Vibrant Glossy 3D Striped & Cratered Central Planet with Cyan Atmospheric Halo
    this.drawPlanet(palette);

    // 6. Glowing Cosmic Warp Portal
    this.drawPortal();

    // 7. Radiant Glossy 3D Golden & Magnetic Collectible Stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.collected) continue;
      const bobScale = this.reducedMotion ? 1 : 1 + Math.sin(s.bobPhase) * 0.08;
      this.drawStar(s.x, s.y, bobScale, s.magnetic, s.pulled);
    }

    // 8. Vivid Glowing Neon Hazards (Green Energy Saber, Red-Orange Asteroid, Crystal Star Mine)
    const sizeScale = this.outerRadius / 148;
    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];
      const r = h.orbit === 0 ? this.innerRadius : this.outerRadius;
      const hx = this.centerX + Math.cos(h.angle) * r;
      const hy = this.centerY + Math.sin(h.angle) * r;
      this.drawHazard(hx, hy, h, sizeScale);
    }

    // 9. Cosmetic Trail Ribbon / Flame Plume & Glossy 3D Space Craft
    if (this.screen !== 'GAMEOVER' || this.hitstopTimer > 0) {
      this.drawTrail();
      this.drawSatellite();
    }

    // 9.5 Slow-Mo Chrono Pulse ambient cyan vignette
    if (this.chronoRemaining > 0 && !this.reducedMotion) {
      const chronoGrad = ctx.createRadialGradient(
        this.centerX,
        this.centerY,
        this.outerRadius * 0.65,
        this.centerX,
        this.centerY,
        Math.max(this.width, this.height) * 0.72
      );
      chronoGrad.addColorStop(0, 'rgba(72, 232, 255, 0)');
      chronoGrad.addColorStop(1, 'rgba(42, 184, 255, 0.22)');
      ctx.fillStyle = chronoGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 10. Pooled Luminous Shockwaves & Starburst Sparks
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha * 0.4);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, TAU);
      ctx.stroke();

      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.85, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.beginPath();
      ctx.arc(-p.size * 0.2, -p.size * 0.2, p.size * 0.35, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (this.impactFlash > 0.01 && !this.reducedMotion) {
      ctx.fillStyle = `rgba(255, 92, 66, ${(this.impactFlash * 0.24).toFixed(3)})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  /**
   * LobbyScreen renders its own full-bleed cosmic launchpad background image,
   * so keep the underlying canvas lightweight while on TITLE.
   */
  private renderLobbyBackdrop(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#080C38';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawFourPointSparkle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string
  ): void {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 1.45);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    glow.addColorStop(0.45, color);
    glow.addColorStop(1, 'rgba(124, 235, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.45, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.closePath();
    ctx.fill();
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

      // Subtle moon orbit guide
      ctx.strokeStyle = 'rgba(148, 198, 255, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, mRad, 0, TAU);
      ctx.stroke();

      // Luminous gravity aura
      const wellGrad = ctx.createRadialGradient(mx, my, 4, mx, my, wellPx);
      if (isBoost) {
        wellGrad.addColorStop(
          0,
          engaged ? 'rgba(196, 120, 255, 0.38)' : 'rgba(176, 108, 255, 0.2)'
        );
        wellGrad.addColorStop(1, 'rgba(176, 108, 255, 0)');
      } else {
        wellGrad.addColorStop(
          0,
          engaged ? 'rgba(66, 226, 255, 0.36)' : 'rgba(66, 210, 255, 0.18)'
        );
        wellGrad.addColorStop(1, 'rgba(66, 210, 255, 0)');
      }
      ctx.fillStyle = wellGrad;
      ctx.beginPath();
      ctx.arc(mx, my, wellPx, 0, TAU);
      ctx.fill();

      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = engaged
        ? '#FFFFFF'
        : isBoost
          ? 'rgba(218, 166, 255, 0.65)'
          : 'rgba(116, 232, 255, 0.62)';
      ctx.lineWidth = engaged ? 2 : 1.4;
      ctx.beginPath();
      ctx.arc(mx, my, wellPx, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      if (engaged) {
        ctx.strokeStyle = isBoost ? 'rgba(255, 220, 96, 0.9)' : 'rgba(92, 238, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(satX, satY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const moonR = Math.max(10, this.outerRadius * 0.078);

      // Soft atmospheric moon halo
      const halo = ctx.createRadialGradient(mx, my, moonR * 0.6, mx, my, moonR * 1.65);
      halo.addColorStop(0, isBoost ? 'rgba(212, 138, 255, 0.5)' : 'rgba(104, 224, 255, 0.45)');
      halo.addColorStop(1, 'rgba(104, 224, 255, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mx, my, moonR * 1.65, 0, TAU);
      ctx.fill();

      // Glossy shaded moon sphere
      const sphereGrad = ctx.createRadialGradient(
        mx - moonR * 0.32,
        my - moonR * 0.34,
        moonR * 0.12,
        mx,
        my,
        moonR
      );
      sphereGrad.addColorStop(0, '#F5F2FF');
      sphereGrad.addColorStop(0.5, isBoost ? '#B584FF' : '#7BCFFF');
      sphereGrad.addColorStop(1, isBoost ? '#52299C' : '#1E52A8');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(mx, my, moonR, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, moonR, 0, TAU);
      ctx.clip();
      ctx.fillStyle = 'rgba(20, 14, 58, 0.28)';
      ctx.beginPath();
      ctx.arc(mx - moonR * 0.3, my - moonR * 0.14, moonR * 0.25, 0, TAU);
      ctx.arc(mx + moonR * 0.24, my + moonR * 0.26, moonR * 0.22, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(220, 246, 255, 0.65)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(mx, my, moonR, 0, TAU);
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawOrbitTrack(radius: number, isActive: boolean): void {
    const ctx = this.ctx;
    ctx.save();

    if (isActive) {
      // Multi-layered warm golden-orange cosmic ring glow (no shadowBlur!)
      ctx.strokeStyle = 'rgba(255, 145, 0, 0.14)';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 200, 48, 0.28)';
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
      ctx.stroke();

      // Radiant golden dashed core
      ctx.strokeStyle = '#FFE45C';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.setLineDash([7, 9]);
      ctx.lineDashOffset = this.reducedMotion ? 0 : -this.planetRotation * 44;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating golden stardust motes around active orbit (matching gameplay mockup)
      if (!this.lowPower) {
        const moteCount = 14;
        for (let i = 0; i < moteCount; i++) {
          const a = (i * TAU) / moteCount + this.elapsedClock * 0.25;
          const radialOff = Math.sin(i * 4.3 + this.elapsedClock * 1.4) * 7.5;
          const mx = this.centerX + Math.cos(a) * (radius + radialOff);
          const my = this.centerY + Math.sin(a) * (radius + radialOff);
          const pulse = 0.45 + 0.55 * Math.sin(this.elapsedClock * 3 + i * 1.7);
          ctx.fillStyle = `rgba(255, 224, 102, ${(pulse * 0.78).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(mx, my, i % 3 === 0 ? 1.9 : 1.25, 0, TAU);
          ctx.fill();
        }
      }
    } else {
      // Soft cool ice-blue aura + crisp silver-blue dashed line for inactive orbit
      ctx.strokeStyle = 'rgba(130, 204, 255, 0.12)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(196, 226, 255, 0.56)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.setLineDash([7, 8]);
      ctx.lineDashOffset = this.reducedMotion ? 0 : -this.planetRotation * 16;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  /**
   * Vibrant glossy 3D striped & cratered cartoon planet matching the gameplay mockup
   * (bright sunny yellow, coral-red, sky cyan, lime green, emerald teal stripes with
   * glossy spherical shading, inset cartoon craters, and glowing cyan rim halo).
   */
  private getCosmicPlanetStripes(): string[] {
    const ch = this.level.chapter;
    const palettes: Record<number, string[]> = {
      1: ['#FFE853', '#FF5B3B', '#28C8FF', '#7BE338', '#159E6E', '#F9B838'],
      2: ['#FFE853', '#F44B33', '#22BCFF', '#8EE32E', '#129A6A', '#F6C150'],
      3: ['#A8F5FF', '#3B96FF', '#9D5CFF', '#FF5FA8', '#2669D9', '#52E5FF'],
      4: ['#FFF06B', '#FF8E2B', '#FF4557', '#B63DFF', '#3968F2', '#FFD64D'],
      5: ['#9EFFC7', '#20DCAC', '#1DA3FF', '#6F58FF', '#1847B8', '#42F5CF'],
      6: ['#FFE963', '#FF5288', '#8B4DFF', '#20C9FF', '#28E07F', '#FFB82E'],
    };
    return palettes[ch] || palettes[2];
  }

  private drawPlanet(_palette: PlanetPalette): void {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const pr = this.planetRadius;
    const stripes = this.getCosmicPlanetStripes();

    ctx.save();

    // 1. Radiant cyan-white cosmic atmospheric halo behind planet
    const outerHalo = ctx.createRadialGradient(cx, cy, pr * 0.85, cx, cy, pr * 1.48);
    outerHalo.addColorStop(0, 'rgba(118, 240, 255, 0.62)');
    outerHalo.addColorStop(0.42, 'rgba(56, 178, 255, 0.28)');
    outerHalo.addColorStop(1, 'rgba(30, 96, 255, 0)');
    ctx.fillStyle = outerHalo;
    ctx.beginPath();
    ctx.arc(cx, cy, pr * 1.48, 0, TAU);
    ctx.fill();

    // Base planet circle
    ctx.fillStyle = stripes[0];
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, TAU);
    ctx.fill();

    // Clipped glossy curved horizontal stripes + craters + 3D shading
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, TAU);
    ctx.clip();

    const waveDrift = this.reducedMotion ? 0 : Math.sin(this.planetRotation * 0.7) * pr * 0.06;
    const bandCount = stripes.length;

    for (let i = 1; i < bandCount; i++) {
      const t = i / bandCount;
      const yBase = cy - pr + t * (pr * 2.02);
      const curve = pr * 0.14;
      const shift = (i % 2 === 0 ? 1 : -1) * waveDrift;

      // Subtle dark separation groove between glossy stripes
      ctx.fillStyle = 'rgba(10, 18, 60, 0.22)';
      ctx.beginPath();
      ctx.moveTo(cx - pr * 1.15, yBase - 1.5);
      ctx.quadraticCurveTo(cx + shift, yBase - 1.5 + curve, cx + pr * 1.15, yBase - 1.5 - curve * 0.35);
      ctx.lineTo(cx + pr * 1.15, cy + pr * 1.2);
      ctx.lineTo(cx - pr * 1.15, cy + pr * 1.2);
      ctx.closePath();
      ctx.fill();

      // Main vivid stripe band
      ctx.fillStyle = stripes[i];
      ctx.beginPath();
      ctx.moveTo(cx - pr * 1.15, yBase);
      ctx.quadraticCurveTo(cx + shift, yBase + curve, cx + pr * 1.15, yBase - curve * 0.35);
      ctx.lineTo(cx + pr * 1.15, cy + pr * 1.2);
      ctx.lineTo(cx - pr * 1.15, cy + pr * 1.2);
      ctx.closePath();
      ctx.fill();

      // Crisp glossy top-edge highlight on each stripe
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - pr * 1.1, yBase + 1.2);
      ctx.quadraticCurveTo(cx + shift, yBase + 1.2 + curve, cx + pr * 1.1, yBase + 1.2 - curve * 0.35);
      ctx.stroke();
    }

    // Smooth inset glossy cartoon craters (matching the mockup planet craters)
    const craters = [
      { ox: -0.42, oy: -0.34, rx: 0.17, ry: 0.12, rot: -0.25 },
      { ox: 0.24, oy: -0.68, rx: 0.13, ry: 0.08, rot: 0.15 },
      { ox: 0.56, oy: -0.02, rx: 0.16, ry: 0.13, rot: 0.2 },
      { ox: -0.38, oy: 0.42, rx: 0.2, ry: 0.15, rot: -0.15 },
      { ox: 0.28, oy: 0.56, rx: 0.14, ry: 0.1, rot: 0.18 },
      { ox: -0.04, oy: 0.08, rx: 0.1, ry: 0.08, rot: 0 },
    ];
    for (let i = 0; i < craters.length; i++) {
      const c = craters[i];
      const crx = cx + c.ox * pr;
      const cry = cy + c.oy * pr;
      ctx.save();
      ctx.translate(crx, cry);
      ctx.rotate(c.rot);
      ctx.fillStyle = 'rgba(12, 24, 64, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, c.rx * pr, c.ry * pr, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(0, 0.9, c.rx * pr * 0.94, c.ry * pr * 0.9, 0, 0.15, Math.PI - 0.15);
      ctx.stroke();
      ctx.restore();
    }

    // 3D Spherical glossy shading (bright top-left light + rich indigo bottom shadow)
    const sphereShade = ctx.createRadialGradient(
      cx - pr * 0.32,
      cy - pr * 0.34,
      pr * 0.08,
      cx,
      cy,
      pr * 1.06
    );
    sphereShade.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
    sphereShade.addColorStop(0.45, 'rgba(255, 255, 255, 0.04)');
    sphereShade.addColorStop(0.76, 'rgba(14, 24, 92, 0.18)');
    sphereShade.addColorStop(1, 'rgba(9, 14, 62, 0.52)');
    ctx.fillStyle = sphereShade;
    ctx.fillRect(cx - pr, cy - pr, pr * 2, pr * 2);

    // Glossy glass-like specular shine arc on upper-left limb
    ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.beginPath();
    ctx.ellipse(cx - pr * 0.32, cy - pr * 0.42, pr * 0.36, pr * 0.14, -0.58, 0, TAU);
    ctx.fill();

    ctx.restore();

    // Crisp luminous cyan-white rim stroke around planet edge (or glowing Boss Sovereign crown!)
    if (this.level.boss) {
      const bossPulse = 0.65 + 0.35 * Math.sin(this.elapsedClock * 5.2);
      ctx.strokeStyle =
        this.polarityFlipCountdown > 0
          ? `rgba(218, 128, 255, ${bossPulse.toFixed(2)})`
          : `rgba(255, 92, 56, ${bossPulse.toFixed(2)})`;
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.arc(cx, cy, pr + 4.5, 0, TAU);
      ctx.stroke();

      // Boss phase arc indicators around the planet core
      const total = this.bossTotalPhases || 2;
      const segArc = (TAU - total * 0.24) / total;
      for (let i = 0; i < total; i++) {
        const a0 = -Math.PI / 2 + i * (segArc + 0.24);
        ctx.strokeStyle = i < this.bossPhase ? '#FFE45C' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, pr + 9.5, a0, a0 + segArc);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = this.level.boss ? '#FFD46B' : 'rgba(182, 248, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, TAU);
    ctx.stroke();

    ctx.restore();
  }

  private drawSolarFlares(): void {
    if (this.solarFlares.length === 0) return;
    const ctx = this.ctx;

    for (let i = 0; i < this.solarFlares.length; i++) {
      const f = this.solarFlares[i];
      if (f.state === 'idle') continue;
      const r = f.orbit === 0 ? this.innerRadius : this.outerRadius;

      ctx.save();
      if (f.state === 'telegraph') {
        const blink = 0.45 + 0.55 * Math.abs(Math.sin(this.elapsedClock * 11));
        ctx.strokeStyle = `rgba(255, 138, 36, ${(0.24 + blink * 0.24).toFixed(2)})`;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, r, 0, TAU);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 224, 96, ${(0.55 + blink * 0.45).toFixed(2)})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 10]);
        ctx.lineDashOffset = -this.elapsedClock * 75;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, r, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Active scorching solar plasma ring!
        const flicker = 0.8 + 0.2 * Math.sin(this.elapsedClock * 32);
        ctx.strokeStyle = `rgba(255, 64, 24, ${(0.35 * flicker).toFixed(2)})`;
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, r, 0, TAU);
        ctx.stroke();

        ctx.strokeStyle = '#FF7B1C';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, r, 0, TAU);
        ctx.stroke();

        ctx.strokeStyle = '#FFF6B8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, r, 0, TAU);
        ctx.stroke();

        // Sweeping plasma flare heads along the ring
        for (let k = 0; k < 3; k++) {
          const a = f.sweepAngle + (k * TAU) / 3;
          const fx = this.centerX + Math.cos(a) * r;
          const fy = this.centerY + Math.sin(a) * r;
          const flareGlow = ctx.createRadialGradient(fx, fy, 1, fx, fy, 18);
          flareGlow.addColorStop(0, '#FFFFFF');
          flareGlow.addColorStop(0.45, '#FFB82E');
          flareGlow.addColorStop(1, 'rgba(255, 72, 24, 0)');
          ctx.fillStyle = flareGlow;
          ctx.beginPath();
          ctx.arc(fx, fy, 18, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  private drawWormholeGates(): void {
    if (this.wormholeGates.length === 0) return;
    const ctx = this.ctx;
    const scale = this.outerRadius / 148;

    for (let i = 0; i < this.wormholeGates.length; i++) {
      const g = this.wormholeGates[i];
      const rA = g.orbit === 0 ? this.innerRadius : this.outerRadius;
      const ax = this.centerX + Math.cos(g.angle) * rA;
      const ay = this.centerY + Math.sin(g.angle) * rA;

      const rB = g.targetOrbit === 0 ? this.innerRadius : this.outerRadius;
      const bx = this.centerX + Math.cos(g.targetAngle) * rB;
      const by = this.centerY + Math.sin(g.targetAngle) * rB;

      const cooling = g.cooldown > 0;

      // Subtle quantum tether line linking paired gates
      ctx.save();
      ctx.strokeStyle = cooling ? 'rgba(160, 190, 240, 0.14)' : 'rgba(104, 240, 255, 0.22)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 7]);
      ctx.lineDashOffset = -this.elapsedClock * 20;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const ends = [
        { x: ax, y: ay },
        { x: bx, y: by },
      ];
      for (let e = 0; e < ends.length; e++) {
        const pt = ends[e];
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.globalAlpha = cooling ? 0.45 : 1;

        const glow = ctx.createRadialGradient(0, 0, 2 * scale, 0, 0, 22 * scale);
        glow.addColorStop(0, '#FFFFFF');
        glow.addColorStop(0.42, g.color);
        glow.addColorStop(1, 'rgba(60, 242, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 22 * scale, 0, TAU);
        ctx.fill();

        ctx.rotate(this.elapsedClock * (e === 0 ? 2.6 : -2.6));
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 2.6 * scale;
        ctx.setLineDash([8 * scale, 5 * scale]);
        ctx.beginPath();
        ctx.arc(0, 0, 13.5 * scale, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#0D144D';
        ctx.beginPath();
        ctx.arc(0, 0, 8.5 * scale, 0, TAU);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.6 * scale;
        ctx.beginPath();
        ctx.arc(0, 0, 8.5 * scale, 0, TAU);
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  private drawBossDebrisRings(): void {
    if (this.debrisRings.length === 0) return;
    const ctx = this.ctx;

    for (let i = 0; i < this.debrisRings.length; i++) {
      const ring = this.debrisRings[i];
      const fade = Math.max(0.2, 1 - (ring.radius / ring.maxRadius) * 0.4);
      const startDanger = ring.gapAngle + ring.gapHalfWidth;
      const endDanger = ring.gapAngle + TAU - ring.gapHalfWidth;

      ctx.save();
      ctx.globalAlpha = fade;

      // Glowing crimson-orange expanding hazard arc
      ctx.strokeStyle = 'rgba(255, 72, 36, 0.32)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, ring.radius, startDanger, endDanger);
      ctx.stroke();

      ctx.strokeStyle = '#FF5526';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, ring.radius, startDanger, endDanger);
      ctx.stroke();

      ctx.strokeStyle = '#FFE48C';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, ring.radius, startDanger, endDanger);
      ctx.stroke();
      ctx.setLineDash([]);

      // Clear emerald-cyan safe-passage gap guide arc
      ctx.strokeStyle = 'rgba(84, 255, 178, 0.65)';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(
        this.centerX,
        this.centerY,
        ring.radius,
        ring.gapAngle - ring.gapHalfWidth + 0.08,
        ring.gapAngle + ring.gapHalfWidth - 0.08
      );
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
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
      // Glowing white-cyan dashed circular beacon ring (matches upper-right ring in mockup)
      const softGlow = ctx.createRadialGradient(0, 0, 2 * scale, 0, 0, 22 * scale);
      softGlow.addColorStop(0, 'rgba(186, 244, 255, 0.34)');
      softGlow.addColorStop(0.6, 'rgba(116, 214, 255, 0.16)');
      softGlow.addColorStop(1, 'rgba(116, 214, 255, 0)');
      ctx.fillStyle = softGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 22 * scale, 0, TAU);
      ctx.fill();

      ctx.rotate(this.elapsedClock * 0.55);
      ctx.strokeStyle = 'rgba(224, 248, 255, 0.82)';
      ctx.lineWidth = 2.4 * scale;
      ctx.lineCap = 'round';
      ctx.setLineDash([7 * scale, 6 * scale]);
      ctx.beginPath();
      ctx.arc(0, 0, 14.5 * scale, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(128, 226, 255, 0.55)';
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, 8.5 * scale, 0, TAU);
      ctx.stroke();
    } else {
      const pulseScale = this.reducedMotion ? 1 : 1 + Math.sin(this.portal.pulse) * 0.09;
      ctx.scale(pulseScale, pulseScale);

      // Radiant cyan-gold vortex halo
      const glow = ctx.createRadialGradient(0, 0, 4 * scale, 0, 0, 34 * scale);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      glow.addColorStop(0.35, 'rgba(72, 242, 255, 0.65)');
      glow.addColorStop(0.68, 'rgba(255, 216, 72, 0.28)');
      glow.addColorStop(1, 'rgba(72, 242, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 34 * scale, 0, TAU);
      ctx.fill();

      // Swirling outer golden ring
      ctx.save();
      ctx.rotate(this.elapsedClock * 2.4);
      ctx.strokeStyle = '#FFE45C';
      ctx.lineWidth = 3 * scale;
      ctx.setLineDash([10 * scale, 6 * scale]);
      ctx.beginPath();
      ctx.arc(0, 0, 18.5 * scale, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Bright cyan-white portal aperture
      const coreGrad = ctx.createRadialGradient(0, 0, 1.5 * scale, 0, 0, 14 * scale);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.45, '#58F3FF');
      coreGrad.addColorStop(0.8, '#2864FF');
      coreGrad.addColorStop(1, '#121E6B');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 14 * scale, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = '#E6FFFF';
      ctx.lineWidth = 2.2 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, 14 * scale, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawGlowingStarShape(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outerR: number,
    topColor: string,
    bottomColor: string,
    withOutline: boolean
  ): void {
    const innerR = outerR * 0.48;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(x, y - outerR, x, y + outerR);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fill();

    if (withOutline) {
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#C95800';
      ctx.lineWidth = Math.max(1.6, outerR * 0.14);
      ctx.stroke();

      // Inner glossy specular sheen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
      ctx.beginPath();
      ctx.ellipse(x - outerR * 0.12, y - outerR * 0.24, outerR * 0.26, outerR * 0.13, -0.35, 0, TAU);
      ctx.fill();
    }
  }

  private drawStar(
    x: number,
    y: number,
    scale: number,
    magnetic: boolean,
    pulled: boolean
  ): void {
    const ctx = this.ctx;
    const s = scale * (this.outerRadius / 148);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    if (magnetic) {
      // Pulsing magenta-cyan magnetic field ring & orbiting mini sparks
      const pulseR = 20 + Math.sin(this.elapsedClock * 5) * 3;
      ctx.strokeStyle = pulled ? '#FF8AF7' : 'rgba(220, 128, 255, 0.72)';
      ctx.lineWidth = pulled ? 2.2 : 1.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let k = 0; k < 2; k++) {
        const a = this.elapsedClock * 3.8 + k * Math.PI;
        ctx.fillStyle = k === 0 ? '#7CEBFF' : '#FF8AF7';
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 17.5, Math.sin(a) * 17.5, 2.4, 0, TAU);
        ctx.fill();
      }
    }

    // Radiant golden-orange (or magnetic violet-gold) ambient glow halo
    const halo = ctx.createRadialGradient(0, 0, 3, 0, 0, 24);
    halo.addColorStop(0, magnetic ? 'rgba(255, 210, 255, 0.72)' : 'rgba(255, 232, 84, 0.65)');
    halo.addColorStop(0.5, magnetic ? 'rgba(212, 92, 255, 0.34)' : 'rgba(255, 148, 0, 0.26)');
    halo.addColorStop(1, 'rgba(255, 136, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, TAU);
    ctx.fill();

    this.drawGlowingStarShape(
      ctx,
      0,
      0,
      14.5,
      magnetic ? '#FFF5FF' : '#FFF57A',
      magnetic ? '#FF88E8' : '#FF9900',
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
      // 1. Glowing Neon-Green Energy Saber / Plasma Comet (matches right-hand green saber in mockup)
      const travelDir = h.speed >= 0 ? h.angle + Math.PI / 2 : h.angle - Math.PI / 2;
      ctx.rotate(travelDir);

      // Luminous green outer glow aura
      const saberGlow = ctx.createRadialGradient(-sz * 0.3, 0, sz * 0.2, -sz * 0.3, 0, sz * 2.35);
      saberGlow.addColorStop(0, 'rgba(60, 255, 140, 0.52)');
      saberGlow.addColorStop(0.55, 'rgba(0, 224, 118, 0.2)');
      saberGlow.addColorStop(1, 'rgba(0, 224, 118, 0)');
      ctx.fillStyle = saberGlow;
      ctx.beginPath();
      ctx.ellipse(-sz * 0.3, 0, sz * 2.35, sz * 1.15, 0, 0, TAU);
      ctx.fill();

      // Curved neon-green plasma blade
      ctx.fillStyle = '#14E870';
      ctx.beginPath();
      ctx.moveTo(sz * 1.45, -sz * 0.08);
      ctx.quadraticCurveTo(sz * 0.45, -sz * 0.56, -sz * 0.85, -sz * 0.38);
      ctx.lineTo(-sz * 0.85, sz * 0.38);
      ctx.quadraticCurveTo(sz * 0.45, sz * 0.22, sz * 1.45, sz * 0.08);
      ctx.closePath();
      ctx.fill();

      // Bright electric lime-white inner plasma core
      ctx.fillStyle = '#CCFFD9';
      ctx.beginPath();
      ctx.moveTo(sz * 1.25, 0);
      ctx.quadraticCurveTo(sz * 0.35, -sz * 0.26, -sz * 0.72, -sz * 0.14);
      ctx.lineTo(-sz * 0.72, sz * 0.14);
      ctx.quadraticCurveTo(sz * 0.35, sz * 0.06, sz * 1.25, 0);
      ctx.closePath();
      ctx.fill();

      // Golden hilt & emitter collar at the base
      ctx.fillStyle = '#FFB81C';
      ctx.strokeStyle = '#9E4B00';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-sz * 1.05, -sz * 0.55, sz * 0.34, sz * 1.1, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#47D67C';
      ctx.beginPath();
      ctx.roundRect(-sz * 1.55, -sz * 0.28, sz * 0.55, sz * 0.56, 3);
      ctx.fill();
    } else if (h.type === 'asteroid') {
      // 2. Fiery Glowing Red-Orange Studded Asteroid Cube-Rock (matches left-hand asteroid in mockup)
      ctx.rotate(h.spin);

      const glow = ctx.createRadialGradient(0, 0, sz * 0.3, 0, 0, sz * 1.75);
      glow.addColorStop(0, 'rgba(255, 118, 42, 0.5)');
      glow.addColorStop(0.6, 'rgba(235, 58, 22, 0.18)');
      glow.addColorStop(1, 'rgba(235, 58, 22, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, sz * 1.75, 0, TAU);
      ctx.fill();

      // Concave-edged cartoon fiery block silhouette
      const rockGrad = ctx.createLinearGradient(-sz, -sz, sz, sz);
      rockGrad.addColorStop(0, '#FFA03B');
      rockGrad.addColorStop(0.45, '#F24D22');
      rockGrad.addColorStop(1, '#B31D12');

      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(-sz * 0.92, -sz * 0.84);
      ctx.quadraticCurveTo(0, -sz * 0.62, sz * 0.92, -sz * 0.84);
      ctx.quadraticCurveTo(sz * 0.68, 0, sz * 0.92, sz * 0.84);
      ctx.quadraticCurveTo(0, sz * 0.62, -sz * 0.92, sz * 0.84);
      ctx.quadraticCurveTo(-sz * 0.68, 0, -sz * 0.92, -sz * 0.84);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#FFD37A';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Crater dimples & glowing ember flecks
      ctx.fillStyle = 'rgba(98, 14, 12, 0.55)';
      ctx.beginPath();
      ctx.arc(-sz * 0.28, -sz * 0.2, sz * 0.22, 0, TAU);
      ctx.arc(sz * 0.3, sz * 0.22, sz * 0.17, 0, TAU);
      ctx.arc(sz * 0.22, -sz * 0.32, sz * 0.11, 0, TAU);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 240, 175, 0.72)';
      ctx.beginPath();
      ctx.arc(-sz * 0.32, sz * 0.34, sz * 0.09, 0, TAU);
      ctx.arc(sz * 0.02, -sz * 0.05, sz * 0.08, 0, TAU);
      ctx.fill();
    } else {
      // 3. Vibrant Multi-Color Glossy Crystal Star-Mine (matches upper-right rainbow crystal in mockup)
      ctx.rotate(h.spin);

      const crystalGlow = ctx.createRadialGradient(0, 0, sz * 0.2, 0, 0, sz * 1.85);
      crystalGlow.addColorStop(0, 'rgba(255, 240, 138, 0.62)');
      crystalGlow.addColorStop(0.5, 'rgba(255, 86, 168, 0.25)');
      crystalGlow.addColorStop(1, 'rgba(72, 232, 255, 0)');
      ctx.fillStyle = crystalGlow;
      ctx.beginPath();
      ctx.arc(0, 0, sz * 1.85, 0, TAU);
      ctx.fill();

      // 4-point faceted rainbow crystal star
      const spikeR = sz * 1.2;
      const midR = sz * 0.45;
      const facets = [
        { a1: -Math.PI / 2, a2: -Math.PI / 4, c: '#FFE84D' },
        { a1: -Math.PI / 4, a2: 0, c: '#FF9A1F' },
        { a1: 0, a2: Math.PI / 4, c: '#FF3E5E' },
        { a1: Math.PI / 4, a2: Math.PI / 2, c: '#FF5CC8' },
        { a1: Math.PI / 2, a2: (3 * Math.PI) / 4, c: '#9B4DFF' },
        { a1: (3 * Math.PI) / 4, a2: Math.PI, c: '#2998FF' },
        { a1: Math.PI, a2: (5 * Math.PI) / 4, c: '#28E8FF' },
        { a1: (5 * Math.PI) / 4, a2: (3 * Math.PI) / 2, c: '#6CFF7A' },
      ];

      for (let i = 0; i < facets.length; i++) {
        const f = facets[i];
        const r1 = i % 2 === 0 ? spikeR : midR;
        const r2 = i % 2 === 0 ? midR : spikeR;
        ctx.fillStyle = f.c;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(f.a1) * r1, Math.sin(f.a1) * r1);
        ctx.lineTo(Math.cos(f.a2) * r2, Math.sin(f.a2) * r2);
        ctx.closePath();
        ctx.fill();
      }

      // Crisp specular white gleam in center
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.24, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawTrail(): void {
    const len = this.satTrail.length;
    if (len < 3) return;
    const ctx = this.ctx;
    const satDef = getSatelliteById(this.satelliteId);
    const scale = (this.outerRadius / 148) * (0.78 + satDef.sizeScale * 0.22);

    const buildFlamePath = (widthMult: number) => {
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
        const flicker = Math.sin(i * 0.9 - this.elapsedClock * 16) * 0.9 * (1 - ratio);
        const halfW = (0.35 + Math.pow(ratio, 1.35) * 5.2 * widthMult) * scale;
        leftPts.push({ x: p.x + nx * (halfW + flicker), y: p.y + ny * (halfW + flicker) });
        rightPts.push({ x: p.x - nx * (halfW - flicker), y: p.y - ny * (halfW - flicker) });
      }
      ctx.beginPath();
      ctx.moveTo(leftPts[0].x, leftPts[0].y);
      for (let i = 1; i < len; i++) {
        ctx.lineTo(leftPts[i].x, leftPts[i].y);
      }
      for (let i = len - 1; i >= 0; i--) {
        ctx.lineTo(rightPts[i].x, rightPts[i].y);
      }
      ctx.closePath();
    };

    ctx.save();

    if (this.trailId === 'prism') {
      // Multi-band prismatic comet ribbon
      const bands = [
        { mult: 1.95, color: 'rgba(255, 77, 136, 0.36)' },
        { mult: 1.45, color: 'rgba(255, 212, 38, 0.72)' },
        { mult: 1.0, color: '#3CF2FF' },
        { mult: 0.48, color: '#FFFFFF' },
      ];
      for (let b = 0; b < bands.length; b++) {
        buildFlamePath(bands[b].mult);
        ctx.fillStyle = bands[b].color;
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    if (this.trailId === 'aurora') {
      const startPt = this.satTrail[0];
      const endPt = this.satTrail[len - 1];
      const auroraOuter = ctx.createLinearGradient(startPt.x, startPt.y, endPt.x, endPt.y);
      auroraOuter.addColorStop(0, 'rgba(179, 107, 255, 0.08)');
      auroraOuter.addColorStop(0.5, 'rgba(56, 232, 255, 0.36)');
      auroraOuter.addColorStop(1, 'rgba(16, 232, 154, 0.45)');

      const auroraMid = ctx.createLinearGradient(startPt.x, startPt.y, endPt.x, endPt.y);
      auroraMid.addColorStop(0, '#B36BFF');
      auroraMid.addColorStop(0.5, '#38E8FF');
      auroraMid.addColorStop(1, '#3DFFBA');

      buildFlamePath(1.85);
      ctx.fillStyle = auroraOuter;
      ctx.fill();
      buildFlamePath(1.05);
      ctx.fillStyle = auroraMid;
      ctx.fill();
      buildFlamePath(0.45);
      ctx.fillStyle = '#E8FFFF';
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.trailId === 'stardust') {
      buildFlamePath(1.65);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.32)';
      ctx.fill();
      buildFlamePath(0.95);
      ctx.fillStyle = '#7CEBFF';
      ctx.fill();
      buildFlamePath(0.42);
      ctx.fillStyle = '#FFF5B8';
      ctx.fill();

      // Twinkling stardust sparkles along the wake
      if (!this.lowPower) {
        for (let i = 2; i < len - 1; i += 3) {
          const pt = this.satTrail[i];
          const off = Math.sin(i * 2.1 + this.elapsedClock * 6) * 5.5 * scale;
          ctx.fillStyle = i % 2 === 0 ? '#FFF49E' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pt.x + off, pt.y - off * 0.7, (1.4 + (i / len) * 1.4) * scale, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
      return;
    }

    if (this.trailId === 'crimson_nova') {
      buildFlamePath(1.8);
      ctx.fillStyle = 'rgba(200, 29, 119, 0.38)';
      ctx.fill();
      buildFlamePath(1.1);
      ctx.fillStyle = '#FF5533';
      ctx.fill();
      buildFlamePath(0.52);
      ctx.fillStyle = '#FFE88A';
      ctx.fill();
      ctx.restore();
      return;
    }

    // Classic Solar Plume (adapts cleanly to equipped craft)
    let outerColor = 'rgba(255, 132, 0, 0.34)';
    let midColor = '#FFB81C';
    let coreColor = '#FFF9BF';
    if (this.satelliteId === 'tinny') {
      outerColor = 'rgba(32, 232, 168, 0.34)';
      midColor = '#2EF0A8';
      coreColor = '#E6FFF7';
    } else if (this.satelliteId === 'heavy') {
      outerColor = 'rgba(255, 168, 24, 0.42)';
      midColor = '#FFD43B';
      coreColor = '#FFFCE0';
    } else if (this.satelliteId === 'nano_stopper') {
      outerColor = 'rgba(130, 186, 255, 0.38)';
      midColor = '#66E3FF';
      coreColor = '#F4FFFF';
    } else if (this.satelliteId === 'magnet_probe') {
      outerColor = 'rgba(255, 96, 212, 0.36)';
      midColor = '#FF74E8';
      coreColor = '#FFF0FF';
    } else if (this.satelliteId === 'phase_dasher') {
      outerColor = 'rgba(168, 92, 255, 0.4)';
      midColor = '#B47BFF';
      coreColor = '#F2E8FF';
    } else if (this.satelliteId === 'star_collector') {
      outerColor = 'rgba(255, 208, 42, 0.42)';
      midColor = '#FFE45C';
      coreColor = '#FFFFFF';
    }

    buildFlamePath(1.65);
    ctx.fillStyle = outerColor;
    ctx.fill();

    buildFlamePath(1.0);
    ctx.fillStyle = midColor;
    ctx.fill();

    buildFlamePath(0.5);
    ctx.fillStyle = coreColor;
    ctx.fill();
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

    // Keep nose oriented along travel direction even when Boss Polarity Flip reverses orbit!
    const tangentAngle =
      this.satAngle + (this.orbitDirection === 1 ? Math.PI / 2 : -Math.PI / 2) + this.satWarpProgress * 5.2;

    ctx.save();
    ctx.translate(sx, sy);

    // Active Star Magnet Booster or Magnet Probe field ring
    if ((this.magnetRemaining > 0 || this.satelliteId === 'magnet_probe') && this.satWarpProgress === 0) {
      const magR =
        this.magnetRemaining > 0
          ? this.outerRadius * 0.34
          : Math.max(24, 30 * (this.outerRadius / 148));
      ctx.save();
      ctx.strokeStyle =
        this.magnetRemaining > 0 ? 'rgba(255, 130, 245, 0.72)' : 'rgba(255, 148, 240, 0.42)';
      ctx.lineWidth = this.magnetRemaining > 0 ? 2.4 : 1.5;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = this.elapsedClock * 32;
      ctx.beginPath();
      ctx.arc(0, 0, magR, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Phase Dasher invulnerability aura on lane shifts
    if (this.phaseInvulnTimer > 0 && this.satWarpProgress === 0) {
      const phaseR = Math.max(18, 24 * (this.outerRadius / 148));
      ctx.save();
      const phaseGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, phaseR * 1.25);
      phaseGrad.addColorStop(0, 'rgba(216, 152, 255, 0.36)');
      phaseGrad.addColorStop(0.7, 'rgba(116, 232, 255, 0.22)');
      phaseGrad.addColorStop(1, 'rgba(116, 232, 255, 0)');
      ctx.fillStyle = phaseGrad;
      ctx.beginPath();
      ctx.arc(0, 0, phaseR * 1.25, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = '#E0A8FF';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, phaseR, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Full-obstacle Holographic Cyan Shield Bubble (renders in world space around craft)
    if (this.shieldActive && this.satWarpProgress === 0) {
      const baseBubbleR = Math.max(16, 22 * (this.outerRadius / 148) * (0.78 + satDef.sizeScale * 0.22));
      ctx.save();
      const shieldGrad = ctx.createRadialGradient(0, 0, baseBubbleR * 0.35, 0, 0, baseBubbleR * 1.18);
      shieldGrad.addColorStop(0, 'rgba(72, 238, 255, 0.08)');
      shieldGrad.addColorStop(0.75, 'rgba(66, 230, 255, 0.3)');
      shieldGrad.addColorStop(1, 'rgba(66, 230, 255, 0)');
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(0, 0, baseBubbleR * 1.18, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = '#6CF4FF';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -this.elapsedClock * 24;
      ctx.beginPath();
      ctx.arc(0, 0, baseBubbleR, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (this.phaseInvulnTimer > 0) {
      ctx.globalAlpha = 0.72 + Math.sin(this.elapsedClock * 42) * 0.22;
    }

    ctx.rotate(tangentAngle);

    const stretchX = (1 - this.satSquash * 0.16) * drawScale;
    const stretchY = (1 + this.satSquash * 0.2) * drawScale;
    ctx.scale(stretchX, stretchY);

    // Heavy satellite glowing golden outer-orbit armor bumper when cruising on outer orbit
    if (satDef.outerImmune && this.satTargetOrbit === 1 && this.satWarpProgress === 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 214, 68, 0.35)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, -1, 18.5, -Math.PI * 0.88, -Math.PI * 0.12);
      ctx.stroke();

      ctx.strokeStyle = '#FFE45C';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(0, -1, 18.5, -Math.PI * 0.88, -Math.PI * 0.12);
      ctx.stroke();
      ctx.restore();
    }

    // Nano Stopper subtle glowing cyan chrono ring
    if (this.satelliteId === 'nano_stopper' && this.satWarpProgress === 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(104, 240, 255, 0.72)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Accent colors per satellite class
    let accentBright = '#FF3838';
    let accentDeep = '#B81420';
    let hullLight = '#FFFFFF';
    let hullShade = '#C9D3F2';
    let glassCore = '#52E8FF';
    let glassEdge = '#1875FF';

    if (this.satelliteId === 'tinny') {
      accentBright = '#26E89A';
      accentDeep = '#0E9A68';
      hullLight = '#FFFDE8';
      hullShade = '#BCEFD6';
      glassCore = '#FFE866';
      glassEdge = '#FF9500';
    } else if (this.satelliteId === 'heavy') {
      accentBright = '#FFC82E';
      accentDeep = '#C96E00';
      hullLight = '#E4EEFF';
      hullShade = '#7D9EE0';
      glassCore = '#78F5FF';
      glassEdge = '#205EFF';
    } else if (this.satelliteId === 'nano_stopper') {
      accentBright = '#A85CFF';
      accentDeep = '#5E24C8';
      hullLight = '#F8F2FF';
      hullShade = '#CBB6F2';
      glassCore = '#7CF8FF';
      glassEdge = '#20B2FF';
    } else if (this.satelliteId === 'magnet_probe') {
      accentBright = '#FF52C8';
      accentDeep = '#B51782';
      hullLight = '#FFF2FB';
      hullShade = '#F2B8E4';
      glassCore = '#66F5FF';
      glassEdge = '#1B8CFF';
    } else if (this.satelliteId === 'phase_dasher') {
      accentBright = '#3CE8FF';
      accentDeep = '#5A28E8';
      hullLight = '#EBF8FF';
      hullShade = '#A9B8F8';
      glassCore = '#F0A8FF';
      glassEdge = '#8B2EFF';
    } else if (this.satelliteId === 'star_collector') {
      accentBright = '#FFD838';
      accentDeep = '#D97B00';
      hullLight = '#FFFCE6';
      hullShade = '#F2D074';
      glassCore = '#6CFFBA';
      glassEdge = '#0FA66E';
    }

    // Miniature flickering thruster flame jet at nozzle
    const flameFlicker = 0.85 + Math.sin(this.elapsedClock * 36) * 0.22;
    ctx.fillStyle = '#FF9000';
    ctx.beginPath();
    ctx.moveTo(-4.2, 10.5);
    ctx.quadraticCurveTo(0, 10.5 + 12 * flameFlicker, 4.2, 10.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFF799';
    ctx.beginPath();
    ctx.moveTo(-2.4, 10.5);
    ctx.quadraticCurveTo(0, 10.5 + 7.5 * flameFlicker, 2.4, 10.5);
    ctx.closePath();
    ctx.fill();

    // Swept left & right rocket fins
    ctx.fillStyle = accentDeep;
    ctx.beginPath();
    ctx.moveTo(-6.2, 2.5);
    ctx.quadraticCurveTo(-13.5, 5.5, -12.2, 13);
    ctx.quadraticCurveTo(-8.4, 10.2, -5.5, 9.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = accentBright;
    ctx.beginPath();
    ctx.moveTo(6.2, 2.5);
    ctx.quadraticCurveTo(13.5, 5.5, 12.2, 13);
    ctx.quadraticCurveTo(8.4, 10.2, 5.5, 9.5);
    ctx.closePath();
    ctx.fill();

    // Nozzle base collar
    ctx.fillStyle = '#5C3A5E';
    ctx.beginPath();
    ctx.roundRect(-4.6, 8.8, 9.2, 2.8, 1.4);
    ctx.fill();

    // Glossy plump teardrop rocket body
    const bodyGrad = ctx.createLinearGradient(-7.5, 0, 7.5, 0);
    bodyGrad.addColorStop(0, hullLight);
    bodyGrad.addColorStop(0.58, '#F0F4FF');
    bodyGrad.addColorStop(1, hullShade);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.bezierCurveTo(9, -8.5, 8.8, 4.5, 5.2, 9.5);
    ctx.lineTo(-5.2, 9.5);
    ctx.bezierCurveTo(-8.8, 4.5, -9, -8.5, 0, -15);
    ctx.closePath();
    ctx.fill();

    // Clipped bright nose cone & glossy side specular
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.bezierCurveTo(9, -8.5, 8.8, 4.5, 5.2, 9.5);
    ctx.lineTo(-5.2, 9.5);
    ctx.bezierCurveTo(-8.8, 4.5, -9, -8.5, 0, -15);
    ctx.closePath();
    ctx.clip();

    const noseGrad = ctx.createLinearGradient(-6, -15, 6, -6);
    noseGrad.addColorStop(0, accentBright);
    noseGrad.addColorStop(1, accentDeep);
    ctx.fillStyle = noseGrad;
    ctx.beginPath();
    ctx.moveTo(-10, -16);
    ctx.lineTo(10, -16);
    ctx.lineTo(10, -6.4);
    ctx.quadraticCurveTo(0, -4.4, -10, -6.4);
    ctx.closePath();
    ctx.fill();

    // Glossy left highlight streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-3.4, -1.5, 1.6, 7.2, 0.14, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Crisp rocket body outline
    ctx.strokeStyle = '#252161';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.bezierCurveTo(9, -8.5, 8.8, 4.5, 5.2, 9.5);
    ctx.lineTo(-5.2, 9.5);
    ctx.bezierCurveTo(-8.8, 4.5, -9, -8.5, 0, -15);
    ctx.closePath();
    ctx.stroke();

    // Glowing cyan glass porthole window
    ctx.fillStyle = '#382B70';
    ctx.beginPath();
    ctx.arc(0, -0.5, 4.4, 0, TAU);
    ctx.fill();

    const winGrad = ctx.createRadialGradient(-1, -1.6, 0.5, 0, -0.5, 3.4);
    winGrad.addColorStop(0, '#E8FFFF');
    winGrad.addColorStop(0.4, glassCore);
    winGrad.addColorStop(1, glassEdge);
    ctx.fillStyle = winGrad;
    ctx.beginPath();
    ctx.arc(0, -0.5, 3.3, 0, TAU);
    ctx.fill();

    // Porthole white glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-1.1, -1.7, 1.05, 0, TAU);
    ctx.fill();

    // Center front stabilizer fin
    ctx.fillStyle = accentBright;
    ctx.beginPath();
    ctx.moveTo(0, 3.5);
    ctx.quadraticCurveTo(1.8, 8.5, 0, 12.2);
    ctx.quadraticCurveTo(-1.8, 8.5, 0, 3.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
