import React, { useEffect, useState } from 'react';
import { Download, Lock } from 'lucide-react';
import { usePWAInstall } from '../hooks/useInstallPrompt';
import { CHAPTERS } from '../game/levels';
import { getChapterClearedCount, isChapterUnlocked } from '../game/storage';
import { LevelRecord } from '../types';

interface LobbyScreenProps {
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

interface SectorArcNode {
  id: number;
  sprite: string;
  leftPct: number;
  topPct: number;
}

const SECTOR_ARC_NODES: SectorArcNode[] = [
  { id: 1, sprite: './assets/lobby/sector-01.png', leftPct: 24, topPct: 22 },
  { id: 2, sprite: './assets/lobby/sector-02.png', leftPct: 11, topPct: 46 },
  { id: 3, sprite: './assets/lobby/sector-03.png', leftPct: 20, topPct: 69 },
  { id: 4, sprite: './assets/lobby/sector-04.png', leftPct: 37, topPct: 82 },
  { id: 5, sprite: './assets/lobby/sector-05.png', leftPct: 57, topPct: 90 },
  { id: 6, sprite: './assets/lobby/sector-06.png', leftPct: 77, topPct: 77 },
];

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  lobbyStars,
  lobbyRockets,
  currentLevelId,
  records,
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
  const [selectedSector, setSelectedSector] = useState<number>(currentChapterId);

  useEffect(() => {
    setSelectedSector(currentChapterId);
  }, [currentChapterId]);

  const handleSectorClick = (chapterId: number) => {
    if (isChapterUnlocked(chapterId, records)) {
      setSelectedSector(chapterId);
    }
    onOpenSectorAtlas(chapterId);
  };

