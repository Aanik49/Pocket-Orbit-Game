import {
  ChapterMeta,
  HazardDef,
  HazardKind,
  LevelConfig,
  MoonDef,
  OrbitLane,
  PlanetPalette,
  StarDef,
} from '../types';

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    roman: 'I',
    title: 'Dawn Orbits',
    subtitle: 'Close is fast, far is slow',
    accentHex: '#38BDF8',
    range: [1, 10],
  },
  {
    id: 2,
    roman: 'II',
    title: 'Debris Drift',
    subtitle: 'Gentle drifting debris and calm timing',
    accentHex: '#FB923C',
    range: [11, 20],
  },
  {
    id: 3,
    roman: 'III',
    title: 'Lunar Pull',
    subtitle: 'Moons gently bend your arc and velocity',
    accentHex: '#A78BFA',
    range: [21, 30],
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Binary Tides',
    subtitle: 'Twin gravity wells and drifting stars',
    accentHex: '#34D399',
    range: [31, 40],
  },
  {
    id: 5,
    roman: 'V',
    title: "Kepler's Sanctuary",
    subtitle: 'Orbital choreography at full resonance',
    accentHex: '#FBBF24',
    range: [41, 50],
  },
];

const CHAPTER_PALETTES: PlanetPalette[][] = [
  // Chapter I: Dawn Orbits (Cerulean / Ice / Mist)
  [
    {
      core: '#38BDF8',
      mid: '#0369A1',
      rim: '#BAE6FD',
      glow: 'rgba(56, 189, 248, 0.22)',
      ring: 'rgba(186, 230, 253, 0.28)',
      bgInner: '#101B33',
    },
    {
      core: '#60A5FA',
      mid: '#1D4ED8',
      rim: '#DBEAFE',
      glow: 'rgba(96, 165, 250, 0.22)',
      ring: 'rgba(219, 234, 254, 0.24)',
      bgInner: '#101930',
    },
    {
      core: '#2DD4BF',
      mid: '#0F766E',
      rim: '#CCFBF1',
      glow: 'rgba(45, 212, 191, 0.2)',
      ring: 'rgba(204, 251, 241, 0.25)',
      bgInner: '#0C1D29',
    },
  ],
  // Chapter II: Debris Drift (Terracotta / Ochre / Ember)
  [
    {
      core: '#FB923C',
      mid: '#C2410C',
      rim: '#FED7AA',
      glow: 'rgba(251, 146, 60, 0.22)',
      ring: 'rgba(254, 215, 170, 0.26)',
      bgInner: '#1D1520',
    },
    {
      core: '#F59E0B',
      mid: '#B45309',
      rim: '#FDE68A',
      glow: 'rgba(245, 158, 11, 0.22)',
      ring: 'rgba(253, 230, 138, 0.24)',
      bgInner: '#1A161D',
    },
    {
      core: '#F97316',
      mid: '#9A3412',
      rim: '#FFEDD5',
      glow: 'rgba(249, 115, 22, 0.2)',
      ring: 'rgba(255, 237, 213, 0.24)',
      bgInner: '#1B131E',
    },
  ],
  // Chapter III: Lunar Pull (Amethyst / Indigo / Violet)
  [
    {
      core: '#A78BFA',
      mid: '#6D28D9',
      rim: '#EDE9FE',
      glow: 'rgba(167, 139, 250, 0.24)',
      ring: 'rgba(221, 214, 254, 0.25)',
      bgInner: '#16142C',
    },
    {
      core: '#818CF8',
      mid: '#4338CA',
      rim: '#E0E7FF',
      glow: 'rgba(129, 140, 248, 0.24)',
      ring: 'rgba(224, 231, 255, 0.25)',
      bgInner: '#12152E',
    },
    {
      core: '#C084FC',
      mid: '#7E22CE',
      rim: '#F3E8FF',
      glow: 'rgba(192, 132, 252, 0.22)',
      ring: 'rgba(243, 232, 255, 0.24)',
      bgInner: '#19132B',
    },
  ],
  // Chapter IV: Binary Tides (Jade / Emerald / Deep Teal)
  [
    {
      core: '#34D399',
      mid: '#047857',
      rim: '#D1FAE5',
      glow: 'rgba(52, 211, 153, 0.22)',
      ring: 'rgba(167, 243, 208, 0.25)',
      bgInner: '#0C1E24',
    },
    {
      core: '#10B981',
      mid: '#065F46',
      rim: '#A7F3D0',
      glow: 'rgba(16, 185, 129, 0.22)',
      ring: 'rgba(167, 243, 208, 0.24)',
      bgInner: '#0A1C21',
    },
    {
      core: '#22D3EE',
      mid: '#0E7490',
      rim: '#CFFAFE',
      glow: 'rgba(34, 211, 238, 0.2)',
      ring: 'rgba(207, 250, 254, 0.24)',
      bgInner: '#0C1C2B',
    },
  ],
  // Chapter V: Kepler's Sanctuary (Solar Amber / Champagne / Slate Gold)
  [
    {
      core: '#FBBF24',
      mid: '#B45309',
      rim: '#FEF3C7',
      glow: 'rgba(251, 191, 36, 0.24)',
      ring: 'rgba(254, 243, 199, 0.28)',
      bgInner: '#1A181D',
    },
    {
      core: '#FCD34D',
      mid: '#92400E',
      rim: '#FFFBEB',
      glow: 'rgba(252, 211, 77, 0.22)',
      ring: 'rgba(254, 243, 199, 0.25)',
      bgInner: '#191720',
    },
    {
      core: '#E2E8F0',
      mid: '#475569',
      rim: '#FFFFFF',
      glow: 'rgba(226, 232, 240, 0.2)',
      ring: 'rgba(241, 245, 249, 0.28)',
      bgInner: '#121826',
    },
  ],
];

