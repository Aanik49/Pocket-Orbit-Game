import { LevelRecord, SaveData } from '../types';

const STORAGE_KEY = 'pocket_orbit_save_v1';

const DEFAULT_SAVE: SaveData = {
  currentLevelId: 1,
  muted: false,
  musicMuted: false,
  lowPower: false,
  records: {},
};

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
 * Chapter 1 (Sectors 01-10) is always unlocked.
 * Chapter N (N >= 2) unlocks only when all 10 levels of every preceding chapter are cleared.
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
  const chapterId = Math.max(1, Math.min(5, Math.ceil(levelId / 10)));
  return isChapterUnlocked(chapterId, records);
}

/**
 * Picks the next logical unlocked sector to play after clearing `fromLevelId`:
 * - If `fromLevelId + 1` is unlocked, advance to it.
 * - Otherwise (e.g. finished level 10 before clearing an earlier level in Chapter I),
 *   guide the player to the first remaining uncompleted sector in the same chapter.
 * - Returns null if all 50 levels are complete.
 */
export function getNextUnlockedLevelId(
  fromLevelId: number,
  records: Record<number, LevelRecord>
): number | null {
  if (fromLevelId < 50 && isLevelUnlocked(fromLevelId + 1, records)) {
    return fromLevelId + 1;
  }

  const chapterId = Math.max(1, Math.min(5, Math.ceil(fromLevelId / 10)));
  const start = (chapterId - 1) * 10 + 1;
  const end = chapterId * 10;
  for (let id = start; id <= end; id++) {
    if (!records[id]?.completed) {
      return id;
    }
  }

  // Fallback: first uncompleted unlocked level overall
  for (let id = 1; id <= 50; id++) {
    if (isLevelUnlocked(id, records) && !records[id]?.completed) {
      return id;
    }
  }

  return null;
}

export function loadSaveData(): SaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE, records: {} };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const records =
      parsed.records && typeof parsed.records === 'object' ? parsed.records : {};

    let currentLevelId =
      typeof parsed.currentLevelId === 'number'
        ? Math.max(1, Math.min(50, Math.floor(parsed.currentLevelId)))
        : 1;

    // Ensure saved currentLevelId never points into a locked chapter
    if (!isLevelUnlocked(currentLevelId, records)) {
      currentLevelId = getNextUnlockedLevelId(1, records) ?? 1;
    }

    return {
      currentLevelId,
      muted: Boolean(parsed.muted),
      musicMuted: Boolean(parsed.musicMuted),
      lowPower: Boolean(parsed.lowPower),
      records,
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

  const updatedRecords: Record<number, LevelRecord> = {
    ...prev.records,
    [levelId]: updatedRecord,
  };

  const nextCandidate = getNextUnlockedLevelId(levelId, updatedRecords);
  const nextLevelId = nextCandidate ?? Math.min(50, levelId);

  const next: SaveData = {
    ...prev,
    currentLevelId: nextLevelId,
    records: updatedRecords,
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
