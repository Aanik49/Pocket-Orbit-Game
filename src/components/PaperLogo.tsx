import React from 'react';

interface PaperLogoProps {
  className?: string;
}

/**
 * Hand-cut layered cardstock POCKET ORBIT display wordmark matching the reference artwork:
 * Burnt terracotta POCKET over sunny golden ochre ORBIT with thick deep-navy cardstock outline
 * and crisp cutout drop shadow.
 */
export const PaperLogo: React.FC<PaperLogoProps> = ({ className = 'w-64 sm:w-80' }) => {
  return (
    <svg
      viewBox="0 0 360 154"
      className={className}
      role="img"
      aria-label="Pocket Orbit"
    >
      {/* Offset paper drop shadow */}
      <g transform="translate(0, 7)" opacity="0.22" fill="#1E243B">
        <text
          x="180"
          y="66"
          textAnchor="middle"
          fontFamily="'Fredoka', sans-serif"
          fontWeight="700"
          fontSize="66"
          letterSpacing="1.5"
          stroke="#1E243B"
          strokeWidth="22"
          strokeLinejoin="round"
        >
          POCKET
        </text>
        <text
          x="180"
          y="128"
          textAnchor="middle"
          fontFamily="'Fredoka', sans-serif"
          fontWeight="700"
          fontSize="68"
          letterSpacing="2"
          stroke="#1E243B"
          strokeWidth="22"
          strokeLinejoin="round"
        >
          ORBIT
        </text>
      </g>

      {/* Deep navy cardstock backing */}
      <g fill="#27324F" stroke="#27324F" strokeWidth="20" strokeLinejoin="round">
        <text
          x="180"
          y="66"
          textAnchor="middle"
          fontFamily="'Fredoka', sans-serif"
          fontWeight="700"
          fontSize="66"
          letterSpacing="1.5"
        >
          POCKET
        </text>
        <text
          x="180"
          y="128"
          textAnchor="middle"
          fontFamily="'Fredoka', sans-serif"
          fontWeight="700"
          fontSize="68"
          letterSpacing="2"
        >
          ORBIT
        </text>
      </g>

      {/* Burnt terracotta POCKET cutout */}
      <text
        x="180"
        y="66"
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="700"
        fontSize="66"
        letterSpacing="1.5"
        fill="#C75C3B"
      >
        POCKET
      </text>

      {/* Sunny ochre ORBIT cutout */}
      <text
        x="180"
        y="128"
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="700"
        fontSize="68"
        letterSpacing="2"
        fill="#F3C24F"
      >
        ORBIT
      </text>
    </svg>
  );
};
