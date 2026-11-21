import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setFadingOut(true);
    }, 1550);

    const doneTimer = window.setTimeout(() => {
      onFinish();
    }, 1950);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFadingOut(true);
    window.setTimeout(onFinish, 180);
  };

  return (
    <div
      onPointerDown={handleSkip}
      role="presentation"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060A16] px-6 transition-opacity duration-350 cursor-pointer ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Orbital Ring + Game Icon */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 180 180"
          className="animate-splash-ring absolute w-40 h-40 sm:w-44 sm:h-44 pointer-events-none"
          aria-hidden="true"
        >
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />
          <circle cx="90" cy="10" r="3.5" fill="#FDE68A" />
        </svg>

        <div className="animate-splash-icon relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border border-sky-400/35 bg-[#070B1E] shadow-[0_14px_42px_rgba(2,6,23,0.75)] flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-16 h-16" aria-hidden="true">
            <circle cx="24" cy="24" r="18" fill="none" stroke="#38BDF8" strokeOpacity="0.5" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="11" fill="none" stroke="#FBBF24" strokeOpacity="0.85" strokeWidth="1.6" />
            <circle cx="24" cy="24" r="5" fill="#38BDF8" />
            <circle cx="35" cy="24" r="2.6" fill="#FDE68A" />
          </svg>
          <img
            src="./icon-512.png"
            alt="Pocket Orbit"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Animated Game Name */}
      <h1 className="animate-splash-title font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-7">
        Pocket Orbit
      </h1>

      <p className="animate-splash-sub text-xs sm:text-sm text-slate-400 tracking-wide mt-2">
        Close is fast · Far is slow
      </p>
    </div>
  );
};
