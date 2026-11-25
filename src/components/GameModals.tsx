import React from 'react';
import {
  RotateCcw,
  Play,
  Layers,
  ArrowRight,
  BatteryCharging,
  Home,
  SlidersHorizontal,
} from 'lucide-react';
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
      className="fixed inset-0 z-30 bg-[#040724]/75 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div className="animate-modal-enter cosmic-modal-frame w-full max-w-[316px]">
        <div className="cosmic-modal-inner overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3.5 text-center">
            <div className="font-display text-xs font-bold text-[#FFA726]">
              Sector {level.chapter} - Level {String(level.id).padStart(2, '0')}
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#FFF2C9] mt-0.5 leading-tight drop-shadow-[0_2px_0_rgba(12,18,74,0.85)]">
              {level.name}
            </h2>
            <p className="text-[11px] sm:text-xs font-bold text-[#74E6FF] mt-1">
              {level.mechanicNote}
            </p>
          </div>

          {/* Battery Saver Band */}
          <div className="flex items-center justify-between gap-2.5 px-4 py-3 bg-[#0B0F44]/75 border-y border-[#3B52A8]/55">
            <div className="flex items-center gap-2.5 min-w-0">
              <BatteryCharging className="w-6 h-6 text-[#4AF56A] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-display font-bold text-white leading-tight">
                  Battery Saver
                </div>
                <div className="text-[10px] font-semibold text-[#A6C4F0] mt-0.5 leading-snug">
                  Lower pixel ratio &amp; lighter effects
                </div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={lowPower}
              aria-label="Toggle Battery Saver"
              onClick={onToggleLowPower}
              className={`shrink-0 w-12 h-7 rounded-full p-1 transition-all flex items-center border-2 focus-visible:outline-2 focus-visible:outline-[#3DF2FF] ${
                lowPower
                  ? 'bg-[#1668E8] border-[#3DF2FF] justify-end'
                  : 'bg-[#121952] border-[#4A68C8] justify-start'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full block transition-all ${
                  lowPower ? 'bg-[#64F4FF]' : 'bg-[#5B75BA]'
                }`}
              />
            </button>
          </div>

          {/* Solid Arcade Buttons */}
          <div className="px-4 py-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="glossy-btn-coral w-full h-11 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onRestart}
                className="glossy-btn-gold h-10 rounded-2xl text-xs sm:text-sm font-display font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.6]" />
                <span>Restart</span>
              </button>

              <button
                type="button"
                onClick={onOpenLevels}
                className="glossy-btn-blue h-10 rounded-2xl text-xs sm:text-sm font-display font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
              >
                <Layers className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Sectors</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onReturnTitle}
              className="h-8 mt-0.5 rounded-xl text-[#7AE8FF] hover:text-white text-xs sm:text-sm font-display font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Title Screen</span>
            </button>
          </div>
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
      className="fixed inset-0 z-30 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div className="animate-modal-enter cosmic-modal-frame w-full max-w-[316px]">
        <div className="cosmic-modal-inner p-4 sm:p-5 text-center">
          <div className="text-[11px] font-mono-num font-bold text-[#FFA726]">
            Sector {level.chapter} · Level {String(level.id).padStart(2, '0')} · {level.name}
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[#FFF2C9] mt-0.5 drop-shadow-[0_2px_0_rgba(12,18,74,0.85)]">
            {isTimeout ? 'Time Expired' : 'Orbit Broken'}
          </h2>
          <p className="text-[11px] font-semibold text-[#98D9FF] mt-1.5 leading-relaxed">
            {isTimeout
              ? 'Ride the fast inner orbit to save seconds, or equip Nano Stopper to turn off the timer.'
              : 'Shift lanes a fraction earlier, or arm a Shield / Heavy craft in Loadout.'}
          </p>

          <div className="flex flex-col gap-2.5 mt-4">
            <button
              type="button"
              onClick={onRetry}
              className="glossy-btn-coral w-full h-11 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Retry Orbit</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onOpenLevels}
                className="glossy-btn-blue h-10 px-2.5 rounded-2xl text-xs sm:text-sm font-display font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sectors</span>
              </button>

              <button
                type="button"
                onClick={onReturnTitle}
                className="glossy-btn-gold h-10 px-2.5 rounded-2xl text-xs sm:text-sm font-display font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Title Screen</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenLoadout}
              className="h-8 rounded-xl text-[#7AE8FF] hover:text-white text-[11px] font-display font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Change Satellite / Arm Shield</span>
            </button>
          </div>
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
      className="fixed inset-0 z-30 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div className="animate-modal-enter cosmic-modal-frame w-full max-w-[316px]">
        <div className="cosmic-modal-inner p-4 sm:p-5 text-center">
          <div className="text-[11px] font-mono-num font-bold text-[#6CFFBA] uppercase tracking-wider">
            {isAllComplete
              ? 'All 60 Levels Complete'
              : `Level ${String(level.id).padStart(2, '0')} Cleared`}
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[#FFF2C9] mt-0.5 drop-shadow-[0_2px_0_rgba(12,18,74,0.85)]">
            {level.name}
          </h2>
          <p className="text-[11px] font-semibold text-[#7CE7FF] mt-0.5">
            {summary.starsEarned >= 3
              ? `Master trajectory · Within par (${summary.parShifts} shifts)`
              : `Clear in ${summary.parShifts} shifts or fewer for 3 stars`}
          </p>

          {/* 3-Star Mastery Row */}
          <div
            className="flex items-center justify-center gap-2 mt-3"
            aria-label={`${summary.starsEarned} of 3 stars earned`}
          >
            {[1, 2, 3].map((slot) => {
              const filled = slot <= summary.starsEarned;
              return (
                <svg
                  key={slot}
                  viewBox="0 0 20 20"
                  className={`w-7 h-7 ${
                    filled ? 'text-[#FFD93B]' : 'text-[#283278]'
                  }`}
                >
                  <path
                    fill="currentColor"
                    stroke={filled ? '#FF8800' : '#4E60B8'}
                    strokeWidth="1.1"
                    d="M10 1.5l2.1 5.9 6.2.4-4.8 3.9 1.6 6.1L10 14.3l-5.1 3.5 1.6-6.1-4.8-3.9 6.2-.4L10 1.5z"
                  />
                </svg>
              );
            })}
          </div>

          {/* Lobby Reward Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1C287A] border border-[#FFD426] font-mono-num text-[11px] font-bold text-[#FFE878]">
              <PaperStarIcon className="w-3.5 h-3.5" />
              +{summary.starsAddedToLobby} Lobby Stars
            </span>

            {summary.sectorBonusRockets > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A1C54] border border-[#FF7B42] font-mono-num text-[11px] font-bold text-[#FFD0B0]">
                <PaperRocketIcon className="w-3.5 h-3.5" />
                +{summary.sectorBonusRockets} Sector Clear Bonus!
              </span>
            )}
          </div>

          {/* Tabular Telemetry Strip */}
          <div className="grid grid-cols-2 divide-x divide-[#3C56B5]/60 rounded-2xl bg-[#0B1045]/75 border border-[#3B54B2]/55 py-2.5 mt-3">
            <div>
              <div className="text-[10px] font-bold text-[#8FB8F0]">Flight Time</div>
              <div className="font-mono-num text-base font-extrabold text-white mt-0.5">
                {summary.flightTime.toFixed(1)}s
              </div>
              {summary.isNewBestTime && (
                <div className="text-[9px] font-bold text-[#6CFFBA]">Best time</div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#8FB8F0]">Orbit Shifts</div>
              <div className="font-mono-num text-base font-extrabold text-[#FFD426] mt-0.5">
                {summary.shiftCount}
              </div>
              {summary.isNewBestShifts && (
                <div className="text-[9px] font-bold text-[#6CFFBA]">Fewest shifts</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-4">
            <button
              type="button"
              onClick={isAllComplete ? onOpenLevels : onNext}
              className="glossy-btn-green w-full h-11 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
            >
              <span>
                {isAllComplete ? 'Sector Atlas' : `Level ${String(nextLevelId).padStart(2, '0')}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onReplay}
                className="glossy-btn-blue h-10 px-2.5 rounded-2xl text-xs sm:text-sm font-display font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>

              <button
                type="button"
                onClick={onReturnTitle}
                className="glossy-btn-gold h-10 px-2.5 rounded-2xl text-xs sm:text-sm font-display font-extrabold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
