import React from 'react';
import { ChapterMeta, SatelliteId } from '../types';

export const PaperStarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2.2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.3 6 20.6l1.3-6.7-5-4.7 6.8-.8L12 2.2z"
      fill="#F3C24F"
      stroke="#B97D19"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M12 4.4l1.6 3.5 3.8.5-2.8 2.6.7 3.8L12 12.9"
      fill="#FFF2B2"
      opacity="0.65"
    />
  </svg>
);

export const PaperRocketIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
    <g transform="rotate(35 14 14)">
      {/* Flame */}
      <path d="M11 21 L14 27 L17 21 Z" fill="#F3C24F" />
      <path d="M12.3 21 L14 24.8 L15.7 21 Z" fill="#E87D3E" />
      {/* Side fins */}
      <path d="M9.5 14.5 L5 21 L10 20 Z" fill="#C75C3B" />
      <path d="M18.5 14.5 L23 21 L18 20 Z" fill="#C75C3B" />
      {/* Body */}
      <path
        d="M14 2.5 C18.5 7 18.8 14.5 17.6 20.5 L10.4 20.5 C9.2 14.5 9.5 7 14 2.5 Z"
        fill="#FAF5E9"
        stroke="#27324F"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Nose */}
      <path d="M14 2.5 C16.4 5.2 17.4 7.4 17.6 9 L10.4 9 C10.6 7.4 11.6 5.2 14 2.5 Z" fill="#C75C3B" />
      {/* Porthole */}
      <circle cx="14" cy="13.5" r="2.7" fill="#4D78A8" stroke="#27324F" strokeWidth="0.9" />
      <circle cx="14" cy="13.5" r="1.2" fill="#D9ECF7" />
    </g>
  </svg>
);

export const PaperShieldIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
    <path
      d="M14 2.5 L23.5 6.4 V13.2 C23.5 19.2 19.4 23.6 14 25.6 C8.6 23.6 4.5 19.2 4.5 13.2 V6.4 L14 2.5 Z"
      fill="#75B8DE"
      stroke="#27324F"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M14 5.2 L20.8 8 V13 C20.8 17.6 17.8 20.9 14 22.6 C10.2 20.9 7.2 17.6 7.2 13 V8 L14 5.2 Z"
      fill="#A9DAF3"
      stroke="#FAF3E6"
      strokeWidth="1.1"
      strokeDasharray="2.5 2"
    />
    <path d="M14.8 8.5 L11 14.5 H14 L13.2 19.5 L17.5 13.2 H14.4 L14.8 8.5 Z" fill="#F3C24F" />
  </svg>
);

export const SatelliteIllustration: React.FC<{
  id: SatelliteId;
  className?: string;
}> = ({ id, className = 'w-14 h-14' }) => {
  const isTiny = id === 'tinny' || id === 'nano_stopper';
  const scale = isTiny ? 0.74 : 1;

  let wingTop = '#A8C8DF';
  let wingBot = '#7E9FBE';
  let hull = '#F5C4B6';
  let hullHi = '#FAF3E6';
  let ribbon = '#C23B58';

  if (id === 'tinny') {
    wingTop = '#A8DFC4';
    wingBot = '#6BAE8E';
    hull = '#F6DF9C';
    hullHi = '#FFF8E2';
    ribbon = '#5EB892';
  } else if (id === 'heavy') {
    wingTop = '#F2C763';
    wingBot = '#C28F2B';
    hull = '#637FA8';
    hullHi = '#92B0D4';
    ribbon = '#E3A43B';
  } else if (id === 'nano_stopper') {
    wingTop = '#D7C2F2';
    wingBot = '#9F84C9';
    hull = '#F7E7C6';
    hullHi = '#FFFBF0';
    ribbon = '#A588D8';
  }

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Soft dark felt coin badge */}
      <circle cx="32" cy="32" r="29" fill="#232942" />
      <circle
        cx="32"
        cy="32"
        r="25"
        fill="none"
        stroke="#E8D5B5"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        strokeDasharray="3.5 3.5"
      />

      {/* Heavy outer-guard arc */}
      {id === 'heavy' && (
        <path
          d="M16 20 A21 21 0 0 1 48 20"
          fill="none"
          stroke="#F3C24F"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}

      {/* Nano Stopper chrono clock ring */}
      {id === 'nano_stopper' && (
        <g stroke="#E3D4F8" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="48" cy="18" r="7" fill="#3B355C" stroke="#F3C24F" strokeWidth="1.4" />
          <line x1="48" y1="18" x2="48" y2="14" />
          <line x1="48" y1="18" x2="51.5" y2="18" />
        </g>
      )}

      <g transform={`translate(32 32) rotate(-32) scale(${scale})`}>
        {/* Flowing ribbon tail */}
        <path
          d="M-2.5 11 C-7 17, 4 21, -2 27 L3 25 C8 20, -2 16, 2.5 11 Z"
          fill={ribbon}
        />
        {/* Solar wings */}
        <rect x="-21" y="-5.5" width="14" height="5.5" fill={wingTop} />
        <rect x="7" y="-5.5" width="14" height="5.5" fill={wingTop} />
        <rect x="-21" y="0" width="14" height="5.5" fill={wingBot} />
        <rect x="7" y="0" width="14" height="5.5" fill={wingBot} />
        <line x1="-14" y1="-5.5" x2="-14" y2="5.5" stroke="#27324F" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="14" y1="-5.5" x2="14" y2="5.5" stroke="#27324F" strokeOpacity="0.35" strokeWidth="1" />
        {/* Hull */}
        <rect x="-7" y="-12" width="14" height="24" rx="4.5" fill={hull} />
        <rect x="-5.8" y="-10.5" width="5.8" height="21" rx="2.8" fill={hullHi} />
        {id === 'heavy' && <rect x="-7" y="-1.8" width="14" height="3.6" fill="#F3C24F" />}
        <circle cx="0" cy="-5" r="2.8" fill="#F3C24F" />
      </g>
    </svg>
  );
};

