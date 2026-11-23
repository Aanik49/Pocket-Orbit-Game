import React, { useState } from 'react';
import { X, Check, Lock, Plus, Minus, Radio, Wrench } from 'lucide-react';
import {
  isSatelliteUnlockedForPurchase,
  SATELLITES,
  SHIELD_COST_ROCKETS,
} from '../game/satellites';
import { LevelRecord, SatelliteId } from '../types';
import {
  PaperRocketIcon,
  PaperShieldIcon,
  PaperStarIcon,
  SatelliteIllustration,
} from './PaperCraftIcons';

interface SpaceStationModalProps {
  lobbyStars: number;
  lobbyRockets: number;
  shieldsOwned: number;
  ownedSatellites: SatelliteId[];
  selectedSatellite: SatelliteId;
  records: Record<number, LevelRecord>;
  onBuySatellite: (id: SatelliteId) => void;
  onEquipSatellite: (id: SatelliteId) => void;
  onBuyShields: (qty: number) => void;
  onClose: () => void;
}

export const SpaceStationModal: React.FC<SpaceStationModalProps> = ({
  lobbyStars,
  lobbyRockets,
  shieldsOwned,
  ownedSatellites,
  selectedSatellite,
  records,
  onBuySatellite,
  onEquipSatellite,
  onBuyShields,
  onClose,
}) => {
  const [tab, setTab] = useState<'satellites' | 'shields'>('satellites');
  const maxAffordableShields = Math.floor(lobbyRockets / SHIELD_COST_ROCKETS);
  const [shieldQty, setShieldQty] = useState<number>(1);

  const effectiveQty =
    maxAffordableShields > 0 ? Math.min(Math.max(1, shieldQty), maxAffordableShields) : 0;
  const totalRocketCost = effectiveQty * SHIELD_COST_ROCKETS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Space Station Shop"
      className="fixed inset-0 z-40 bg-[#14182B]/72 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-lg rounded-3xl border-[3px] border-[#27324F] p-4 sm:p-6 flex flex-col max-h-[90dvh] overflow-hidden"
      >
        {/* Header with live Stars & Rockets balances */}
        <div className="shrink-0 flex items-start justify-between gap-3 pb-3 border-b-2 border-dashed border-[#D3C4AA]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4D78A8] text-[#FAF3E6] flex items-center justify-center shadow-[0_3px_0_#34567D] shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#27324F] leading-tight">
                Space Station
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 font-mono-num text-xs font-bold text-[#27324F]">
                  <PaperStarIcon className="w-4 h-4" /> {lobbyStars}
                </span>
                <span className="inline-flex items-center gap-1 font-mono-num text-xs font-bold text-[#27324F]">
                  <PaperRocketIcon className="w-4 h-4" /> {lobbyRockets}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Space Station"
            className="paper-btn-cream w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-[#27324F]" />
          </button>
        </div>

        {/* Category Tabs: Satellites vs Shields */}
        <div
          role="tablist"
          className="shrink-0 grid grid-cols-2 gap-2 mt-3.5 p-1.5 rounded-2xl bg-[#E7DCC7] border border-[#D4C5AA]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'satellites'}
            onClick={() => setTab('satellites')}
            className={`h-10 rounded-xl font-display font-bold text-sm transition-all ${
              tab === 'satellites'
                ? 'bg-[#4D78A8] text-[#FAF3E6] shadow-[0_2px_0_#34567D]'
                : 'text-[#3F485E] hover:bg-[#F5EFE2]/70'
            }`}
          >
            Satellites (4)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'shields'}
            onClick={() => setTab('shields')}
            className={`h-10 rounded-xl font-display font-bold text-sm transition-all ${
              tab === 'shields'
                ? 'bg-[#4D78A8] text-[#FAF3E6] shadow-[0_2px_0_#34567D]'
                : 'text-[#3F485E] hover:bg-[#F5EFE2]/70'
            }`}
          >
            Shields ({shieldsOwned})
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'satellites' ? (
          <div className="min-h-0 flex-1 overflow-y-auto mt-3.5 flex flex-col gap-2.5 pr-0.5">
            {SATELLITES.map((sat) => {
              const owned = ownedSatellites.includes(sat.id);
              const equipped = selectedSatellite === sat.id;
              const unlocked = isSatelliteUnlockedForPurchase(sat, records);
              const canAfford = lobbyStars >= sat.costStars;

              return (
                <div
                  key={sat.id}
                  className={`rounded-2xl border-2 p-3 flex items-center gap-3 ${
                    equipped
                      ? 'bg-[#FFF5D4] border-[#C75C3B] shadow-[0_3px_0_rgba(199,92,59,0.28)]'
                      : 'bg-[#FCF8EE] border-[#D4C5AA] shadow-[0_2px_0_rgba(39,50,79,0.1)]'
                  }`}
                >
                  <SatelliteIllustration id={sat.id} className="w-14 h-14 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-display font-bold text-sm sm:text-base text-[#27324F]">
                        {sat.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE0CE] text-[#5E5447]">
                        {sat.tagline}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-[#5E5447] mt-1 leading-snug">
                      {sat.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {equipped ? (
                      <span className="inline-flex items-center gap-1 px-3 h-10 rounded-xl bg-[#5F9E73] text-[#FAF3E6] text-xs font-display font-bold">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : owned ? (
                      <button
                        type="button"
                        onClick={() => onEquipSatellite(sat.id)}
                        className="paper-btn-denim h-10 px-3.5 rounded-xl text-xs font-display font-bold whitespace-nowrap"
                      >
                        Equip
                      </button>
                    ) : !unlocked ? (
                      <div className="px-2.5 py-1.5 rounded-xl bg-[#E4DAC6] border border-[#CFC2AA] text-[#6E6354] text-[10px] font-display font-bold text-center leading-tight flex flex-col items-center gap-0.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Sector {sat.unlockSector}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuySatellite(sat.id)}
                        className={`h-10 px-3 rounded-xl text-xs font-display font-bold flex items-center gap-1 whitespace-nowrap ${
                          canAfford
                            ? 'paper-btn-gold'
                            : 'bg-[#E4DAC6] text-[#8B7F6E] cursor-not-allowed border border-[#CFC2AA]'
                        }`}
                      >
                        <PaperStarIcon className="w-4 h-4" />
                        <span>{sat.costStars}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div className="rounded-2xl bg-[#FCF8EE] border-2 border-[#D4C5AA] p-4 shadow-[0_3px_0_rgba(39,50,79,0.12)]">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-[#232942] flex items-center justify-center shrink-0">
                  <PaperShieldIcon className="w-11 h-11" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-lg text-[#27324F]">
                      Orbit Shield
                    </h3>
                    <span className="font-mono-num text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCEAF5] text-[#2B5982]">
                      Owned: {shieldsOwned}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#5E5447] mt-1 leading-relaxed">
                    Protects your craft from every obstacle on both inner and outer orbits. Up to 1 shield can be armed per level.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-2 text-xs font-mono-num font-bold text-[#C75C3B]">
                    <PaperRocketIcon className="w-4 h-4" />
                    <span>{SHIELD_COST_ROCKETS} Rockets each</span>
                  </div>
                </div>
              </div>

              {/* Quantity controls: Manual (-) / (+) AND MAX button */}
              <div className="mt-4 pt-4 border-t-2 border-dashed border-[#D8CBB4] flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#27324F]">
                    Select Quantity
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={effectiveQty <= 1}
                      onClick={() => setShieldQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease shield quantity"
                      className="paper-btn-cream w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-45"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-mono-num font-bold text-base text-[#27324F] w-10 text-center">
                      {effectiveQty}
                    </span>

                    <button
                      type="button"
                      disabled={effectiveQty >= maxAffordableShields}
                      onClick={() =>
                        setShieldQty((q) => Math.min(maxAffordableShields, Math.max(1, q) + 1))
                      }
                      aria-label="Increase shield quantity"
                      className="paper-btn-denim w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-45"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={maxAffordableShields <= 0}
                      onClick={() => setShieldQty(maxAffordableShields)}
                      className="paper-btn-gold h-9 px-3 rounded-xl font-display font-bold text-xs whitespace-nowrap disabled:opacity-45"
                    >
                      MAX ({maxAffordableShields})
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={effectiveQty <= 0}
                  onClick={() => {
                    onBuyShields(effectiveQty);
                    setShieldQty(1);
                  }}
                  className={`w-full h-12 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
                    effectiveQty > 0
                      ? 'paper-btn-terracotta relative'
                      : 'bg-[#E2D8C4] text-[#837766] cursor-not-allowed border-2 border-[#CFC2AA]'
                  }`}
                >
                  {effectiveQty > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-1.5 rounded-xl border border-dashed border-[#FAF3E6]/55 pointer-events-none"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {effectiveQty > 0 ? (
                      <>
                        Buy {effectiveQty} {effectiveQty === 1 ? 'Shield' : 'Shields'} ·
                        <PaperRocketIcon className="w-4 h-4 inline" /> {totalRocketCost}
                      </>
                    ) : (
                      `Need ${SHIELD_COST_ROCKETS} Rockets to buy a Shield`
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface EquipmentsModalProps {
  ownedSatellites: SatelliteId[];
  selectedSatellite: SatelliteId;
  shieldsOwned: number;
  onEquipSatellite: (id: SatelliteId) => void;
  onOpenSpaceStation: () => void;
  onClose: () => void;
}

export const EquipmentsModal: React.FC<EquipmentsModalProps> = ({
  ownedSatellites,
  selectedSatellite,
  shieldsOwned,
  onEquipSatellite,
  onOpenSpaceStation,
  onClose,
}) => {
  const ownedDefs = SATELLITES.filter((s) => ownedSatellites.includes(s.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Equipments Hangar"
      className="fixed inset-0 z-40 bg-[#14182B]/72 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-md rounded-3xl border-[3px] border-[#27324F] p-5 sm:p-6 flex flex-col max-h-[90dvh] overflow-hidden"
      >
        <div className="shrink-0 flex items-start justify-between gap-3 pb-3 border-b-2 border-dashed border-[#D3C4AA]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C75C3B] text-[#FAF3E6] flex items-center justify-center shadow-[0_3px_0_#8D3C23] shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#27324F] leading-tight">
                Equipments
              </h2>
              <p className="text-xs font-semibold text-[#6A5E4E] mt-0.5">
                Your owned satellites & orbital shields
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Equipments"
            className="paper-btn-cream w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-[#27324F]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto mt-3.5 flex flex-col gap-3 pr-0.5">
          {/* Owned Satellites */}
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#6A5E4E] mb-2">
              Owned Satellites ({ownedDefs.length}/{SATELLITES.length})
            </h3>
            <div className="flex flex-col gap-2">
              {ownedDefs.map((sat) => {
                const isEquipped = selectedSatellite === sat.id;
                return (
                  <div
                    key={sat.id}
                    className={`rounded-2xl border-2 p-3 flex items-center gap-3 ${
                      isEquipped
                        ? 'bg-[#FFF5D4] border-[#C75C3B]'
                        : 'bg-[#FCF8EE] border-[#D4C5AA]'
                    }`}
                  >
                    <SatelliteIllustration id={sat.id} className="w-12 h-12 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold text-sm text-[#27324F]">
                        {sat.name}
                      </div>
                      <p className="text-[11px] font-semibold text-[#5E5447] leading-snug mt-0.5">
                        {sat.description}
                      </p>
                    </div>
                    {isEquipped ? (
                      <span className="shrink-0 px-2.5 py-1 rounded-xl bg-[#5F9E73] text-[#FAF3E6] text-xs font-display font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onEquipSatellite(sat.id)}
                        className="paper-btn-denim shrink-0 h-9 px-3 rounded-xl text-xs font-display font-bold"
                      >
                        Select
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Owned Shields Inventory */}
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#6A5E4E] mb-2">
              Power Shields
            </h3>
            <div className="rounded-2xl bg-[#FCF8EE] border-2 border-[#D4C5AA] p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#232942] flex items-center justify-center shrink-0">
                  <PaperShieldIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#27324F]">
                    Orbit Shields
                  </div>
                  <div className="text-[11px] font-semibold text-[#5E5447]">
                    Arm 1 shield before launching any level
                  </div>
                </div>
              </div>
              <span className="font-mono-num font-bold text-lg text-[#4D78A8] shrink-0">
                ×{shieldsOwned}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSpaceStation}
          className="paper-btn-denim shrink-0 mt-4 w-full h-11 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
        >
          <Radio className="w-4 h-4" />
          <span>Visit Space Station Shop</span>
        </button>
      </div>
    </div>
  );
};
