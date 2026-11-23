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

export const TOTAL_SECTORS = 6;
export const TOTAL_LEVELS = 60;

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    roman: 'I',
    title: 'Asteroid Field',
    subtitle: 'Close is fast, far is slow',
    accentHex: '#4D78A8',
    range: [1, 10],
    domeTheme: 'asteroid',
  },
  {
    id: 2,
    roman: 'II',
    title: 'Nebula',
    subtitle: 'Gentle drifting debris and calm timing',
    accentHex: '#9E78C9',
    range: [11, 20],
    domeTheme: 'nebula',
  },
  {
    id: 3,
    roman: 'III',
    title: 'Space Station',
    subtitle: 'Timed orbits with lunar gravity pull',
    accentHex: '#5CA5C4',
    range: [21, 30],
    domeTheme: 'station',
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Lunar Pull',
    subtitle: 'Timed dual-well bends and drifting stars',
    accentHex: '#C75C3B',
    range: [31, 40],
    domeTheme: 'lunar',
  },
  {
    id: 5,
    roman: 'V',
    title: 'Binary Tides',
    subtitle: 'Timed twin moons in opposing choreography',
    accentHex: '#5F9E73',
    range: [41, 50],
    domeTheme: 'binary',
  },
  {
    id: 6,
    roman: 'VI',
    title: "Kepler's Core",
    subtitle: 'Final timed mastery at full orbital resonance',
    accentHex: '#D89B2B',
    range: [51, 60],
    domeTheme: 'core',
  },
];

