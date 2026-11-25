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
      className={`fixed inset-0 z-50 bg-[radial-gradient(circle_at_50%_40%,#1F2F9C_0%,#0E1454_55%,#070A2B_100%)] flex flex-col items-center justify-center px-6 transition-opacity duration-350 cursor-pointer ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Glowing Cyan-Gold Orbital Ring + Launch Rocket Icon */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 180 180"
          className="animate-splash-ring absolute w-44 h-44 sm:w-48 sm:h-48 pointer-events-none drop-shadow-[0_0_12px_rgba(56,232,255,0.65)]"
          aria-hidden="true"
        >
          <circle
            cx="90"
            cy="90"
            r="78"
            fill="none"
            stroke="#3DF2FF"
            strokeWidth="2.2"
            strokeDasharray="7 7"
          />
          <circle cx="90" cy="12" r="5.5" fill="#FFD426" />
          <circle cx="90" cy="12" r="2.5" fill="#FFFFFF" />
        </svg>

        <div className="animate-splash-icon relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-[3px] border-[#3DF2FF] bg-[radial-gradient(circle_at_50%_30%,#2743BA_0%,#0B1248_100%)] shadow-[0_0_28px_rgba(56,232,255,0.45)] flex items-center justify-center p-2">
          <img
            src="./assets/cosmic/rocket.png"
            alt="Pocket Orbit Rocket"
            referrerPolicy="no-referrer"
            draggable={false}
            className="h-full w-auto object-contain drop-shadow-[0_6px_14px_rgba(255,152,20,0.55)]"
          />
        </div>
      </div>

      {/* Animated Glossy Cosmic Game Name */}
      <div className="animate-splash-title mt-7 relative flex items-center justify-center">
        {logoFailed ? (
          <PaperLogo className="w-60 sm:w-72 h-auto" />
        ) : (
          <img
            src="./assets/cosmic/logo.png"
            alt="Pocket Orbit"
            referrerPolicy="no-referrer"
            draggable={false}
            className="w-64 sm:w-76 h-auto object-contain drop-shadow-[0_10px_24px_rgba(45,140,255,0.55)]"
            onError={() => setLogoFailed(true)}
          />
        )}
      </div>

      <p className="animate-splash-sub text-xs sm:text-sm font-bold text-[#7CE7FF] tracking-wide mt-2">
        Close is fast · Far is slow
      </p>
    </div>
  );
};
