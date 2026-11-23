import {
  DailyLoginState,
  DailyMissionItem,
  DailyMissionState,
  LevelRecord,
  MissionMetric,
  SaveData,
  SatelliteId,
} from '../types';
import { CHAPTERS, TOTAL_LEVELS, TOTAL_SECTORS } from './levels';
import { getSatelliteById, isSatelliteUnlockedForPurchase, SHIELD_COST_ROCKETS } from './satellites';

const STORAGE_KEY = 'pocket_orbit_save_v2';
const LEGACY_STORAGE_KEY = 'pocket_orbit_save_v1';

export const INITIAL_STARS = 100;
export const INITIAL_ROCKETS = 50;
export const SECTOR_CLEAR_ROCKET_BONUS = 50;

export interface DailyLoginRewardDef {
  day: number; // 1..7
  rewardType: 'stars' | 'rockets';
  amount: number;
}

export const DAILY_LOGIN_REWARDS: DailyLoginRewardDef[] = [
  { day: 1, rewardType: 'stars', amount: 10 },
  { day: 2, rewardType: 'stars', amount: 20 },
  { day: 3, rewardType: 'stars', amount: 30 },
  { day: 4, rewardType: 'stars', amount: 40 },
  { day: 5, rewardType: 'stars', amount: 50 },
  { day: 6, rewardType: 'rockets', amount: 20 },
  { day: 7, rewardType: 'rockets', amount: 50 },
];

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hashDateKey(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Generates 2 daily missions for a given local date:
 * - Mission 1 (Easy): rewards 10 Stars
 * - Mission 2 (Medium/Hard): rewards 20 Rockets
 */
export function createDailyMissionsForDate(dateKey: string): DailyMissionState {
  const seed = hashDateKey(dateKey);

  const easyTemplates: Array<{ title: string; metric: MissionMetric; target: number }> = [
    { title: 'Complete 1 orbital level', metric: 'levels_cleared', target: 1 },
    { title: 'Collect 6 orbital stars', metric: 'orbital_stars', target: 6 },
    { title: 'Perform 10 orbit shifts', metric: 'shifts', target: 10 },
  ];

  const hardTemplates: Array<{ title: string; metric: MissionMetric; target: number }> = [
    { title: 'Complete 3 orbital levels', metric: 'levels_cleared', target: 3 },
    { title: 'Earn 3-star mastery on 2 levels', metric: 'three_star_clears', target: 2 },
    { title: 'Collect 15 orbital stars', metric: 'orbital_stars', target: 15 },
  ];

  const easy = easyTemplates[seed % easyTemplates.length];
  const hard = hardTemplates[Math.floor(seed / 3) % hardTemplates.length];

  const missions: DailyMissionItem[] = [
    {
      id: `${dateKey}-easy`,
      difficulty: 'easy',
      title: easy.title,
      metric: easy.metric,
      target: easy.target,
      progress: 0,
      rewardType: 'stars',
      rewardAmount: 10,
      claimed: false,
    },
    {
      id: `${dateKey}-hard`,
      difficulty: 'hard',
      title: hard.title,
      metric: hard.metric,
      target: hard.target,
      progress: 0,
      rewardType: 'rockets',
      rewardAmount: 20,
      claimed: false,
    },
  ];

  return { date: dateKey, missions };
}

function createDefaultSave(): SaveData {
  const today = getTodayDateKey();
  return {
    currentLevelId: 1,
    muted: false,
    musicMuted: false,
    lowPower: false,
    stars: INITIAL_STARS,
    rockets: INITIAL_ROCKETS,
    shields: 0,
    ownedSatellites: ['default'],
    selectedSatellite: 'default',
    claimedSectorBonuses: [],
    dailyLogin: {
      lastClaimDate: null,
      claimedDays: 0,
    },
    dailyMissions: createDailyMissionsForDate(today),
    records: {},
  };
}

export function getChapterClearedCount(
  chapterId: number,
  records: Record<number, LevelRecord>
): number {
  const start = (chapterId - 1) * 10 + 1;
  const end = chapterId * 10;
  let cleared = 0;
  for (let id = start; id <= end; id++) {
    if (records[id]?.completed) cleared++;
  }
  return cleared;
}

/**
 * Sector 1 (Levels 01-10) is always unlocked.
 * Sector N (N >= 2) unlocks only when all 10 levels of every preceding sector are cleared.
 */
export function isChapterUnlocked(
  chapterId: number,
  records: Record<number, LevelRecord>
): boolean {
  if (chapterId <= 1) return true;
  for (let ch = 1; ch < chapterId; ch++) {
    if (getChapterClearedCount(ch, records) < 10) {
      return false;
    }
  }
  return true;
}

export function isLevelUnlocked(
  levelId: number,
  records: Record<number, LevelRecord>
): boolean {
  const chapterId = Math.max(1, Math.min(TOTAL_SECTORS, Math.ceil(levelId / 10)));
  return isChapterUnlocked(chapterId, records);
}

export function getNextUnlockedLevelId(
  fromLevelId: number,
  records: Record<number, LevelRecord>
): number | null {
  if (fromLevelId < TOTAL_LEVELS && isLevelUnlocked(fromLevelId + 1, records)) {
    return fromLevelId + 1;
  }

  const chapterId = Math.max(1, Math.min(TOTAL_SECTORS, Math.ceil(fromLevelId / 10)));
  const start = (chapterId - 1) * 10 + 1;
  const end = chapterId * 10;
  for (let id = start; id <= end; id++) {
    if (!records[id]?.completed) {
      return id;
    }
  }

  for (let id = 1; id <= TOTAL_LEVELS; id++) {
    if (isLevelUnlocked(id, records) && !records[id]?.completed) {
      return id;
    }
  }

  return null;
}

export function canClaimDailyLogin(login: DailyLoginState): boolean {
  const today = getTodayDateKey();
  return login.lastClaimDate !== today;
}

export function getNextDailyLoginDay(login: DailyLoginState): number {
  if (login.lastClaimDate === getTodayDateKey()) {
    return Math.max(1, Math.min(7, login.claimedDays));
  }
  return (login.claimedDays % 7) + 1;
}

export function claimDailyLoginReward(prev: SaveData): SaveData {
  const today = getTodayDateKey();
  if (prev.dailyLogin.lastClaimDate === today) return prev;

  const nextDay = (prev.dailyLogin.claimedDays % 7) + 1;
  const reward = DAILY_LOGIN_REWARDS[nextDay - 1];

  const next: SaveData = {
    ...prev,
    stars: prev.stars + (reward.rewardType === 'stars' ? reward.amount : 0),
    rockets: prev.rockets + (reward.rewardType === 'rockets' ? reward.amount : 0),
    dailyLogin: {
      lastClaimDate: today,
      claimedDays: nextDay,
    },
  };
  persistSaveData(next);
  return next;
}

export function ensureTodayMissions(prev: SaveData): SaveData {
  const today = getTodayDateKey();
  if (prev.dailyMissions.date === today && prev.dailyMissions.missions.length === 2) {
    return prev;
  }
  const next: SaveData = {
    ...prev,
    dailyMissions: createDailyMissionsForDate(today),
  };
  persistSaveData(next);
  return next;
}

export function hasClaimableDailyMission(state: DailyMissionState): boolean {
  return state.missions.some((m) => !m.claimed && m.progress >= m.target);
}

export function applyDailyMissionProgress(
  prev: SaveData,
  deltas: Partial<Record<MissionMetric, number>>
): SaveData {
  const synced = ensureTodayMissions(prev);
  let changed = false;

  const updatedMissions = synced.dailyMissions.missions.map((m) => {
    const add = deltas[m.metric] ?? 0;
    if (add <= 0 || m.claimed) return m;
    const nextProgress = Math.min(m.target, m.progress + add);
    if (nextProgress !== m.progress) changed = true;
    return { ...m, progress: nextProgress };
  });

  if (!changed) return synced;
  const next: SaveData = {
    ...synced,
    dailyMissions: {
      ...synced.dailyMissions,
      missions: updatedMissions,
    },
  };
  persistSaveData(next);
  return next;
}

export function claimDailyMissionReward(prev: SaveData, missionId: string): SaveData {
  const mission = prev.dailyMissions.missions.find((m) => m.id === missionId);
  if (!mission || mission.claimed || mission.progress < mission.target) return prev;

  const updatedMissions = prev.dailyMissions.missions.map((m) =>
    m.id === missionId ? { ...m, claimed: true } : m
  );

  const next: SaveData = {
    ...prev,
    stars: prev.stars + (mission.rewardType === 'stars' ? mission.rewardAmount : 0),
    rockets: prev.rockets + (mission.rewardType === 'rockets' ? mission.rewardAmount : 0),
    dailyMissions: {
      ...prev.dailyMissions,
      missions: updatedMissions,
    },
  };
  persistSaveData(next);
  return next;
}

export function buySatellite(prev: SaveData, satelliteId: SatelliteId): SaveData {
  if (prev.ownedSatellites.includes(satelliteId)) return prev;
  const def = getSatelliteById(satelliteId);
  if (!isSatelliteUnlockedForPurchase(def, prev.records)) return prev;
  if (prev.stars < def.costStars) return prev;

  const next: SaveData = {
    ...prev,
    stars: prev.stars - def.costStars,
    ownedSatellites: [...prev.ownedSatellites, satelliteId],
    selectedSatellite: satelliteId,
  };
  persistSaveData(next);
  return next;
}

export function equipSatellite(prev: SaveData, satelliteId: SatelliteId): SaveData {
  if (!prev.ownedSatellites.includes(satelliteId)) return prev;
  if (prev.selectedSatellite === satelliteId) return prev;
  const next: SaveData = {
    ...prev,
    selectedSatellite: satelliteId,
  };
  persistSaveData(next);
  return next;
}

export function buyShields(prev: SaveData, quantity: number): SaveData {
  const qty = Math.max(0, Math.floor(quantity));
  const totalCost = qty * SHIELD_COST_ROCKETS;
  if (qty <= 0 || prev.rockets < totalCost) return prev;

  const next: SaveData = {
    ...prev,
    rockets: prev.rockets - totalCost,
    shields: prev.shields + qty,
  };
  persistSaveData(next);
  return next;
}

export function consumeOneShield(prev: SaveData): SaveData {
  if (prev.shields <= 0) return prev;
  const next: SaveData = {
    ...prev,
    shields: prev.shields - 1,
  };
  persistSaveData(next);
  return next;
}

export function loadSaveData(): SaveData {
  const fallback = createDefaultSave();
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const records =
      parsed.records && typeof parsed.records === 'object' ? parsed.records : {};

    let currentLevelId =
      typeof parsed.currentLevelId === 'number'
        ? Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(parsed.currentLevelId)))
        : 1;

    if (!isLevelUnlocked(currentLevelId, records)) {
      currentLevelId = getNextUnlockedLevelId(1, records) ?? 1;
    }

    const ownedSatellites: SatelliteId[] =
      Array.isArray(parsed.ownedSatellites) && parsed.ownedSatellites.length > 0
        ? Array.from(new Set<SatelliteId>(['default', ...parsed.ownedSatellites]))
        : ['default'];

    const selectedSatellite: SatelliteId =
      parsed.selectedSatellite && ownedSatellites.includes(parsed.selectedSatellite)
        ? parsed.selectedSatellite
        : 'default';

    // Preserve previously completed sectors so they don't re-trigger retroactively unless cleared now
    const claimedSectorBonuses = Array.isArray(parsed.claimedSectorBonuses)
      ? parsed.claimedSectorBonuses.filter((n): n is number => typeof n === 'number')
      : [];

    const today = getTodayDateKey();
    const dailyMissions =
      parsed.dailyMissions &&
      parsed.dailyMissions.date === today &&
      Array.isArray(parsed.dailyMissions.missions) &&
      parsed.dailyMissions.missions.length === 2
        ? parsed.dailyMissions
        : createDailyMissionsForDate(today);

    const dailyLogin: DailyLoginState =
      parsed.dailyLogin && typeof parsed.dailyLogin === 'object'
        ? {
            lastClaimDate:
              typeof parsed.dailyLogin.lastClaimDate === 'string'
                ? parsed.dailyLogin.lastClaimDate
                : null,
            claimedDays:
              typeof parsed.dailyLogin.claimedDays === 'number'
                ? Math.max(0, Math.min(7, Math.floor(parsed.dailyLogin.claimedDays)))
                : 0,
          }
        : { lastClaimDate: null, claimedDays: 0 };

    return {
      currentLevelId,
      muted: Boolean(parsed.muted),
      musicMuted: Boolean(parsed.musicMuted),
      lowPower: Boolean(parsed.lowPower),
      stars:
        typeof parsed.stars === 'number' && Number.isFinite(parsed.stars)
          ? Math.max(0, Math.floor(parsed.stars))
          : INITIAL_STARS,
      rockets:
        typeof parsed.rockets === 'number' && Number.isFinite(parsed.rockets)
          ? Math.max(0, Math.floor(parsed.rockets))
          : INITIAL_ROCKETS,
      shields:
        typeof parsed.shields === 'number' && Number.isFinite(parsed.shields)
          ? Math.max(0, Math.floor(parsed.shields))
          : 0,
      ownedSatellites,
      selectedSatellite,
      claimedSectorBonuses,
      dailyLogin,
      dailyMissions,
      records,
    };
  } catch {
    return fallback;
  }
}

