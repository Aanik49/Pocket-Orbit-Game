import { LevelRecord, SaveData } from '../types';

const STORAGE_KEY = 'pocket_orbit_save_v1';

const DEFAULT_SAVE: SaveData = {
  currentLevelId: 1,
  muted: false,
  lowPower: false,
  records: {},
};

export function loadSaveData(): SaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE, records: {} };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      currentLevelId:
        typeof parsed.currentLevelId === 'number'
          ? Math.max(1, Math.min(50, Math.floor(parsed.currentLevelId)))
          : 1,
      muted: Boolean(parsed.muted),
      lowPower: Boolean(parsed.lowPower),
      records: parsed.records && typeof parsed.records === 'object' ? parsed.records : {},
    };
  } catch {
    return { ...DEFAULT_SAVE, records: {} };
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
  starsEarned: number
): { next: SaveData; isNewBestTime: boolean; isNewBestShifts: boolean } {
  const existing: LevelRecord = prev.records[levelId] ?? {
    completed: false,
    stars: 0,
    bestTime: null,
    bestShifts: null,
  };

  const isNewBestTime = existing.bestTime === null || flightTime < existing.bestTime;
  const isNewBestShifts = existing.bestShifts === null || shiftCount < existing.bestShifts;

  const updatedRecord: LevelRecord = {
    completed: true,
    stars: Math.max(existing.stars, starsEarned),
    bestTime: isNewBestTime ? Number(flightTime.toFixed(2)) : existing.bestTime,
    bestShifts: isNewBestShifts ? shiftCount : existing.bestShifts,
  };

  const nextLevelId = Math.min(50, Math.max(prev.currentLevelId, levelId < 50 ? levelId + 1 : 50));

  const next: SaveData = {
    ...prev,
    currentLevelId: nextLevelId,
    records: {
      ...prev.records,
      [levelId]: updatedRecord,
    },
  };

  persistSaveData(next);
  return { next, isNewBestTime, isNewBestShifts };
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
