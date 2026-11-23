export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type OrbitLane = 0 | 1; // 0 = Inner (Fast), 1 = Outer (Slow)

export type HazardKind = 'asteroid' | 'panel' | 'buoy';

export type SatelliteId = 'default' | 'tinny' | 'heavy' | 'nano_stopper';

export type GameOverReason = 'collision' | 'timeout';

export interface SatelliteDef {
  id: SatelliteId;
  name: string;
  tagline: string;
  description: string;
  costStars: number;
  unlockSector: number; // 1 = available immediately, 3 = unlocks once Sector 3 is unlocked
  sizeScale: number;
  hitboxScale: number;
  outerImmune: boolean;
  disablesTimer: boolean;
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
  ownedSatellites: SatelliteId[];
  selectedSatellite: SatelliteId;
  claimedSectorBonuses: number[]; // Chapter IDs (1..6) whose +50 rocket bonus has been granted
  dailyLogin: DailyLoginState;
  dailyMissions: DailyMissionState;
  records: Record<number, LevelRecord>;
}

export interface LevelLoadout {
  satelliteId: SatelliteId;
  shieldActive: boolean;
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
}

export interface RunSummary {
  levelId: number;
  flightTime: number;
  shiftCount: number;
  parShifts: number;
  starsEarned: number;
  starsAddedToLobby: number;
  sectorBonusRockets: number;
  completedSectorTitle: string | null;
  isNewBestTime: boolean;
  isNewBestShifts: boolean;
}