export function persistSaveData(data: SaveData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}

export function recordLevelCompletion(
  prev: SaveData,
  levelId: number,
  flightTime: number,
  shiftCount: number,
  starsEarned: number,
  orbitalStarsCollected: number
): {
  next: SaveData;
  isNewBestTime: boolean;
  isNewBestShifts: boolean;
  starsAddedToLobby: number;
  sectorBonusRockets: number;
  completedSectorTitle: string | null;
} {
  const existing: LevelRecord = prev.records[levelId] ?? {
    completed: false,
    stars: 0,
    bestTime: null,
    bestShifts: null,
  };

  const isNewBestTime = existing.bestTime === null || flightTime < existing.bestTime;
  const isNewBestShifts = existing.bestShifts === null || shiftCount < existing.bestShifts;

  const normalizedStars = Math.max(1, Math.min(3, Math.round(starsEarned)));
  const prevStars = Math.min(3, existing.stars || 0);

  const updatedRecord: LevelRecord = {
    completed: true,
    stars: Math.max(prevStars, normalizedStars),
    bestTime: isNewBestTime ? Number(flightTime.toFixed(2)) : existing.bestTime,
    bestShifts: isNewBestShifts ? shiftCount : existing.bestShifts,
  };

  const updatedRecords: Record<number, LevelRecord> = {
    ...prev.records,
    [levelId]: updatedRecord,
  };

  // Every level completion adds its earned mastery stars directly to lobby stars
  const starsAddedToLobby = normalizedStars;

  // Check if all 10 levels of this sector are now cleared for the first time (+50 Rockets bonus!)
  const sectorId = Math.max(1, Math.min(TOTAL_SECTORS, Math.ceil(levelId / 10)));
  let sectorBonusRockets = 0;
  let completedSectorTitle: string | null = null;
  let updatedClaimedBonuses = prev.claimedSectorBonuses;

  if (
    getChapterClearedCount(sectorId, updatedRecords) >= 10 &&
    !prev.claimedSectorBonuses.includes(sectorId)
  ) {
    sectorBonusRockets = SECTOR_CLEAR_ROCKET_BONUS;
    completedSectorTitle = CHAPTERS[sectorId - 1]?.title ?? `Sector ${sectorId}`;
    updatedClaimedBonuses = [...prev.claimedSectorBonuses, sectorId];
  }

  const nextCandidate = getNextUnlockedLevelId(levelId, updatedRecords);
  const nextLevelId = nextCandidate ?? Math.min(TOTAL_LEVELS, levelId);

  let next: SaveData = {
    ...prev,
    currentLevelId: nextLevelId,
    stars: prev.stars + starsAddedToLobby,
    rockets: prev.rockets + sectorBonusRockets,
    claimedSectorBonuses: updatedClaimedBonuses,
    records: updatedRecords,
  };

  // Update Daily Mission counters (levels cleared, orbital stars, shifts, 3-star clears)
  next = applyDailyMissionProgress(next, {
    levels_cleared: 1,
    orbital_stars: orbitalStarsCollected,
    shifts: shiftCount,
    three_star_clears: normalizedStars >= 3 ? 1 : 0,
  });

  persistSaveData(next);
  return {
    next,
    isNewBestTime,
    isNewBestShifts,
    starsAddedToLobby,
    sectorBonusRockets,
    completedSectorTitle,
  };
}

export function getCompletionStats(data: SaveData): {
  completedCount: number;
  totalStars: number;
} {
  let completedCount = 0;
  let totalStars = 0;
  for (const key of Object.keys(data.records)) {
    const rec = data.records[Number(key)];
    if (rec?.completed) completedCount++;
    if (rec?.stars) totalStars += rec.stars;
  }
  return { completedCount, totalStars };
}
