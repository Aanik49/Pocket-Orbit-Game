import React from 'react';
import { getTrailById } from '../game/satellites';
import { ChapterMeta, SatelliteId, TrailId } from '../types';

/**
 * Complete, unclipped cosmic arcade Star icon matching the Pocket Orbit asset sheet.
 */
export const PaperStarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`${className} shrink-0 select-none`}
    aria-hidden="true"
  >
    <path
      d="M18 3.2 L22.2 11.7 L31.6 13.1 L24.8 19.7 L26.4 29.1 L18 24.6 L9.6 29.1 L11.2 19.7 L4.4 13.1 L13.8 11.7 Z"
      fill="#FF9800"
      stroke="#0A2180"
      strokeWidth="4.2"
      strokeLinejoin="round"
    />
    <path
      d="M18 3.2 L22.2 11.7 L31.6 13.1 L24.8 19.7 L26.4 29.1 L18 24.6 L9.6 29.1 L11.2 19.7 L4.4 13.1 L13.8 11.7 Z"
      fill="#FFD629"
      stroke="#F58200"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M18 6.4 L20.6 12.1 L26.8 13.2 L21.8 16.5 L18 15.2 L14.2 16.5 L9.2 13.2 L15.4 12.1 Z"
      fill="#FFF59E"
      opacity="0.72"
    />
  </svg>
);

/**
 * Complete, unclipped cosmic arcade Rocket icon matching the Pocket Orbit asset sheet.
 */
export const PaperRocketIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`${className} shrink-0 select-none`}
    aria-hidden="true"
  >
    <g transform="translate(18 18) rotate(45) translate(-18 -18)">
      <path
        d="M14.5 26 L18 33.2 L21.5 26 Z"
        fill="#FF9E14"
        stroke="#0A2180"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M16 26 L18 31.2 L20 26 Z" fill="#FFE84D" />
      <path
        d="M12.5 18.5 C7.5 20.5 6.8 25.5 7.5 28.5 C10 27 12.2 26 13.8 25.5 Z"
        fill="#FF3B1F"
        stroke="#0A2180"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 18.5 C28.5 20.5 29.2 25.5 28.5 28.5 C26 27 23.8 26 22.2 25.5 Z"
        fill="#FF3B1F"
        stroke="#0A2180"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M18 3.6 C24.6 8.5 24.8 19 22 25.2 L14 25.2 C11.2 19 11.4 8.5 18 3.6 Z"
        fill="#FFFFFF"
        stroke="#0A2180"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M18 4.4 C21.2 6.8 22.6 9.5 23 11.6 Q18 13.4 13 11.6 C13.4 9.5 14.8 6.8 18 4.4 Z"
        fill="#FF3B1F"
      />
      <rect x="14.2" y="22.8" width="7.6" height="2.6" rx="1.2" fill="#2A7BFF" />
      <circle cx="18" cy="16.5" r="3.4" fill="#1464F0" stroke="#0A2180" strokeWidth="1.5" />
      <circle cx="17.3" cy="15.8" r="1.4" fill="#7CEBFF" />
    </g>
  </svg>
);

export const PaperShieldIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <img
    src="./assets/cosmic/icon-shield.png"
    alt=""
    aria-hidden="true"
    referrerPolicy="no-referrer"
    draggable={false}
    className={`${className} object-contain shrink-0 select-none`}
  />
);

/** Crisp Slow-Mo Chrono Pulse Booster Icon */
export const ChronoPulseIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" className={`${className} shrink-0 select-none`} aria-hidden="true">
    <circle cx="18" cy="18" r="14.5" fill="#12308A" stroke="#6CE5FF" strokeWidth="2.6" />
    <circle cx="18" cy="18" r="10.2" fill="#0B1B5C" stroke="#3CF2FF" strokeWidth="1.4" strokeDasharray="3 2.5" />
    <path d="M18 10.5 V18 L23.2 21.2" fill="none" stroke="#FFE45C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="18" r="2.2" fill="#FFFFFF" />
    <path d="M13 4.2 H23" stroke="#6CE5FF" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