const LEVEL_NAMES: string[] = [
  // Chapter I (1-10)
  'First Launch',
  'Quiet Meridian',
  'Inner Velocity',
  'Twin Lanes',
  'Calm Crossing',
  'Amber Tangent',
  'Slow Drift',
  'Silent Relay',
  'Split Horizon',
  'First Equinox',
  // Chapter II (11-20)
  'Debris Belt',
  'Counterflow',
  'Broken Wing',
  'Wide Window',
  'Rust Meridian',
  'Gentle Weave',
  'Orbital Gate',
  'Retrograde',
  'Iron Cadence',
  'Cinder Crown',
  // Chapter III (21-30)
  'First Tide',
  'Lunar Slingshot',
  'Outer Shepherd',
  'Dwarf Anchor',
  'Gravity Drag',
  'Crescent Bend',
  'Perigee Pulse',
  'Phase Shift',
  'Tidal Corridor',
  'Eclipse Gate',
  // Chapter IV (31-40)
  'Binary Tides',
  'Opposing Pulls',
  'Wandering Star',
  'Harmonic Drift',
  'Lagrange Point',
  'Emerald Eddy',
  'Countercurrent',
  'Resonant Arc',
  'Deep Perigee',
  'Solstice Ring',
  // Chapter V (41-50)
  "Kepler's Waltz",
  'Golden Tangent',
  'Apsidal Drift',
  'Celestial Loom',
  'Triad Rhythm',
  'Solar Whisper',
  'Event Horizon',
  'Harmonic Lock',
  'Astral Spire',
  'Zenith Resonance',
];

const TAU = Math.PI * 2;

function normalizeAngle(a: number): number {
  const m = a % TAU;
  return m < 0 ? m + TAU : m;
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, TAU - diff);
}