const CHAPTER_PALETTES: PlanetPalette[][] = [
  // Sector 1: Asteroid Field — Pastel rainbow cut-paper planet
  [
    {
      core: '#A7D0B3',
      mid: '#6E89C2',
      rim: '#F6EEDF',
      glow: 'rgba(243, 194, 79, 0.16)',
      ring: '#E8D8BE',
      bgInner: '#242B46',
      strata: ['#D9C3E0', '#F2AD63', '#8CC5C2', '#F08A7B', '#B8D8A6', '#7998CD', '#F3E7D3'],
    },
    {
      core: '#94BBD9',
      mid: '#5D7CA8',
      rim: '#F5EFE2',
      glow: 'rgba(158, 192, 218, 0.16)',
      ring: '#E5D5BA',
      bgInner: '#222943',
      strata: ['#F4C977', '#9EC0DA', '#E99B87', '#A9CFAF', '#7B93C6', '#F4EBDC'],
    },
    {
      core: '#A4CFAF',
      mid: '#5F9376',
      rim: '#F4ECDC',
      glow: 'rgba(164, 207, 175, 0.16)',
      ring: '#E6D6BC',
      bgInner: '#212A42',
      strata: ['#E7A977', '#A4CFAF', '#86A9CE', '#F2D07D', '#DF8E82', '#F4EBDC'],
    },
  ],
  // Sector 2: Nebula — Warm terracotta, lavender, ochre & twilight teal cut-paper strata
  [
    {
      core: '#DE8863',
      mid: '#A8523A',
      rim: '#F7E7CE',
      glow: 'rgba(222, 136, 99, 0.16)',
      ring: '#E4C9A4',
      bgInner: '#27263D',
      strata: ['#F4C76E', '#D97B59', '#9AB7AE', '#EAB074', '#8B79A8', '#F5E8D2'],
    },
    {
      core: '#E8AE5B',
      mid: '#B57435',
      rim: '#F9EED8',
      glow: 'rgba(232, 174, 91, 0.16)',
      ring: '#E7CFA8',
      bgInner: '#25263C',
      strata: ['#E4926B', '#F2C96B', '#87A7B8', '#C86D51', '#B7C89E', '#F6EBDA'],
    },
    {
      core: '#D87A61',
      mid: '#944839',
      rim: '#F6E6D2',
      glow: 'rgba(216, 122, 97, 0.16)',
      ring: '#E2C4A0',
      bgInner: '#28253C',
      strata: ['#F0B86E', '#C96C53', '#8CA6BF', '#E3C88A', '#738A83', '#F3E5CE'],
    },
  ],
  // Sector 3: Space Station — Periwinkle, blush, mint & parchment cut-paper strata
  [
    {
      core: '#9D9AD4',
      mid: '#64629B',
      rim: '#F3ECF5',
      glow: 'rgba(157, 154, 212, 0.18)',
      ring: '#DFD4E8',
      bgInner: '#242544',
      strata: ['#F2B5A7', '#A4A2D8', '#8EC0C5', '#DFB9E4', '#F1CF85', '#7382B8', '#F2EAF2'],
    },
    {
      core: '#8CA3D6',
      mid: '#52689E',
      rim: '#EDF1F8',
      glow: 'rgba(140, 163, 214, 0.18)',
      ring: '#D7DFEE',
      bgInner: '#212744',
      strata: ['#D7A8D8', '#8FAED9', '#F0B68A', '#9AC9B5', '#6C7DB4', '#F1ECE4'],
    },
    {
      core: '#B89BD2',
      mid: '#765B96',
      rim: '#F5EEF8',
      glow: 'rgba(184, 155, 210, 0.18)',
      ring: '#E2D5EA',
      bgInner: '#262444',
      strata: ['#F0A092', '#B59AD2', '#95C2C8', '#ECCF87', '#7F7DB8', '#F4ECE5'],
    },
  ],
  // Sector 4: Lunar Pull — Coral, plum, pale slate & sandstone paper strata
  [
    {
      core: '#D88E84',
      mid: '#8C525C',
      rim: '#F7EFE6',
      glow: 'rgba(216, 142, 132, 0.16)',
      ring: '#E8D8CC',
      bgInner: '#26233B',
      strata: ['#F3CA7B', '#D98574', '#94A8C9', '#C8A5CE', '#A6C7A3', '#6E749E', '#F5ECE0'],
    },
    {
      core: '#C49BB8',
      mid: '#7A5B82',
      rim: '#F4EEF5',
      glow: 'rgba(196, 155, 184, 0.16)',
      ring: '#E0D4E6',
      bgInner: '#25243D',
      strata: ['#E8A87C', '#C49BB8', '#8FB8B8', '#F0CF7E', '#838BB8', '#F4ECE2'],
    },
    {
      core: '#E0A377',
      mid: '#9C6245',
      rim: '#FAF0E2',
      glow: 'rgba(224, 163, 119, 0.16)',
      ring: '#EAD8C3',
      bgInner: '#28253A',
      strata: ['#C5A3CE', '#E29E73', '#8AB0C6', '#B3CF9E', '#7E7CA8', '#F7EEE0'],
    },
  ],
  // Sector 5: Binary Tides — Seafoam sage, mint, slate blue & butter yellow paper strata
  [
    {
      core: '#8CC4A8',
      mid: '#4F846E',
      rim: '#EEF4E8',
      glow: 'rgba(140, 196, 168, 0.16)',
      ring: '#D4E2D2',
      bgInner: '#1E2C3E',
      strata: ['#F2CE79', '#8AC3A8', '#7FA5C7', '#E69F8A', '#A8D19E', '#5F849A', '#F2EFE2'],
    },
    {
      core: '#7EB9B4',
      mid: '#467B7B',
      rim: '#EAF3F0',
      glow: 'rgba(126, 185, 180, 0.16)',
      ring: '#CFE0DC',
      bgInner: '#1D2B3D',
      strata: ['#E7B773', '#7EB9B4', '#9AC89F', '#849AC7', '#E39784', '#F3EDE0'],
    },
    {
      core: '#8AB5C9',
      mid: '#4D748E',
      rim: '#ECF2F5',
      glow: 'rgba(138, 181, 201, 0.16)',
      ring: '#D2DFE6',
      bgInner: '#1F2A40',
      strata: ['#F1C974', '#86B7C9', '#99C7A8', '#DC9987', '#748AB8', '#F2EDE1'],
    },
  ],
  // Sector 6: Kepler's Core — Golden foil, terracotta, cobalt & ivory paper strata
  [
    {
      core: '#F0C25B',
      mid: '#BA8531',
      rim: '#FBF2DC',
      glow: 'rgba(240, 194, 91, 0.18)',
      ring: '#EEDBB6',
      bgInner: '#262841',
      strata: ['#DF7D63', '#F3C55B', '#88B4C9', '#A8CD9F', '#8C8CC2', '#E8A464', '#F7EFE0'],
    },
    {
      core: '#E9B96A',
      mid: '#A87534',
      rim: '#FAF1DD',
      glow: 'rgba(233, 185, 106, 0.18)',
      ring: '#EAD6B2',
      bgInner: '#242740',
      strata: ['#E69578', '#F2C96B', '#7EA4C4', '#9BC7A5', '#A996C9', '#F6EDE0'],
    },
    {
      core: '#DFD3BE',
      mid: '#8F826E',
      rim: '#FAF5EB',
      glow: 'rgba(223, 211, 190, 0.16)',
      ring: '#E8DEC9',
      bgInner: '#232840',
      strata: ['#F0BE5C', '#D97B5E', '#7E9EC4', '#9AC5A4', '#B299C9', '#F6F0E3'],
    },
  ],
];

