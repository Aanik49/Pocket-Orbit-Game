import React from 'react';
import { ChapterMeta, SatelliteId } from '../types';

/**
 * Complete, unclipped cosmic arcade Star icon matching the Pocket Orbit asset sheet.
 */
export const PaperStarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`${className} shrink-0 select-none`}
    aria-hidden="true"
  >
    {/* Deep royal-blue arcade sticker outline */}
    <path
      d="M18 3.2 L22.2 11.7 L31.6 13.1 L24.8 19.7 L26.4 29.1 L18 24.6 L9.6 29.1 L11.2 19.7 L4.4 13.1 L13.8 11.7 Z"
      fill="#FF9800"
      stroke="#0A2180"
      strokeWidth="4.2"
      strokeLinejoin="round"
    />
    {/* Rich warm gold star body */}
    <path
      d="M18 3.2 L22.2 11.7 L31.6 13.1 L24.8 19.7 L26.4 29.1 L18 24.6 L9.6 29.1 L11.2 19.7 L4.4 13.1 L13.8 11.7 Z"
      fill="#FFD629"
      stroke="#F58200"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Crisp specular highlight */}
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
      {/* Thruster flame */}
      <path
        d="M14.5 26 L18 33.2 L21.5 26 Z"
        fill="#FF9E14"
        stroke="#0A2180"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M16 26 L18 31.2 L20 26 Z" fill="#FFE84D" />

      {/* Left & right red rocket fins */}
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

      {/* Plump white rocket fuselage */}
      <path
        d="M18 3.6 C24.6 8.5 24.8 19 22 25.2 L14 25.2 C11.2 19 11.4 8.5 18 3.6 Z"
        fill="#FFFFFF"
        stroke="#0A2180"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* Red nose cone */}
      <path
        d="M18 4.4 C21.2 6.8 22.6 9.5 23 11.6 Q18 13.4 13 11.6 C13.4 9.5 14.8 6.8 18 4.4 Z"
        fill="#FF3B1F"
      />

      {/* Soft blue-gray lower body accent */}
      <rect x="14.2" y="22.8" width="7.6" height="2.6" rx="1.2" fill="#2A7BFF" />

      {/* Blue glass porthole window */}
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
  }

  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0`} aria-hidden="true">
      {/* Deep navy circular coin badge with stitched ring (matching Equipments mockup) */}
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

      {/* Heavy outer-guard gold shield arc */}
      {id === 'heavy' && (
        <path
          d="M15 21 A21 21 0 0 1 49 21"
          fill="none"
          stroke="#FFD426"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {/* Nano Stopper chrono clock badge */}
      {id === 'nano_stopper' && (
        <g stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="48" cy="17" r="7.5" fill="#46208A" stroke="#3CF2FF" strokeWidth="1.6" />
          <line x1="48" y1="17" x2="48" y2="12.8" />
          <line x1="48" y1="17" x2="51.5" y2="17" />
        </g>
      )}

      <g transform={`translate(32 32) rotate(-32) scale(${scale})`}>
        {/* Thruster flame glow */}
        <path d="M-3.5 11 L0 21 L3.5 11 Z" fill="#FF9E1C" />
        <path d="M-1.8 11 L0 17.5 L1.8 11 Z" fill="#FFF282" />

        {/* Solar panels */}
        <rect x="-22" y="-5.8" width="14.5" height="5.8" rx="1.5" fill={wingTop} />
        <rect x="7.5" y="-5.8" width="14.5" height="5.8" rx="1.5" fill={wingTop} />
        <rect x="-22" y="0" width="14.5" height="5.8" rx="1.5" fill={wingBot} />
        <rect x="7.5" y="0" width="14.5" height="5.8" rx="1.5" fill={wingBot} />
        <line x1="-15" y1="-5.8" x2="-15" y2="5.8" stroke="#0B226E" strokeOpacity="0.45" strokeWidth="1.1" />
        <line x1="15" y1="-5.8" x2="15" y2="5.8" stroke="#0B226E" strokeOpacity="0.45" strokeWidth="1.1" />

        {/* Capsule hull */}
        <rect x="-7.2" y="-12.5" width="14.4" height="24.5" rx="6" fill={hullShade} stroke="#0F2C82" strokeWidth="1.2" />
        <rect x="-5.8" y="-11.2" width="7.2" height="22" rx="3.6" fill={hull} />
        {/* Nose cap */}
        <path d="M-6 -7 C-5 -12 5 -12 6 -7 Z" fill={accent} />
        {/* Porthole */}
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
