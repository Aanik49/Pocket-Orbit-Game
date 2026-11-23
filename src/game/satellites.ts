import { LevelRecord, SatelliteDef, SatelliteId } from '../types';
import { isChapterUnlocked } from './storage';

export const SHIELD_COST_ROCKETS = 10;

export const SATELLITES: SatelliteDef[] = [
  {
    id: 'default',
    name: 'Classic Craft',
    tagline: 'Balanced Origami Scout',
    description: 'Reliable paper-craft satellite with balanced size and smooth orbital agility.',
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
    tagline: 'Micro Compact Craft',
    description: 'Significantly smaller silhouette and hitbox to slip cleanly past tight space debris.',
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
    tagline: 'Outer Orbit Protector',
    description: 'Armored hull ignores all obstacles on the outer orbit. Inner orbit collisions still fail.',
    costStars: 50,
    unlockSector: 1,
    sizeScale: 1.0,
    hitboxScale: 1.0,
    outerImmune: true,
    disablesTimer: false,
  },
  {
    id: 'nano_stopper',
    name: 'Nano Stopper',
    tagline: 'Chrono Micro Craft',
    description: 'Tiny frame like Tinny and disables the countdown timer completely in timed sectors.',
    costStars: 50,
    unlockSector: 3,
    sizeScale: 0.64,
    hitboxScale: 0.62,
    outerImmune: false,
    disablesTimer: true,
  },
];

export function getSatelliteById(id: SatelliteId): SatelliteDef {
  return SATELLITES.find((s) => s.id === id) ?? SATELLITES[0];
}

export function isSatelliteUnlockedForPurchase(
  satellite: SatelliteDef,
  records: Record<number, LevelRecord>
): boolean {
  if (satellite.unlockSector <= 1) return true;
  return isChapterUnlocked(satellite.unlockSector, records);
}