/** Deterministic pseudo-random helper so all 50 levels are fixed & reproducible */
function seeded(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Guarantees every level has wide starting clearance, generous hazard separation, and reachable stars/portal.
 */
function sanitizeLevel(cfg: LevelConfig): LevelConfig {
  const startAngle = cfg.startAngle;
  const safeHazards: HazardDef[] = [];

  for (let idx = 0; idx < cfg.hazards.length; idx++) {
    const h = { ...cfg.hazards[idx] };
    let angle = normalizeAngle(h.angle);

    for (let attempt = 0; attempt < 20; attempt++) {
      let conflict = false;

      // 1. Wide spawn safe zone on starting orbit so player always has calm reaction time
      if (h.orbit === cfg.startOrbit && angularDistance(angle, startAngle) < 1.35) {
        conflict = true;
      }

      // 2. Stationary hazard never overlaps a stationary star on the same lane
      if (!conflict && h.speed === 0) {
        for (const s of cfg.stars) {
          if (
            s.orbit === h.orbit &&
            (!s.speed || s.speed === 0) &&
            angularDistance(angle, s.angle) < 0.68
          ) {
            conflict = true;
            break;
          }
        }
      }

      // 3. Stationary hazard never crowds a stationary portal on the same lane
      if (
        !conflict &&
        h.speed === 0 &&
        (!cfg.portal.speed || cfg.portal.speed === 0) &&
        cfg.portal.orbit === h.orbit &&
        angularDistance(angle, cfg.portal.angle) < 0.72
      ) {
        conflict = true;
      }

      // 4. Generous separation between hazards so lanes always stay readable and fair
      if (!conflict) {
        for (const prev of safeHazards) {
          if (prev.orbit === h.orbit && angularDistance(angle, prev.angle) < 0.95) {
            conflict = true;
            break;
          }
          // Avoid stationary walls blocking both inner and outer orbits together
          if (
            prev.orbit !== h.orbit &&
            prev.speed === 0 &&
            h.speed === 0 &&
            angularDistance(angle, prev.angle) < 0.72
          ) {
            conflict = true;
            break;
          }
        }
      }

      if (!conflict) break;
      angle = normalizeAngle(angle + 0.31);
    }

    h.angle = angle;
    safeHazards.push(h);
  }

  return { ...cfg, hazards: safeHazards };
}

/**
 * Handcrafted, welcoming Chapter I (Levels 1-10):
 * - Calm orbital velocities
 * - Levels 1-6: stationary debris only (1 to 2-3 pieces)
 * - Levels 7-10: introduces a single very slow drifter alongside clean static hazards
 */
function buildChapterOneLevels(): LevelConfig[] {
  const p = CHAPTER_PALETTES[0];
  const baseStart = -Math.PI / 2;

  return [
    // Level 1: Single calm obstacle to learn tapping between inner & outer rings effortlessly
    {
      id: 1,
      chapter: 1,
      name: LEVEL_NAMES[0],
      mechanicNote: 'Close orbit is fast · Far orbit is slow',
      planetPalette: p[0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.48,
      outerSpeed: 0.78,
      parShifts: 4,
      stars: [
        { orbit: 1, angle: -0.1 },
        { orbit: 0, angle: 1.75 },
        { orbit: 1, angle: 3.55 },
      ],
      hazards: [{ orbit: 1, angle: 1.75, speed: 0, type: 'asteroid', size: 12 }],
      moons: [],
      portal: { orbit: 0, angle: -0.75 },
    },
    // Level 2: Two wide-spaced stationary obstacles
    {
      id: 2,
      chapter: 1,
      name: LEVEL_NAMES[1],
      mechanicNote: 'Switch lanes smoothly before each rock',
      planetPalette: p[1],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.5,
      outerSpeed: 0.8,
      parShifts: 4,
      stars: [
        { orbit: 0, angle: 0.15 },
        { orbit: 1, angle: 2.05 },
        { orbit: 0, angle: 3.9 },
      ],
      hazards: [
        { orbit: 1, angle: 0.25, speed: 0, type: 'asteroid', size: 12 },
        { orbit: 0, angle: 2.1, speed: 0, type: 'panel', size: 12 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.6 },
    },
    // Level 3: Starting on inner lane for first time
    {
      id: 3,
      chapter: 1,
      name: LEVEL_NAMES[2],
      mechanicNote: 'Start fast on the inner ring, then step outward',
      planetPalette: p[2],
      startOrbit: 0,
      startAngle: baseStart,
      innerSpeed: 1.54,
      outerSpeed: 0.8,
      parShifts: 4,
      stars: [
        { orbit: 0, angle: 0.25 },
        { orbit: 1, angle: 2.15 },
        { orbit: 0, angle: 4.05 },
      ],
      hazards: [
        { orbit: 0, angle: 2.1, speed: 0, type: 'panel', size: 12 },
        { orbit: 1, angle: 4.0, speed: 0, type: 'asteroid', size: 12 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.55 },
    },
    // Level 4: Gentle alternating pattern
    {
      id: 4,
      chapter: 1,
      name: LEVEL_NAMES[3],
      mechanicNote: 'Rhythmic hops between inner and outer tracks',
      planetPalette: p[0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.56,
      outerSpeed: 0.82,
      parShifts: 5,
      stars: [
        { orbit: 1, angle: 0.3 },
        { orbit: 0, angle: 1.85 },
        { orbit: 1, angle: 3.65 },
      ],
      hazards: [
        { orbit: 1, angle: 1.85, speed: 0, type: 'buoy', size: 12 },
        { orbit: 0, angle: 3.65, speed: 0, type: 'asteroid', size: 12 },
      ],
      moons: [],
      portal: { orbit: 0, angle: -0.62 },
    },
    // Level 5: Three spacious stationary pieces
    {
      id: 5,
      chapter: 1,
      name: LEVEL_NAMES[4],
      mechanicNote: 'Three well-spaced static markers to weave around',
      planetPalette: p[1],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.58,
      outerSpeed: 0.83,
      parShifts: 5,
      stars: [
        { orbit: 0, angle: 0.2 },
        { orbit: 1, angle: 2.0 },
        { orbit: 0, angle: 3.85 },
      ],
      hazards: [
        { orbit: 1, angle: 0.35, speed: 0, type: 'asteroid', size: 12 },
        { orbit: 0, angle: 2.05, speed: 0, type: 'panel', size: 12 },
        { orbit: 1, angle: 3.9, speed: 0, type: 'buoy', size: 12 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.52 },
    },
    // Level 6: Staggered static lanes
    {
      id: 6,
      chapter: 1,
      name: LEVEL_NAMES[5],
      mechanicNote: 'Use the outer ring to breathe before shifting inside',
      planetPalette: p[2],
      startOrbit: 0,
      startAngle: baseStart,
      innerSpeed: 1.6,
      outerSpeed: 0.84,
      parShifts: 5,
      stars: [
        { orbit: 1, angle: 0.35 },
        { orbit: 0, angle: 2.2 },
        { orbit: 1, angle: 4.1 },
      ],
      hazards: [
        { orbit: 0, angle: 0.45, speed: 0, type: 'panel', size: 12 },
        { orbit: 1, angle: 2.2, speed: 0, type: 'asteroid', size: 12 },
        { orbit: 0, angle: 4.1, speed: 0, type: 'buoy', size: 12 },
      ],
      moons: [],
      portal: { orbit: 0, angle: -0.58 },
    },
    // Level 7: First ultra-gentle drifting debris on outer lane
    {
      id: 7,
      chapter: 1,
      name: LEVEL_NAMES[6],
      mechanicNote: 'One slowly drifting rock joins the outer belt',
      planetPalette: p[0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.6,
      outerSpeed: 0.85,
      parShifts: 5,
      stars: [
        { orbit: 0, angle: 0.25 },
        { orbit: 1, angle: 2.15 },
        { orbit: 0, angle: 4.0 },
      ],
      hazards: [
        { orbit: 1, angle: 1.4, speed: -0.22, type: 'asteroid', size: 12 },
        { orbit: 0, angle: 2.75, speed: 0, type: 'panel', size: 12 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.5 },
    },
    // Level 8: Single slow prograde drifter + static buoy
    {
      id: 8,
      chapter: 1,
      name: LEVEL_NAMES[7],
      mechanicNote: 'A slow satellite drifts with your orbit',
      planetPalette: p[1],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.62,
      outerSpeed: 0.86,
      parShifts: 5,
      stars: [
        { orbit: 1, angle: 0.3 },
        { orbit: 0, angle: 2.1 },
        { orbit: 1, angle: 3.95 },
      ],
      hazards: [
        { orbit: 0, angle: 1.15, speed: 0.24, type: 'buoy', size: 12 },
        { orbit: 1, angle: 2.5, speed: 0, type: 'asteroid', size: 12 },
      ],
      moons: [],
      portal: { orbit: 0, angle: -0.55 },
    },
    // Level 9: One gentle drifter + two static pieces
    {
      id: 9,
      chapter: 1,
      name: LEVEL_NAMES[8],
      mechanicNote: 'Wait on the slow outer ring to let debris pass',
      planetPalette: p[2],
      startOrbit: 0,
      startAngle: baseStart,
      innerSpeed: 1.64,
      outerSpeed: 0.87,
      parShifts: 6,
      stars: [
        { orbit: 0, angle: 0.2 },
        { orbit: 1, angle: 2.2 },
        { orbit: 0, angle: 4.15 },
      ],
      hazards: [
        { orbit: 1, angle: 1.0, speed: -0.26, type: 'panel', size: 12 },
        { orbit: 0, angle: 2.15, speed: 0, type: 'asteroid', size: 12 },
        { orbit: 1, angle: 3.9, speed: 0, type: 'buoy', size: 12 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.48 },
    },
    // Level 10: Chapter I finale — crisp, calm, and fair
    {
      id: 10,
      chapter: 1,
      name: LEVEL_NAMES[9],
      mechanicNote: 'Chapter I finale · Combine inner bursts and outer patience',
      planetPalette: p[0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.66,
      outerSpeed: 0.88,
      parShifts: 6,
      stars: [
        { orbit: 0, angle: 0.25 },
        { orbit: 1, angle: 2.1 },
        { orbit: 0, angle: 4.0 },
      ],
      hazards: [
        { orbit: 0, angle: 1.35, speed: -0.28, type: 'asteroid', size: 12 },
        { orbit: 1, angle: 3.1, speed: 0.24, type: 'panel', size: 12 },
        { orbit: 0, angle: 4.75, speed: 0, type: 'buoy', size: 12 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.52 },
    },
  ];
}

/**
 * Levels 11-50 with a much smoother, zen-friendly difficulty curve:
 * - Chapter II (11-20): Very approachable gentle moving debris (2-3 hazards, calm speeds)
 * - Chapter III (21-30): Lunar gravity wells with only 2-3 light hazards so gravity is easy to read
 * - Chapter IV (31-40): Dual moons + gentle drifting stars, 2-3 hazards
 * - Chapter V (41-50): Satisfying late-game mastery, capped at 3-4 well-spaced hazards
 */
function buildChapterTwoToFiveLevel(id: number): LevelConfig {
  const chapter = Math.ceil(id / 10); // 2..5
  const inChapter = ((id - 1) % 10) + 1; // 1..10
  const progress = (id - 11) / 39; // 0..1 across chapters 2-5
  const paletteList = CHAPTER_PALETTES[chapter - 1];
  const palette = paletteList[(id - 1) % paletteList.length];

  const startOrbit: OrbitLane = id % 3 === 0 ? 0 : 1;
  const startAngle = -Math.PI / 2;

  // Calm, smoothly rising orbital speeds (easier & more readable across all chapters)
  const innerSpeed = Number((1.66 + progress * 0.46 + (inChapter % 3) * 0.02).toFixed(2));
  const outerSpeed = Number((0.87 + progress * 0.2 + ((inChapter + 1) % 2) * 0.015).toFixed(2));

  // Stars: 3 stars normally, 4 stars only on late chapter climaxes (30, 40, 50)
  const starCount = id === 30 || id === 40 || id === 50 ? 4 : 3;
  const hasDriftingStars = (chapter === 4 && inChapter >= 3) || (chapter === 5 && inChapter >= 2);
  const stars: StarDef[] = [];
  const starBaseOffset = 0.22 + seeded(id * 3.1) * 0.42;

  for (let i = 0; i < starCount; i++) {
    const orbit: OrbitLane = ((i + id) % 2) as OrbitLane;
    const angle = normalizeAngle(
      startAngle + 1.15 + (i * (TAU - 1.7)) / starCount + starBaseOffset * 0.2
    );
    const drift =
      hasDriftingStars && (i % 2 === 1 || id >= 47)
        ? Number(((i % 2 === 0 ? 1 : -1) * (0.16 + progress * 0.12)).toFixed(2))
        : 0;
    stars.push({ orbit, angle, speed: drift });
  }

  // Clean, spacious hazard counts (significantly lighter in Ch. 2 & 3)
  let hazardCount = 2;
  if (chapter === 2) {
    hazardCount = inChapter <= 4 ? 2 : 3;
  } else if (chapter === 3) {
    hazardCount = inChapter <= 5 ? 2 : 3;
  } else if (chapter === 4) {
    hazardCount = inChapter <= 4 ? 2 : 3;
  } else {
    hazardCount = inChapter <= 5 ? 3 : 4;
  }

  const kinds: HazardKind[] = ['asteroid', 'panel', 'buoy'];
  const hazards: HazardDef[] = [];

  for (let i = 0; i < hazardCount; i++) {
    const orbit: OrbitLane = ((i + (id % 2)) % 2) as OrbitLane;
    const baseAngle = normalizeAngle(
      startAngle + 1.5 + (i * (TAU - 1.35)) / hazardCount + seeded(id * 11 + i * 7) * 0.35
    );

    let speed = 0;
    if (chapter === 2) {
      // Chapter II: Gentle drifting speeds, mixing 1 stationary anchor on early levels
      if (inChapter <= 3 && i === hazardCount - 1) {
        speed = 0;
      } else {
        const dir = i % 2 === 0 ? -1 : 1;
        speed = dir * (0.26 + inChapter * 0.018);
      }
    } else if (chapter === 3) {
      // Chapter III: Keep debris slow while player enjoys lunar gravity
      if (inChapter <= 2 && i === hazardCount - 1) {
        speed = 0;
      } else {
        const dir = i % 2 === 0 ? -1 : 1;
        speed = dir * (0.28 + inChapter * 0.02);
      }
    } else if (chapter === 4) {
      const dir = orbit === 0 ? -1 : 1;
      speed = dir * (0.36 + inChapter * 0.018);
    } else {
      const dir = (i + orbit) % 2 === 0 ? -1 : 1;
      speed = dir * (0.44 + inChapter * 0.018 + (orbit === 0 ? 0.04 : 0));
    }

    hazards.push({
      orbit,
      angle: baseAngle,
      speed: Number(speed.toFixed(2)),
      type: kinds[(id + i) % kinds.length],
      size: 12.5,
    });
  }

  // Gravity Moons (Chapter III onwards)
  const moons: MoonDef[] = [];
  if (chapter === 3) {
    if (inChapter <= 4) {
      moons.push({
        orbitRadiusMult: 1.33,
        angle: 1.05 + inChapter * 0.55,
        speed: 0.3 + inChapter * 0.025,
        wellRadiusMult: 0.5,
        speedBoost: 1.32 + inChapter * 0.02,
        radialTug: 0.068,
        color: '#C4B5FD',
      });
    } else if (inChapter <= 7) {
      moons.push({
        orbitRadiusMult: 0.48,
        angle: 2.1 + inChapter * 0.4,
        speed: -(0.38 + (inChapter - 4) * 0.03),
        wellRadiusMult: 0.47,
        speedBoost: 0.72,
        radialTug: -0.065,
        color: '#A5B4FC',
      });
    } else {
      const isOuter = inChapter % 2 === 1;
      moons.push({
        orbitRadiusMult: isOuter ? 1.31 : 0.47,
        angle: 0.8 + inChapter * 0.5,
        speed: isOuter ? 0.38 : -0.44,
        wellRadiusMult: 0.52,
        speedBoost: isOuter ? 1.4 : 0.68,
        radialTug: isOuter ? 0.08 : -0.072,
        color: isOuter ? '#DDD6FE' : '#93C5FD',
      });
    }
  } else if (chapter === 4) {
    moons.push({
      orbitRadiusMult: 1.32,
      angle: 0.6 + inChapter * 0.45,
      speed: 0.34 + inChapter * 0.02,
      wellRadiusMult: 0.48,
      speedBoost: 1.38,
      radialTug: 0.075,
      color: '#6EE7B7',
    });
    if (inChapter >= 2) {
      moons.push({
        orbitRadiusMult: 0.47,
        angle: normalizeAngle(0.6 + inChapter * 0.45 + Math.PI),
        speed: -(0.4 + inChapter * 0.02),
        wellRadiusMult: 0.45,
        speedBoost: 0.7,
        radialTug: -0.07,
        color: '#67E8F9',
      });
    }
  } else if (chapter === 5) {
    const dualOuter = inChapter % 3 === 0;
    if (dualOuter) {
      moons.push({
        orbitRadiusMult: 1.32,
        angle: 0.4 + inChapter * 0.3,
        speed: 0.38 + inChapter * 0.015,
        wellRadiusMult: 0.48,
        speedBoost: 1.42,
        radialTug: 0.08,
        color: '#FDE68A',
      });
      moons.push({
        orbitRadiusMult: 1.32,
        angle: normalizeAngle(0.4 + inChapter * 0.3 + Math.PI),
        speed: 0.38 + inChapter * 0.015,
        wellRadiusMult: 0.46,
        speedBoost: 0.68,
        radialTug: 0.075,
        color: '#C4B5FD',
      });
    } else {
      moons.push({
        orbitRadiusMult: 1.31,
        angle: 0.9 + inChapter * 0.38,
        speed: 0.4 + inChapter * 0.018,
        wellRadiusMult: 0.5,
        speedBoost: 1.44,
        radialTug: 0.082,
        color: '#FDE68A',
      });
      moons.push({
        orbitRadiusMult: 0.46,
        angle: normalizeAngle(2.9 + inChapter * 0.42),
        speed: -(0.46 + inChapter * 0.018),
        wellRadiusMult: 0.46,
        speedBoost: 0.66,
        radialTug: -0.075,
        color: '#93C5FD',
      });
    }
  }

  // Wormhole portal (moves gently only in late chapters)
  const portalOrbit: OrbitLane = ((id + 1) % 2) as OrbitLane;
  const portalAngle = normalizeAngle(startAngle + 0.6 + seeded(id * 17) * 0.45);
  const movingPortal = id === 30 || (chapter === 4 && inChapter >= 8) || (chapter === 5 && inChapter >= 5);
  const portalSpeed = movingPortal
    ? Number(((id % 2 === 0 ? 1 : -1) * (0.18 + progress * 0.12)).toFixed(2))
    : 0;

  let mechanicNote = 'Calm timing between orbital lanes';
  if (chapter === 2) {
    mechanicNote = 'Gentle drifting debris · Switch lanes early';
  } else if (chapter === 3) {
    mechanicNote =
      inChapter <= 4
        ? 'Outer moon gently accelerates your orbit'
        : inChapter <= 7
          ? 'Inner dwarf moon softly slows your craft'
          : 'Anticipate lunar pull as you cross lanes';
  } else if (chapter === 4) {
    mechanicNote = hasDriftingStars
      ? 'Twin moons and softly drifting stars'
      : 'Balance opposing lunar gravity fields';
  } else {
    mechanicNote = movingPortal
      ? 'Align with the moving wormhole through tidal pull'
      : 'Precision orbital rhythm across twin wells';
  }

  const parShifts = Math.min(10, starCount + 2 + Math.floor(chapter * 0.6));

  return sanitizeLevel({
    id,
    chapter,
    name: LEVEL_NAMES[id - 1],
    mechanicNote,
    planetPalette: palette,
    startOrbit,
    startAngle,
    innerSpeed,
    outerSpeed,
    parShifts,
    stars,
    hazards,
    moons,
    portal: {
      orbit: portalOrbit,
      angle: portalAngle,
      speed: portalSpeed,
    },
  });
}

function createAllLevels(): LevelConfig[] {
  const ch1 = buildChapterOneLevels().map(sanitizeLevel);
  const rest: LevelConfig[] = [];
  for (let id = 11; id <= 50; id++) {
    rest.push(buildChapterTwoToFiveLevel(id));
  }
  return [...ch1, ...rest];
}

export const LEVELS: LevelConfig[] = createAllLevels();

export function getLevelById(id: number): LevelConfig {
  const clamped = Math.max(1, Math.min(LEVELS.length, id));
  return LEVELS[clamped - 1];
}

export function getChapterForLevel(id: number): ChapterMeta {
  const idx = Math.max(0, Math.min(CHAPTERS.length - 1, Math.ceil(id / 10) - 1));
  return CHAPTERS[idx];
}
