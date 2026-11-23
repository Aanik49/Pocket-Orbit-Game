import React from 'react';
import { Pause, Volume2, VolumeX, Music, Clock, Shield } from 'lucide-react';
import { getSatelliteById } from '../game/satellites';
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
  const activeSat = getSatelliteById(hud.satelliteId);
  const isLowTime = hud.timeRemaining !== null && hud.timeRemaining <= 5;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none px-4 py-4 sm:px-7 sm:py-6">
      {/* Top Paper-Cutout Perimeter HUD */}
      <header className="w-full max-w-2xl mx-auto flex items-start justify-between gap-2">
        {/* Left: Cream paper circular Pause button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPause();
          }}
          aria-label="Pause game"
          className="pointer-events-auto w-11 h-11 rounded-full bg-[#F5EFE2] hover:bg-[#FAF6EC] text-[#C75C3B] paper-tag-shadow active:scale-95 transition-transform flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-[#F3C24F]"
        >
          <Pause className="w-5 h-5 fill-current" />
        </button>

        {/* Center: Cream paper hand-cut Level, Star & Timer Tag */}
        <div className="flex flex-col items-center gap-1.5 min-w-0">
          <div className="bg-[#F5EFE2] paper-tag-shadow rounded-2xl px-4 py-2 flex flex-col items-center text-center min-w-0">
            <div className="flex items-baseline gap-1.5 text-sm sm:text-base leading-none">
              <span className="font-display font-semibold text-[#27324F]">level</span>
              <span className="font-mono-num font-bold text-[#C75C3B]">
                {String(level.id).padStart(2, '0')}
              </span>
              <span aria-hidden="true" className="text-[#B8AB96] text-xs mx-0.5">·</span>
              <span className="font-display font-semibold text-[#27324F] text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[170px]">
                {level.name}
              </span>
            </div>

            {/* Crisp Gold-Foil Star Slots + Optional Countdown Timer */}
            <div className="flex items-center gap-2.5 mt-1.5">
              <div
                className="flex items-center gap-1"
                aria-label={`${hud.starsCollected} of ${hud.totalStars} stars collected`}
              >
                {Array.from({ length: hud.totalStars }).map((_, idx) => {
                  const collected = idx < hud.starsCollected;
                  return (
                    <svg
                      key={idx}
                      viewBox="0 0 20 20"
                      className={`w-4 h-4 transition-transform duration-200 ${
                        collected ? 'scale-110 text-[#F3C24F]' : 'scale-100 text-[#D4C9B6]'
                      }`}
                    >
                      <path
                        fill="currentColor"
                        stroke={collected ? '#B67D1B' : 'none'}
                        strokeWidth="0.8"
                        d="M10 1.5l2.1 5.9 6.2.4-4.8 3.9 1.6 6.1L10 14.3l-5.1 3.5 1.6-6.1-4.8-3.9 6.2-.4L10 1.5z"
                      />
                    </svg>
                  );
                })}
              </div>

              {hud.timeLimit !== null && (
                <div
                  aria-label={
                    hud.timerDisabled
                      ? 'Timer stopped by Nano Stopper'
                      : `${Math.ceil(hud.timeRemaining ?? 0)} seconds remaining`
                  }
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono-num font-bold ${
                    hud.timerDisabled
                      ? 'bg-[#E9E0F7] text-[#66469A]'
                      : isLowTime
                        ? 'bg-[#C75C3B] text-[#FAF3E6]'
                        : 'bg-[#E8DEC9] text-[#27324F]'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {hud.timerDisabled
                      ? 'OFF'
                      : `${Math.max(0, hud.timeRemaining ?? 0).toFixed(1)}s`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Active Power-Up / Craft Status Strip (Shield or Heavy outer guard) */}
          {(hud.shieldActive || activeSat.outerImmune) && (
            <div className="flex items-center gap-1.5">
              {hud.shieldActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4D78A8] text-[#FAF3E6] text-[10px] font-display font-bold paper-tag-shadow">
                  <Shield className="w-3 h-3 text-[#A9DAF3]" />
                  SHIELD ACTIVE
                </span>
              )}
              {activeSat.outerImmune && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3C24F] text-[#27324F] text-[10px] font-display font-bold paper-tag-shadow">
                  HEAVY · OUTER GUARD
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Cream paper circular Music & Sound toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
            }}
            aria-label={musicMuted ? 'Enable music' : 'Mute music'}
            aria-pressed={!musicMuted}
            className="pointer-events-auto relative w-11 h-11 rounded-full bg-[#F5EFE2] hover:bg-[#FAF6EC] paper-tag-shadow active:scale-95 transition-transform flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#F3C24F]"
          >
            <Music
              className={`w-4 h-4 ${
                musicMuted ? 'text-[#C75C3B] opacity-70' : 'text-[#27324F]'
              }`}
            />
            {musicMuted && (
              <span
                aria-hidden="true"
                className="absolute w-5 h-[2px] bg-[#C75C3B] -rotate-45 rounded-full"
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
            className="pointer-events-auto w-11 h-11 rounded-full bg-[#F5EFE2] hover:bg-[#FAF6EC] paper-tag-shadow active:scale-95 transition-transform flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#F3C24F]"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-[#C75C3B]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#27324F]" />
            )}
          </button>
        </div>
      </header>

      {/* Bottom Quiet Tutorial Prompt (Levels 1 & 2) + Flight State Readout */}
      <footer className="w-full max-w-xl mx-auto flex flex-col items-center gap-2 pb-1">
        {level.id === 1 && (
          <div
            aria-live="polite"
            className="px-4 py-2 rounded-2xl bg-[#F5EFE2]/95 border border-dashed border-[#B5A389] paper-tag-shadow text-center max-w-[300px] sm:max-w-sm transition-opacity duration-200"
          >
            {hud.portalActive ? (
              <>
                <p className="text-xs font-display font-bold text-[#3D7A52]">
                  Portal open on the {hud.portalOrbit === 0 ? 'inner' : 'outer'} ring
                </p>
                <p className="text-[11px] font-semibold text-[#5E5447] mt-0.5">
                  Tap to align your orbit and glide right through
                </p>
              </>
            ) : hud.shiftCount === 0 ? (
              <>
                <p className="text-xs font-display font-bold text-[#27324F]">
                  Tap anywhere to shift between orbits
                </p>
                <p className="text-[11px] font-semibold text-[#5E5447] mt-0.5">
                  Inner ring moves fast · Outer ring moves slow
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-display font-bold text-[#27324F]">
                  Collect all {hud.totalStars} stars to open the portal
                </p>
                <p className="text-[11px] font-semibold text-[#5E5447] mt-0.5">
                  Dodge crumpled rocks by shifting lanes early
                </p>
              </>
            )}
          </div>
        )}

        {level.id === 2 && (
          <div
            aria-live="polite"
            className="px-4 py-2 rounded-2xl bg-[#F5EFE2]/95 border border-dashed border-[#B5A389] paper-tag-shadow text-center max-w-[300px] sm:max-w-sm transition-opacity duration-200"
          >
            {hud.portalActive ? (
              <p className="text-xs font-display font-bold text-[#3D7A52]">
                Portal open — shift to the {hud.portalOrbit === 0 ? 'inner' : 'outer'} ring
              </p>
            ) : hud.shiftCount === 0 ? (
              <>
                <p className="text-xs font-display font-bold text-[#27324F]">
                  Time your tap before reaching obstacles
                </p>
                <p className="text-[11px] font-semibold text-[#5E5447] mt-0.5">
                  Use the inner ring to speed up or outer ring to wait
                </p>
              </>
            ) : (
              <p className="text-xs font-display font-semibold text-[#27324F]">
                Fewer orbit shifts earn up to 3 mastery stars
              </p>
            )}
          </div>
        )}

        {level.id > 2 && (
          <div className="text-xs tracking-wide text-center font-semibold">
            {hud.portalActive ? (
              <span className="text-[#F3C24F]">
                Portal open on {hud.portalOrbit === 0 ? 'Inner' : 'Outer'} ring
              </span>
            ) : (
              <span className="text-[#E6DAC4]/90">
                Collect {remaining} {remaining === 1 ? 'star' : 'stars'} to open portal
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2.5 text-[11px] sm:text-xs font-mono-num">
          <span className={isInner ? 'text-[#F3C24F] font-bold' : 'text-[#A8C8DF] font-bold'}>
            {isInner ? 'INNER · FAST' : 'OUTER · SLOW'}
          </span>

          {hud.inGravityWell && (
            <>
              <span aria-hidden="true" className="text-[#8B879E]">·</span>
              <span
                className={
                  hud.gravityMode === 'boost'
                    ? 'text-[#E5C6F5] font-bold'
                    : 'text-[#B5D6EB] font-bold'
                }
              >
                {hud.gravityMode === 'boost' ? 'GRAVITY SLINGSHOT' : 'GRAVITY DRAG'}
              </span>
            </>
          )}

          <span aria-hidden="true" className="text-[#8B879E]">·</span>
          <span className="text-[#D4C9B6]">Shifts {hud.shiftCount}</span>
        </div>
      </footer>
    </div>
  );
};
