export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type OrbitLane = 0 | 1; // 0 = Inner (Fast), 1 = Outer (Slow)

export type HazardKind = 'asteroid' | 'panel' | 'buoy';

export interface PlanetPalette {
  core: string;
  mid: string;
  rim: string;
  glow: string;
  ring: string;
  bgInner: string;
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
  id: number; // 1..50
  chapter: number; // 1..5
  name: string;
  mechanicNote: string;
  planetPalette: PlanetPalette;
  startOrbit: OrbitLane;
  startAngle: number;
  innerSpeed: number; // rad/s
  outerSpeed: number; // rad/s
  parShifts: number;
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
}

export interface LevelRecord {
  completed: boolean;
  stars: number;
  bestTime: number | null;
  bestShifts: number | null;
}

export interface SaveData {
  currentLevelId: number;
  muted: boolean;
  lowPower: boolean;
  records: Record<number, LevelRecord>;
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
}

export interface RunSummary {
  levelId: number;
  flightTime: number;
  shiftCount: number;
  parShifts: number;
  starsEarned: number;
  isNewBestTime: boolean;
  isNewBestShifts: boolean;
}