/** Crisp Star Magnet Booster Icon */
export const StarMagnetIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" className={`${className} shrink-0 select-none`} aria-hidden="true">
    <circle cx="18" cy="18" r="15" fill="#3B126E" stroke="#FF7BF2" strokeWidth="2.4" />
    <path
      d="M11 12 V20 C11 24.4 14.1 27.5 18 27.5 C21.9 27.5 25 24.4 25 20 V12"
      fill="none"
      stroke="#FF47A8"
      strokeWidth="4.6"
      strokeLinecap="butt"
    />
    <rect x="8.7" y="9.5" width="4.6" height="4.2" rx="1" fill="#7CEBFF" />
    <rect x="22.7" y="9.5" width="4.6" height="4.2" rx="1" fill="#7CEBFF" />
    <path
      d="M18 8.2 L19.2 11.4 L22.5 11.8 L19.9 13.8 L20.7 17 L18 15.2 L15.3 17 L16.1 13.8 L13.5 11.8 L16.8 11.4 Z"
      fill="#FFE45C"
    />
  </svg>
);

/** Cosmetic Trail Preview Coin Badge */
export const TrailPreviewBadge: React.FC<{
  id: TrailId;
  className?: string;
}> = ({ id, className = 'w-11 h-11' }) => {
  const trail = getTrailById(id);
  const [c1, c2, c3] = trail.previewColors;
  const gradId = `trail-grad-${id}`;

  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0`} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="10" y1="50" x2="54" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c1} />
          <stop offset="55%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="#0D1858" stroke="#2D68E8" strokeWidth="2.5" />
      <path
        d="M14 48 C18 32, 34 36, 48 16"
        fill="none"
        stroke={c1}
        strokeOpacity="0.45"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M14 48 C18 32, 34 36, 48 16"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <path
        d="M16 46 C20 33, 34 36, 48 16"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="48" cy="16" r="4.2" fill="#FFFFFF" />
      <circle cx="24" cy="30" r="1.8" fill={c3} />
      <circle cx="38" cy="40" r="1.6" fill={c2} />
    </svg>
  );
};

export const SatelliteIllustration: React.FC<{
  id: SatelliteId;
  className?: string;
}> = ({ id, className = 'w-12 h-12' }) => {
  const isTiny = id === 'tinny' || id === 'nano_stopper';
  const scale = isTiny ? 0.78 : 1;

  let wingTop = '#44C8FF';
  let wingBot = '#1264E8';
  let hull = '#FFFFFF';
  let hullShade = '#C8D8F8';
  let accent = '#FF8A2B';
  let coreGlow = '#3CF2FF';

  if (id === 'tinny') {
    wingTop = '#5AF5A8';
    wingBot = '#12A862';
    hull = '#FFF7C2';
    hullShade = '#F5C442';
    accent = '#17C964';
    coreGlow = '#6CFFBA';
  } else if (id === 'heavy') {
    wingTop = '#FFE052';
    wingBot = '#E08200';
    hull = '#DCE7FF';
    hullShade = '#7D9EE0';
    accent = '#FFB81C';
    coreGlow = '#FFE45E';
  } else if (id === 'nano_stopper') {
    wingTop = '#E09EFF';
    wingBot = '#8B3DF0';
    hull = '#F5E8FF';
    hullShade = '#C2A0F5';
    accent = '#3CF2FF';
    coreGlow = '#E5B2FF';
  } else if (id === 'magnet_probe') {
    wingTop = '#FF88DC';
    wingBot = '#C21F8C';
    hull = '#FFF0FB';
    hullShade = '#F0B6E2';
    accent = '#FF47A8';
    coreGlow = '#7CEBFF';
  } else if (id === 'phase_dasher') {
    wingTop = '#6CF4FF';
    wingBot = '#6432F0';
    hull = '#EAF8FF';
    hullShade = '#9EB4F8';
    accent = '#B87BFF';
    coreGlow = '#FFFFFF';
  } else if (id === 'star_collector') {
    wingTop = '#FFF275';
    wingBot = '#E68A00';
    hull = '#FFFCE8';
    hullShade = '#F5CE62';
    accent = '#1AD68B';
    coreGlow = '#FFE84D';
  }

  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0`} aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#0F1F6B" stroke="#1E5AE0" strokeWidth="2.5" />
      <circle
        cx="32"
        cy="32"
        r="24.5"
        fill="none"
        stroke="#63D8FF"
        strokeOpacity="0.5"
        strokeWidth="1.3"
        strokeDasharray="3.5 3.5"
      />

      {id === 'heavy' && (
        <path
          d="M15 21 A21 21 0 0 1 49 21"
          fill="none"
          stroke="#FFD426"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {id === 'magnet_probe' && (
        <circle
          cx="32"
          cy="32"
          r="21"
          fill="none"
          stroke="#FF7BF2"
          strokeWidth="2.2"
          strokeDasharray="5 4"
        />
      )}

      {id === 'phase_dasher' && (
        <path
          d="M14 42 C18 24, 42 18, 52 24"
          fill="none"
          stroke="#C88EFF"
          strokeOpacity="0.7"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}

      {id === 'star_collector' && (
        <path
          d="M48 11 L49.6 15.2 L54 15.6 L50.6 18.4 L51.6 22.8 L48 20.4 L44.4 22.8 L45.4 18.4 L42 15.6 L46.4 15.2 Z"
          fill="#FFE45C"
          stroke="#B85D00"
          strokeWidth="1"
        />
      )}

      {id === 'nano_stopper' && (
        <g stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="48" cy="17" r="7.5" fill="#46208A" stroke="#3CF2FF" strokeWidth="1.6" />
          <line x1="48" y1="17" x2="48" y2="12.8" />
          <line x1="48" y1="17" x2="51.5" y2="17" />
        </g>
      )}

      <g transform={`translate(32 32) rotate(-32) scale(${scale})`}>
        <path d="M-3.5 11 L0 21 L3.5 11 Z" fill="#FF9E1C" />
        <path d="M-1.8 11 L0 17.5 L1.8 11 Z" fill="#FFF282" />

        <rect x="-22" y="-5.8" width="14.5" height="5.8" rx="1.5" fill={wingTop} />
        <rect x="7.5" y="-5.8" width="14.5" height="5.8" rx="1.5" fill={wingTop} />
        <rect x="-22" y="0" width="14.5" height="5.8" rx="1.5" fill={wingBot} />
        <rect x="7.5" y="0" width="14.5" height="5.8" rx="1.5" fill={wingBot} />
        <line x1="-15" y1="-5.8" x2="-15" y2="5.8" stroke="#0B226E" strokeOpacity="0.45" strokeWidth="1.1" />
        <line x1="15" y1="-5.8" x2="15" y2="5.8" stroke="#0B226E" strokeOpacity="0.45" strokeWidth="1.1" />

        <rect x="-7.2" y="-12.5" width="14.4" height="24.5" rx="6" fill={hullShade} stroke="#0F2C82" strokeWidth="1.2" />
        <rect x="-5.8" y="-11.2" width="7.2" height="22" rx="3.6" fill={hull} />
        <path d="M-6 -7 C-5 -12 5 -12 6 -7 Z" fill={accent} />
        <circle cx="0" cy="-1.5" r="3.4" fill="#1458E0" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="0" cy="-1.5" r="1.8" fill={coreGlow} />
      </g>
    </svg>
  );
};

export const SectorDomeArt: React.FC<{
  theme: ChapterMeta['domeTheme'];
  locked?: boolean;
  className?: string;
}> = ({ locked = false, className = 'w-14 h-14' }) => (
  <div className={`${className} ${locked ? 'opacity-60 grayscale' : ''} flex items-center justify-center`}>
    <img
      src="./assets/cosmic/icon-radio.png"
      alt=""
      aria-hidden="true"
      referrerPolicy="no-referrer"
      className="w-full h-full object-contain"
    />
  </div>
);
