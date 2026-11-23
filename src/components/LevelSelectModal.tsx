import React, { useState } from 'react';
import { X, Check, Lock } from 'lucide-react';
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
      className="fixed inset-0 z-40 bg-[#14182B]/72 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-lg rounded-3xl border-[3px] border-[#27324F] p-4 sm:p-6 flex flex-col max-h-[90dvh] overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 pb-3 border-b-2 border-dashed border-[#D3C4AA]">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#27324F] tracking-tight">
              Sector Atlas
            </h2>
            <p className="text-xs font-bold text-[#6A5E4E] mt-0.5 font-mono-num">
              {totalCompleted} of {TOTAL_LEVELS} levels cleared · Complete a sector for +50 Rockets
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sector atlas"
            className="paper-btn-cream w-10 h-10 rounded-full flex items-center justify-center transition-transform shrink-0 focus-visible:outline-2 focus-visible:outline-[#27324F]"
          >
            <X className="w-5 h-5 text-[#27324F]" />
          </button>
        </div>

        {/* 6 Sector Segmented Tabs (All always visible & inspectable) */}
        <div
          role="tablist"
          aria-label="Orbital Sectors"
          className="shrink-0 grid grid-cols-6 gap-1 mt-3.5 p-1.5 rounded-2xl bg-[#E7DCC7] border border-[#D4C5AA]"
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
                className={`h-9 sm:h-10 rounded-xl text-[11px] sm:text-xs font-display font-bold transition-all whitespace-nowrap flex items-center justify-center gap-0.5 focus-visible:outline-2 focus-visible:outline-[#27324F] ${
                  isActive
                    ? 'bg-[#4D78A8] text-[#FAF3E6] shadow-[0_2px_0_#34567D]'
                    : unlocked
                      ? 'text-[#3F485E] hover:bg-[#F5EFE2]/70'
                      : 'text-[#847866] hover:bg-[#F5EFE2]/45'
                }`}
              >
                {!unlocked && <Lock className="w-2.5 h-2.5 shrink-0 opacity-80" aria-hidden="true" />}
                <span>S.{ch.roman}</span>
              </button>
            );
          })}
        </div>

        {/* Active Sector Heading & Unlock Status */}
        <div className="shrink-0 flex items-baseline justify-between gap-3 mt-3.5 mb-2.5">
          <div className="min-w-0">
            <h3 className="font-display text-sm sm:text-base font-bold text-[#27324F]">
              Sector {chapter.id}: {chapter.title}
            </h3>
            {chapterUnlocked ? (
              <p className="text-xs font-semibold text-[#6A5E4E] mt-0.5">
                {chapter.id >= 3 ? `${chapter.subtitle} · Timed` : chapter.subtitle}
              </p>
            ) : (
              <p className="text-xs font-bold text-[#C75C3B] mt-0.5 font-mono-num">
                Locked · Clear all 10 levels in Sector {prevChapter?.id} ({prevChapterCleared}/10)
              </p>
            )}
          </div>
          <span className="text-xs font-mono-num font-bold text-[#6A5E4E] shrink-0">
            {String(chapter.range[0]).padStart(2, '0')}–{String(chapter.range[1]).padStart(2, '0')}
          </span>
        </div>

        {/* 10-Level Grid: ONLY number + small completion stars beside number & above title + title (no subtitles) */}
        <div className="min-h-0 flex-1 grid grid-cols-2 gap-2.5 overflow-y-auto py-1 pr-0.5">
          {chapterLevels.map((lvl) => {
            const rec = records[lvl.id];
            const isSelected = lvl.id === currentLevelId && chapterUnlocked;
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
                className={`min-h-[56px] px-3 py-2.5 rounded-2xl border-2 text-left flex flex-col justify-center overflow-hidden transition-all focus-visible:outline-2 focus-visible:outline-[#27324F] ${
                  !chapterUnlocked
                    ? 'bg-[#E5DBC7] border-[#CFC2AA] opacity-75 cursor-not-allowed'
                    : isSelected
                      ? 'bg-[#F3C24F] border-[#27324F] shadow-[0_3px_0_#C29229] active:translate-y-0.5'
                      : rec?.completed
                        ? 'bg-[#4D78A8] border-[#34567D] shadow-[0_3px_0_#34567D] hover:bg-[#5884B5] active:translate-y-0.5'
                        : 'bg-[#FCF8EE] border-dashed border-[#BFAEA0] hover:border-[#4D78A8] shadow-[0_2px_0_#D8CBB4] active:translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`font-mono-num text-xs font-bold shrink-0 ${
                        !chapterUnlocked
                          ? 'text-[#847866]'
                          : isSelected
                            ? 'text-[#27324F]'
                            : rec?.completed
                              ? 'text-[#FAF3E6]'
                              : 'text-[#C75C3B]'
                      }`}
                    >
                      {String(lvl.id).padStart(2, '0')}
                    </span>

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
                                  ? 'text-[#27324F]'
                                  : 'text-[#F3C24F]'
                                : isSelected
                                  ? 'text-[#B58924]/50'
                                  : 'text-[#2B496B]/70'
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
                    <Lock className="w-3.5 h-3.5 text-[#847866] shrink-0" aria-label="Locked" />
                  ) : rec?.completed ? (
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-[#27324F]' : 'text-[#C8E8C8]'
                      }`}
                      aria-label="Cleared"
                    />
                  ) : null}
                </div>

                <div
                  className={`font-display text-sm font-semibold truncate mt-0.5 w-full ${
                    !chapterUnlocked
                      ? 'text-[#786D5D]'
                      : isSelected
                        ? 'text-[#27324F]'
                        : rec?.completed
                          ? 'text-[#FAF3E6]'
                          : 'text-[#27324F]'
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
  );
};
