import React from 'react';
import { X, Check, Calendar, ClipboardCheck } from 'lucide-react';
import {
  canClaimDailyLogin,
  DAILY_LOGIN_REWARDS,
  getNextDailyLoginDay,
} from '../game/storage';
import { DailyLoginState, DailyMissionState } from '../types';
import { PaperRocketIcon, PaperStarIcon } from './PaperCraftIcons';

interface DailyLoginModalProps {
  loginState: DailyLoginState;
  onClaim: () => void;
  onClose: () => void;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({
  loginState,
  onClaim,
  onClose,
}) => {
  const claimable = canClaimDailyLogin(loginState);
  const activeDay = getNextDailyLoginDay(loginState);
  const completedInCycle = claimable ? loginState.claimedDays % 7 : loginState.claimedDays;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily Login Rewards"
      className="safe-modal-pad fixed inset-0 z-40 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter cosmic-modal-frame relative w-full max-w-[348px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Daily Login"
          className="glossy-close-orange absolute -top-2.5 -right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-transform focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="cosmic-modal-inner p-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#3D58C4]/50">
            <div className="w-9 h-9 rounded-xl bg-[#1668E8] border-2 border-[#7CCBFF] text-white flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#FFCC29] leading-tight drop-shadow-[0_2px_0_#A63A00]">
                Daily Login
              </h2>
              <p className="text-[11px] font-bold text-[#7CE7FF]">
                7-day supply drop of Stars &amp; Rockets
              </p>
            </div>
          </div>

          {/* Days 1-6 Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {DAILY_LOGIN_REWARDS.slice(0, 6).map((item) => {
              const isClaimed = item.day <= completedInCycle;
              const isToday = claimable && item.day === activeDay;
              return (
                <div
                  key={item.day}
                  className={`relative rounded-xl p-2 flex flex-col items-center text-center transition-all ${
                    isToday
                      ? 'bg-[#C94A14] border-2 border-[#FFD426]'
                      : isClaimed
                        ? 'bg-[#103864]/85 border-2 border-[#3CE886]/70'
                        : 'cosmic-glass-card'
                  }`}
                >
                  <span
                    className={`font-mono-num text-[10px] font-bold ${
                      isToday ? 'text-[#FFF1B5]' : 'text-[#89B8F8]'
                    }`}
                  >
                    Day {item.day}
                  </span>
                  <div className="my-1">
                    {item.rewardType === 'stars' ? (
                      <PaperStarIcon className="w-6 h-6" />
                    ) : (
                      <PaperRocketIcon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="font-mono-num text-[11px] font-extrabold text-white leading-tight">
                    +{item.amount} {item.rewardType === 'stars' ? 'Stars' : 'Rockets'}
                  </span>
                  {isClaimed && (
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[#18B848] border border-white text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day 7 Grand Supply Row */}
          {(() => {
            const day7 = DAILY_LOGIN_REWARDS[6];
            const isClaimed = completedInCycle >= 7;
            const isToday = claimable && activeDay === 7;
            return (
              <div
                className={`relative mt-2 rounded-xl px-3 py-2 flex items-center justify-between gap-2.5 ${
                  isToday
                    ? 'bg-[#C94A14] border-2 border-[#FFD426]'
                    : isClaimed
                      ? 'bg-[#103864]/85 border-2 border-[#3CE886]/70'
                      : 'cosmic-glass-card'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PaperRocketIcon className="w-8 h-8 shrink-0" />
                  <div>
                    <div className="font-display font-extrabold text-xs sm:text-sm text-white">
                      Day 7 Grand Supply
                    </div>
                    <div className="font-mono-num text-[11px] font-extrabold text-[#FFD426]">
                      +{day7.amount} Rockets
                    </div>
                  </div>
                </div>
                {isClaimed ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#18B848] text-white text-[10px] font-display font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Claimed
                  </span>
                ) : (
                  <span className="font-mono-num text-[11px] font-bold text-[#89C8FF]">Day 7</span>
                )}
              </div>
            );
          })()}

          <button
            type="button"
            disabled={!claimable}
            onClick={onClaim}
            className={`mt-3.5 w-full h-10 rounded-full font-display font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all ${
              claimable
                ? 'glossy-btn-coral'
                : 'bg-[#18226B] text-[#7D91C9] cursor-not-allowed border border-[#3B50A8]'
            }`}
          >
            <span>
              {claimable
                ? `Claim Day ${activeDay} Reward`
                : 'Today’s Login Reward Claimed'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface DailyMissionModalProps {
  missionState: DailyMissionState;
  onClaimMission: (missionId: string) => void;
  onClose: () => void;
}

export const DailyMissionModal: React.FC<DailyMissionModalProps> = ({
  missionState,
  onClaimMission,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily Missions"
      className="safe-modal-pad fixed inset-0 z-40 bg-[#040724]/78 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter cosmic-modal-frame relative w-full max-w-[348px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Daily Missions"
          className="glossy-close-orange absolute -top-2.5 -right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-transform focus-visible:outline-2 focus-visible:outline-[#3DF2FF]"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="cosmic-modal-inner p-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#3D58C4]/50">
            <div className="w-9 h-9 rounded-xl bg-[#FF6814] border-2 border-[#FFE699] text-white flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#FFCC29] leading-tight drop-shadow-[0_2px_0_#A63A00]">
                Daily Missions
              </h2>
              <p className="text-[11px] font-bold text-[#7CE7FF]">
                2 fresh orbital objectives every day
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-3">
            {missionState.missions.map((m) => {
              const pct = Math.min(100, Math.round((m.progress / Math.max(1, m.target)) * 100));
              const ready = !m.claimed && m.progress >= m.target;
              return (
                <div key={m.id} className="cosmic-glass-card rounded-2xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className={`inline-block text-[9px] font-display font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          m.difficulty === 'easy'
                            ? 'bg-[#12543B] text-[#6CFFBA] border border-[#3CE886]/50'
                            : 'bg-[#5A1F38] text-[#FFB08A] border border-[#FF7842]/50'
                        }`}
                      >
                        {m.difficulty === 'easy' ? 'Easy' : 'Medium / Hard'}
                      </span>
                      <h3 className="font-display font-bold text-xs sm:text-sm text-white mt-1 leading-snug">
                        {m.title}
                      </h3>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0C1452] border border-[#5B8EFF]/70">
                      {m.rewardType === 'stars' ? (
                        <PaperStarIcon className="w-4 h-4" />
                      ) : (
                        <PaperRocketIcon className="w-4 h-4" />
                      )}
                      <span className="font-mono-num text-[11px] font-extrabold text-[#FFD426]">
                        +{m.rewardAmount}
                      </span>
                    </div>
                  </div>

                  {/* Solid Progress Bar */}
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <div className="flex-1 h-2.5 rounded-full bg-[#090E3A] overflow-hidden border border-[#3D5BC4]/70">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          m.claimed || ready ? 'bg-[#18B848]' : 'bg-[#2BB8FF]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono-num text-[11px] font-bold text-[#9AC8FF] shrink-0">
                      {m.progress}/{m.target}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-end">
                    {m.claimed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#12543B] border border-[#3CE886]/60 text-[#6CFFBA] text-[11px] font-display font-bold">
                        <Check className="w-3 h-3 stroke-[3]" /> Claimed
                      </span>
                    ) : ready ? (
                      <button
                        type="button"
                        onClick={() => onClaimMission(m.id)}
                        className="glossy-btn-green h-8 px-3.5 rounded-full text-[11px] font-display font-extrabold transition-all"
                      >
                        Claim +{m.rewardAmount} {m.rewardType === 'stars' ? 'Stars' : 'Rockets'}
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-[#7F98D4]">In progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
