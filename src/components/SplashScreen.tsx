import React, { useEffect, useState } from 'react';
import { PaperLogo } from './PaperLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

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
      className={`fixed inset-0 z-50 paper-cream-surface flex flex-col items-center justify-center px-6 transition-opacity duration-350 cursor-pointer ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Stitched Twine Ring + Framed Paper Game Icon */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 180 180"
          className="animate-splash-ring absolute w-40 h-40 sm:w-44 sm:h-44 pointer-events-none"
          aria-hidden="true"
        >
          <circle
            cx="90"
            cy="90"
            r="78"
            fill="none"
            stroke="#8B765B"
            strokeWidth="1.8"
            strokeDasharray="6 7"
          />
          <circle cx="90" cy="12" r="5" fill="#C75C3B" />
          <circle cx="90" cy="12" r="2.2" fill="#F5EFE2" />
        </svg>

        <div className="animate-splash-icon relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-[3px] border-[#27324F] bg-[#1E243B] paper-cutout-shadow flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-16 h-16" aria-hidden="true">
            <circle cx="24" cy="24" r="18" fill="none" stroke="#E8D5B5" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="24" cy="24" r="11" fill="none" stroke="#F3C24F" strokeWidth="1.6" strokeDasharray="3 3" />
            <circle cx="24" cy="24" r="5.5" fill="#F08A7B" />
            <circle cx="35" cy="24" r="2.8" fill="#FAF3E6" />
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

      {/* Animated Layered Paper-Cut Game Name */}
      <div className="animate-splash-title mt-7 relative flex items-center justify-center">
        {logoFailed ? (
          <PaperLogo className="w-56 sm:w-64 h-auto" />
        ) : (
          <img
            src="./assets/lobby/logo.png"
            alt="Pocket Orbit"
            referrerPolicy="no-referrer"
            draggable={false}
            className="w-56 sm:w-64 h-auto object-contain"
            onError={() => setLogoFailed(true)}
          />
        )}
      </div>

      <p className="animate-splash-sub text-xs sm:text-sm font-semibold text-[#5E5447] tracking-wide mt-2">
        Close is fast · Far is slow
      </p>
    </div>
  );
};
