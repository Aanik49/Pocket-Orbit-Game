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
      className="fixed inset-0 z-40 bg-[#14182B]/72 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-md rounded-3xl border-[3px] border-[#27324F] p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-dashed border-[#D3C4AA]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4D78A8] text-[#FAF3E6] flex items-center justify-center shadow-[0_3px_0_#34567D] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#27324F] leading-tight">
                Daily Login
              </h2>
              <p className="text-xs font-semibold text-[#6A5E4E] mt-0.5">
                7-day supply drop of Stars & Rockets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Daily Login"
            className="paper-btn-cream w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-[#27324F]" />
          </button>
        </div>

        {/* Days 1-6 grid + Day 7 grand prize banner */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {DAILY_LOGIN_REWARDS.slice(0, 6).map((item) => {
            const isClaimed = item.day <= completedInCycle;
            const isToday = claimable && item.day === activeDay;
            return (
              <div
                key={item.day}
                className={`relative rounded-2xl border-2 p-2.5 flex flex-col items-center text-center ${
                  isToday
                    ? 'bg-[#FFF3CC] border-[#C75C3B] shadow-[0_3px_0_#C75C3B]'
                    : isClaimed
                      ? 'bg-[#E6F1E6] border-[#6DA174]'
                      : 'bg-[#FCF8EE] border-dashed border-[#CBBBA0]'
                }`}
              >
                <span className="font-mono-num text-[11px] font-bold text-[#5E5447]">
                  Day {item.day}
                </span>
                <div className="my-1.5">
                  {item.rewardType === 'stars' ? (
                    <PaperStarIcon className="w-7 h-7" />
                  ) : (
                    <PaperRocketIcon className="w-7 h-7" />
                  )}
                </div>
                <span className="font-mono-num text-xs font-bold text-[#27324F]">
                  +{item.amount} {item.rewardType === 'stars' ? 'Stars' : 'Rockets'}
                </span>
                {isClaimed && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#5F9E73] text-[#FAF3E6] flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Day 7 Grand Prize Row */}
        {(() => {
          const day7 = DAILY_LOGIN_REWARDS[6];
          const isClaimed = completedInCycle >= 7;
          const isToday = claimable && activeDay === 7;
          return (
            <div
              className={`relative mt-2.5 rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 ${
                isToday
                  ? 'bg-[#FFF0BD] border-[#C75C3B] shadow-[0_3px_0_#C75C3B]'
                  : isClaimed
                    ? 'bg-[#E6F1E6] border-[#6DA174]'
                    : 'bg-[#FCF8EE] border-dashed border-[#CBBBA0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <PaperRocketIcon className="w-9 h-9 shrink-0" />
                <div>
                  <div className="font-display font-bold text-sm text-[#27324F]">
                    Day 7 Grand Supply
                  </div>
                  <div className="font-mono-num text-xs font-bold text-[#C75C3B]">
                    +{day7.amount} Rockets
                  </div>
                </div>
              </div>
              {isClaimed ? (
                <span className="px-2.5 py-1 rounded-full bg-[#5F9E73] text-[#FAF3E6] text-xs font-display font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Claimed
                </span>
              ) : (
                <span className="font-mono-num text-xs font-bold text-[#6A5E4E]">
                  Day 7
                </span>
              )}
            </div>
          );
        })()}

        <button
          type="button"
          disabled={!claimable}
          onClick={onClaim}
          className={`mt-5 w-full h-12 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
            claimable
              ? 'paper-btn-terracotta relative'
              : 'bg-[#E2D8C4] text-[#837766] cursor-not-allowed border-2 border-[#CFC2AA]'
          }`}
        >
          {claimable && (
            <span
              aria-hidden="true"
              className="absolute inset-1.5 rounded-xl border border-dashed border-[#FAF3E6]/55 pointer-events-none"
            />
          )}
          <span className="relative z-10">
            {claimable
              ? `Claim Day ${activeDay} Reward`
              : 'Today’s Login Reward Claimed'}
          </span>
        </button>
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
      className="fixed inset-0 z-40 bg-[#14182B]/72 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-enter paper-cream-surface paper-cutout-shadow w-full max-w-md rounded-3xl border-[3px] border-[#27324F] p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-dashed border-[#D3C4AA]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4D78A8] text-[#FAF3E6] flex items-center justify-center shadow-[0_3px_0_#34567D] shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#27324F] leading-tight">
                Daily Missions
              </h2>
              <p className="text-xs font-semibold text-[#6A5E4E] mt-0.5">
                2 fresh orbital objectives every day
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Daily Missions"
            className="paper-btn-cream w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-[#27324F]" />
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {missionState.missions.map((m) => {
            const pct = Math.min(100, Math.round((m.progress / Math.max(1, m.target)) * 100));
            const ready = !m.claimed && m.progress >= m.target;
            return (
              <div
                key={m.id}
                className="rounded-2xl bg-[#FCF8EE] border-2 border-[#D4C5AA] p-3.5 shadow-[0_3px_0_rgba(39,50,79,0.12)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={`inline-block text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        m.difficulty === 'easy'
                          ? 'bg-[#DCECE0] text-[#3B784E]'
                          : 'bg-[#F5E0D6] text-[#B84B2E]'
                      }`}
                    >
                      {m.difficulty === 'easy' ? 'Easy' : 'Medium / Hard'}
                    </span>
                    <h3 className="font-display font-bold text-sm sm:text-base text-[#27324F] mt-1">
                      {m.title}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4EAD2] border border-[#D4C5AA]">
                    {m.rewardType === 'stars' ? (
                      <PaperStarIcon className="w-4 h-4" />
                    ) : (
                      <PaperRocketIcon className="w-4 h-4" />
                    )}
                    <span className="font-mono-num text-xs font-bold text-[#27324F]">
                      +{m.rewardAmount}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2.5 rounded-full bg-[#E5DBC7] overflow-hidden border border-[#CFC2AA]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        m.claimed || ready ? 'bg-[#5F9E73]' : 'bg-[#4D78A8]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono-num text-xs font-bold text-[#5E5447] shrink-0">
                    {m.progress}/{m.target}
                  </span>
                </div>

                <div className="mt-3 flex justify-end">
                  {m.claimed ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E6F1E6] text-[#3B784E] text-xs font-display font-bold">
                      <Check className="w-3.5 h-3.5" /> Claimed
                    </span>
                  ) : ready ? (
                    <button
                      type="button"
                      onClick={() => onClaimMission(m.id)}
                      className="paper-btn-sage h-9 px-4 rounded-xl text-xs font-display font-bold transition-all"
                    >
                      Claim +{m.rewardAmount} {m.rewardType === 'stars' ? 'Stars' : 'Rockets'}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#857865]">
                      In progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
