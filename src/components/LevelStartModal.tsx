import React, { useState } from 'react';
import { X, Play, Clock, Shield, Check, Radio, Crown } from 'lucide-react';
import { getSatelliteById, getTrailById, SATELLITES } from '../game/satellites';
import { LevelConfig, SatelliteId, TrailId } from '../types';
import {
  ChronoPulseIcon,
  PaperShieldIcon,
  SatelliteIllustration,
  StarMagnetIcon,
  TrailPreviewBadge,
} from './PaperCraftIcons';

interface LevelStartModalProps {
  level: LevelConfig;
  ownedSatellites: SatelliteId[];
  selectedSatellite: SatelliteId;
  selectedTrail: TrailId;
  shieldsOwned: number;
  chronoOwned: number;
  magnetOwned: number;
  onSelectSatellite: (id: SatelliteId) => void;
  onLaunch: (options: {
    useShield: boolean;
    enableChrono: boolean;
    enableMagnet: boolean;
  }) => void;
  onOpenSpaceStation: () => void;
  onClose: () => void;
}

export const LevelStartModal: React.FC<LevelStartModalProps> = ({
  level,
  ownedSatellites,
  selectedSatellite,
  selectedTrail,
  shieldsOwned,
  chronoOwned,
  magnetOwned,
  onSelectSatellite,
  onLaunch,
  onOpenSpaceStation,
  onClose,
}) => {
  const [useShield, setUseShield] = useState(false);
  const [enableChrono, setEnableChrono] = useState(chronoOwned > 0);
  const [enableMagnet, setEnableMagnet] = useState(magnetOwned > 0);

  const ownedDefs = SATELLITES.filter((s) => ownedSatellites.includes(s.id));
  const activeSat = getSatelliteById(selectedSatellite);
  const activeTrail = getTrailById(selectedTrail);
  const timerOffBySat = level.timeLimit !== null && activeSat.disablesTimer;

  const canUseShield = shieldsOwned > 0;
  const effectiveShield = canUseShield && useShield;
  const effectiveChrono = chronoOwned > 0 && enableChrono;
  const effectiveMagnet = magnetOwned > 0 && enableMagnet;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Launch Level ${level.id}`}
      className="safe-modal-pad fixed inset-0 z-40 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter cosmic-modal-frame relative w-full max-w-[356px] max-h-[84dvh] flex flex-col"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel launch"
          className="glossy-close-orange absolute -top-2.5 -right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-transform focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="cosmic-modal-inner p-3.5 sm:p-4 flex flex-col max-h-[calc(84dvh-5px)] overflow-hidden">
          {/* Top Level / Boss Banner Box */}
          <div
            className={`shrink-0 rounded-2xl px-3.5 py-2.5 border ${
              level.boss
                ? 'bg-[#34103B] border-[#FF7B42]'
                : 'bg-[#0E155C] border-[#5B7EFF]/60'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="font-display text-xs font-bold text-[#FFA726] inline-flex items-center gap-1">
                {level.boss && <Crown className="w-3.5 h-3.5 text-[#FFD426]" />}
                Sector {level.chapter} · Level {String(level.id).padStart(2, '0')}
                {level.boss ? ' · Boss Finale' : ''}
              </span>
              {level.timeLimit !== null && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono-num font-bold ${
                    timerOffBySat ? 'text-[#D6B8FF]' : 'text-[#FFB299]'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {timerOffBySat ? 'Timer OFF' : `${level.timeLimit}s`}
                </span>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#FFF2C9] mt-0.5 leading-tight drop-shadow-[0_2px_0_rgba(10,14,62,0.85)]">
              {level.boss ? level.boss.title : level.name}
            </h2>
            <p className="text-[11px] font-bold text-[#74E6FF] mt-0.5">{level.mechanicNote}</p>
            {level.boss && (
              <p className="text-[10px] font-mono-num font-bold text-[#FFD426] mt-0.5">
                Boss Bounty: +{level.boss.bonusRockets} Rockets on clear
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto mt-3 flex flex-col gap-2.5 pr-0.5">
            {/* 1. CHOOSE SATELLITE */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-extrabold text-[11px] uppercase tracking-wider text-[#FFD426]">
                  Choose Craft
                </span>
                <button
                  type="button"
                  onClick={onOpenSpaceStation}
                  className="text-[11px] font-display font-bold text-[#6CE5FF] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Radio className="w-3 h-3" /> Shop &amp; Trails
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ownedDefs.map((sat) => {
                  const isSelected = selectedSatellite === sat.id;
                  return (
                    <button
                      key={sat.id}
                      type="button"
                      onClick={() => onSelectSatellite(sat.id)}
                      className={`relative rounded-xl p-2 text-left flex items-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#3DF2FF] ${
                        isSelected
                          ? 'bg-[#C94A14] border-2 border-[#FFC43B]'
                          : 'cosmic-glass-card hover:border-[#6CE5FF]'
                      }`}
                    >
                      <SatelliteIllustration id={sat.id} className="w-9 h-9 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs text-white truncate">
                          {sat.name}
                        </div>
                        <div
                          className={`text-[9px] font-semibold truncate ${
                            isSelected ? 'text-[#FFE2B5]' : 'text-[#A8C8F5]'
                          }`}
                        >
                          {sat.tagline}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF661A] border-2 border-[#FFE994] text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Craft + Active Trail Summary */}
              <div className="mt-2 bg-[#1E3686]/85 border border-[#5B9BFF]/50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <TrailPreviewBadge id={activeTrail.id} className="w-7 h-7 shrink-0" />
                <p className="text-[10px] sm:text-[11px] font-semibold text-[#D6EAFF] leading-snug">
                  <strong className="text-white">{activeSat.name}:</strong> {activeSat.description}{' '}
                  <span className="text-[#8CEEFF]">· Trail: {activeTrail.name}</span>
                </p>
              </div>
            </div>

            {/* 2. ARM SHIELD POWER-UP */}
            <div className="cosmic-glass-card rounded-2xl p-2.5 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#0D164D] border border-[#3E64C8]/65 flex items-center justify-center shrink-0 p-1">
                  <PaperShieldIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-display font-bold text-white">
                    <span>Orbit Shield</span>
                    <span className="font-mono-num text-[10px] text-[#7CEBFF]">
                      · {shieldsOwned} owned
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#BDD7FA] leading-snug mt-0.5">
                    {canUseShield
                      ? effectiveShield
                        ? 'Armed (-1 on launch) · Immune to obstacles & flares.'
                        : 'Protects all run from debris & solar flares (-1).'
                      : 'Buy at Space Station (10 Rockets).'}
                  </p>
                </div>
              </div>

              {canUseShield ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={effectiveShield}
                  aria-label="Toggle orbit shield for this level"
                  onClick={() => setUseShield((v) => !v)}
                  className={`shrink-0 w-11 h-6.5 rounded-full p-0.5 transition-all flex items-center border-2 focus-visible:outline-2 focus-visible:outline-[#3DF2FF] ${
                    effectiveShield
                      ? 'bg-[#1668E8] border-[#3DF2FF] justify-end'
                      : 'bg-[#121952] border-[#4A68C8] justify-start'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      effectiveShield ? 'bg-[#64F4FF]' : 'bg-[#5B75BA]'
                    }`}
                  >
                    {effectiveShield && <Shield className="w-2.5 h-2.5 text-[#09205E]" />}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSpaceStation}
                  className="glossy-btn-gold shrink-0 h-7.5 px-2.5 rounded-xl font-display font-extrabold text-[11px] whitespace-nowrap"
                >
                  Buy
                </button>
              )}
            </div>

            {/* 3. IN-RUN ACTIVE BOOSTERS (CHRONO PULSE & STAR MAGNET) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  chronoOwned > 0 ? setEnableChrono((v) => !v) : onOpenSpaceStation()
                }
                className={`rounded-2xl p-2 text-left flex items-center gap-2 transition-all border ${
                  effectiveChrono
                    ? 'bg-[#1443A8]/90 border-[#66E5FF]'
                    : 'cosmic-glass-card border-[#4562BF]/60 opacity-85'
                }`}
              >
                <ChronoPulseIcon className="w-8 h-8 shrink-0" />
                <div className="min-w-0">
                  <div className="font-display font-bold text-[11px] text-white truncate">
                    Slow-Mo
                  </div>
                  <div className="font-mono-num text-[10px] font-bold text-[#8CEEFF]">
                    {chronoOwned > 0
                      ? effectiveChrono
                        ? `Ready (x${chronoOwned})`
                        : `Off (x${chronoOwned})`
                      : 'Buy (8)'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  magnetOwned > 0 ? setEnableMagnet((v) => !v) : onOpenSpaceStation()
                }
                className={`rounded-2xl p-2 text-left flex items-center gap-2 transition-all border ${
                  effectiveMagnet
                    ? 'bg-[#661D8C]/90 border-[#FF8AF7]'
                    : 'cosmic-glass-card border-[#4562BF]/60 opacity-85'
                }`}
              >
                <StarMagnetIcon className="w-8 h-8 shrink-0" />
                <div className="min-w-0">
                  <div className="font-display font-bold text-[11px] text-white truncate">
                    Magnet
                  </div>
                  <div className="font-mono-num text-[10px] font-bold text-[#FFB8F8]">
                    {magnetOwned > 0
                      ? effectiveMagnet
                        ? `Ready (x${magnetOwned})`
                        : `Off (x${magnetOwned})`
                      : 'Buy (8)'}
                  </div>
                </div>
              </button>
            </div>
            <p className="text-[10px] font-semibold text-[#9EC2F5] text-center -mt-1">
              Slow-Mo &amp; Magnet only consume 1 charge if tapped during flight.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onLaunch({
                useShield: effectiveShield,
                enableChrono: effectiveChrono,
                enableMagnet: effectiveMagnet,
              })
            }
            className="glossy-btn-coral shrink-0 mt-3 w-full h-11 rounded-full font-display font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
          >
            <span>{effectiveShield ? 'LAUNCH WITH SHIELD (-1)' : 'LAUNCH ORBIT'}</span>
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
