import { BoosterKind, LevelRecord, SatelliteDef, SatelliteId, TrailDef, TrailId } from '../types';
import { isChapterUnlocked } from './storage';

export const SHIELD_COST_ROCKETS = 10;
export const CHRONO_COST_ROCKETS = 8;
export const MAGNET_COST_ROCKETS = 8;

export interface BoosterDef {
  id: BoosterKind;
  name: string;
  shortName: string;
  description: string;
  costRockets: number;
  usageNote: string;
}

export const BOOSTERS: BoosterDef[] = [
  {
    id: 'shield',
    name: 'Orbit Shield',
    shortName: 'Shield',
    description:
      'Protects your craft from every obstacle, debris ring, and solar flare on both orbits for the entire run.',
    costRockets: SHIELD_COST_ROCKETS,
    usageNote: 'Armed pre-launch (-1 per run)',
  },
  {
    id: 'chrono',
    name: 'Chrono Pulse',
    shortName: 'Slow-Mo',
    description:
      'Trigger mid-run to slow hazards, solar flares, moons, and the countdown clock to 42% speed for 3.5 seconds.',
    costRockets: CHRONO_COST_ROCKETS,
    usageNote: 'Tap HUD button in-run (-1 on use)',
  },
  {
    id: 'magnet',
    name: 'Star Magnet',
    shortName: 'Magnet',
    description:
      'Unleash a 6-second gravity field that pulls stars from across both orbits directly into your craft.',
    costRockets: MAGNET_COST_ROCKETS,
    usageNote: 'Tap HUD button in-run (-1 on use)',
  },
];

export function getBoosterCost(kind: BoosterKind): number {
  if (kind === 'shield') return SHIELD_COST_ROCKETS;
  if (kind === 'chrono') return CHRONO_COST_ROCKETS;
  return MAGNET_COST_ROCKETS;
}

export const SATELLITES: SatelliteDef[] = [
  {
    id: 'default',
    name: 'Classic Craft',
    tagline: 'Balanced Scout',
    description: 'Reliable cosmic craft with balanced size and smooth orbital agility.',
    costStars: 0,
    unlockSector: 1,
    sizeScale: 1.0,
    hitboxScale: 1.0,
    outerImmune: false,
    disablesTimer: false,
  },
  {
    id: 'tinny',
    name: 'Tinny',
    tagline: 'Micro Compact',
    description: 'Significantly smaller silhouette and hitbox to slip cleanly past tight debris.',
    costStars: 50,
    unlockSector: 1,
    sizeScale: 0.64,
    hitboxScale: 0.62,
    outerImmune: false,
    disablesTimer: false,
  },
  {
    id: 'heavy',
    name: 'Heavy',
    tagline: 'Outer Guard',
    description: 'Armored hull ignores obstacles and flares on the outer orbit. Inner lane still fails.',
    costStars: 50,
    unlockSector: 1,
    sizeScale: 1.0,
    hitboxScale: 1.0,
    outerImmune: true,
    disablesTimer: false,
  },
  {
    id: 'magnet_probe',
    name: 'Magnet Probe',
    tagline: 'Wide Star Pull',
    description: 'Projects a magnetic field with +85% star pickup reach and pulls nearby stars in.',
    costStars: 60,
    unlockSector: 1,
    sizeScale: 0.96,
    hitboxScale: 0.94,
    outerImmune: false,
    disablesTimer: false,
    magnetRangeMult: 1.85,
  },
  {
    id: 'phase_dasher',
    name: 'Phase Dasher',
    tagline: 'Shift Invuln',
    description: 'Grants 0.55s of phase invulnerability on every orbit shift to dash through hazards.',
    costStars: 75,
    unlockSector: 2,
    sizeScale: 0.92,
    hitboxScale: 0.88,
    outerImmune: false,
    disablesTimer: false,
    phaseDashSeconds: 0.55,
  },
  {
    id: 'star_collector',
    name: 'Star Collector',
    tagline: '+2 Bonus Stars',
    description: 'Gilded harvester earns +2 bonus Lobby Stars on every clear with +25% star reach.',
    costStars: 80,
    unlockSector: 2,
    sizeScale: 1.0,
    hitboxScale: 0.96,
    outerImmune: false,
    disablesTimer: false,
    magnetRangeMult: 1.25,
    bonusLobbyStars: 2,
  },
  {
    id: 'nano_stopper',
    name: 'Nano Stopper',
    tagline: 'Chrono Micro',
    description: 'Tiny frame like Tinny and disables the countdown timer completely in timed sectors.',
    costStars: 50,
    unlockSector: 3,
    sizeScale: 0.64,
    hitboxScale: 0.62,
    outerImmune: false,
    disablesTimer: true,
  },
];

export const TRAILS: TrailDef[] = [
  {
    id: 'classic',
    name: 'Solar Plume',
    tagline: 'Standard Flame',
    description: 'Crisp fiery thruster plume that matches your equipped craft.',
    costStars: 0,
    previewColors: ['#FF8800', '#FFD43B', '#FFF9C4'],
  },
  {
    id: 'stardust',
    name: 'Stardust Ribbon',
    tagline: 'Sparkling Wake',
    description: 'Silky twilight-gold ribbon leaving twinkling stardust sparkles behind your orbit.',
    costStars: 30,
    previewColors: ['#3B82F6', '#7CEBFF', '#FFF3A8'],
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    tagline: 'Solar Veil',
    description: 'Shimmering emerald, cyan, and violet orbital ribbon flowing smoothly in space.',
    costStars: 40,
    previewColors: ['#10E89A', '#38E8FF', '#B36BFF'],
  },
  {
    id: 'prism',
    name: 'Prism Comet',
    tagline: 'Spectrum Stream',
    description: 'Radiant multi-band prismatic comet ribbon with a bright white light core.',
    costStars: 50,
    previewColors: ['#FF4D88', '#FFD426', '#3CF2FF'],
  },
  {
    id: 'crimson_nova',
    name: 'Supernova Ember',
    tagline: 'Plasma Flare',
    description: 'Blazing coral-magenta ribbon trailing glowing ember motes around the planet.',
    costStars: 60,
    previewColors: ['#C81D77', '#FF5533', '#FFE07D'],
  },
];

export function getSatelliteById(id: SatelliteId): SatelliteDef {
  return SATELLITES.find((s) => s.id === id) ?? SATELLITES[0];
}

export function getTrailById(id: TrailId): TrailDef {
  return TRAILS.find((t) => t.id === id) ?? TRAILS[0];
}

export function isSatelliteUnlockedForPurchase(
  satellite: SatelliteDef,
  records: Record<number, LevelRecord>
): boolean {
  if (satellite.unlockSector <= 1) return true;
  return isChapterUnlocked(satellite.unlockSector, records);
}