/**
 * Handcrafted paper-craft sector diorama dome icons for the 6 floating lobby island sectors.
 */
export const SectorDomeArt: React.FC<{
  theme: ChapterMeta['domeTheme'];
  locked?: boolean;
  className?: string;
}> = ({ theme, locked = false, className = 'w-20 h-16 sm:w-24 sm:h-20' }) => {
  return (
    <svg
      viewBox="0 0 110 86"
      className={`${className} ${locked ? 'saturate-[0.55] opacity-90' : ''}`}
      aria-hidden="true"
    >
      {/* Ground stone base disc */}
      <ellipse cx="55" cy="70" rx="45" ry="12" fill="#4C5675" />
      <ellipse cx="55" cy="66" rx="43" ry="10.5" fill="#7D88A6" />
      <ellipse cx="55" cy="65" rx="38" ry="8.5" fill="#8B96B4" />

      {theme === 'asteroid' && (
        <g>
          {/* Floating mini pebbles */}
          <circle cx="24" cy="24" r="4" fill="#6F6783" />
          <circle cx="52" cy="14" r="6" fill="#7B728F" />
          <circle cx="84" cy="24" r="4.5" fill="#6A627D" />
          {/* Cratered grey-violet asteroid dome */}
          <path d="M22 65 A33 33 0 0 1 88 65 Z" fill="#807794" />
          <path d="M26 65 A29 29 0 0 1 82 65 Z" fill="#9289A6" />
          <ellipse cx="42" cy="48" rx="6.5" ry="5" fill="#635B75" />
          <ellipse cx="64" cy="42" rx="5.5" ry="4.5" fill="#635B75" />
          <ellipse cx="73" cy="56" rx="4" ry="3" fill="#635B75" />
          <ellipse cx="52" cy="57" rx="3.5" ry="2.5" fill="#6C6380" />
          {/* Little felt pine trees */}
          <polygon points="18,65 24,48 30,65" fill="#5D8F68" />
          <polygon points="80,65 86,46 92,65" fill="#4F7F5B" />
        </g>
      )}

      {theme === 'nebula' && (
        <g>
          {/* Glowing purple cosmos glass dome */}
          <path d="M21 65 A34 34 0 0 1 89 65 Z" fill="#734CC2" />
          <path d="M25 65 A30 30 0 0 1 85 65 Z" fill="#2A2666" />
          {/* Swirling spiral galaxy */}
          <ellipse cx="55" cy="48" rx="22" ry="12" transform="rotate(-18 55 48)" fill="#9E5CE8" opacity="0.55" />
          <ellipse cx="55" cy="48" rx="14" ry="7" transform="rotate(-18 55 48)" fill="#F3B860" opacity="0.85" />
          <ellipse cx="55" cy="48" rx="6" ry="3.5" transform="rotate(-18 55 48)" fill="#FFF4D2" />
          {/* Sparkles */}
          <circle cx="38" cy="40" r="1.8" fill="#FFF2B2" />
          <circle cx="72" cy="42" r="2" fill="#A9E5F5" />
          <circle cx="64" cy="56" r="1.6" fill="#FFF2B2" />
          {/* Dome glass rim & bushes */}
          <path d="M22 65 A33 33 0 0 1 88 65" fill="none" stroke="#BA9CF2" strokeWidth="3" />
          <circle cx="22" cy="64" r="5" fill="#5D8F68" />
          <circle cx="88" cy="64" r="5" fill="#5D8F68" />
        </g>
      )}

      {theme === 'station' && (
        <g>
          {/* Satellite dish antenna on top */}
          <line x1="55" y1="32" x2="55" y2="22" stroke="#4F6B8C" strokeWidth="2.8" />
          <path d="M45 18 Q55 27 65 18" fill="#B5D0E6" stroke="#3F5978" strokeWidth="1.6" />
          <circle cx="55" cy="17" r="2.2" fill="#4D78A8" />
          {/* Tiered white-blue space station dome */}
          <path d="M22 65 Q24 31 55 31 Q86 31 88 65 Z" fill="#C7D6E6" />
          <path d="M27 65 Q29 35 55 35 Q81 35 83 65 Z" fill="#EDF3F8" />
          {/* Blue glowing ring & viewport windows */}
          <path d="M24 55 Q55 61 86 55" fill="none" stroke="#53A8D8" strokeWidth="4" strokeLinecap="round" />
          <rect x="41" y="42" width="8" height="7" rx="2.5" fill="#4A95C7" />
          <rect x="52" y="42" width="8" height="7" rx="2.5" fill="#4A95C7" />
          <rect x="63" y="42" width="8" height="7" rx="2.5" fill="#4A95C7" />
          {/* Side accent shrubs */}
          <circle cx="20" cy="64" r="4.5" fill="#5D8F68" />
          <circle cx="90" cy="64" r="4.5" fill="#5D8F68" />
        </g>
      )}

      {theme === 'lunar' && (
        <g>
          {/* Orbiting terracotta crescent moon */}
          <circle cx="79" cy="24" r="8" fill="#E3976B" />
          <circle cx="82" cy="22" r="6.5" fill="#F5EFE2" opacity="0.35" />
          {/* Layered blush-coral moon canyon dome */}
          <path d="M22 65 A33 33 0 0 1 88 65 Z" fill="#C9745B" />
          <path d="M26 65 A29 29 0 0 1 84 65 Z" fill="#DE9278" />
          <path d="M29 53 Q55 44 81 53 L84 65 L26 65 Z" fill="#B55F48" />
          <ellipse cx="44" cy="46" rx="5.5" ry="4" fill="#9E4E3B" />
          <ellipse cx="66" cy="56" rx="6" ry="4" fill="#8C4231" />
          {/* Stitched gravity arc */}
          <path
            d="M17 50 Q55 12 93 50"
            fill="none"
            stroke="#F3C24F"
            strokeWidth="1.8"
            strokeDasharray="4 4"
          />
        </g>
      )}

      {theme === 'binary' && (
        <g>
          {/* Twin sage & teal moons */}
          <circle cx="38" cy="48" r="17" fill="#5F9E73" />
          <circle cx="36" cy="46" r="14" fill="#8CC4A8" />
          <circle cx="69" cy="50" r="15" fill="#4D78A8" />
          <circle cx="71" cy="48" r="12" fill="#8AB9D9" />
          {/* Connecting orbital wave */}
          <path
            d="M20 48 Q55 24 90 48"
            fill="none"
            stroke="#F3C24F"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <circle cx="55" cy="36" r="3.5" fill="#F3C24F" />
        </g>
      )}

      {theme === 'core' && (
        <g>
          {/* Golden sunburst solar temple dome */}
          <circle cx="55" cy="44" r="24" fill="#F3C24F" opacity="0.28" />
          <path d="M24 65 A31 31 0 0 1 86 65 Z" fill="#D48D2A" />
          <path d="M29 65 A26 26 0 0 1 81 65 Z" fill="#F3C24F" />
          <path d="M36 65 A19 19 0 0 1 74 65 Z" fill="#FFF0B8" />
          {/* Crown ring */}
          <ellipse
            cx="55"
            cy="46"
            rx="38"
            ry="10"
            transform="rotate(-14 55 46)"
            fill="none"
            stroke="#C75C3B"
            strokeWidth="2.8"
          />
          <polygon points="55,15 58,24 67,24 60,29 63,38 55,33 47,38 50,29 43,24 52,24" fill="#C75C3B" />
        </g>
      )}
    </svg>
  );
};
