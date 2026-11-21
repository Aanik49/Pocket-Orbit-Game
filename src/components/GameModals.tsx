import React from 'react';
import { RotateCcw, Play, Layers, ArrowRight, BatteryCharging, Home } from 'lucide-react';
import { LevelConfig, RunSummary } from '../types';

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
      className="fixed inset-0 z-30 bg-[#040712]/82 flex items-center justify-center p-5"
    >
      <div className="animate-modal-enter w-full max-w-sm rounded-2xl bg-[#0B1224] border border-slate-700/60 p-6">
        <div className="pb-4 border-b border-slate-800">
          <div className="text-xs font-mono-num text-sky-300">
            Sector {String(level.id).padStart(2, '0')} · Chapter {level.chapter}
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mt-0.5">
            {level.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{level.mechanicNote}</p>
        </div>

        {/* Battery Saver toggle for older/low-power Android devices */}
        <div className="flex items-center justify-between gap-3 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BatteryCharging className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-slate-100">Battery Saver</div>
              <div className="text-[11px] text-slate-400">Lower pixel ratio & lighter trails</div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={lowPower}
            onClick={onToggleLowPower}
            className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center focus-visible:outline-2 focus-visible:outline-sky-400 ${
              lowPower ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white block" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 mt-5">
          <button
            type="button"
            onClick={onResume}
            className="w-full h-12 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-amber-200"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onRestart}
              className="h-11 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={onOpenLevels}
              className="h-11 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <Layers className="w-4 h-4" />
              <span>Sectors</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onReturnTitle}
            className="h-10 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
  onRetry: () => void;
  onOpenLevels: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  onRetry,
  onOpenLevels,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Orbit Interrupted"
      className="fixed inset-0 z-30 bg-[#040712]/78 flex items-center justify-center p-5"
    >
      <div className="animate-modal-enter w-full max-w-sm rounded-2xl bg-[#0B1224] border border-rose-500/35 p-6 text-center">
        <div className="text-xs font-mono-num text-rose-300">
          Sector {String(level.id).padStart(2, '0')} · {level.name}
        </div>
        <h2 className="font-display text-2xl font-semibold text-white mt-1">
          Orbit Broken
        </h2>
        <p className="text-xs text-slate-300/90 mt-2 leading-relaxed">
          Shifting lanes a fraction earlier opens clean space around debris.
        </p>

        <div className="flex items-center gap-2.5 mt-6">
          <button
            type="button"
            onClick={onOpenLevels}
            className="h-12 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            Sectors
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-rose-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Orbit</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-3">Press Space or Enter to relaunch</p>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  level: LevelConfig;
  summary: RunSummary;
  onReplay: () => void;
  onNext: () => void;
  onOpenLevels: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  summary,
  onReplay,
  onNext,
  onOpenLevels,
}) => {
  const isFinalLevel = level.id >= 50;
  const underPar = summary.shiftCount <= summary.parShifts;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sector Cleared"
      className="fixed inset-0 z-30 bg-[#040712]/78 flex items-center justify-center p-5"
    >
      <div className="animate-modal-enter w-full max-w-sm rounded-2xl bg-[#0B1224] border border-emerald-400/35 p-6 text-center">
        <div className="text-xs font-mono-num text-emerald-300">
          {isFinalLevel ? 'All 50 Sectors Complete' : `Sector ${String(level.id).padStart(2, '0')} Cleared`}
        </div>
        <h2 className="font-display text-2xl font-semibold text-white mt-1">
          {level.name}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {underPar
            ? `Graceful trajectory · Within par (${summary.parShifts} shifts)`
            : 'Wormhole synchronized'}
        </p>

        {/* Stars Earned Row */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: summary.starsEarned }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" className="w-7 h-7 text-amber-300">
              <path
                fill="currentColor"
                d="M10 1.5l2.1 5.9 6.2.4-4.8 3.9 1.6 6.1L10 14.3l-5.1 3.5 1.6-6.1-4.8-3.9 6.2-.4L10 1.5z"
              />
            </svg>
          ))}
        </div>

        {/* Clean tabular telemetry strip (no nested card boxes) */}
        <div className="grid grid-cols-2 divide-x divide-slate-800 border-y border-slate-800 py-3.5 mt-5">
          <div>
            <div className="text-[11px] text-slate-400">Flight Time</div>
            <div className="font-mono-num text-lg font-semibold text-white mt-0.5">
              {summary.flightTime.toFixed(1)}s
            </div>
            {summary.isNewBestTime && (
              <div className="text-[10px] text-emerald-300 mt-0.5">Best time</div>
            )}
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Orbit Shifts</div>
            <div className="font-mono-num text-lg font-semibold text-amber-300 mt-0.5">
              {summary.shiftCount}
            </div>
            {summary.isNewBestShifts && (
              <div className="text-[10px] text-emerald-300 mt-0.5">Fewest shifts</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-5">
          <button
            type="button"
            onClick={onReplay}
            className="h-12 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            Replay
          </button>

          <button
            type="button"
            onClick={isFinalLevel ? onOpenLevels : onNext}
            className="flex-1 h-12 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-emerald-200"
          >
            <span>{isFinalLevel ? 'Sector Atlas' : `Sector ${String(level.id + 1).padStart(2, '0')}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