const LEVEL_NAMES: string[] = [
  // Sector 1: Asteroid Field (1-10)
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
  // Sector 2: Nebula (11-20)
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
  // Sector 3: Space Station (21-30 — Timed Orbits Begin)
  'Docking Clock',
  'Station Sprint',
  'Orbital Rush',
  'Dockyard Drift',
  'Relay Countdown',
  'Solar Transit',
  'Quick Transfer',
  'Beacon Window',
  'Airlock Arc',
  'Station Zenith',
  // Sector 4: Lunar Pull (31-40 — Timed Lunar Gravity)
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
  // Sector 5: Binary Tides (41-50 — Timed Twin Wells)
  'Binary Tides',
  'Opposing Pulls',
  'Wandering Star',
  'Harmonic Drift',
  'Lagrange Point',
  'Emerald Eddy',
  'Countercurrent',
  'Resonant Arc',
  'Twin Eclipse',
  'Tidal Finale',
  // Sector 6: Kepler's Core (51-60 — Timed Mastery)
  'Golden Axis',
  'Kepler Ratio',
  'Helios Waltz',
  'Synchronous',
  'Pendulum Ring',
  'Crown Current',
  'Solar Weave',
  'Apogee Sprint',
  'Celestial Knot',
  'Pocket Orbit',
];

const TAU = Math.PI * 2;

function normalizeAngle(a: number): number {
  let res = a % TAU;
  if (res < 0) res += TAU;
  return res;
}

function angularDist(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, TAU - diff);
}

function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Keeps spawn zone and collectible stars fair by nudging any overlapping hazard
 * out of immediate spawn / star collision arcs.
 */
function sanitizeLevel(level: LevelConfig): LevelConfig {
  const safeHazards: HazardDef[] = level.hazards.map((h) => {
    let angle = normalizeAngle(h.angle);

    for (let attempt = 0; attempt < 16; attempt++) {
      let conflict = false;

      // Never place a hazard near the satellite's starting arc on the starting lane
      if (h.orbit === level.startOrbit && angularDist(angle, level.startAngle) < 1.25) {
        conflict = true;
      }

      // Never park a stationary hazard right on top of a collectible star
      if (Math.abs(h.speed) < 0.05) {
        for (const s of level.stars) {
          if (s.orbit === h.orbit && angularDist(angle, s.angle) < 0.62) {
            conflict = true;
            break;
          }
        }
        if (
          level.portal.orbit === h.orbit &&
          Math.abs(level.portal.speed ?? 0) < 0.05 &&
          angularDist(angle, level.portal.angle) < 0.62
        ) {
          conflict = true;
        }
      }

      if (!conflict) break;
      angle = normalizeAngle(angle + 0.55);
    }

    return { ...h, angle };
  });

  return { ...level, hazards: safeHazards };
}

/**
 * Hand-tuned Sector 1 (Levels 1-10): Relaxed, forgiving, and untimed.
 */
