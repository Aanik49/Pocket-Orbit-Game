export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type OrbitLane = 0 | 1; // 0 = Inner (Fast), 1 = Outer (Slow)

export type HazardKind = 'asteroid' | 'panel' | 'buoy';

export type SatelliteId =
  | 'default'
  | 'tinny'
  | 'heavy'
  | 'nano_stopper'
  | 'magnet_probe'
  | 'phase_dasher'
  | 'star_collector';

export type TrailId = 'classic' | 'stardust' | 'aurora' | 'prism' | 'crimson_nova';

export type BoosterKind = 'shield' | 'chrono' | 'magnet';

export type GameOverReason = 'collision' | 'timeout' | 'flare';

export interface SatelliteDef {
  id: SatelliteId;
  name: string;
  tagline: string;
  description: string;
  costStars: number;
  unlockSector: number; // 1 = available immediately, 2+ = unlocks once that sector is unlocked
  sizeScale: number;
  hitboxScale: number;
  outerImmune: boolean;
  disablesTimer: boolean;
  magnetRangeMult?: number; // Extra star pickup & pull radius multiplier
  phaseDashSeconds?: number; // Brief invulnerability window upon shifting orbits
  bonusLobbyStars?: number; // Extra Lobby Stars awarded on level completion
}

export interface TrailDef {
  id: TrailId;
  name: string;
  tagline: string;
  description: string;
  costStars: number;
  previewColors: [string, string, string];
}

export interface PlanetPalette {
  core: string;
  mid: string;
  rim: string;
  glow: string;
  ring: string;
  bgInner: string;
  strata: string[]; // Layered hand-cut wavy construction paper bands
}

export interface StarDef {
  orbit: OrbitLane;
  angle: number;
  speed?: number; // Optional gentle orbital drift in advanced levels
  magnetic?: boolean; // Magnetic star cluster that pulls toward craft when shifting nearby
}

export interface HazardDef {
  orbit: OrbitLane;
  angle: number;
  speed: number; // rad/s (0 = stationary, negative = counter-orbit, positive = prograde)
  type: HazardKind;
  size: number;
}

export interface MoonDef {
  orbitRadiusMult: number; // Relative to outerRadius (e.g., 1.32 outer moon, 0.48 inner dwarf moon)
  angle: number;
  speed: number;
  wellRadiusMult: number; // Relative to outerRadius (e.g., 0.52)
  speedBoost: number; // > 1 accelerates (slingshot), < 1 slows (gravity drag)
  radialTug: number; // Positive pulls outward, negative pulls inward (px scaled by outerRadius)
  color: string;
}

export interface SolarFlareDef {
  orbit: OrbitLane; // Starting lane targeted by the periodic flare sweep
  period: number; // Total seconds per cycle (idle + telegraph + active)
  telegraphDuration: number; // Warning duration before flare erupts
  activeDuration: number; // Scorching active sweep duration
  initialDelay: number; // Seconds before first telegraph begins
  alternating?: boolean; // Alternates between inner and outer lane each cycle
}

export interface WormholeGateDef {
  id: string;
  orbit: OrbitLane;
  angle: number;
  targetOrbit: OrbitLane;
  targetAngle: number; // Usually opposite side (angle + Math.PI)
  color?: string;
}

export type BossEventType = 'debris_ring' | 'polarity_flip' | 'solar_surge';

export interface BossConfig {
  title: string;
  subtitle: string;
  phases: number; // 2 or 3 phases triggered as stars are collected
  events: BossEventType[]; // Boss signature twists triggered across phases
  ringInterval?: number; // Seconds between expanding debris ring pulses in active boss phases
  polarityFlipPhase?: number; // Phase index (2 or 3) that flips orbital direction
  bonusRockets: number;
}

export interface PortalDef {
  orbit: OrbitLane;
  angle: number;
  speed?: number; // Optional gentle movement in high-tier levels
}

