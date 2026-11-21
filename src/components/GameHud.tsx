import React from 'react';
import { Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { HudSnapshot, LevelConfig } from '../types';

interface GameHudProps {
  level: LevelConfig;
  hud: HudSnapshot;
  muted: boolean;
  musicMuted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  level,
  hud,
  muted,
  musicMuted,
  onPause,
  onToggleMute,
  onToggleMusic,
}) => {
  const remaining = Math.max(0, hud.totalStars - hud.starsCollected);
  const isInner = hud.targetOrbit === 0;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none px-4 py-4 sm:px-7 sm:py-6">
      {/* Top Perimeter HUD (Low-occlusion, unboxed typography) */}
      <header className="w-full max-w-2xl mx-auto flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPause();
          }}
          aria-label="Pause game"
          className="pointer-events-auto w-11 h-11 rounded-xl bg-[#0B1224]/85 border border-slate-700/50 text-slate-200 hover:text-white hover:border-slate-500/70 active:scale-95 transition-transform flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-sky-400"
        >
          <Pause className="w-4 h-4" />
        </button>

        {/* Center Level & Star Readout */}
        <div className="flex flex-col items-center text-center min-w-0 pt-0.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono-num font-semibold text-sky-300">
              {String(level.id).padStart(2, '0')} / 50
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-display font-semibold text-slate-100 truncate max-w-[130px] sm:max-w-[240px]">
              {level.name}
            </span>
          </div>

          {/* Crisp SVG Star Slots */}
          <div
            className="flex items-center gap-1.5 mt-1.5"
            aria-label={`${hud.starsCollected} of ${hud.totalStars} stars collected`}
          >
            {Array.from({ length: hud.totalStars }).map((_, idx) => {
              const collected = idx < hud.starsCollected;
              return (
                <svg
                  key={idx}
                  viewBox="0 0 20 20"
                  className={`w-4 h-4 transition-transform duration-200 ${
                    collected ? 'scale-110 text-amber-300' : 'scale-100 text-slate-600/80'
                  }`}
                >
                  <path
                    fill="currentColor"
                    d="M10 1.5l2.1 5.9 6.2.4-4.8 3.9 1.6 6.1L10 14.3l-5.1 3.5 1.6-6.1-4.8-3.9 6.2-.4L10 1.5z"
                  />
                </svg>
              );
            })}
          </div>
        </div>

        {/* Right Audio Controls: Music toggle beside Sound toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
            }}
            aria-label={musicMuted ? 'Enable music' : 'Mute music'}
            aria-pressed={!musicMuted}
            className="pointer-events-auto relative w-11 h-11 rounded-xl bg-[#0B1224]/85 border border-slate-700/50 text-slate-200 hover:text-white hover:border-slate-500/70 active:scale-95 transition-transform flex items-center justify-center focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <Music className={`w-4 h-4 ${musicMuted ? 'text-rose-400/90 opacity-65' : 'text-sky-300'}`} />
            {musicMuted && (
              <span
                aria-hidden="true"
                className="absolute w-5 h-[1.8px] bg-rose-400 -rotate-45 rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={!muted}
            className="pointer-events-auto w-11 h-11 rounded-xl bg-[#0B1224]/85 border border-slate-700/50 text-slate-200 hover:text-white hover:border-slate-500/70 active:scale-95 transition-transform flex items-center justify-center focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Bottom Quiet Flight State Readout */}
      <footer className="w-full max-w-xl mx-auto flex flex-col items-center gap-1.5 pb-1">
        <div className="text-xs tracking-wide text-center">
          {hud.portalActive ? (
            <span className="font-medium text-emerald-300">
              Wormhole open on {hud.portalOrbit === 0 ? 'Inner' : 'Outer'} ring
            </span>
          ) : level.id === 1 && hud.shiftCount === 0 ? (
            <span className="text-amber-200/90">
              Tap anywhere to shift between fast inner and slow outer rings
            </span>
          ) : (
            <span className="text-slate-300/85">
              Collect {remaining} {remaining === 1 ? 'star' : 'stars'} to open wormhole
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2.5 text-[11px] sm:text-xs font-mono-num">
          <span className={isInner ? 'text-amber-300 font-semibold' : 'text-sky-300 font-semibold'}>
            {isInner ? 'INNER · FAST' : 'OUTER · SLOW'}
          </span>

          {hud.inGravityWell && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className={hud.gravityMode === 'boost' ? 'text-violet-300 font-semibold' : 'text-sky-200 font-semibold'}>
                {hud.gravityMode === 'boost' ? 'GRAVITY SLINGSHOT' : 'GRAVITY DRAG'}
              </span>
            </>
          )}

          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">Shifts {hud.shiftCount}</span>
        </div>
      </footer>
    </div>
  );
};
