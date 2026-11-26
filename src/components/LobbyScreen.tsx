import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/useInstallPrompt';
import { LevelRecord } from '../types';

interface LobbyScreenProps {
  isVisible: boolean;
  lobbyStars: number;
  lobbyRockets: number;
  currentLevelId: number;
  records: Record<number, LevelRecord>;
  muted: boolean;
  musicMuted: boolean;
  dailyLoginClaimable: boolean;
  dailyMissionClaimable: boolean;
  onPlayCurrent: () => void;
  onOpenSectorAtlas: (chapterId: number) => void;
  onOpenDailyLogin: () => void;
  onOpenDailyMission: () => void;
  onOpenEquipments: () => void;
  onOpenSpaceStation: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  isVisible,
  lobbyStars,
  lobbyRockets,
  currentLevelId,
  muted,
  musicMuted,
  dailyLoginClaimable,
  dailyMissionClaimable,
  onPlayCurrent,
  onOpenSectorAtlas,
  onOpenDailyLogin,
  onOpenDailyMission,
  onOpenEquipments,
  onOpenSpaceStation,
  onToggleMute,
  onToggleMusic,
}) => {
  const { canInstall, install } = usePWAInstall();
  const currentChapterId = Math.min(6, Math.max(1, Math.ceil(currentLevelId / 10)));

  return (
    <section
      aria-label="Pocket Orbit Space Launchpad Lobby"
      aria-hidden={!isVisible}
      className={`absolute inset-0 z-20 flex flex-col justify-between overflow-hidden bg-[#080C38] transition-opacity duration-200 ease-out ${
        isVisible ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}
    >
      {/* FULL-BLEED COSMIC LAUNCHPAD BACKDROP FROM ASSET SHEET */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img
          src="./assets/cosmic/lobby-bg.png"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          draggable={false}
          className="w-full h-full object-cover object-bottom"
        />
        {/* Subtle radial edge vignette so wide screens blend cleanly */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,8,34,0.42)_100%)]"
        />
      </div>

      {/* 1. TOP BAR: Stars & Rockets Glossy Pills (Left) · Music & Sound Glossy Buttons (Right) */}
      <header className="safe-lobby-top relative z-30 w-full max-w-[540px] mx-auto flex items-center justify-between gap-2 shrink-0">
        {/* Left: Glossy Star & Rocket Currency Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Stars Pill */}
          <div
            aria-label={`${lobbyStars} Stars`}
            className="relative h-10 sm:h-11 w-[108px] sm:w-[126px] shrink-0 select-none"
          >
            <img
              src="./assets/cosmic/pill-star.png"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(4,8,36,0.55)]"
            />
            <span className="absolute inset-y-0 left-[38%] right-[12%] flex items-center justify-center font-display font-bold text-sm sm:text-base text-white tabular-nums leading-none drop-shadow-[0_1.5px_2px_rgba(4,8,36,0.9)]">
              {lobbyStars.toLocaleString()}
            </span>
          </div>

          {/* Rockets Pill */}
          <div
            aria-label={`${lobbyRockets} Rockets`}
            className="relative h-10 sm:h-11 w-[104px] sm:w-[122px] shrink-0 select-none"
          >
            <img
              src="./assets/cosmic/pill-rocket.png"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(4,8,36,0.55)]"
            />
            <span className="absolute inset-y-0 left-[40%] right-[12%] flex items-center justify-center font-display font-bold text-sm sm:text-base text-white tabular-nums leading-none drop-shadow-[0_1.5px_2px_rgba(4,8,36,0.9)]">
              {lobbyRockets.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Glossy Blue Music & Sound Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {canInstall && (
            <button
              type="button"
              onClick={() => void install()}
              aria-label="Install Pocket Orbit"
              className="glossy-btn-gold h-9 px-3 rounded-full flex items-center gap-1 text-xs font-display font-bold whitespace-nowrap transition-transform focus-visible:outline-2 focus-visible:outline-[#38E8FF]"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Music Button */}
          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={musicMuted ? 'Enable music' : 'Mute music'}
            aria-pressed={!musicMuted}
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#38E8FF]"
          >
            <img
              src="./assets/cosmic/btn-music.png"
              alt="Music"
              referrerPolicy="no-referrer"
              draggable={false}
              className={`w-full h-full object-contain select-none drop-shadow-[0_4px_8px_rgba(4,8,36,0.6)] transition-opacity ${
                musicMuted ? 'opacity-60 saturate-50' : 'opacity-100'
              }`}
            />
            {musicMuted && (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <span className="w-7 h-[3px] bg-[#FF5224] border border-white -rotate-45 rounded-full shadow-md" />
              </span>
            )}
          </button>

          {/* Sound Button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={!muted}
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#38E8FF]"
          >
            <img
              src="./assets/cosmic/btn-sound.png"
              alt="Sound"
              referrerPolicy="no-referrer"
              draggable={false}
              className={`w-full h-full object-contain select-none drop-shadow-[0_4px_8px_rgba(4,8,36,0.6)] transition-opacity ${
                muted ? 'opacity-60 saturate-50' : 'opacity-100'
              }`}
            />
            {muted && (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <span className="w-7 h-[3px] bg-[#FF5224] border border-white -rotate-45 rounded-full shadow-md" />
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. UPPER CENTER: GLOSSY 3D RAINBOW-RINGED POCKET ORBIT LOGO */}
      <div className="relative z-20 w-full flex justify-center px-6 mt-1 sm:mt-2 shrink-0 select-none pointer-events-none">
        <img
          src="./assets/cosmic/logo.png"
          alt="Pocket Orbit"
          referrerPolicy="no-referrer"
          draggable={false}
          className="w-[245px] sm:w-[300px] md:w-[330px] max-w-[74vw] max-h-[16vh] h-auto object-contain drop-shadow-[0_8px_22px_rgba(32,124,255,0.48)]"
        />
      </div>

      {/* 3. CENTER LAUNCHPAD ROCKET HERO + GLOWING ORBIT RING + BILLOWING STEAM */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center min-h-0 px-4 select-none pointer-events-none">
        <div className="relative flex items-center justify-center w-[210px] sm:w-[250px] h-full max-h-[270px] sm:max-h-[320px]">
          {/* Glowing golden orbital ring encircling the rocket's thruster */}
          <svg
            viewBox="0 0 260 120"
            className="absolute w-[112%] h-auto bottom-[26%] opacity-90 drop-shadow-[0_0_12px_rgba(255,204,48,0.85)]"
            aria-hidden="true"
          >
            <ellipse
              cx="130"
              cy="60"
              rx="112"
              ry="28"
              fill="none"
              stroke="#FFD84D"
              strokeWidth="2.8"
            />
            <ellipse
              cx="130"
              cy="60"
              rx="112"
              ry="28"
              fill="none"
              stroke="#FFF7C2"
              strokeWidth="1.2"
              opacity="0.8"
            />
          </svg>

          {/* Soft luminous launchpad blast glow & steam clouds */}
          <div
            aria-hidden="true"
            className="absolute bottom-[4%] w-[180px] sm:w-[220px] h-[54px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,244,196,0.92)_0%,rgba(216,196,255,0.58)_45%,rgba(122,94,255,0)_76%)] blur-[3px]"
          />

          {/* Hovering Cartoon Rocket with Roaring Flame */}
          <img
            src="./assets/cosmic/rocket.png"
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="sync"
            draggable={false}
            className={`${
              isVisible ? 'animate-rocket-hover' : ''
            } relative z-10 h-[84%] max-h-[245px] sm:max-h-[290px] w-auto object-contain drop-shadow-[0_12px_22px_rgba(255,152,20,0.45)]`}
          />
        </div>
      </div>

      {/* 4. LOWER CENTER: JUICY GOLDEN PLAY >> BUTTON + 5-BUTTON GLOSSY ROYAL-BLUE DOCK */}
      <footer className="safe-lobby-bottom relative z-30 w-full max-w-[520px] mx-auto flex flex-col items-center gap-2.5 sm:gap-4 shrink-0">
        {/* PLAY >> Button sitting prominently over the launchpad */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onPlayCurrent}
            aria-label="Play Pocket Orbit"
            className="relative w-[200px] sm:w-[238px] transition-transform hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-[#38E8FF] rounded-full"
          >
            <img
              src="./assets/cosmic/btn-play.png"
              alt="PLAY"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-auto object-contain select-none drop-shadow-[0_10px_22px_rgba(255,136,0,0.5)]"
            />
          </button>

          <p className="text-[11px] sm:text-xs font-bold text-[#B8D8FF] tracking-wide text-center drop-shadow-[0_1px_3px_rgba(4,8,34,0.95)]">
            Tap Anywhere to shift orbit.
          </p>
        </div>

        {/* 5 Glossy Blue Bottom Dock Buttons: Sectors · Daily Login · Daily Mission · Equipments · Space Station */}
        <nav
          aria-label="Lobby Navigation"
          className="w-full grid grid-cols-5 gap-1.5 sm:gap-2.5 items-end"
        >
          {/* 1. Sectors */}
          <button
            type="button"
            onClick={() => onOpenSectorAtlas(currentChapterId)}
            aria-label="Sectors"
            className="group relative flex items-center justify-center transition-transform hover:-translate-y-1 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#38E8FF] rounded-2xl"
          >
            <img
              src="./assets/cosmic/dock-sectors.png"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-auto object-contain select-none drop-shadow-[0_6px_12px_rgba(4,8,38,0.72)] group-hover:brightness-110 transition-all"
            />
            <span className="absolute inset-x-0 bottom-[16%] font-display font-bold text-[10px] sm:text-xs text-white text-center leading-none drop-shadow-[0_1.5px_2px_rgba(4,12,68,0.95)] pointer-events-none">
              Sectors
            </span>
          </button>

          {/* 2. Daily Login */}
          <button
            type="button"
            onClick={onOpenDailyLogin}
            aria-label="Daily Login"
            className="group relative flex items-center justify-center transition-transform hover:-translate-y-1 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#38E8FF] rounded-2xl"
          >
            <img
              src="./assets/cosmic/dock-daily-login.png"
              alt="Daily Login"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-auto object-contain select-none drop-shadow-[0_6px_12px_rgba(4,8,38,0.72)] group-hover:brightness-110 transition-all"
            />
            {dailyLoginClaimable && (
              <span
                aria-label="Daily login reward ready"
                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF4626] border-2 border-white shadow-[0_0_8px_rgba(255,70,38,0.9)]"
              />
            )}
          </button>

          {/* 3. Daily Mission */}
          <button
            type="button"
            onClick={onOpenDailyMission}
            aria-label="Daily Mission"
            className="group relative flex items-center justify-center transition-transform hover:-translate-y-1 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#38E8FF] rounded-2xl"
          >
            <img
              src="./assets/cosmic/dock-daily-mission.png"
              alt="Daily Mission"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-auto object-contain select-none drop-shadow-[0_6px_12px_rgba(4,8,38,0.72)] group-hover:brightness-110 transition-all"
            />
            {dailyMissionClaimable && (
              <span
                aria-label="Mission reward ready"
                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF4626] border-2 border-white shadow-[0_0_8px_rgba(255,70,38,0.9)]"
              />
            )}
          </button>

          {/* 4. Equipments */}
          <button
            type="button"
            onClick={onOpenEquipments}
            aria-label="Equipments"
            className="group relative flex items-center justify-center transition-transform hover:-translate-y-1 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#38E8FF] rounded-2xl"
          >
            <img
              src="./assets/cosmic/dock-equipments.png"
              alt="Equipments"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-auto object-contain select-none drop-shadow-[0_6px_12px_rgba(4,8,38,0.72)] group-hover:brightness-110 transition-all"
            />
          </button>

          {/* 5. Space Station */}
          <button
            type="button"
            onClick={onOpenSpaceStation}
            aria-label="Space Station"
            className="group relative flex items-center justify-center transition-transform hover:-translate-y-1 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#38E8FF] rounded-2xl"
          >
            <img
              src="./assets/cosmic/dock-space-station.png"
              alt="Space Station"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-auto object-contain select-none drop-shadow-[0_6px_12px_rgba(4,8,38,0.72)] group-hover:brightness-110 transition-all"
            />
          </button>
        </nav>
      </footer>
    </section>
  );
};
