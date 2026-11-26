import React, { useState } from 'react';
import { X, Check, Lock, Plus, Minus, Radio, Wrench } from 'lucide-react';
import {
  BOOSTERS,
  isSatelliteUnlockedForPurchase,
  SATELLITES,
  TRAILS,
} from '../game/satellites';
import { BoosterKind, LevelRecord, SatelliteId, TrailId } from '../types';
import {
  ChronoPulseIcon,
  PaperRocketIcon,
  PaperShieldIcon,
  PaperStarIcon,
  SatelliteIllustration,
  StarMagnetIcon,
  TrailPreviewBadge,
} from './PaperCraftIcons';

interface SpaceStationModalProps {
  lobbyStars: number;
  lobbyRockets: number;
  shieldsOwned: number;
  chronoOwned: number;
  magnetOwned: number;
  ownedSatellites: SatelliteId[];
  selectedSatellite: SatelliteId;
  ownedTrails: TrailId[];
  selectedTrail: TrailId;
  records: Record<number, LevelRecord>;
  onBuySatellite: (id: SatelliteId) => void;
  onEquipSatellite: (id: SatelliteId) => void;
  onBuyTrail: (id: TrailId) => void;
  onEquipTrail: (id: TrailId) => void;
  onBuyBooster: (kind: BoosterKind, qty: number) => void;
  onClose: () => void;
}

const BoosterIcon: React.FC<{ kind: BoosterKind; className?: string }> = ({ kind, className }) => {
  if (kind === 'shield') return <PaperShieldIcon className={className} />;
  if (kind === 'chrono') return <ChronoPulseIcon className={className} />;
  return <StarMagnetIcon className={className} />;
};

