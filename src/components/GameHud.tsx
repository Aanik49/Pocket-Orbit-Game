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
    <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none px-3.5 py-3.5 sm:px-6 sm:py-5">
      {/* TOP COSMIC GLOSSY HUD (Matches Gameplay Reference Mockup) */}
      <header className="w-full max-w-2xl mx-auto flex items-start justify-between gap-2">
        {/* Left: Solid Coral-Red Circular Pause Button with Cyan Rim */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPause();
          }}
          aria-label="Pause game"
          className="pointer-events-auto relative w-11 h-11 rounded-full bg-[#FF5224] border-2 border-[#66E5FF] shadow-[0_3px_0_#B82A08,0_4px_10px_rgba(5,8,34,0.5)] text-white active:scale-95 hover:bg-[#FF643B] transition-all flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-[#FFD426]"
        >
          <Pause className="w-5 h-5 fill-current" />
        </button>

        {/* Center: Solid Deep Indigo Level & Star Pill with Gold Rim */}
        <div className="flex flex-col items-center gap-1.5 min-w-0">
          <div className="rounded-2xl px-3.5 py-1.5 bg-[#121B6B]/92 border-2 border-[#FFD94A] shadow-[0_4px_12px_rgba(4,8,36,0.5)] flex flex-col items-center text-center min-w-0">
            <div className="flex items-baseline gap-1 text-xs sm:text-sm leading-none whitespace-nowrap">
              <span className="font-display font-bold text-white">level</span>
              <span className="font-mono-num font-bold text-[#FFD426]">
                {String(level.id).padStart(2, '0')}
              </span>
              <span aria-hidden="true" className="text-white/80 mx-0.5">-</span>
              <span className="font-display font-bold text-[#FFBE3B] truncate max-w-[115px] sm:max-w-[180px]">
                {level.name}
              </span>
            </div>

            {/* Golden Star Slots + Optional Countdown Timer */}
            <div className="flex items-center gap-2 mt-1">
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
                        collected
                          ? 'scale-110 text-[#FFD93B]'
                          : 'scale-100 text-[#2E3878]'
                      }`}
                    >
                      <path
                        fill="currentColor"
                        stroke={collected ? '#FF8800' : '#5869B8'}
                        strokeWidth="1.2"
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
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono-num font-bold border ${
                    hud.timerDisabled
                      ? 'bg-[#3C2282] border-[#B682FF] text-[#E6CEFF]'
                      : isLowTime
                        ? 'bg-[#D92811] border-[#FFB273] text-white animate-pulse'
                        : 'bg-[#101C6B] border-[#42B8FF] text-[#8CEEFF]'
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

          {/* Active Power-Up / Craft Status Chips */}
          {(hud.shieldActive || activeSat.outerImmune) && (
            <div className="flex items-center gap-1.5">
              {hud.shieldActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1668E8] border border-[#8CEEFF] text-white text-[10px] font-display font-bold">
                  <Shield className="w-3 h-3 text-[#FFE45E]" />
                  SHIELD ACTIVE
                </span>
              )}
              {activeSat.outerImmune && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFC414] border border-[#FFF4A3] text-[#4A1C00] text-[10px] font-display font-bold">
                  HEAVY · OUTER GUARD
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Solid Royal-Blue Circular Music & Sound Buttons with Cyan Rims */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
            }}
            aria-label={musicMuted ? 'Enable music' : 'Mute music'}
            aria-pressed={!musicMuted}
            className="pointer-events-auto relative w-11 h-11 rounded-full bg-[#1668E8] border-2 border-[#7CEBFF] shadow-[0_3px_0_#0A3C9E,0_4px_10px_rgba(5,8,34,0.5)] active:scale-95 hover:bg-[#2376F5] transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#FFD426]"
          >
            <Music
              className={`w-5 h-5 text-white ${musicMuted ? 'opacity-60' : 'opacity-100'}`}
            />
            {musicMuted && (
              <span
                aria-hidden="true"
                className="absolute w-6 h-[2.5px] bg-[#FF5224] border border-white -rotate-45 rounded-full"
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
            className="pointer-events-auto w-11 h-11 rounded-full bg-[#1668E8] border-2 border-[#7CEBFF] shadow-[0_3px_0_#0A3C9E,0_4px_10px_rgba(5,8,34,0.5)] active:scale-95 hover:bg-[#2376F5] transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#FFD426]"
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-[#FFE0D6]" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </header>

      {/* BOTTOM TUTORIAL CARD (Levels 1 & 2) + CRISP COSMIC FLIGHT READOUT */}
      <footer className="w-full max-w-xl mx-auto flex flex-col items-center gap-1.5 pb-1">
        {level.id === 1 && (
          <div
            aria-live="polite"
            className="cosmic-glass-card px-4 py-2 rounded-2xl text-center max-w-[310px] sm:max-w-sm transition-opacity duration-200"
          >
            {hud.portalActive ? (
              <>
                <p className="text-xs font-display font-bold text-[#6CFFBA]">
                  Portal open on the {hud.portalOrbit === 0 ? 'inner' : 'outer'} ring
                </p>
                <p className="text-[11px] font-semibold text-[#C8E4FF] mt-0.5">
                  Tap to align your orbit and glide right through
                </p>
              </>
            ) : hud.shiftCount === 0 ? (
              <>
                <p className="text-xs font-display font-bold text-white">
                  Tap anywhere to shift between orbits
                </p>
                <p className="text-[11px] font-semibold text-[#7CE7FF] mt-0.5">
                  Inner ring moves fast · Outer ring moves slow
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-display font-bold text-[#FFD426]">
                  Collect all {hud.totalStars} stars to open the portal
                </p>
                <p className="text-[11px] font-semibold text-[#C8E4FF] mt-0.5">
                  Dodge space hazards by shifting lanes early
                </p>
              </>
            )}
          </div>
        )}

        {level.id === 2 && (
          <div
            aria-live="polite"
            className="cosmic-glass-card px-4 py-2 rounded-2xl text-center max-w-[310px] sm:max-w-sm transition-opacity duration-200"
          >
            {hud.portalActive ? (
              <p className="text-xs font-display font-bold text-[#6CFFBA]">
                Portal open — shift to the {hud.portalOrbit === 0 ? 'inner' : 'outer'} ring
              </p>
            ) : hud.shiftCount === 0 ? (
              <>
                <p className="text-xs font-display font-bold text-white">
                  Time your tap before reaching obstacles
                </p>
                <p className="text-[11px] font-semibold text-[#7CE7FF] mt-0.5">
                  Use the inner ring to speed up or outer ring to wait
                </p>
              </>
            ) : (
              <p className="text-xs font-display font-bold text-[#FFD426]">
                Fewer orbit shifts earn up to 3 mastery stars
              </p>
            )}
          </div>
        )}

        {level.id > 2 && (
          <div className="text-sm sm:text-base tracking-wide text-center font-display font-bold drop-shadow-[0_2px_4px_rgba(4,8,34,0.95)]">
            {hud.portalActive ? (
              <span className="text-[#6CFFBA]">
                Portal open on {hud.portalOrbit === 0 ? 'Inner' : 'Outer'} ring
              </span>
            ) : (
              <span className="text-white">
                Collect {remaining} {remaining === 1 ? 'star' : 'stars'} to open portal
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-display font-bold drop-shadow-[0_2px_4px_rgba(4,8,34,0.95)]">
          <span className={isInner ? 'text-[#FFD426]' : 'text-[#66E5FF]'}>
            {isInner ? 'INNER · FAST' : 'OUTER · SLOW'}
          </span>

          {hud.inGravityWell && (
            <>
              <span aria-hidden="true" className="text-white/60">-</span>
              <span
                className={
                  hud.gravityMode === 'boost' ? 'text-[#F09EFF]' : 'text-[#7CEBFF]'
                }
              >
                {hud.gravityMode === 'boost' ? 'GRAVITY SLINGSHOT' : 'GRAVITY DRAG'}
              </span>
            </>
          )}

          <span aria-hidden="true" className="text-white/75">-</span>
          <span className="text-white font-mono-num">Shifts {hud.shiftCount}</span>
        </div>
      </footer>
    </div>
  );
};
