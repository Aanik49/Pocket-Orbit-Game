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
    subtitle: 'Counter-orbiting lanes and timing gates',
    accentHex: '#FB923C',
    range: [11, 20],
  },
  {
    id: 3,
    roman: 'III',
    title: 'Lunar Pull',
    subtitle: 'Moons bend your arc and velocity',
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
  'Slow Drift',
  'Crossing Arc',
  'Silent Relay',
  'Amber Tangent',
  'Split Horizon',
  'First Equinox',
  // Chapter II (11-20)
  'Debris Belt',
  'Counterflow',
  'Broken Wing',
  'Narrow Window',
  'Rust Meridian',
  'Needle Thread',
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
 * Guarantees every level has fair starting clearance and reachable stars/portal.
 */
function sanitizeLevel(cfg: LevelConfig): LevelConfig {
  const startAngle = cfg.startAngle;
  const safeHazards: HazardDef[] = [];

  for (let idx = 0; idx < cfg.hazards.length; idx++) {
    const h = { ...cfg.hazards[idx] };
    let angle = normalizeAngle(h.angle);

    // Attempt small angular nudges if a hazard conflicts with spawn, stationary stars/portal, or twin wall
    for (let attempt = 0; attempt < 16; attempt++) {
      let conflict = false;

      // 1. Spawn safe zone on starting orbit
      if (h.orbit === cfg.startOrbit && angularDistance(angle, startAngle) < 1.05) {
        conflict = true;
      }

      // 2. Stationary hazard must never sit on a stationary star on the same lane
      if (!conflict && h.speed === 0) {
        for (const s of cfg.stars) {
          if (
            s.orbit === h.orbit &&
            (!s.speed || s.speed === 0) &&
            angularDistance(angle, s.angle) < 0.52
          ) {
            conflict = true;
            break;
          }
        }
      }

      // 3. Stationary hazard must never block stationary portal on same lane
      if (
        !conflict &&
        h.speed === 0 &&
        (!cfg.portal.speed || cfg.portal.speed === 0) &&
        cfg.portal.orbit === h.orbit &&
        angularDistance(angle, cfg.portal.angle) < 0.56
      ) {
        conflict = true;
      }

      // 4. Avoid impossible walls with previously placed hazards
      if (!conflict) {
        for (const prev of safeHazards) {
          if (prev.orbit === h.orbit && angularDistance(angle, prev.angle) < 0.62) {
            conflict = true;
            break;
          }
          // Stationary wall across both lanes at identical angle
          if (
            prev.orbit !== h.orbit &&
            prev.speed === 0 &&
            h.speed === 0 &&
            angularDistance(angle, prev.angle) < 0.48
          ) {
            conflict = true;
            break;
          }
        }
      }

      if (!conflict) break;
      angle = normalizeAngle(angle + 0.34);
    }

    h.angle = angle;
    safeHazards.push(h);
  }

  return { ...cfg, hazards: safeHazards };
}

function buildHandcraftedEarlyLevels(): LevelConfig[] {
  const p = CHAPTER_PALETTES;
  const baseStart = -Math.PI / 2;

  return [
    // Level 1: Pure, iconic introduction matching the prototype feel
    {
      id: 1,
      chapter: 1,
      name: LEVEL_NAMES[0],
      mechanicNote: 'Close orbit is fast · Far orbit is slow',
      planetPalette: p[0][0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.88,
      outerSpeed: 1.02,
      parShifts: 4,
      stars: [
        { orbit: 1, angle: 0.05 },
        { orbit: 0, angle: 1.78 },
        { orbit: 1, angle: 3.6 },
      ],
      hazards: [
        { orbit: 1, angle: 1.78, speed: 0, type: 'asteroid', size: 13 },
        { orbit: 0, angle: 3.6, speed: 0, type: 'panel', size: 14 },
      ],
      moons: [],
      portal: { orbit: 0, angle: -0.68 },
    },
    // Level 2: Alternating stationary rhythm
    {
      id: 2,
      chapter: 1,
      name: LEVEL_NAMES[1],
      mechanicNote: 'Switch lanes early before each rock',
      planetPalette: p[0][1],
      startOrbit: 0,
      startAngle: baseStart,
      innerSpeed: 1.9,
      outerSpeed: 1.04,
      parShifts: 4,
      stars: [
        { orbit: 0, angle: 0.15 },
        { orbit: 1, angle: 2.0 },
        { orbit: 0, angle: 3.9 },
      ],
      hazards: [
        { orbit: 0, angle: 1.95, speed: 0, type: 'panel', size: 14 },
        { orbit: 1, angle: 3.85, speed: 0, type: 'asteroid', size: 13 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.55 },
    },
    // Level 3: Three stationary obstacles teaching speed anticipation
    {
      id: 3,
      chapter: 1,
      name: LEVEL_NAMES[2],
      mechanicNote: 'Use the inner ring to overtake wide gaps',
      planetPalette: p[0][2],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.96,
      outerSpeed: 1.02,
      parShifts: 5,
      stars: [
        { orbit: 0, angle: 0.35 },
        { orbit: 1, angle: 2.25 },
        { orbit: 0, angle: 4.15 },
      ],
      hazards: [
        { orbit: 1, angle: 0.45, speed: 0, type: 'asteroid', size: 13 },
        { orbit: 0, angle: 2.25, speed: 0, type: 'panel', size: 14 },
        { orbit: 1, angle: 4.15, speed: 0, type: 'buoy', size: 13 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.45 },
    },
    // Level 4: Staggered twin lanes
    {
      id: 4,
      chapter: 1,
      name: LEVEL_NAMES[3],
      mechanicNote: 'Staggered gates reward calm pacing',
      planetPalette: p[0][0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.94,
      outerSpeed: 1.05,
      parShifts: 5,
      stars: [
        { orbit: 1, angle: 0.4 },
        { orbit: 0, angle: 1.65 },
        { orbit: 1, angle: 3.45 },
      ],
      hazards: [
        { orbit: 1, angle: 1.65, speed: 0, type: 'panel', size: 14 },
        { orbit: 0, angle: 2.7, speed: 0, type: 'asteroid', size: 13 },
        { orbit: 1, angle: 4.55, speed: 0, type: 'asteroid', size: 13 },
      ],
      moons: [],
      portal: { orbit: 0, angle: -0.58 },
    },
    // Level 5: First gentle moving debris
    {
      id: 5,
      chapter: 1,
      name: LEVEL_NAMES[4],
      mechanicNote: 'First drifting debris enters the outer belt',
      planetPalette: p[0][1],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.96,
      outerSpeed: 1.05,
      parShifts: 5,
      stars: [
        { orbit: 0, angle: 0.2 },
        { orbit: 1, angle: 2.15 },
        { orbit: 0, angle: 4.05 },
      ],
      hazards: [
        { orbit: 1, angle: 1.15, speed: -0.42, type: 'asteroid', size: 13 },
        { orbit: 0, angle: 2.6, speed: 0, type: 'panel', size: 14 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.48 },
    },
  ];
}

function buildGeneratedLevel(id: number): LevelConfig {
  const chapter = Math.ceil(id / 10); // 1..5
  const inChapter = ((id - 1) % 10) + 1; // 1..10
  const progress = (id - 1) / 49; // 0..1
  const paletteList = CHAPTER_PALETTES[chapter - 1];
  const palette = paletteList[(id - 1) % paletteList.length];

  const startOrbit: OrbitLane = id % 3 === 0 ? 0 : 1;
  const startAngle = -Math.PI / 2;

  // Smooth Keplerian speed progression (stays calm and readable all the way to 50)
  const innerSpeed = Number((1.92 + progress * 0.48 + (inChapter % 3) * 0.03).toFixed(2));
  const outerSpeed = Number((1.04 + progress * 0.16 + ((inChapter + 1) % 2) * 0.02).toFixed(2));

  // Stars: 3 stars normally, 4 stars on chapter climaxes (10, 20, 30, 40, 45, 50)
  const starCount = id % 10 === 0 || id === 45 ? 4 : 3;
  const hasDriftingStars = (chapter === 4 && inChapter >= 3) || (chapter === 5 && inChapter >= 2);
  const stars: StarDef[] = [];
  const starBaseOffset = 0.25 + seeded(id * 3.1) * 0.5;

  for (let i = 0; i < starCount; i++) {
    const orbit: OrbitLane = ((i + id) % 2) as OrbitLane;
    const angle = normalizeAngle(startAngle + 1.05 + (i * (TAU - 1.55)) / starCount + starBaseOffset * 0.25);
    const drift =
      hasDriftingStars && (i % 2 === 1 || id >= 46)
        ? Number(((i % 2 === 0 ? 1 : -1) * (0.2 + progress * 0.14)).toFixed(2))
        : 0;
    stars.push({ orbit, angle, speed: drift });
  }

  // Hazards: clean, readable escalation from 2 -> 5 hazards
  let hazardCount = 3;
  if (chapter === 1) hazardCount = inChapter <= 7 ? 3 : 4;
  else if (chapter === 2) hazardCount = inChapter <= 5 ? 3 : 4;
  else if (chapter === 3) hazardCount = inChapter <= 3 ? 2 : inChapter <= 7 ? 3 : 4;
  else if (chapter === 4) hazardCount = inChapter <= 4 ? 3 : 4;
  else hazardCount = inChapter <= 5 ? 4 : 5;

  const kinds: HazardKind[] = ['asteroid', 'panel', 'buoy'];
  const hazards: HazardDef[] = [];

  for (let i = 0; i < hazardCount; i++) {
    const orbit: OrbitLane = ((i + (id % 2)) % 2) as OrbitLane;
    const baseAngle = normalizeAngle(
      startAngle + 1.3 + (i * (TAU - 1.2)) / hazardCount + seeded(id * 11 + i * 7) * 0.45
    );

    let speed = 0;
    if (chapter === 1) {
      // Levels 6-10: mix of static and gentle drifters
      if (i % 2 === 0) {
        speed = (i === 0 ? -1 : 1) * (0.38 + inChapter * 0.03);
      }
    } else if (chapter === 2) {
      // Debris Drift: counter-orbiting & alternating speeds
      const dir = orbit === 0 ? -1 : i % 2 === 0 ? -1 : 1;
      speed = dir * (0.48 + inChapter * 0.042 + (orbit === 0 ? 0.12 : 0));
    } else if (chapter === 3) {
      // Lunar Pull: cleaner hazards while learning moons
      if (inChapter === 1) {
        speed = i === 0 ? 0 : -0.4;
      } else {
        const dir = i % 2 === 0 ? -1 : 1;
        speed = i === hazardCount - 1 && inChapter < 6 ? 0 : dir * (0.45 + inChapter * 0.045);
      }
    } else if (chapter === 4) {
      // Binary Tides: crisp counter-flowing lanes
      const dir = orbit === 0 ? -1 : 1;
      speed = dir * (0.56 + inChapter * 0.04 + (i % 2) * 0.1);
    } else {
      // Chapter V: Kepler's Sanctuary
      const dir = (i + orbit) % 2 === 0 ? -1 : 1;
      speed = dir * (0.64 + inChapter * 0.038 + (orbit === 0 ? 0.14 : 0));
    }

    hazards.push({
      orbit,
      angle: baseAngle,
      speed: Number(speed.toFixed(2)),
      type: kinds[(id + i) % kinds.length],
      size: orbit === 0 ? 13 : 14,
    });
  }

  // Gravity Moons (Chapter III onwards!)
  const moons: MoonDef[] = [];
  if (chapter === 3) {
    if (inChapter <= 3) {
      // Outer slingshot moon (boosts speed & gently tugs outward)
      moons.push({
        orbitRadiusMult: 1.32,
        angle: 1.05 + inChapter * 0.55,
        speed: 0.36 + inChapter * 0.04,
        wellRadiusMult: 0.52,
        speedBoost: 1.38 + inChapter * 0.03,
        radialTug: 0.08,
        color: '#C4B5FD',
      });
    } else if (inChapter <= 6) {
      // Inner dwarf drag moon (slows velocity & gently tugs inward)
      moons.push({
        orbitRadiusMult: 0.48,
        angle: 2.1 + inChapter * 0.4,
        speed: -(0.46 + (inChapter - 3) * 0.05),
        wellRadiusMult: 0.48,
        speedBoost: 0.68,
        radialTug: -0.075,
        color: '#A5B4FC',
      });
    } else {
      // Stronger shepherd moon
      const isOuter = inChapter % 2 === 1;
      moons.push({
        orbitRadiusMult: isOuter ? 1.3 : 0.47,
        angle: 0.8 + inChapter * 0.5,
        speed: isOuter ? 0.48 : -0.56,
        wellRadiusMult: 0.54,
        speedBoost: isOuter ? 1.48 : 0.64,
        radialTug: isOuter ? 0.095 : -0.085,
        color: isOuter ? '#DDD6FE' : '#93C5FD',
      });
    }
  } else if (chapter === 4) {
    // Binary Tides: Dual opposing moons!
    moons.push({
      orbitRadiusMult: 1.32,
      angle: 0.6 + inChapter * 0.45,
      speed: 0.4 + inChapter * 0.025,
      wellRadiusMult: 0.5,
      speedBoost: 1.44,
      radialTug: 0.085,
      color: '#6EE7B7',
    });
    if (inChapter >= 2) {
      moons.push({
        orbitRadiusMult: 0.47,
        angle: normalizeAngle(0.6 + inChapter * 0.45 + Math.PI),
        speed: -(0.48 + inChapter * 0.025),
        wellRadiusMult: 0.46,
        speedBoost: 0.66,
        radialTug: -0.08,
        color: '#67E8F9',
      });
    }
  } else if (chapter === 5) {
    // Kepler's Sanctuary: Twin high-clarity tidal moons (and 2 opposing outer moons on select levels)
    const dualOuter = inChapter % 3 === 0;
    if (dualOuter) {
      moons.push({
        orbitRadiusMult: 1.32,
        angle: 0.4 + inChapter * 0.3,
        speed: 0.46 + inChapter * 0.02,
        wellRadiusMult: 0.5,
        speedBoost: 1.48,
        radialTug: 0.09,
        color: '#FDE68A',
      });
      moons.push({
        orbitRadiusMult: 1.32,
        angle: normalizeAngle(0.4 + inChapter * 0.3 + Math.PI),
        speed: 0.46 + inChapter * 0.02,
        wellRadiusMult: 0.48,
        speedBoost: 0.65,
        radialTug: 0.085,
        color: '#C4B5FD',
      });
    } else {
      moons.push({
        orbitRadiusMult: 1.31,
        angle: 0.9 + inChapter * 0.38,
        speed: 0.48 + inChapter * 0.02,
        wellRadiusMult: 0.52,
        speedBoost: 1.5,
        radialTug: 0.095,
        color: '#FDE68A',
      });
      moons.push({
        orbitRadiusMult: 0.46,
        angle: normalizeAngle(2.9 + inChapter * 0.42),
        speed: -(0.56 + inChapter * 0.02),
        wellRadiusMult: 0.47,
        speedBoost: 0.62,
        radialTug: -0.085,
        color: '#93C5FD',
      });
    }
  }

  // Wormhole portal (gently moves on chapter 3 finale & selected levels in Chapters IV–V)
  const portalOrbit: OrbitLane = ((id + 1) % 2) as OrbitLane;
  const portalAngle = normalizeAngle(startAngle + 0.55 + seeded(id * 17) * 0.5);
  const movingPortal = id === 30 || (chapter === 4 && inChapter >= 7) || (chapter === 5 && inChapter >= 4);
  const portalSpeed = movingPortal ? Number(((id % 2 === 0 ? 1 : -1) * (0.24 + progress * 0.14)).toFixed(2)) : 0;

  // Concise zen mechanic whisper
  let mechanicNote = 'Calm timing between orbital lanes';
  if (chapter === 1) {
    mechanicNote = inChapter >= 8 ? 'Watch drifting debris before switching' : 'Close orbit accelerates · Far orbit slows';
  } else if (chapter === 2) {
    mechanicNote = 'Counter-orbiting debris closes gaps fast';
  } else if (chapter === 3) {
    mechanicNote =
      inChapter <= 3
        ? 'Outer moon slingshots your speed upward'
        : inChapter <= 6
          ? 'Inner dwarf moon drags and slows your craft'
          : 'Anticipate lunar gravity before crossing';
  } else if (chapter === 4) {
    mechanicNote = hasDriftingStars
      ? 'Twin moons and drifting stars in motion'
      : 'Balance opposing lunar gravity fields';
  } else {
    mechanicNote = movingPortal
      ? 'Align with the moving wormhole through tidal pull'
      : 'Precision orbital rhythm across twin wells';
  }

  const parShifts = Math.min(10, starCount + 2 + Math.floor(chapter * 0.7));

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
  const early = buildHandcraftedEarlyLevels().map(sanitizeLevel);
  const rest: LevelConfig[] = [];
  for (let id = 6; id <= 50; id++) {
    rest.push(buildGeneratedLevel(id));
  }
  return [...early, ...rest];
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
