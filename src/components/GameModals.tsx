import React from 'react';
import { RotateCcw, Play, Layers, ArrowRight, BatteryCharging, Home, SlidersHorizontal } from 'lucide-react';
import { GameOverReason, LevelConfig, RunSummary } from '../types';
import { PaperRocketIcon, PaperStarIcon } from './PaperCraftIcons';

interface PauseModalProps {
  level: LevelConfig;
  lowPower: boolean;
  onToggleLowPower: () => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenLevels: () => void;
  onReturnTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  lowPower,
  onToggleLowPower,
  onResume,
  onRestart,
  onOpenLevels,
  onReturnTitle,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game Paused"
      className="fixed inset-0 z-30 bg-[#14182B]/72 flex items-center justify-center p-5"
    >
      <div className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-sm rounded-3xl border-[3px] border-[#27324F] p-6">
        <div className="pb-4 border-b-2 border-dashed border-[#D3C4AA]">
          <div className="text-xs font-mono-num font-bold text-[#C75C3B]">
            Sector {level.chapter} · Level {String(level.id).padStart(2, '0')}
          </div>
          <h2 className="font-display text-2xl font-bold text-[#27324F] mt-0.5">
            {level.name}
          </h2>
          <p className="text-xs font-semibold text-[#6A5E4E] mt-1">{level.mechanicNote}</p>
        </div>

        {/* Battery Saver toggle */}
        <div className="flex items-center justify-between gap-3 py-4 border-b-2 border-dashed border-[#D3C4AA]">
          <div className="flex items-center gap-2.5">
            <BatteryCharging className="w-5 h-5 text-[#4D8B62] shrink-0" />
            <div>
              <div className="text-sm font-display font-bold text-[#27324F]">Battery Saver</div>
              <div className="text-[11px] font-semibold text-[#6A5E4E]">
                Lower pixel ratio & lighter paper grain
              </div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={lowPower}
            onClick={onToggleLowPower}
            className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center border-2 border-[#27324F] focus-visible:outline-2 focus-visible:outline-[#27324F] ${
              lowPower ? 'bg-[#5F9E73] justify-end' : 'bg-[#D8CCB7] justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#FAF3E6] block shadow-sm" />
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-5">
          <button
            type="button"
            onClick={onResume}
            className="paper-btn-terracotta relative w-full h-12 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#27324F]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-1.5 rounded-xl border border-dashed border-[#FAF3E6]/55 pointer-events-none"
            />
            <Play className="w-4 h-4 relative z-10 fill-current" />
            <span className="relative z-10">Resume</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onRestart}
              className="paper-btn-cream h-11 rounded-2xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={onOpenLevels}
              className="paper-btn-denim h-11 rounded-2xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <Layers className="w-4 h-4" />
              <span>Sectors</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onReturnTitle}
            className="h-10 rounded-xl text-[#5E5447] hover:text-[#27324F] text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  level: LevelConfig;
  reason: GameOverReason;
  onRetry: () => void;
  onOpenLoadout: () => void;
  onOpenLevels: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  reason,
  onRetry,
  onOpenLoadout,
  onOpenLevels,
  onReturnTitle,
}) => {
  const isTimeout = reason === 'timeout';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isTimeout ? 'Time Expired' : 'Orbit Interrupted'}
      className="fixed inset-0 z-30 bg-[#14182B]/72 flex items-center justify-center p-5"
    >
      <div className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-sm rounded-3xl border-[3px] border-[#27324F] p-6 text-center">
        <div className="text-xs font-mono-num font-bold text-[#C75C3B]">
          Sector {level.chapter} · Level {String(level.id).padStart(2, '0')} · {level.name}
        </div>
        <h2 className="font-display text-2xl font-bold text-[#27324F] mt-1">
          {isTimeout ? 'Time Expired' : 'Orbit Broken'}
        </h2>
        <p className="text-xs font-semibold text-[#5E5447] mt-2 leading-relaxed">
          {isTimeout
            ? 'Ride the fast inner orbit to save seconds, or equip Nano Stopper to turn off the timer.'
            : 'Shift lanes a fraction earlier, or arm a Shield / Heavy craft in Loadout.'}
        </p>

        <div className="flex flex-col gap-2.5 mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="paper-btn-terracotta relative w-full h-12 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-1.5 rounded-xl border border-dashed border-[#FAF3E6]/55 pointer-events-none"
            />
            <RotateCcw className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Retry Orbit</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenLevels}
              className="paper-btn-denim h-11 px-3 rounded-2xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <Layers className="w-4 h-4" />
              <span>Sectors</span>
            </button>

            <button
              type="button"
              onClick={onReturnTitle}
              className="paper-btn-cream h-11 px-3 rounded-2xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <Home className="w-4 h-4" />
              <span>Title Screen</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenLoadout}
            className="h-9 rounded-xl text-[#4D78A8] hover:text-[#27324F] text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Change Satellite / Arm Shield</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  level: LevelConfig;
  summary: RunSummary;
  nextLevelId: number | null;
  onReplay: () => void;
  onNext: () => void;
  onOpenLevels: () => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  summary,
  nextLevelId,
  onReplay,
  onNext,
  onOpenLevels,
  onReturnTitle,
}) => {
  const isAllComplete = nextLevelId === null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Cleared"
      className="fixed inset-0 z-30 bg-[#14182B]/72 flex items-center justify-center p-5"
    >
      <div className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-sm rounded-3xl border-[3px] border-[#27324F] p-6 text-center">
        <div className="text-xs font-mono-num font-bold text-[#448458]">
          {isAllComplete
            ? 'All 60 Levels Complete'
            : `Level ${String(level.id).padStart(2, '0')} Cleared`}
        </div>
        <h2 className="font-display text-2xl font-bold text-[#27324F] mt-1">
          {level.name}
        </h2>
        <p className="text-xs font-semibold text-[#6A5E4E] mt-1">
          {summary.starsEarned >= 3
            ? `Master trajectory · Within par (${summary.parShifts} shifts)`
            : `Clear in ${summary.parShifts} shifts or fewer for 3 stars`}
        </p>

        {/* 3-Star Gold-Foil Mastery Rating Row */}
        <div
          className="flex items-center justify-center gap-2.5 mt-3.5"
          aria-label={`${summary.starsEarned} of 3 stars earned`}
        >
          {[1, 2, 3].map((slot) => {
            const filled = slot <= summary.starsEarned;
            return (
              <svg
                key={slot}
                viewBox="0 0 20 20"
                className={`w-8 h-8 ${
                  filled
                    ? 'text-[#F3C24F] drop-shadow-[0_2px_0_rgba(39,50,79,0.22)]'
                    : 'text-[#D6CBB7]'
                }`}
              >
                <path
                  fill="currentColor"
                  stroke={filled ? '#B67D1B' : 'none'}
                  strokeWidth="0.9"
                  d="M10 1.5l2.1 5.9 6.2.4-4.8 3.9 1.6 6.1L10 14.3l-5.1 3.5 1.6-6.1-4.8-3.9 6.2-.4L10 1.5z"
                />
              </svg>
            );
          })}
        </div>

        {/* Lobby Reward Badges (+Stars earned & optional +50 Rockets Sector Bonus) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3CC] border border-[#D9B65B] font-mono-num text-xs font-bold text-[#27324F]">
            <PaperStarIcon className="w-4 h-4" />
            +{summary.starsAddedToLobby} Lobby Stars
          </span>

          {summary.sectorBonusRockets > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F8E2D4] border border-[#C75C3B] font-mono-num text-xs font-bold text-[#B34323]">
              <PaperRocketIcon className="w-4 h-4" />
              +{summary.sectorBonusRockets} Sector Clear Bonus!
            </span>
          )}
        </div>

        {/* Clean tabular telemetry strip */}
        <div className="grid grid-cols-2 divide-x-2 divide-dashed divide-[#D3C4AA] border-y-2 border-dashed border-[#D3C4AA] py-3 mt-4">
          <div>
            <div className="text-[11px] font-bold text-[#6A5E4E]">Flight Time</div>
            <div className="font-mono-num text-lg font-bold text-[#27324F] mt-0.5">
              {summary.flightTime.toFixed(1)}s
            </div>
            {summary.isNewBestTime && (
              <div className="text-[10px] font-bold text-[#448458] mt-0.5">Best time</div>
            )}
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#6A5E4E]">Orbit Shifts</div>
            <div className="font-mono-num text-lg font-bold text-[#C75C3B] mt-0.5">
              {summary.shiftCount}
            </div>
            {summary.isNewBestShifts && (
              <div className="text-[10px] font-bold text-[#448458] mt-0.5">Fewest shifts</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-4">
          <button
            type="button"
            onClick={isAllComplete ? onOpenLevels : onNext}
            className="paper-btn-sage relative w-full h-12 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-1.5 rounded-xl border border-dashed border-[#FAF3E6]/55 pointer-events-none"
            />
            <span className="relative z-10">
              {isAllComplete ? 'Sector Atlas' : `Level ${String(nextLevelId).padStart(2, '0')}`}
            </span>
            <ArrowRight className="w-4 h-4 relative z-10" />
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onReplay}
              className="paper-btn-denim h-11 px-3 rounded-2xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={onReturnTitle}
              className="paper-btn-cream h-11 px-3 rounded-2xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
