import React from 'react';
import {
  Pause,
  Volume2,
  VolumeX,
  Music,
  Clock,
  Shield,
  Flame,
  Crown,
  RotateCcw,
} from 'lucide-react';
import { getSatelliteById } from '../game/satellites';
import { HudSnapshot, LevelConfig } from '../types';
import { ChronoPulseIcon, StarMagnetIcon } from './PaperCraftIcons';

interface GameHudProps {
  level: LevelConfig;
  hud: HudSnapshot;
  muted: boolean;
  musicMuted: boolean;
  chronoOwned: number;
  magnetOwned: number;
  chronoArmed: boolean;
  magnetArmed: boolean;
  onActivateChrono: () => void;
  onActivateMagnet: () => void;
  onPause: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  level,
  hud,
  muted,
  musicMuted,
  chronoOwned,
  magnetOwned,
  chronoArmed,
  magnetArmed,
  onActivateChrono,
  onActivateMagnet,
  onPause,
  onToggleMute,
  onToggleMusic,
}) => {
  const remaining = Math.max(0, hud.totalStars - hud.starsCollected);
  const isInner = hud.targetOrbit === 0;
  const activeSat = getSatelliteById(hud.satelliteId);
  const isLowTime = hud.timeRemaining !== null && hud.timeRemaining <= 5;

  const showChronoBtn = chronoArmed && (chronoOwned > 0 || hud.chronoRemaining > 0);
  const showMagnetBtn = magnetArmed && (magnetOwned > 0 || hud.magnetRemaining > 0);

  return (
    <div className="safe-hud-pad absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
      {/* TOP COSMIC GLOSSY HUD */}
      <header className="w-full max-w-2xl mx-auto flex items-start justify-between gap-2">
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

        {/* Center Level & Star Readout */}
        <div className="flex flex-col items-center gap-1.5 min-w-0">
          <div
            className={`rounded-2xl px-3.5 py-1.5 border-2 shadow-[0_4px_12px_rgba(4,8,36,0.5)] flex flex-col items-center text-center min-w-0 ${
              level.boss
                ? 'bg-[#330F3A]/94 border-[#FF7842]'
                : 'bg-[#121B6B]/92 border-[#FFD94A]'
            }`}
          >
            <div className="flex items-baseline gap-1 text-xs sm:text-sm leading-none whitespace-nowrap">
              {level.boss && (
                <Crown className="w-3.5 h-3.5 text-[#FFD426] self-center mr-0.5 shrink-0" />
              )}
              <span className="font-display font-bold text-white">
                {level.boss ? 'boss' : 'level'}
              </span>
              <span className="font-mono-num font-bold text-[#FFD426]">
                {String(level.id).padStart(2, '0')}
              </span>
              <span aria-hidden="true" className="text-white/80 mx-0.5">
                -
              </span>
              <span className="font-display font-bold text-[#FFBE3B] truncate max-w-[115px] sm:max-w-[180px]">
                {level.boss ? level.boss.title : level.name}
              </span>
            </div>

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
                        collected ? 'scale-110 text-[#FFD93B]' : 'scale-100 text-[#2E3878]'
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

              {hud.bossTotalPhases > 0 && (
                <span className="font-mono-num text-[10px] font-extrabold text-[#FFB878]">
                  P{hud.bossPhase}/{hud.bossTotalPhases}
                </span>
              )}

              {hud.timeLimit !== null && (
                <div
                  aria-label={
                    hud.timerDisabled
                      ? 'Timer stopped by Nano Stopper'
                      : `${Math.ceil(hud.timeRemaining ?? 0)} seconds remaining`
                  }
                  className={`inline-flex items-center gap-1 text-[11px] font-mono-num font-bold ${
                    hud.timerDisabled
                      ? 'text-[#D6B4FF]'
                      : isLowTime
                        ? 'text-[#FF785A] animate-pulse'
                        : 'text-[#8CEEFF]'
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

          {/* Crisp Dynamic Alerts: Boss Phase / Solar Flare Warning / Active Effects */}
          {hud.bossAlert && (
            <div className="px-3 py-1 rounded-xl bg-[#4A123C]/92 border border-[#FF9457] text-[#FFE89C] text-[11px] font-display font-extrabold tracking-wide shadow-md">
              {hud.bossAlert}
            </div>
          )}

          {(hud.flareWarningLane !== null || hud.flareActiveLane !== null) && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-xl text-[11px] font-display font-extrabold border ${
                hud.flareActiveLane !== null
                  ? 'bg-[#B8200E]/92 border-[#FFE078] text-white'
                  : 'bg-[#7A3508]/92 border-[#FFC44D] text-[#FFE89C]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#FFD43B]" />
              <span>
                {hud.flareActiveLane !== null
                  ? `FLARE ACTIVE · ${hud.flareActiveLane === 0 ? 'INNER' : 'OUTER'} LANE`
                  : `SOLAR FLARE · SHIFT TO ${hud.flareWarningLane === 0 ? 'OUTER' : 'INNER'}`}
              </span>
            </div>
          )}

          {/* Clean unboxed active status metadata */}
          {(hud.shieldActive ||
            activeSat.outerImmune ||
            hud.phaseInvulnActive ||
            hud.orbitReversed) && (
            <div className="flex items-center gap-2 text-[10px] font-display font-bold text-[#DCEEFF] drop-shadow-[0_1px_2px_rgba(4,8,34,0.95)]">
              {hud.shieldActive && (
                <span className="inline-flex items-center gap-1 text-[#7CEBFF]">
                  <Shield className="w-3 h-3 text-[#FFE45E]" />
                  Shield
                </span>
              )}
              {activeSat.outerImmune && <span className="text-[#FFE45E]">Outer Guard</span>}
              {hud.phaseInvulnActive && <span className="text-[#E0A8FF]">Phase Invuln</span>}
              {hud.orbitReversed && (
                <span className="inline-flex items-center gap-0.5 text-[#FFB0F8]">
                  <RotateCcw className="w-3 h-3" />
                  Reversed
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Music & Sound Buttons */}
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
            <Music className={`w-5 h-5 text-white ${musicMuted ? 'opacity-60' : 'opacity-100'}`} />
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

      {/* BOTTOM REGION: IN-RUN BOOSTER TRIGGERS + TUTORIAL / FLIGHT READOUT */}
      <footer className="w-full max-w-xl mx-auto flex flex-col items-center gap-2 pb-1">
        {/* In-Run Consumable Booster Buttons (Chrono Pulse & Star Magnet) */}
        {(showChronoBtn || showMagnetBtn) && (
          <div className="w-full flex items-center justify-between gap-3 px-1">
            <div>
              {showChronoBtn && (
                <button
                  type="button"
                  disabled={hud.chronoUsed || hud.chronoRemaining > 0}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivateChrono();
                  }}
                  aria-label="Activate Slow-Mo Chrono Pulse"
                  className={`pointer-events-auto h-11 pl-2 pr-3 rounded-2xl border-2 flex items-center gap-2 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-[#FFD426] ${
                    hud.chronoRemaining > 0
                      ? 'bg-[#1264E8] border-[#66F4FF] shadow-[0_0_16px_rgba(72,232,255,0.55)]'
                      : hud.chronoUsed
                        ? 'bg-[#141A4E]/70 border-[#3D4F9E]/60 opacity-50 cursor-not-allowed'
                        : 'bg-[#10287A]/92 border-[#6CE5FF] hover:bg-[#1942B8] shadow-[0_3px_0_#071754]'
                  }`}
                >
                  <ChronoPulseIcon className="w-7 h-7" />
                  <div className="text-left leading-tight">
                    <div className="font-display font-extrabold text-[11px] text-white whitespace-nowrap">
                      {hud.chronoRemaining > 0
                        ? `${hud.chronoRemaining.toFixed(1)}s`
                        : 'Slow-Mo'}
                    </div>
                    <div className="font-mono-num text-[9px] font-bold text-[#8CEEFF]">
                      {hud.chronoRemaining > 0
                        ? 'ACTIVE'
                        : hud.chronoUsed
                          ? 'USED'
                          : `x${chronoOwned} · Q`}
                    </div>
                  </div>
                </button>
              )}
            </div>

            <div>
              {showMagnetBtn && (
                <button
                  type="button"
                  disabled={hud.magnetUsed || hud.magnetRemaining > 0}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivateMagnet();
                  }}
                  aria-label="Activate Star Magnet"
                  className={`pointer-events-auto h-11 pl-2 pr-3 rounded-2xl border-2 flex items-center gap-2 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-[#FFD426] ${
                    hud.magnetRemaining > 0
                      ? 'bg-[#7A20A8] border-[#FF8AF7] shadow-[0_0_16px_rgba(255,123,242,0.55)]'
                      : hud.magnetUsed
                        ? 'bg-[#141A4E]/70 border-[#3D4F9E]/60 opacity-50 cursor-not-allowed'
                        : 'bg-[#3A1468]/92 border-[#FF8AF7] hover:bg-[#5B1FA0] shadow-[0_3px_0_#24084A]'
                  }`}
                >
                  <StarMagnetIcon className="w-7 h-7" />
                  <div className="text-left leading-tight">
                    <div className="font-display font-extrabold text-[11px] text-white whitespace-nowrap">
                      {hud.magnetRemaining > 0
                        ? `${hud.magnetRemaining.toFixed(1)}s`
                        : 'Magnet'}
                    </div>
                    <div className="font-mono-num text-[9px] font-bold text-[#FFC0FA]">
                      {hud.magnetRemaining > 0
                        ? 'ACTIVE'
                        : hud.magnetUsed
                          ? 'USED'
                          : `x${magnetOwned} · E`}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

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
              <span aria-hidden="true" className="text-white/60">
                ·
              </span>
              <span className={hud.gravityMode === 'boost' ? 'text-[#F09EFF]' : 'text-[#7CEBFF]'}>
                {hud.gravityMode === 'boost' ? 'GRAVITY SLINGSHOT' : 'GRAVITY DRAG'}
              </span>
            </>
          )}

          <span aria-hidden="true" className="text-white/75">
            ·
          </span>
          <span className="text-white font-mono-num">Shifts {hud.shiftCount}</span>
        </div>
      </footer>
    </div>
  );
};
