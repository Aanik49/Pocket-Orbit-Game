import React from 'react';
import { Volume2, VolumeX, Music, Layers, Play, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/useInstallPrompt';
import { ChapterMeta, LevelConfig } from '../types';

interface TitleOverlayProps {
  currentLevel: LevelConfig;
  currentChapter: ChapterMeta;
  completedCount: number;
  totalStars: number;
  muted: boolean;
  musicMuted: boolean;
  onStart: () => void;
  onOpenLevels: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  currentLevel,
  currentChapter,
  completedCount,
  totalStars,
  muted,
  musicMuted,
  onStart,
  onOpenLevels,
  onToggleMute,
  onToggleMusic,
}) => {
  const isResuming = completedCount > 0;
  const { canInstall, install } = usePWAInstall();

  return (
    <section
      aria-label="Pocket Orbit Title Screen"
      className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none px-6 py-6 sm:px-10 sm:py-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(5,8,20,0.72) 0%, rgba(5,8,20,0.06) 36%, rgba(5,8,20,0.08) 64%, rgba(5,8,20,0.88) 100%)',
      }}
    >
      {/* Top quiet header row: Game Icon + Title Lockup + install/music/sound controls */}
      <div className="flex items-start justify-between gap-3 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-sky-400/30 bg-[#070B1E] shrink-0 shadow-[0_6px_22px_rgba(2,6,23,0.65)] flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-9 h-9" aria-hidden="true">
              <circle cx="24" cy="24" r="18" fill="none" stroke="#38BDF8" strokeOpacity="0.5" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="11" fill="none" stroke="#FBBF24" strokeOpacity="0.85" strokeWidth="1.6" />
              <circle cx="24" cy="24" r="5" fill="#38BDF8" />
              <circle cx="35" cy="24" r="2.6" fill="#FDE68A" />
            </svg>
            <img
              src="./icon-192.png"
              alt="Pocket Orbit game icon"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="font-display text-xl sm:text-3xl font-semibold tracking-tight text-white leading-none truncate">
              Pocket Orbit
            </h1>
            <p className="mt-1.5 text-[11px] sm:text-sm text-slate-300/85 tracking-wide truncate">
              Close is fast · Far is slow · 50 Sectors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canInstall && (
            <button
              type="button"
              onClick={() => void install()}
              aria-label="Install Pocket Orbit to device"
              className="pointer-events-auto h-11 px-3 rounded-xl bg-[#0B1224]/85 border border-sky-400/50 text-sky-200 hover:text-white hover:border-sky-300 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Music toggle beside Sound toggle */}
          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={musicMuted ? 'Enable music' : 'Mute music'}
            aria-pressed={!musicMuted}
            className="pointer-events-auto relative w-11 h-11 rounded-xl bg-[#0B1224]/85 border border-slate-700/50 text-slate-200 hover:text-white hover:border-slate-500/70 active:scale-95 transition-transform flex items-center justify-center focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <Music className={`w-5 h-5 ${musicMuted ? 'text-rose-400/90 opacity-65' : 'text-sky-300'}`} />
            {musicMuted && (
              <span
                aria-hidden="true"
                className="absolute w-6 h-[1.8px] bg-rose-400 -rotate-45 rounded-full"
              />
            )}
          </button>

          {/* Sound effects toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={!muted}
            className="pointer-events-auto w-11 h-11 rounded-xl bg-[#0B1224]/85 border border-slate-700/50 text-slate-200 hover:text-white hover:border-slate-500/70 active:scale-95 transition-transform flex items-center justify-center focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Calm open center: leaves the live orbiting planet & satellite completely unobstructed */}
      <div className="flex-1" />

      {/* Bottom focal launch cluster */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 pointer-events-auto">
        {/* Clean unboxed metadata strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-300/90">
          <span className="font-mono-num text-sky-300">
            Sector {String(currentLevel.id).padStart(2, '0')}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-display font-medium text-slate-100">{currentLevel.name}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">Chapter {currentChapter.roman}</span>
          {completedCount > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono-num text-amber-300">
                {completedCount}/50 Cleared ({totalStars}★)
              </span>
            </>
          )}
        </div>

        {/* Action row: single primary CTA + secondary 50-sector atlas trigger */}
        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenLevels}
            className="h-13 px-4 sm:px-5 rounded-2xl bg-[#0D152B]/90 border border-slate-700/60 hover:border-slate-500/80 text-slate-200 hover:text-white text-sm font-medium active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Sectors</span>
          </button>

          <button
            type="button"
            onClick={onStart}
            className="flex-1 h-13 px-6 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-display font-semibold text-base tracking-tight active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-200"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isResuming ? `Continue Sector ${String(currentLevel.id).padStart(2, '0')}` : 'Start Orbit'}</span>
          </button>
        </div>

        {/* Bottom control-hint line */}
        <p className="text-xs text-slate-400 tracking-wide text-center">
          Tap Anywhere to shift orbit.
        </p>
      </div>
    </section>
  );
};
