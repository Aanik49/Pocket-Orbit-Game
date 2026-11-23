import React, { useState } from 'react';
import { X, Play, Clock, Shield, Check, Radio } from 'lucide-react';
import { getSatelliteById, SATELLITES } from '../game/satellites';
import { LevelConfig, SatelliteId } from '../types';
import { PaperShieldIcon, SatelliteIllustration } from './PaperCraftIcons';

interface LevelStartModalProps {
  level: LevelConfig;
  ownedSatellites: SatelliteId[];
  selectedSatellite: SatelliteId;
  shieldsOwned: number;
  onSelectSatellite: (id: SatelliteId) => void;
  onLaunch: (useShield: boolean) => void;
  onOpenSpaceStation: () => void;
  onClose: () => void;
}

export const LevelStartModal: React.FC<LevelStartModalProps> = ({
  level,
  ownedSatellites,
  selectedSatellite,
  shieldsOwned,
  onSelectSatellite,
  onLaunch,
  onOpenSpaceStation,
  onClose,
}) => {
  const [useShield, setUseShield] = useState(false);

  const ownedDefs = SATELLITES.filter((s) => ownedSatellites.includes(s.id));
  const activeSat = getSatelliteById(selectedSatellite);
  const timerOffBySat = level.timeLimit !== null && activeSat.disablesTimer;

  const canUseShield = shieldsOwned > 0;
  const effectiveShield = canUseShield && useShield;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Launch Level ${level.id}`}
      className="fixed inset-0 z-40 bg-[#14182B]/74 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-md rounded-3xl border-[3px] border-[#27324F] p-5 sm:p-6 flex flex-col max-h-[90dvh] overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-3 pb-3 border-b-2 border-dashed border-[#D3C4AA]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-num text-xs font-bold text-[#C75C3B]">
                Sector {level.chapter} · Level {String(level.id).padStart(2, '0')}
              </span>
              {level.timeLimit !== null && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-mono-num font-bold px-2 py-0.5 rounded-full ${
                    timerOffBySat
                      ? 'bg-[#E9E0F7] text-[#66469A]'
                      : 'bg-[#F8E2D4] text-[#B8492A]'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {timerOffBySat ? 'Timer OFF' : `${level.timeLimit}s Limit`}
                </span>
              )}
            </div>
            <h2 className="font-display text-2xl font-bold text-[#27324F] mt-0.5 leading-tight">
              {level.name}
            </h2>
            <p className="text-xs font-semibold text-[#6A5E4E] mt-1">{level.mechanicNote}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel launch"
            className="paper-btn-cream w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-[#27324F]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto mt-4 flex flex-col gap-4 pr-0.5">
          {/* 1. Satellite Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-[#5E5447]">
                Choose Satellite
              </span>
              {ownedDefs.length < SATELLITES.length && (
                <button
                  type="button"
                  onClick={onOpenSpaceStation}
                  className="text-[11px] font-display font-bold text-[#4D78A8] hover:underline flex items-center gap-1"
                >
                  <Radio className="w-3 h-3" /> Get More
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ownedDefs.map((sat) => {
                const isSelected = selectedSatellite === sat.id;
                return (
                  <button
                    key={sat.id}
                    type="button"
                    onClick={() => onSelectSatellite(sat.id)}
                    className={`relative rounded-2xl border-2 p-2.5 text-left flex items-center gap-2.5 transition-all focus-visible:outline-2 focus-visible:outline-[#27324F] ${
                      isSelected
                        ? 'bg-[#FFF3CC] border-[#C75C3B] shadow-[0_3px_0_#C75C3B]'
                        : 'bg-[#FCF8EE] border-[#D4C5AA] hover:border-[#4D78A8]'
                    }`}
                  >
                    <SatelliteIllustration id={sat.id} className="w-10 h-10 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-display font-bold text-xs text-[#27324F] truncate">
                        {sat.name}
                      </div>
                      <div className="text-[10px] font-semibold text-[#6A5E4E] truncate">
                        {sat.tagline}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#C75C3B] text-[#FAF3E6] flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] font-semibold text-[#5E5447] mt-2 bg-[#EFE6D4] rounded-xl px-3 py-1.5">
              <strong className="text-[#27324F]">{activeSat.name}:</strong> {activeSat.description}
            </p>
          </div>

          {/* 2. Shield Power-Up Toggle (Deducts 1 Shield on Launch) */}
          <div className="rounded-2xl bg-[#FCF8EE] border-2 border-[#D4C5AA] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#232942] flex items-center justify-center shrink-0">
                <PaperShieldIcon className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm text-[#27324F]">
                    Arm Shield
                  </span>
                  <span className="font-mono-num text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DCEAF5] text-[#2B5982]">
                    {shieldsOwned} left
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#6A5E4E] leading-snug mt-0.5">
                  {canUseShield
                    ? effectiveShield
                      ? 'Active! Uses 1 shield — immune to all obstacles.'
                      : 'Protects from every obstacle this run (-1 shield).'
                    : 'No shields owned. Buy at Space Station (10 Rockets).'}
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
                className={`shrink-0 w-13 h-8 rounded-full p-1 transition-colors flex items-center border-2 border-[#27324F] focus-visible:outline-2 focus-visible:outline-[#27324F] ${
                  effectiveShield ? 'bg-[#4D78A8] justify-end' : 'bg-[#D8CCB7] justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-[#FAF3E6] flex items-center justify-center shadow-sm">
                  {effectiveShield && <Shield className="w-3 h-3 text-[#4D78A8]" />}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSpaceStation}
                className="paper-btn-gold shrink-0 h-9 px-3 rounded-xl font-display font-bold text-xs whitespace-nowrap"
              >
                Buy
              </button>
            )}
          </div>
        </div>

        {/* Launch CTA */}
        <button
          type="button"
          onClick={() => onLaunch(effectiveShield)}
          className="paper-btn-terracotta relative shrink-0 mt-5 w-full h-13 rounded-2xl font-display font-bold text-lg tracking-wide flex items-center justify-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#27324F]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-1.5 rounded-xl border-[1.5px] border-dashed border-[#FAF3E6]/60 pointer-events-none"
          />
          <Play className="w-5 h-5 relative z-10 fill-current" />
          <span className="relative z-10">
            {effectiveShield ? 'LAUNCH WITH SHIELD (-1)' : 'LAUNCH ORBIT'}
          </span>
        </button>
      </div>
    </div>
  );
};
