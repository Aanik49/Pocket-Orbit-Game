import React, { useState } from 'react';
import { X, Check, Lock } from 'lucide-react';
import { CHAPTERS, LEVELS } from '../game/levels';
import { getChapterClearedCount, isChapterUnlocked } from '../game/storage';
import { LevelRecord } from '../types';

interface LevelSelectModalProps {
  currentLevelId: number;
  records: Record<number, LevelRecord>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  records,
  onSelectLevel,
  onClose,
}) => {
  const initialChapter = Math.max(1, Math.min(5, Math.ceil(currentLevelId / 10)));
  const [activeChapterId, setActiveChapterId] = useState<number>(initialChapter);

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
      className="fixed inset-0 z-40 bg-[#040712]/88 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter w-full max-w-lg rounded-2xl bg-[#0B1224] border border-slate-700/60 p-4 sm:p-6 flex flex-col max-h-[90dvh] overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight">
              Sector Atlas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono-num">
              {totalCompleted} of 50 sectors cleared
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sector atlas"
            className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Chapter Segmented Tabs (All always visible & inspectable) */}
        <div
          role="tablist"
          aria-label="Orbital Chapters"
          className="shrink-0 grid grid-cols-5 gap-1.5 mt-3.5 p-1 rounded-xl bg-[#060A16] border border-slate-800/80"
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
                className={`h-9 sm:h-10 rounded-lg text-xs font-display font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : unlocked
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {!unlocked && <Lock className="w-3 h-3 shrink-0 opacity-75" aria-hidden="true" />}
                <span>Ch. {ch.roman}</span>
              </button>
            );
          })}
        </div>

        {/* Active Chapter Heading & Unlock Status */}
        <div className="shrink-0 flex items-baseline justify-between gap-3 mt-3.5 mb-2.5">
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-slate-100">
              Chapter {chapter.roman}: {chapter.title}
            </h3>
            {chapterUnlocked ? (
              <p className="text-xs text-slate-400 mt-0.5">{chapter.subtitle}</p>
            ) : (
              <p className="text-xs text-amber-300/90 mt-0.5 font-mono-num">
                Locked · Clear all 10 sectors in Chapter {prevChapter?.roman} ({prevChapterCleared}/10)
              </p>
            )}
          </div>
          <span className="text-xs font-mono-num text-slate-400 shrink-0">
            {String(chapter.range[0]).padStart(2, '0')}–{String(chapter.range[1]).padStart(2, '0')}
          </span>
        </div>

        {/* 10-Level Grid: clean number and title only, locked chapters show lock icon */}
        <div className="min-h-0 flex-1 grid grid-cols-2 gap-2 overflow-y-auto py-0.5">
          {chapterLevels.map((lvl) => {
            const rec = records[lvl.id];
            const isSelected = lvl.id === currentLevelId && chapterUnlocked;

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
                className={`min-h-[54px] px-3.5 py-2.5 rounded-xl border text-left flex flex-col justify-center transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  !chapterUnlocked
                    ? 'bg-[#070C19] border-slate-800/70 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'bg-sky-500/15 border-sky-400/70 active:scale-[0.98]'
                      : rec?.completed
                        ? 'bg-slate-900/80 border-slate-700/60 hover:border-slate-500/70 active:scale-[0.98]'
                        : 'bg-[#080E1D] border-slate-800/90 hover:border-slate-700 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span
                    className={`font-mono-num text-xs font-semibold ${
                      chapterUnlocked ? 'text-sky-300' : 'text-slate-500'
                    }`}
                  >
                    {String(lvl.id).padStart(2, '0')}
                  </span>

                  {!chapterUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-label="Locked" />
                  ) : rec?.completed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-label="Cleared" />
                  ) : null}
                </div>

                <div
                  className={`font-display text-sm font-medium truncate mt-0.5 ${
                    chapterUnlocked ? 'text-slate-100' : 'text-slate-400'
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