function buildSectorOneLevels(): LevelConfig[] {
  const p = CHAPTER_PALETTES[0];
  const baseStart = -Math.PI / 2;

  return [
    {
      id: 1,
      chapter: 1,
      name: LEVEL_NAMES[0],
      mechanicNote: 'Tap anywhere to switch orbits · Inner is fast, outer is slow',
      planetPalette: p[0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.48,
      outerSpeed: 0.82,
      parShifts: 3,
      timeLimit: null,
      stars: [
        { orbit: 1, angle: 0.4 },
        { orbit: 0, angle: 2.35 },
      ],
      hazards: [{ orbit: 1, angle: 2.35, speed: 0, type: 'asteroid', size: 11.5 }],
      moons: [],
      portal: { orbit: 1, angle: -0.45 },
    },
    {
      id: 2,
      chapter: 1,
      name: LEVEL_NAMES[1],
      mechanicNote: 'Shift inward to skip past an outer obstacle smoothly',
      planetPalette: p[1],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.5,
      outerSpeed: 0.82,
      parShifts: 3,
      timeLimit: null,
      stars: [
        { orbit: 0, angle: 0.45 },
        { orbit: 1, angle: 2.65 },
      ],
      hazards: [{ orbit: 1, angle: 0.55, speed: 0, type: 'asteroid', size: 11.5 }],
      moons: [],
      portal: { orbit: 0, angle: -0.6 },
    },
    {
      id: 3,
      chapter: 1,
      name: LEVEL_NAMES[2],
      mechanicNote: 'Feel the crisp speed boost on the inner ring',
      planetPalette: p[2],
      startOrbit: 0,
      startAngle: baseStart,
      innerSpeed: 1.55,
      outerSpeed: 0.83,
      parShifts: 4,
      timeLimit: null,
      stars: [
        { orbit: 0, angle: 0.25 },
        { orbit: 1, angle: 2.15 },
        { orbit: 0, angle: 4.05 },
      ],
      hazards: [
        { orbit: 0, angle: 2.15, speed: 0, type: 'panel', size: 11.5 },
        { orbit: 1, angle: 4.05, speed: 0, type: 'asteroid', size: 11.5 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.55 },
    },
    {
      id: 4,
      chapter: 1,
      name: LEVEL_NAMES[3],
      mechanicNote: 'Weave cleanly between two widely spaced static hazards',
      planetPalette: p[0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.56,
      outerSpeed: 0.83,
      parShifts: 4,
      timeLimit: null,
      stars: [
        { orbit: 1, angle: 0.3 },
        { orbit: 0, angle: 2.25 },
        { orbit: 1, angle: 4.15 },
      ],
      hazards: [
        { orbit: 1, angle: 2.25, speed: 0, type: 'asteroid', size: 11.5 },
        { orbit: 0, angle: 4.15, speed: 0, type: 'buoy', size: 11.5 },
      ],
      moons: [],
      portal: { orbit: 0, angle: -0.5 },
    },
    {
      id: 5,
      chapter: 1,
      name: LEVEL_NAMES[4],
      mechanicNote: 'Hop across lanes to gather stars in one calm sweep',
      planetPalette: p[1],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.58,
      outerSpeed: 0.84,
      parShifts: 5,
      timeLimit: null,
      stars: [
        { orbit: 0, angle: 0.35 },
        { orbit: 1, angle: 2.05 },
        { orbit: 0, angle: 3.9 },
      ],
      hazards: [
        { orbit: 1, angle: 0.35, speed: 0, type: 'asteroid', size: 12 },
        { orbit: 0, angle: 2.05, speed: 0, type: 'panel', size: 12 },
        { orbit: 1, angle: 3.9, speed: 0, type: 'buoy', size: 12 },
      ],
      moons: [],
      portal: { orbit: 1, angle: -0.52 },
    },
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
      timeLimit: null,
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
      timeLimit: null,
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
      timeLimit: null,
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
      timeLimit: null,
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
    {
      id: 10,
      chapter: 1,
      name: LEVEL_NAMES[9],
      mechanicNote: 'Sector 1 finale · Combine inner bursts and outer patience',
      planetPalette: p[0],
      startOrbit: 1,
      startAngle: baseStart,
      innerSpeed: 1.66,
      outerSpeed: 0.88,
      parShifts: 6,
      timeLimit: null,
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
 * Sector 2 (Levels 11-20 — Nebula): Untimed gentle drifting debris.
 * Sectors 3-6 (Levels 21-60): Redesigned for crisp timed orbital gameplay!
 * - Sector 3 (Space Station, 21-30): First timed sector (26s -> 20s), clean fast-inner sprint paths & outer helper moons.
 * - Sector 4 (Lunar Pull, 31-40): Timed lunar slingshot & gravity-drag sectors (24s -> 18s).
 * - Sector 5 (Binary Tides, 41-50): Timed dual-moon & drifting star sectors (22s -> 17s).
 * - Sector 6 (Kepler's Core, 51-60): Final timed mastery with moving portals & crisp resonance (21s -> 16s).
 */
function buildSectorTwoToSixLevel(id: number): LevelConfig {
  const chapter = Math.ceil(id / 10); // 2..6
  const inChapter = ((id - 1) % 10) + 1; // 1..10
  const progress = (id - 11) / 49; // 0..1 across levels 11..60
  const paletteList = CHAPTER_PALETTES[chapter - 1];
  const palette = paletteList[(id - 1) % paletteList.length];

  const startOrbit: OrbitLane = chapter >= 3 ? (inChapter % 2 === 1 ? 0 : 1) : id % 3 === 0 ? 0 : 1;
  const startAngle = -Math.PI / 2;

  // Timed sectors (3-6) feature brisker, responsive orbital speeds so racing the clock feels snappy and rewarding
  let innerSpeed: number;
  let outerSpeed: number;
  if (chapter === 2) {
    innerSpeed = Number((1.66 + inChapter * 0.015).toFixed(2));
    outerSpeed = Number((0.87 + inChapter * 0.008).toFixed(2));
  } else {
    const timedProg = (id - 21) / 39; // 0..1 across Sectors 3-6
    innerSpeed = Number((1.84 + timedProg * 0.44 + (inChapter % 3) * 0.025).toFixed(2));
    outerSpeed = Number((0.96 + timedProg * 0.22 + ((inChapter + 1) % 2) * 0.02).toFixed(2));
  }

  // Time limit: null in Sectors 1-2; redesigned escalating countdown in Sectors 3-6
  let timeLimit: number | null = null;
  if (chapter === 3) {
    // 26s on Lv 21 easing smoothly to 20s on Lv 30
    timeLimit = Math.round(26 - ((inChapter - 1) / 9) * 6);
  } else if (chapter === 4) {
    // 24s on Lv 31 easing smoothly to 18s on Lv 40
    timeLimit = Math.round(24 - ((inChapter - 1) / 9) * 6);
  } else if (chapter === 5) {
    // 22s on Lv 41 easing smoothly to 17s on Lv 50
    timeLimit = Math.round(22 - ((inChapter - 1) / 9) * 5);
  } else if (chapter === 6) {
    // 21s on Lv 51 easing smoothly to 16s on Lv 60
    timeLimit = Math.round(21 - ((inChapter - 1) / 9) * 5);
  }

  // Stars: 3 stars normally, 4 stars on sector climaxes (30, 40, 50, 58, 60)
  const starCount = id === 30 || id === 40 || id === 50 || id === 58 || id === 60 ? 4 : 3;
  const hasDriftingStars = (chapter === 4 && inChapter >= 6) || chapter >= 5;
  const stars: StarDef[] = [];
  const starBaseOffset = 0.18 + seeded(id * 3.7) * 0.36;

  for (let i = 0; i < starCount; i++) {
    // In timed Sectors 3+, deliberately alternate inner/outer arcs so speed-shifting pays off
    const orbit: OrbitLane =
      chapter >= 3 ? (((i + (inChapter % 2)) % 2) as OrbitLane) : (((i + id) % 2) as OrbitLane);
    const angle = normalizeAngle(
      startAngle + 1.05 + (i * (TAU - 1.55)) / starCount + starBaseOffset * 0.22
    );
    const drift =
      hasDriftingStars && (i % 2 === 1 || id >= 55)
        ? Number(((i % 2 === 0 ? 1 : -1) * (0.16 + progress * 0.14)).toFixed(2))
        : 0;
    stars.push({ orbit, angle, speed: drift });
  }

  // Redesigned hazard layouts:
  // Sector 3+ balances outer-orbit threats (rewarding Heavy craft!) and tight inner gates (rewarding Tinny!)
  let hazardCount = 2;
  if (chapter === 2) {
    hazardCount = inChapter <= 4 ? 2 : 3;
  } else if (chapter === 3) {
    hazardCount = inChapter <= 3 ? 2 : 3;
  } else if (chapter === 4) {
    hazardCount = inChapter <= 4 ? 3 : 3;
  } else if (chapter === 5) {
    hazardCount = inChapter <= 5 ? 3 : 4;
  } else {
    hazardCount = inChapter <= 4 ? 3 : 4;
  }

  const kinds: HazardKind[] = ['asteroid', 'panel', 'buoy'];
  const hazards: HazardDef[] = [];

  for (let i = 0; i < hazardCount; i++) {
    const orbit: OrbitLane =
      chapter >= 3
        ? ((i === 0 ? 1 : (i + (id % 2)) % 2) as OrbitLane)
        : (((i + (id % 2)) % 2) as OrbitLane);

    const baseAngle = normalizeAngle(
      startAngle + 1.48 + (i * (TAU - 1.28)) / hazardCount + seeded(id * 11 + i * 7) * 0.32
    );

    let speed = 0;
    if (chapter === 2) {
      if (inChapter <= 3 && i === hazardCount - 1) {
        speed = 0;
      } else {
        const dir = i % 2 === 0 ? -1 : 1;
        speed = dir * (0.26 + inChapter * 0.018);
      }
    } else if (chapter === 3) {
      // Space Station timed levels: crisp readable patrollers with an open fast-lane line
      if (inChapter <= 2 && i === hazardCount - 1) {
        speed = 0;
      } else {
        const dir = i % 2 === 0 ? -1 : 1;
        speed = dir * (0.3 + inChapter * 0.02);
      }
    } else if (chapter === 4) {
      const dir = orbit === 0 ? -1 : 1;
      speed = dir * (0.34 + inChapter * 0.02);
    } else if (chapter === 5) {
      const dir = (i + orbit) % 2 === 0 ? -1 : 1;
      speed = dir * (0.4 + inChapter * 0.018 + (orbit === 0 ? 0.03 : 0));
    } else {
      const dir = (i + orbit) % 2 === 0 ? -1 : 1;
      speed = dir * (0.45 + inChapter * 0.02 + (orbit === 0 ? 0.04 : 0));
    }

    hazards.push({
      orbit,
      angle: baseAngle,
      speed: Number(speed.toFixed(2)),
      type: kinds[(id + i) % kinds.length],
      size: chapter >= 4 ? 12.8 : 12.2,
    });
  }

  // Gravity Moons (introduced gently in Sector 3 Space Station, expanded in Sectors 4-6)
  const moons: MoonDef[] = [];
  if (chapter === 3) {
    // Sector 3: One helpful slingshot moon from Lv. 23 onwards to help players beat the clock!
    if (inChapter >= 3) {
      const isBoost = inChapter <= 7 || inChapter % 2 === 1;
      moons.push({
        orbitRadiusMult: isBoost ? 1.32 : 0.48,
        angle: 0.9 + inChapter * 0.52,
        speed: isBoost ? 0.32 + inChapter * 0.018 : -0.36,
        wellRadiusMult: 0.49,
        speedBoost: isBoost ? 1.38 : 0.74,
        radialTug: isBoost ? 0.068 : -0.06,
        color: isBoost ? '#D0D3DF' : '#B7C2D6',
      });
    }
  } else if (chapter === 4) {
    // Sector 4: Lunar Pull — prominent boost & drag moons
    moons.push({
      orbitRadiusMult: 1.32,
      angle: 0.75 + inChapter * 0.48,
      speed: 0.35 + inChapter * 0.02,
      wellRadiusMult: 0.51,
      speedBoost: 1.4,
      radialTug: 0.075,
      color: '#C7C9D6',
    });
    if (inChapter >= 5) {
      moons.push({
        orbitRadiusMult: 0.48,
        angle: normalizeAngle(0.75 + inChapter * 0.48 + Math.PI),
        speed: -(0.38 + (inChapter - 4) * 0.02),
        wellRadiusMult: 0.45,
        speedBoost: 0.72,
        radialTug: -0.065,
        color: '#AEB8CE',
      });
    }
  } else if (chapter === 5) {
    // Sector 5: Binary Tides — Dual opposing gravity wells
    moons.push({
      orbitRadiusMult: 1.32,
      angle: 0.55 + inChapter * 0.44,
      speed: 0.36 + inChapter * 0.02,
      wellRadiusMult: 0.49,
      speedBoost: 1.42,
      radialTug: 0.078,
      color: '#BFD2C7',
    });
    moons.push({
      orbitRadiusMult: 0.47,
      angle: normalizeAngle(0.55 + inChapter * 0.44 + Math.PI),
      speed: -(0.42 + inChapter * 0.02),
      wellRadiusMult: 0.45,
      speedBoost: 0.7,
      radialTug: -0.07,
      color: '#B5C8D8',
    });
  } else if (chapter === 6) {
    // Sector 6: Kepler's Core — Resonant dual moons
    const dualOuter = inChapter % 3 === 0;
    if (dualOuter) {
      moons.push({
        orbitRadiusMult: 1.32,
        angle: 0.4 + inChapter * 0.32,
        speed: 0.4 + inChapter * 0.015,
        wellRadiusMult: 0.48,
        speedBoost: 1.45,
        radialTug: 0.08,
        color: '#E0D6BC',
      });
      moons.push({
        orbitRadiusMult: 1.32,
        angle: normalizeAngle(0.4 + inChapter * 0.32 + Math.PI),
        speed: 0.4 + inChapter * 0.015,
        wellRadiusMult: 0.46,
        speedBoost: 0.68,
        radialTug: 0.075,
        color: '#C7C2D9',
      });
    } else {
      moons.push({
        orbitRadiusMult: 1.31,
        angle: 0.9 + inChapter * 0.38,
        speed: 0.42 + inChapter * 0.018,
        wellRadiusMult: 0.5,
        speedBoost: 1.46,
        radialTug: 0.082,
        color: '#E0D6BC',
      });
      moons.push({
        orbitRadiusMult: 0.46,
        angle: normalizeAngle(2.9 + inChapter * 0.42),
        speed: -(0.46 + inChapter * 0.018),
        wellRadiusMult: 0.46,
        speedBoost: 0.68,
        radialTug: -0.075,
        color: '#B8C6DC',
      });
    }
  }

  // Wormhole portal (moves gently in Sector 5-6 climaxes)
  const portalOrbit: OrbitLane = ((id + 1) % 2) as OrbitLane;
  const portalAngle = normalizeAngle(startAngle + 0.58 + seeded(id * 17) * 0.42);
  const movingPortal =
    id === 40 || (chapter === 5 && inChapter >= 7) || (chapter === 6 && inChapter >= 4);
  const portalSpeed = movingPortal
    ? Number(((id % 2 === 0 ? 1 : -1) * (0.18 + progress * 0.12)).toFixed(2))
    : 0;

  let mechanicNote = 'Calm timing between orbital lanes';
  if (chapter === 2) {
    mechanicNote = 'Gentle drifting debris · Switch lanes early';
  } else if (chapter === 3) {
    mechanicNote = `Timed Sector (${timeLimit}s) · Ride the fast inner ring to beat the clock`;
  } else if (chapter === 4) {
    mechanicNote = `Timed Lunar Pull (${timeLimit}s) · Use outer slingshots to save seconds`;
  } else if (chapter === 5) {
    mechanicNote = `Timed Binary Tides (${timeLimit}s) · Balance twin gravity wells`;
  } else {
    mechanicNote = `Kepler Mastery (${timeLimit}s) · Precision rhythm at full speed`;
  }

  const parShifts = Math.min(10, starCount + 2 + Math.floor(chapter * 0.55));

  return sanitizeLevel({
    id,
    chapter,
    name: LEVEL_NAMES[id - 1] ?? `Sector ${id}`,
    mechanicNote,
    planetPalette: palette,
    startOrbit,
    startAngle,
    innerSpeed,
    outerSpeed,
    parShifts,
    timeLimit,
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
  const s1 = buildSectorOneLevels().map(sanitizeLevel);
  const rest: LevelConfig[] = [];
  for (let id = 11; id <= TOTAL_LEVELS; id++) {
    rest.push(buildSectorTwoToSixLevel(id));
  }
  return [...s1, ...rest];
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

/**
 * 1-3 star mastery rating based on orbit shift efficiency vs level par:
 * - 3 stars: cleared within parShifts
 * - 2 stars: cleared within parShifts + 3
 * - 1 star: cleared in more than parShifts + 3 shifts
 */
export function calculateCompletionStars(shiftCount: number, parShifts: number): number {
  if (shiftCount <= parShifts) return 3;
  if (shiftCount <= parShifts + 3) return 2;
  return 1;
}