export const SpaceStationModal: React.FC<SpaceStationModalProps> = ({
  lobbyStars,
  lobbyRockets,
  shieldsOwned,
  chronoOwned,
  magnetOwned,
  ownedSatellites,
  selectedSatellite,
  ownedTrails,
  selectedTrail,
  records,
  onBuySatellite,
  onEquipSatellite,
  onBuyTrail,
  onEquipTrail,
  onBuyBooster,
  onClose,
}) => {
  const [tab, setTab] = useState<'satellites' | 'trails' | 'boosters'>('satellites');
  const [selectedBooster, setSelectedBooster] = useState<BoosterKind>('shield');
  const [boosterQty, setBoosterQty] = useState<number>(1);

  const activeBoosterDef = BOOSTERS.find((b) => b.id === selectedBooster) ?? BOOSTERS[0];
  const ownedMap: Record<BoosterKind, number> = {
    shield: shieldsOwned,
    chrono: chronoOwned,
    magnet: magnetOwned,
  };
  const maxAffordable = Math.floor(lobbyRockets / activeBoosterDef.costRockets);
  const effectiveQty = maxAffordable > 0 ? Math.min(Math.max(1, boosterQty), maxAffordable) : 0;
  const totalRocketCost = effectiveQty * activeBoosterDef.costRockets;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Space Station Shop"
      className="safe-modal-pad fixed inset-0 z-40 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter station-modal-frame relative w-full max-w-[366px] px-3.5 pb-4 pt-7 flex flex-col max-h-[84dvh]"
      >
        {/* Centered Floating Solid-Blue Header Pill */}
        <div className="pointer-events-none absolute -top-5 inset-x-0 flex justify-center z-20">
          <div className="station-header-pill w-fit h-10 pl-1.5 pr-4 rounded-full inline-flex items-center gap-2 whitespace-nowrap">
            <div className="w-8 h-8 rounded-full bg-[#0F52D6] border-2 border-[#7CCBFF] flex items-center justify-center text-white shrink-0">
              <Radio className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="font-display text-base sm:text-lg font-extrabold text-white leading-none drop-shadow-[0_1.5px_0_#072578]">
              Space Station
            </h2>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Space Station"
          className="glossy-close-orange absolute -top-2.5 -right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-transform focus-visible:outline-2 focus-visible:outline-[#38E8FF]"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Live Stars & Rockets Balances */}
        <div className="shrink-0 flex items-center justify-center gap-4 pb-2">
          <span className="inline-flex items-center gap-1 font-mono-num text-sm font-extrabold text-[#17275C]">
            <PaperStarIcon className="w-4 h-4" />
            <span>{lobbyStars.toLocaleString()}</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono-num text-sm font-extrabold text-[#17275C]">
            <PaperRocketIcon className="w-4 h-4" />
            <span>{lobbyRockets.toLocaleString()}</span>
          </span>
        </div>

        {/* Segmented Tabs: Crafts (7) | Trails (5) | Boosters */}
        <div
          role="tablist"
          className="shrink-0 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#EEDAC0] border border-[#DEC299]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'satellites'}
            onClick={() => setTab('satellites')}
            className={`h-8.5 rounded-xl font-display font-bold text-xs whitespace-nowrap transition-all ${
              tab === 'satellites' ? 'glossy-btn-blue' : 'text-[#1D2D66] hover:bg-[#FAF0DD]'
            }`}
          >
            Crafts ({SATELLITES.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'trails'}
            onClick={() => setTab('trails')}
            className={`h-8.5 rounded-xl font-display font-bold text-xs whitespace-nowrap transition-all ${
              tab === 'trails' ? 'glossy-btn-blue' : 'text-[#1D2D66] hover:bg-[#FAF0DD]'
            }`}
          >
            Trails ({TRAILS.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'boosters'}
            onClick={() => setTab('boosters')}
            className={`h-8.5 rounded-xl font-display font-bold text-xs whitespace-nowrap transition-all ${
              tab === 'boosters' ? 'glossy-btn-blue' : 'text-[#1D2D66] hover:bg-[#FAF0DD]'
            }`}
          >
            Boosters
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'satellites' ? (
          <div className="min-h-0 flex-1 overflow-y-auto mt-2.5 flex flex-col gap-2 pr-0.5">
            {SATELLITES.map((sat) => {
              const owned = ownedSatellites.includes(sat.id);
              const equipped = selectedSatellite === sat.id;
              const unlocked = isSatelliteUnlockedForPurchase(sat, records);
              const canAfford = lobbyStars >= sat.costStars;

              return (
                <div
                  key={sat.id}
                  className={`rounded-2xl border-2 p-2.5 flex items-center gap-2.5 ${
                    equipped ? 'bg-[#FFE6A0] border-[#F08814]' : 'bg-[#FFFDF8] border-[#E5D0AE]'
                  }`}
                >
                  <SatelliteIllustration id={sat.id} className="w-11 h-11 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-display font-extrabold text-xs sm:text-sm text-[#13245C] leading-tight">
                        {sat.name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#174CA6]">· {sat.tagline}</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#3B4B75] mt-0.5 leading-snug">
                      {sat.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {equipped ? (
                      <span className="glossy-btn-green inline-flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] font-display font-bold whitespace-nowrap">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    ) : owned ? (
                      <button
                        type="button"
                        onClick={() => onEquipSatellite(sat.id)}
                        className="glossy-btn-blue h-8 px-3 rounded-full text-[11px] font-display font-bold whitespace-nowrap"
                      >
                        Select
                      </button>
                    ) : !unlocked ? (
                      <div className="px-2 py-1 rounded-xl bg-[#EAE0CE] border border-[#D4C3A3] text-[#586280] text-[9px] font-display font-bold text-center leading-tight flex flex-col items-center gap-0.5">
                        <Lock className="w-3 h-3" />
                        <span>Sector {sat.unlockSector}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuySatellite(sat.id)}
                        className={`h-8 px-2.5 rounded-full text-[11px] font-display font-extrabold flex items-center gap-1 whitespace-nowrap ${
                          canAfford
                            ? 'glossy-btn-gold'
                            : 'bg-[#E6DAC4] text-[#7A746A] cursor-not-allowed border border-[#D2C2A8]'
                        }`}
                      >
                        <PaperStarIcon className="w-3.5 h-3.5" />
                        <span>{sat.costStars}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : tab === 'trails' ? (
          <div className="min-h-0 flex-1 overflow-y-auto mt-2.5 flex flex-col gap-2 pr-0.5">
            {TRAILS.map((trail) => {
              const owned = ownedTrails.includes(trail.id);
              const equipped = selectedTrail === trail.id;
              const canAfford = lobbyStars >= trail.costStars;

              return (
                <div
                  key={trail.id}
                  className={`rounded-2xl border-2 p-2.5 flex items-center gap-2.5 ${
                    equipped ? 'bg-[#FFE6A0] border-[#F08814]' : 'bg-[#FFFDF8] border-[#E5D0AE]'
                  }`}
                >
                  <TrailPreviewBadge id={trail.id} className="w-11 h-11 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-display font-extrabold text-xs sm:text-sm text-[#13245C] leading-tight">
                        {trail.name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#174CA6]">
                        · {trail.tagline}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#3B4B75] mt-0.5 leading-snug">
                      {trail.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {equipped ? (
                      <span className="glossy-btn-green inline-flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] font-display font-bold whitespace-nowrap">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    ) : owned ? (
                      <button
                        type="button"
                        onClick={() => onEquipTrail(trail.id)}
                        className="glossy-btn-blue h-8 px-3 rounded-full text-[11px] font-display font-bold whitespace-nowrap"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyTrail(trail.id)}
                        className={`h-8 px-2.5 rounded-full text-[11px] font-display font-extrabold flex items-center gap-1 whitespace-nowrap ${
                          canAfford
                            ? 'glossy-btn-gold'
                            : 'bg-[#E6DAC4] text-[#7A746A] cursor-not-allowed border border-[#D2C2A8]'
                        }`}
                      >
                        <PaperStarIcon className="w-3.5 h-3.5" />
                        <span>{trail.costStars}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto mt-2.5 flex flex-col gap-2.5 pr-0.5">
            {/* Booster Selector Cards */}
            <div className="grid grid-cols-3 gap-1.5">
              {BOOSTERS.map((b) => {
                const isSelected = selectedBooster === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBooster(b.id);
                      setBoosterQty(1);
                    }}
                    className={`rounded-2xl border-2 p-2 flex flex-col items-center text-center transition-all ${
                      isSelected
                        ? 'bg-[#FFE6A0] border-[#F08814]'
                        : 'bg-[#FFFDF8] border-[#E5D0AE] hover:border-[#3B82F6]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#0D1A5C] border border-[#2D68E8] flex items-center justify-center p-1">
                      <BoosterIcon kind={b.id} className="w-6 h-6" />
                    </div>
                    <span className="font-display font-extrabold text-[11px] text-[#13245C] mt-1 leading-tight whitespace-nowrap">
                      {b.shortName}
                    </span>
                    <span className="font-mono-num text-[10px] font-bold text-[#174CA6]">
                      Owned: {ownedMap[b.id]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Booster Detail Card */}
            <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E5D0AE] p-3">
              <div className="flex items-start gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-[#0D1A5C] border-2 border-[#1668E8] flex items-center justify-center shrink-0 p-1.5">
                  <BoosterIcon kind={activeBoosterDef.id} className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="font-display font-extrabold text-sm text-[#13245C]">
                      {activeBoosterDef.name}
                    </h3>
                    <span className="font-mono-num text-[11px] font-extrabold text-[#0D3C96]">
                      x{ownedMap[activeBoosterDef.id]}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#3B4B75] mt-0.5 leading-snug">
                    {activeBoosterDef.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-mono-num font-extrabold text-[#DF2E14]">
                      <PaperRocketIcon className="w-3.5 h-3.5" />
                      <span>{activeBoosterDef.costRockets} Rockets each</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#4B5F96]">
                      {activeBoosterDef.usageNote}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity + Buy CTA */}
            <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E5D0AE] p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-extrabold text-xs sm:text-sm text-[#13245C] leading-tight">
                  Select Quantity
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={effectiveQty <= 1}
                    onClick={() => setBoosterQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="glossy-btn-cream w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-45"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.8]" />
                  </button>

                  <span className="font-mono-num font-extrabold text-base text-[#13245C] w-6 text-center">
                    {effectiveQty}
                  </span>

                  <button
                    type="button"
                    disabled={effectiveQty >= maxAffordable}
                    onClick={() =>
                      setBoosterQty((q) => Math.min(maxAffordable, Math.max(1, q) + 1))
                    }
                    aria-label="Increase quantity"
                    className="glossy-btn-blue w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-45"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                  </button>

                  <button
                    type="button"
                    disabled={maxAffordable <= 0}
                    onClick={() => setBoosterQty(maxAffordable)}
                    className="glossy-btn-gold h-8 px-2.5 rounded-xl font-display font-extrabold text-[11px] whitespace-nowrap disabled:opacity-45"
                  >
                    MAX ({maxAffordable})
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={effectiveQty <= 0}
                onClick={() => {
                  onBuyBooster(activeBoosterDef.id, effectiveQty);
                  setBoosterQty(1);
                }}
                className={`w-full h-10 rounded-full font-display font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all ${
                  effectiveQty > 0
                    ? 'glossy-btn-coral'
                    : 'bg-[#E4D7C2] text-[#7D7466] cursor-not-allowed border-2 border-[#CEBFA6]'
                }`}
              >
                {effectiveQty > 0 ? (
                  <>
                    <span>
                      Buy {effectiveQty} {activeBoosterDef.shortName} ·
                    </span>
                    <PaperRocketIcon className="w-4 h-4 inline" />
                    <span>{totalRocketCost}</span>
                  </>
                ) : (
                  <span>Need {activeBoosterDef.costRockets} Rockets to buy</span>
                )}
              </button>
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
  ownedTrails: TrailId[];
  selectedTrail: TrailId;
  shieldsOwned: number;
  chronoOwned: number;
  magnetOwned: number;
  onEquipSatellite: (id: SatelliteId) => void;
  onEquipTrail: (id: TrailId) => void;
  onOpenSpaceStation: () => void;
  onClose: () => void;
}

export const EquipmentsModal: React.FC<EquipmentsModalProps> = ({
  ownedSatellites,
  selectedSatellite,
  ownedTrails,
  selectedTrail,
  shieldsOwned,
  chronoOwned,
  magnetOwned,
  onEquipSatellite,
  onEquipTrail,
  onOpenSpaceStation,
  onClose,
}) => {
  const ownedDefs = SATELLITES.filter((s) => ownedSatellites.includes(s.id));
  const ownedTrailDefs = TRAILS.filter((t) => ownedTrails.includes(t.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Equipments Hangar"
      className="safe-modal-pad fixed inset-0 z-40 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter station-modal-frame relative w-full max-w-[356px] px-3.5 pb-4 pt-7 flex flex-col max-h-[84dvh]"
      >
        <div className="pointer-events-none absolute -top-5 inset-x-0 flex justify-center z-20">
          <div className="station-header-pill w-fit h-10 pl-1.5 pr-4 rounded-full inline-flex items-center gap-2 whitespace-nowrap">
            <div className="w-8 h-8 rounded-full bg-[#FF6814] border-2 border-[#FFE699] flex items-center justify-center text-white shrink-0">
              <Wrench className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="font-display text-base sm:text-lg font-extrabold text-white leading-none drop-shadow-[0_1.5px_0_#072578]">
              Equipments
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Equipments"
          className="glossy-close-orange absolute -top-2.5 -right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-transform focus-visible:outline-2 focus-visible:outline-[#38E8FF]"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <p className="shrink-0 text-[11px] sm:text-xs font-bold text-[#253B7A] text-center pb-2">
          Your owned crafts, ribbon trails &amp; boosters
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-2.5 pr-0.5">
          {/* Owned Satellites */}
          <div>
            <div className="px-2.5 py-1 rounded-xl bg-[#CFE5FF] border border-[#9EC8FA] mb-1.5">
              <h3 className="font-display font-extrabold text-[11px] tracking-wider text-[#123A8C]">
                Owned Crafts ({ownedDefs.length}/{SATELLITES.length})
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {ownedDefs.map((sat) => {
                const isEquipped = selectedSatellite === sat.id;
                return (
                  <div
                    key={sat.id}
                    className={`rounded-2xl border-2 p-2.5 flex items-center gap-2.5 ${
                      isEquipped ? 'bg-[#FFE6A0] border-[#F08814]' : 'bg-[#FFFDF8] border-[#E5D0AE]'
                    }`}
                  >
                    <SatelliteIllustration id={sat.id} className="w-10 h-10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-extrabold text-xs sm:text-sm text-[#13245C] leading-tight">
                        {sat.name}
                      </div>
                      <p className="text-[10px] font-semibold text-[#3B4B75] leading-snug mt-0.5">
                        {sat.description}
                      </p>
                    </div>
                    {isEquipped ? (
                      <span className="glossy-btn-green shrink-0 px-2.5 h-8 rounded-full text-[11px] font-display font-bold flex items-center gap-1 whitespace-nowrap">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onEquipSatellite(sat.id)}
                        className="glossy-btn-blue shrink-0 h-8 px-3 rounded-full text-[11px] font-display font-bold whitespace-nowrap"
                      >
                        Select
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Owned Cosmetic Trails */}
          <div>
            <div className="px-2.5 py-1 rounded-xl bg-[#CFE5FF] border border-[#9EC8FA] mb-1.5">
              <h3 className="font-display font-extrabold text-[11px] tracking-wider text-[#123A8C]">
                Cosmetic Trails ({ownedTrailDefs.length}/{TRAILS.length})
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {ownedTrailDefs.map((trail) => {
                const isEquipped = selectedTrail === trail.id;
                return (
                  <div
                    key={trail.id}
                    className={`rounded-2xl border-2 p-2 flex items-center gap-2.5 ${
                      isEquipped ? 'bg-[#FFE6A0] border-[#F08814]' : 'bg-[#FFFDF8] border-[#E5D0AE]'
                    }`}
                  >
                    <TrailPreviewBadge id={trail.id} className="w-9 h-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-extrabold text-xs text-[#13245C] leading-tight">
                        {trail.name}
                      </div>
                      <div className="text-[10px] font-semibold text-[#3B4B75] truncate">
                        {trail.tagline}
                      </div>
                    </div>
                    {isEquipped ? (
                      <span className="glossy-btn-green shrink-0 px-2.5 h-7.5 rounded-full text-[11px] font-display font-bold flex items-center gap-1 whitespace-nowrap">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onEquipTrail(trail.id)}
                        className="glossy-btn-blue shrink-0 h-7.5 px-3 rounded-full text-[11px] font-display font-bold whitespace-nowrap"
                      >
                        Equip
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Owned Boosters Inventory */}
          <div>
            <div className="px-2.5 py-1 rounded-xl bg-[#CFE5FF] border border-[#9EC8FA] mb-1.5">
              <h3 className="font-display font-extrabold text-[11px] tracking-wider text-[#123A8C]">
                In-Run Boosters
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E5D0AE] p-2 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-[#0D1A5C] flex items-center justify-center p-1">
                  <PaperShieldIcon className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-[10px] text-[#13245C] mt-1">
                  Shields
                </span>
                <span className="font-mono-num font-extrabold text-sm text-[#1342A8]">
                  x{shieldsOwned}
                </span>
              </div>
              <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E5D0AE] p-2 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-[#0D1A5C] flex items-center justify-center p-1">
                  <ChronoPulseIcon className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-[10px] text-[#13245C] mt-1">
                  Slow-Mo
                </span>
                <span className="font-mono-num font-extrabold text-sm text-[#1342A8]">
                  x{chronoOwned}
                </span>
              </div>
              <div className="rounded-2xl bg-[#FFFDF8] border-2 border-[#E5D0AE] p-2 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-[#0D1A5C] flex items-center justify-center p-1">
                  <StarMagnetIcon className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-[10px] text-[#13245C] mt-1">
                  Magnets
                </span>
                <span className="font-mono-num font-extrabold text-sm text-[#1342A8]">
                  x{magnetOwned}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSpaceStation}
          className="glossy-btn-blue shrink-0 mt-3 w-full h-10 rounded-full font-display font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5"
        >
          <Radio className="w-4 h-4" />
          <span>Visit Space Station Shop</span>
        </button>
      </div>
    </div>
  );
};
