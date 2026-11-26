import React, { useState } from 'react';
import { X, Check, Lock, Crown } from 'lucide-react';
import { CHAPTERS, LEVELS, TOTAL_LEVELS, TOTAL_SECTORS } from '../game/levels';
import { getChapterClearedCount, isChapterUnlocked } from '../game/storage';
import { LevelRecord } from '../types';

interface LevelSelectModalProps {
  currentLevelId: number;
  initialChapterId?: number;
  records: Record<number, LevelRecord>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  initialChapterId,
  records,
  onSelectLevel,
  onClose,
}) => {
  const defaultChapter = initialChapterId
    ? Math.max(1, Math.min(TOTAL_SECTORS, initialChapterId))
    : Math.max(1, Math.min(TOTAL_SECTORS, Math.ceil(currentLevelId / 10)));
  const [activeChapterId, setActiveChapterId] = useState<number>(defaultChapter);

  const chapter = CHAPTERS[activeChapterId - 1];
  const chapterLevels = LEVELS.filter((l) => l.chapter === activeChapterId);
  const chapterUnlocked = isChapterUnlocked(activeChapterId, records);

  const prevChapter = activeChapterId > 1 ? CHAPTERS[activeChapterId - 2] : null;
  const prevChapterCleared = prevChapter ? getChapterClearedCount(prevChapter.id, records) : 10;

  const totalCompleted = Object.values(records).filter((r) => r.completed).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select Sector"
      className="safe-modal-pad fixed inset-0 z-40 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter cosmic-modal-frame relative w-full max-w-[380px] max-h-[82dvh] flex flex-col"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sector atlas"
          className="glossy-close-orange absolute -top-2.5 -right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-transform focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="cosmic-modal-inner p-3.5 sm:p-4 flex flex-col max-h-[calc(82dvh-5px)] overflow-hidden">
          <div className="shrink-0 text-center pb-2.5 border-b border-[#3D58C4]/50">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#FFCC29] tracking-tight drop-shadow-[0_2px_0_#A63A00]">
              Sector Atlas
            </h2>
            <p className="text-[11px] font-bold text-[#DCEAFF] mt-0.5 font-mono-num">
              {totalCompleted} of {TOTAL_LEVELS} cleared · Clear a sector for +50 Rockets
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Orbital Sectors"
            className="shrink-0 grid grid-cols-6 gap-1 mt-2.5 p-1 rounded-2xl bg-[#0A0E42]/90 border border-[#4466C8]/65"
          >
            {CHAPTERS.map((ch) => {
              const isActive = ch.id === activeChapterId;
              const unlocked = isChapterUnlocked(ch.id, records);
              return (
                <button
                  key={ch.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveChapterId(ch.id)}
                  className={`h-7.5 rounded-xl text-[10px] sm:text-[11px] font-display font-extrabold transition-all whitespace-nowrap flex items-center justify-center gap-0.5 focus-visible:outline-2 focus-visible:outline-[#3DF2FF] ${
                    isActive
                      ? 'glossy-btn-blue'
                      : unlocked
                        ? 'text-[#B5CCFA] hover:bg-[#1E2E8C]/60 hover:text-white'
                        : 'text-[#7385B8] hover:bg-[#1A256E]/45'
                  }`}
                >
                  {!unlocked && <Lock className="w-2.5 h-2.5 shrink-0 opacity-85" aria-hidden="true" />}
                  <span>S.{ch.roman}</span>
                </button>
              );
            })}
          </div>

          <div className="shrink-0 flex items-baseline justify-between gap-2 mt-2.5 mb-2">
            <div className="min-w-0">
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#FFB82E]">
                Sector {chapter.id}: {chapter.title}
              </h3>
              {chapterUnlocked ? (
                <p className="text-[11px] font-bold text-[#7CE7FF] mt-0.5">
                  {chapter.id >= 3 ? `${chapter.subtitle} · Timed` : chapter.subtitle}
                </p>
              ) : (
                <p className="text-[11px] font-bold text-[#FF8866] mt-0.5 font-mono-num">
                  Locked · Clear all 10 in Sector {prevChapter?.id} ({prevChapterCleared}/10)
                </p>
              )}
            </div>
            <span className="text-xs font-mono-num font-extrabold text-[#FFB82E] shrink-0">
              {String(chapter.range[0]).padStart(2, '0')}–{String(chapter.range[1]).padStart(2, '0')}
            </span>
          </div>

          <div className="min-h-0 flex-1 grid grid-cols-2 gap-2 overflow-y-auto py-0.5 pr-0.5">
            {chapterLevels.map((lvl) => {
              const rec = records[lvl.id];
              const isSelected = lvl.id === currentLevelId && chapterUnlocked;
              const isBoss = Boolean(lvl.boss);
              const earnedStars = rec?.completed ? Math.max(1, Math.min(3, rec.stars || 1)) : 0;

              return (
                <button
                  key={lvl.id}
                  type="button"
                  disabled={!chapterUnlocked}
                  aria-disabled={!chapterUnlocked}
                  onClick={() => {
                    if (chapterUnlocked) {
                      onSelectLevel(lvl.id);
                    }
                  }}
                  className={`min-h-[48px] px-2.5 py-1.5 rounded-xl text-left flex flex-col justify-center overflow-hidden transition-all focus-visible:outline-2 focus-visible:outline-[#3DF2FF] ${
                    !chapterUnlocked
                      ? 'bg-[#121959]/65 border border-[#3E4F9E]/55 opacity-75 cursor-not-allowed'
                      : isSelected
                        ? 'glossy-btn-gold active:translate-y-0.5'
                        : isBoss && !rec?.completed
                          ? 'bg-[#461336]/92 border-[1.5px] border-[#FF6B42] hover:border-[#FFD426] active:translate-y-0.5'
                          : rec?.completed
                            ? 'glossy-btn-blue active:translate-y-0.5'
                            : 'bg-[#151E6B]/85 border-[1.5px] border-[#4A61C4]/70 hover:border-[#6CE5FF] hover:bg-[#1B2884] active:translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full min-w-0">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className={`font-mono-num text-[11px] font-extrabold shrink-0 ${
                          !chapterUnlocked
                            ? 'text-[#7A8CC2]'
                            : isSelected
                              ? 'text-[#4A1C00]'
                              : isBoss
                                ? 'text-[#FFD426]'
                                : rec?.completed
                                  ? 'text-white'
                                  : 'text-[#89A4E8]'
                        }`}
                      >
                        {String(lvl.id).padStart(2, '0')}
                      </span>

                      {isBoss && (
                        <span
                          className={`inline-flex items-center gap-0.5 text-[9px] font-display font-extrabold shrink-0 ${
                            isSelected ? 'text-[#7A2200]' : 'text-[#FF9E57]'
                          }`}
                        >
                          <Crown className="w-2.5 h-2.5" aria-hidden="true" />
                          BOSS
                        </span>
                      )}

                      {chapterUnlocked && rec?.completed && (
                        <span
                          className="inline-flex items-center gap-0.5 shrink-0"
                          aria-label={`${earnedStars} of 3 stars`}
                        >
                          {[1, 2, 3].map((slot) => (
                            <svg
                              key={slot}
                              viewBox="0 0 20 20"
                              className={`w-2.5 h-2.5 shrink-0 ${
                                slot <= earnedStars
                                  ? isSelected
                                    ? 'text-[#4A1C00]'
                                    : 'text-[#FFD93B]'
                                  : isSelected
                                    ? 'text-[#A66500]/45'
                                    : 'text-[#082475]/75'
                              }`}
                            >
                              <path
                                fill="currentColor"
                                d="M10 1.5l2.1 5.9 6.2.4-4.8 3.9 1.6 6.1L10 14.3l-5.1 3.5 1.6-6.1-4.8-3.9 6.2-.4L10 1.5z"
                              />
                            </svg>
                          ))}
                        </span>
                      )}
                    </div>

                    {!chapterUnlocked ? (
                      <Lock className="w-3 h-3 text-[#7A8CC2] shrink-0" aria-label="Locked" />
                    ) : rec?.completed ? (
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 stroke-[3] ${
                          isSelected ? 'text-[#4A1C00]' : 'text-[#7DF2FF]'
                        }`}
                        aria-label="Cleared"
                      />
                    ) : null}
                  </div>

                  <div
                    className={`font-display text-xs font-bold truncate mt-0.5 w-full ${
                      !chapterUnlocked
                        ? 'text-[#8495C8]'
                        : isSelected
                          ? 'text-[#4A1C00]'
                          : rec?.completed || isBoss
                            ? 'text-white'
                            : 'text-[#B5C8F5]'
                    }`}
                  >
                    {lvl.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