  return (
    <section
      aria-label="Pocket Orbit Space Lobby"
      className="absolute inset-0 z-20 flex flex-col items-center justify-between overflow-hidden pointer-events-none"
    >
      {/* TOP STACK: Header -> Equal Gap -> POCKET ORBIT -> Exact Same Equal Gap -> Sector Orbital Hub */}
      <div className="w-full flex flex-col items-center shrink-0">
        {/* 1. TOP BAR: Music (left) · Stars & Rockets Stitched Pills (center) · Sound (right) */}
        <header className="relative w-full max-w-[560px] mx-auto px-3.5 pt-3 sm:px-6 sm:pt-4 flex items-center justify-between gap-2 pointer-events-auto z-30">
          {/* Left: Terracotta Stitched Music Button */}
          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={musicMuted ? 'Enable music' : 'Mute music'}
            aria-pressed={!musicMuted}
            className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#27324F]"
          >
            <img
              src="./assets/lobby/btn-music.png"
              alt="Music"
              referrerPolicy="no-referrer"
              draggable={false}
              className={`w-full h-full object-contain select-none transition-opacity ${
                musicMuted ? 'opacity-55 grayscale-[35%]' : 'opacity-100'
              }`}
            />
            {musicMuted && (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <span className="w-8 sm:w-9 h-[3px] bg-[#27324F] border border-[#FAF3E6] -rotate-45 rounded-full shadow-sm" />
              </span>
            )}
          </button>

          {/* Center: Stitched Stars & Rockets Currency Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-0">
            {/* Stars Currency Pill */}
            <div
              aria-label={`${lobbyStars} Stars`}
              className="relative h-10 sm:h-12 w-[116px] sm:w-[144px] shrink-0 select-none"
            >
              <img
                src="./assets/lobby/pill-star.png"
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-contain"
              />
              <span className="absolute inset-y-0 left-[34%] right-[10%] flex items-center justify-center font-display font-extrabold text-[15px] sm:text-lg text-[#27324F] tabular-nums leading-none tracking-tight">
                {lobbyStars.toLocaleString()}
              </span>
            </div>

            {/* Rockets Currency Pill */}
            <div
              aria-label={`${lobbyRockets} Rockets`}
              className="relative h-11 sm:h-[54px] w-[108px] sm:w-[134px] shrink-0 select-none"
            >
              <img
                src="./assets/lobby/pill-rocket.png"
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-contain"
              />
              <span className="absolute inset-y-0 left-[40%] right-[10%] flex items-center justify-center font-display font-extrabold text-[15px] sm:text-lg text-[#27324F] tabular-nums leading-none tracking-tight">
                {lobbyRockets.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right: Denim Stitched Sound Button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={!muted}
            className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#27324F]"
          >
            <img
              src="./assets/lobby/btn-sound.png"
              alt="Sound"
              referrerPolicy="no-referrer"
              draggable={false}
              className={`w-full h-full object-contain select-none transition-opacity ${
                muted ? 'opacity-55 grayscale-[35%]' : 'opacity-100'
              }`}
            />
            {muted && (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <span className="w-8 sm:w-9 h-[3px] bg-[#27324F] border border-[#FAF3E6] -rotate-45 rounded-full shadow-sm" />
              </span>
            )}
          </button>

          {/* Optional unobtrusive PWA Install chip when browser supports install */}
          {canInstall && (
            <button
              type="button"
              onClick={() => void install()}
              aria-label="Install Pocket Orbit"
              className="paper-btn-gold absolute -bottom-8 right-3.5 sm:right-6 h-7 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-display font-bold whitespace-nowrap transition-transform focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
        </header>

        {/* 2. CENTERED HAND-CUT POCKET ORBIT TITLE LOGO (equal gap from Top Bar) */}
        <div className="relative w-full flex justify-center px-6 mt-4 sm:mt-6 z-20 select-none pointer-events-none">
          <img
            src="./assets/lobby/logo.png"
            alt="Pocket Orbit"
            referrerPolicy="no-referrer"
            draggable={false}
            className="w-[215px] sm:w-[270px] md:w-[295px] max-w-[68vw] h-auto object-contain"
          />
        </div>

        {/* 3. SECTOR ORBITAL HUB (exact same equal gap below Pocket Orbit, lifted higher) */}
        <div className="relative w-full flex justify-center px-4 mt-4 sm:mt-6 z-20 pointer-events-auto">
          <div className="relative w-[min(66vw,268px)] sm:w-[min(56vw,325px)] max-h-[37dvh] sm:max-h-[40dvh] aspect-[1/1.05] flex items-center justify-center">
            {/* Concentric Dashed Twine Orbits, Rocket Trail & Tiny Accent Stars */}
            <svg
              viewBox="0 0 360 390"
              className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-visible"
              aria-hidden="true"
            >
              {/* Outer dashed orbital arc connecting 01 → 02 → 03 → 04 → 05 → 06 */}
              <circle
                cx="196"
                cy="184"
                r="146"
                fill="none"
                stroke="#8B765B"
                strokeWidth="2.1"
                strokeDasharray="6 6"
                opacity="0.72"
              />

              {/* Inner dashed orbital arc framing the central stitched planet */}
              <circle
                cx="208"
                cy="176"
                r="102"
                fill="none"
                stroke="#8B765B"
                strokeWidth="1.9"
                strokeDasharray="5 5"
                opacity="0.65"
              />

              {/* Curved twine trail swooping from the planet up into the flying rocket */}
              <path
                d="M286 154 C312 146 322 114 308 88"
                fill="none"
                stroke="#B5A188"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.82"
              />

              {/* 3 tiny warm ochre paper stars tucked along the orbital rings */}
              <polygon
                points="135,96 138,103 145,103 139,108 141,115 135,111 129,115 131,108 125,103 132,103"
                fill="#F1BD53"
                stroke="#C98F32"
                strokeWidth="0.7"
              />
              <polygon
                points="96,178 99,185 106,185 100,190 102,197 96,193 90,197 92,190 86,185 93,185"
                fill="#CFA265"
                stroke="#9C733E"
                strokeWidth="0.7"
              />
              <polygon
                points="224,302 228,311 237,311 230,316 232,325 224,320 216,325 218,316 211,311 220,311"
                fill="#F1BD53"
                stroke="#C98F32"
                strokeWidth="0.7"
              />
            </svg>

            {/* Flying Paper Rocket perched above-right of the central planet */}
            <div
              aria-hidden="true"
              className="absolute pointer-events-none select-none z-20"
              style={{
                left: '84%',
                top: '14%',
                width: '25%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img
                src="./assets/lobby/rocket-fly.png"
                alt=""
                referrerPolicy="no-referrer"
                draggable={false}
                className="animate-cloud-slow w-full h-auto object-contain"
              />
            </div>

            {/* Central Layered Stitched Planet ("SECTOR N") */}
            <button
              type="button"
              onClick={() => onOpenSectorAtlas(selectedSector)}
              aria-label={`Open Sector ${selectedSector} levels`}
              style={{
                left: '61%',
                top: '44%',
                width: '62%',
                transform: 'translate(-50%, -50%)',
              }}
              className="group absolute z-10 flex items-center justify-center rounded-full transition-transform hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-[#27324F]"
            >
              <img
                src="./assets/lobby/planet.png"
                alt={`Sector ${selectedSector}`}
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-auto object-contain select-none"
              />
              {/* Dynamic Paper-Cut Terracotta Sector Number positioned right below "SECTOR" */}
              <span
                aria-hidden="true"
                className="absolute left-[53%] top-[53%] -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-[20px] sm:text-[26px] leading-none text-[#C45B38] select-none pointer-events-none"
                style={{
                  WebkitTextStroke: '1.2px #FAF3E6',
                  paintOrder: 'stroke fill',
                  textShadow: '0 2px 0 rgba(39,50,79,0.28)',
                }}
              >
                {selectedSector}
              </span>
            </button>

            {/* All 6 Stitched Circular Sector Coins (01–06) arranged on the orbital arc */}
            {SECTOR_ARC_NODES.map((node) => {
              const chapter = CHAPTERS[node.id - 1];
              const unlocked = isChapterUnlocked(node.id, records);
              const cleared = getChapterClearedCount(node.id, records);
              const isSelected = selectedSector === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleSectorClick(node.id)}
                  aria-label={`Sector ${node.id}: ${chapter.title}, ${
                    unlocked ? `${cleared} of 10 levels cleared` : 'Locked'
                  }`}
                  style={{
                    left: `${node.leftPct}%`,
                    top: `${node.topPct}%`,
                    width: '21.5%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="group absolute z-20 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#27324F]"
                >
                  <img
                    src={node.sprite}
                    alt={`Sector 0${node.id}`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className={`w-full h-auto object-contain select-none transition-all rounded-full ${
                      isSelected && unlocked
                        ? 'ring-[2.5px] ring-[#FAF3E6] shadow-[0_0_0_4px_rgba(199,92,59,0.45)]'
                        : ''
                    } ${!unlocked ? 'brightness-[0.86] saturate-[0.72]' : ''}`}
                  />

                  {/* Crisp Stitched Lock Badge on Locked Sectors */}
                  {!unlocked && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C75C3B] border-2 border-[#FAF3E6] shadow-[0_2px_0_rgba(39,50,79,0.32)] flex items-center justify-center text-[#FAF3E6]"
                    >
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.8]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM STACK: 4 Equal-Gap Shadowed Action Buttons Row + Stitched PLAY CTA */}
      <footer className="relative w-full max-w-[460px] mx-auto px-3.5 sm:px-6 pb-3 sm:pb-5 pt-2 flex flex-col items-center gap-3 sm:gap-4 z-30 pointer-events-auto">
        {/* 4. SINGLE HORIZONTAL ROW: Daily Login · Daily Mission · Equipment · Space Station (Equal Gaps + Crisp Shadows) */}
        <nav
          aria-label="Lobby Actions"
          className="w-full grid grid-cols-4 gap-3 sm:gap-5 items-start"
        >
          {/* Daily Login */}
          <button
            type="button"
            onClick={onOpenDailyLogin}
            className="group relative flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#27324F] rounded-2xl"
          >
            <div className="relative w-[58px] h-[58px] sm:w-[70px] sm:h-[70px] flex items-center justify-center">
              <img
                src="./assets/lobby/btn-daily-login.png"
                alt="Daily Login"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-contain select-none drop-shadow-[0_6px_8px_rgba(39,50,79,0.34)] group-hover:drop-shadow-[0_9px_10px_rgba(39,50,79,0.38)] transition-all"
              />
              {dailyLoginClaimable && (
                <span
                  aria-label="Daily login reward ready"
                  className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#D94F38] border-2 border-[#FAF3E6] shadow-sm"
                />
              )}
            </div>
            <span className="font-display font-extrabold text-[10px] sm:text-xs text-[#27324F] leading-[1.12] tracking-wide uppercase text-center">
              Daily
              <br />
              Login
            </span>
          </button>

          {/* Daily Mission */}
          <button
            type="button"
            onClick={onOpenDailyMission}
            className="group relative flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#27324F] rounded-2xl"
          >
            <div className="relative w-[58px] h-[58px] sm:w-[70px] sm:h-[70px] flex items-center justify-center">
              <img
                src="./assets/lobby/btn-daily-mission.png"
                alt="Daily Mission"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-contain select-none drop-shadow-[0_6px_8px_rgba(39,50,79,0.34)] group-hover:drop-shadow-[0_9px_10px_rgba(39,50,79,0.38)] transition-all"
              />
              {dailyMissionClaimable && (
                <span
                  aria-label="Mission reward ready"
                  className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#D94F38] border-2 border-[#FAF3E6] shadow-sm"
                />
              )}
            </div>
            <span className="font-display font-extrabold text-[10px] sm:text-xs text-[#27324F] leading-[1.12] tracking-wide uppercase text-center">
              Daily
              <br />
              Mission
            </span>
          </button>

          {/* Equipment */}
          <button
            type="button"
            onClick={onOpenEquipments}
            className="group relative flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#27324F] rounded-2xl"
          >
            <div className="relative w-[58px] h-[58px] sm:w-[70px] sm:h-[70px] flex items-center justify-center">
              <img
                src="./assets/lobby/btn-equipment.png"
                alt="Equipment"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-contain select-none drop-shadow-[0_6px_8px_rgba(39,50,79,0.34)] group-hover:drop-shadow-[0_9px_10px_rgba(39,50,79,0.38)] transition-all"
              />
            </div>
            <span className="font-display font-extrabold text-[10px] sm:text-xs text-[#27324F] leading-[1.12] tracking-wide uppercase text-center">
              Equipment
            </span>
          </button>

          {/* Space Station */}
          <button
            type="button"
            onClick={onOpenSpaceStation}
            className="group relative flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#27324F] rounded-2xl"
          >
            <div className="relative w-[58px] h-[58px] sm:w-[70px] sm:h-[70px] flex items-center justify-center">
              <img
                src="./assets/lobby/btn-space-station.png"
                alt="Space Station"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-contain select-none drop-shadow-[0_6px_8px_rgba(39,50,79,0.34)] group-hover:drop-shadow-[0_9px_10px_rgba(39,50,79,0.38)] transition-all"
              />
            </div>
            <span className="font-display font-extrabold text-[10px] sm:text-xs text-[#27324F] leading-[1.12] tracking-wide uppercase text-center">
              Space
              <br />
              Station
            </span>
          </button>
        </nav>

        {/* 5. STITCHED PLAY CTA + REQUIRED HINT TEXT */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onPlayCurrent}
            aria-label="Play Pocket Orbit"
            className="relative w-[166px] sm:w-[206px] transition-transform hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0.5 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-[#27324F] rounded-2xl"
          >
            <img
              src="./assets/lobby/btn-play.png"
              alt="PLAY"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-auto object-contain select-none drop-shadow-[0_5px_6px_rgba(39,50,79,0.26)]"
            />
          </button>

          <p className="text-[11px] sm:text-xs font-bold text-[#5E5447] tracking-wide text-center">
            Tap Anywhere to shift orbit.
          </p>
        </div>
      </footer>
    </section>
  );
};