export interface LevelConfig {
  id: number; // 1..60
  chapter: number; // 1..6
  name: string;
  mechanicNote: string;
  planetPalette: PlanetPalette;
  startOrbit: OrbitLane;
  startAngle: number;
  innerSpeed: number; // rad/s
  outerSpeed: number; // rad/s
  parShifts: number;
  timeLimit: number | null; // Seconds from Sector 3 (Lv. 21-60) onwards; null for Sectors 1-2
  stars: StarDef[];
  hazards: HazardDef[];
  moons: MoonDef[];
  solarFlares?: SolarFlareDef[];
  wormholeGates?: WormholeGateDef[];
  boss?: BossConfig;
  portal: PortalDef;
}

export interface ChapterMeta {
  id: number;
  roman: string;
  title: string;
  subtitle: string;
  accentHex: string;
  range: [number, number];
  domeTheme: 'asteroid' | 'nebula' | 'station' | 'lunar' | 'binary' | 'core';
}

export interface LevelRecord {
  completed: boolean;
  stars: number;
  bestTime: number | null;
  bestShifts: number | null;
}

export interface DailyLoginState {
  lastClaimDate: string | null; // YYYY-MM-DD
  claimedDays: number; // 0..7 in current 7-day cycle
}

export type MissionMetric = 'levels_cleared' | 'orbital_stars' | 'shifts' | 'three_star_clears';

export interface DailyMissionItem {
  id: string;
  difficulty: 'easy' | 'hard';
  title: string;
  metric: MissionMetric;
  target: number;
  progress: number;
  rewardType: 'stars' | 'rockets';
  rewardAmount: number;
  claimed: boolean;
}

export interface DailyMissionState {
  date: string; // YYYY-MM-DD
  missions: DailyMissionItem[];
}

export interface SaveData {
  currentLevelId: number;
  muted: boolean;
  musicMuted: boolean;
  lowPower: boolean;
  stars: number;
  rockets: number;
  shields: number;
  chronoPulses: number;
  starMagnets: number;
  ownedSatellites: SatelliteId[];
  selectedSatellite: SatelliteId;
  ownedTrails: TrailId[];
  selectedTrail: TrailId;
  claimedSectorBonuses: number[]; // Chapter IDs (1..6) whose +50 rocket bonus has been granted
  dailyLogin: DailyLoginState;
  dailyMissions: DailyMissionState;
  records: Record<number, LevelRecord>;
}

export interface LevelLoadout {
  satelliteId: SatelliteId;
  trailId: TrailId;
  shieldActive: boolean;
  chronoAvailable: boolean;
  magnetAvailable: boolean;
}

export interface HudSnapshot {
  levelId: number;
  starsCollected: number;
  totalStars: number;
  portalActive: boolean;
  portalOrbit: OrbitLane;
  targetOrbit: OrbitLane;
  inGravityWell: boolean;
  gravityMode: 'none' | 'boost' | 'drag';
  shiftCount: number;
  timeLimit: number | null;
  timeRemaining: number | null;
  timerDisabled: boolean;
  shieldActive: boolean;
  satelliteId: SatelliteId;
  // New mechanic & booster telemetry
  chronoRemaining: number; // > 0 when Slow-Mo Chrono Pulse is active
  chronoUsed: boolean;
  magnetRemaining: number; // > 0 when Star Magnet booster is active
  magnetUsed: boolean;
  phaseInvulnActive: boolean;
  flareWarningLane: OrbitLane | null;
  flareActiveLane: OrbitLane | null;
  orbitReversed: boolean;
  bossPhase: number; // 0 if not a boss level, 1..N during boss encounter
  bossTotalPhases: number;
  bossAlert: string | null;
}

export interface RunSummary {
  levelId: number;
  flightTime: number;
  shiftCount: number;
  parShifts: number;
  starsEarned: number;
  starsAddedToLobby: number;
  craftBonusStars: number;
  bossBonusRockets: number;
  sectorBonusRockets: number;
  completedSectorTitle: string | null;
  isNewBestTime: boolean;
  isNewBestShifts: boolean;
}
