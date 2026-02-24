"use client";

import { BADGE_MAP } from "@/lib/badges";

interface BadgeIconProps {
  badgeKey: string;
  earned: boolean;
  size?: number;
  pulse?: boolean;
}

const BADGE_SYMBOLS: Record<string, (cx: number, cy: number) => React.ReactNode> = {
  // Étoile dans un cercle
  first_purchase: (cx, cy) => (
    <g>
      <circle cx={cx} cy={cy} r="12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
      <path
        d={`M${cx},${cy - 9} l2.5,5.5 6,0.8 -4.3,4.2 1,6 -5.2,-2.7 -5.2,2.7 1,-6 -4.3,-4.2 6,-0.8z`}
        fill="white"
      />
    </g>
  ),
  // Appareil photo
  collector_50: (cx, cy) => (
    <g>
      <rect x={cx - 11} y={cy - 6} width="22" height="16" rx="3" fill="white" />
      <circle cx={cx} cy={cy + 1} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx={cx} cy={cy + 1} r="3" fill="currentColor" opacity="0.3" />
      <rect x={cx - 4} y={cy - 9} width="8" height="4" rx="1" fill="white" />
    </g>
  ),
  // Trophée
  collector_100: (cx, cy) => (
    <g>
      <path
        d={`M${cx - 6},${cy - 10} h12 v4 c0,6 -3,10 -6,12 c-3,-2 -6,-6 -6,-12z`}
        fill="white"
      />
      <rect x={cx - 2} y={cy + 5} width="4" height="3" fill="white" />
      <rect x={cx - 5} y={cy + 8} width="10" height="2" rx="1" fill="white" />
      <path d={`M${cx - 6},${cy - 6} c-4,0 -5,2 -5,4 s1,4 5,4`} fill="none" stroke="white" strokeWidth="1.5" />
      <path d={`M${cx + 6},${cy - 6} c4,0 5,2 5,4 s-1,4 -5,4`} fill="none" stroke="white" strokeWidth="1.5" />
    </g>
  ),
  // 3 anneaux enlacés
  multi_sport: (cx, cy) => (
    <g>
      <circle cx={cx - 6} cy={cy - 2} r="6" fill="none" stroke="white" strokeWidth="2" />
      <circle cx={cx + 6} cy={cy - 2} r="6" fill="none" stroke="white" strokeWidth="2" />
      <circle cx={cx} cy={cy + 5} r="6" fill="none" stroke="white" strokeWidth="2" />
    </g>
  ),
  // Étoile à 5 branches
  loyal_5: (cx, cy) => (
    <path
      d={`M${cx},${cy - 12} l3.5,7.5 8,1.2 -5.8,5.6 1.4,8 -7.1,-3.7 -7.1,3.7 1.4,-8 -5.8,-5.6 8,-1.2z`}
      fill="white"
    />
  ),
  // Boussole
  explorer_10: (cx, cy) => (
    <g>
      <circle cx={cx} cy={cy} r="12" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="1.5" fill="white" />
      <polygon points={`${cx},${cy - 10} ${cx + 3},${cy} ${cx},${cy + 10} ${cx - 3},${cy}`} fill="white" opacity="0.9" />
      <polygon points={`${cx},${cy - 10} ${cx + 3},${cy} ${cx},${cy}`} fill="white" opacity="0.5" />
      <polygon points={`${cx},${cy + 10} ${cx - 3},${cy} ${cx},${cy}`} fill="white" opacity="0.5" />
    </g>
  ),
  // Deux silhouettes
  social_3: (cx, cy) => (
    <g>
      <circle cx={cx - 5} cy={cy - 6} r="4.5" fill="white" />
      <ellipse cx={cx - 5} cy={cy + 4} rx="7" ry="5" fill="white" />
      <circle cx={cx + 7} cy={cy - 5} r="3.5" fill="white" opacity="0.8" />
      <ellipse cx={cx + 7} cy={cy + 4} rx="5.5" ry="4.5" fill="white" opacity="0.8" />
    </g>
  ),
  // Couronne
  leader_10: (cx, cy) => (
    <g>
      <path
        d={`M${cx - 11},${cy + 4} l3,-12 5.5,6 2.5,-8 2.5,8 5.5,-6 3,12z`}
        fill="white"
      />
      <rect x={cx - 11} y={cy + 4} width="22" height="5" rx="1" fill="white" />
      <circle cx={cx - 8} cy={cy - 5} r="1.5" fill="white" />
      <circle cx={cx} cy={cy - 9} r="1.5" fill="white" />
      <circle cx={cx + 8} cy={cy - 5} r="1.5" fill="white" />
    </g>
  ),
  // Diamant
  patron_100: (cx, cy) => (
    <g>
      <polygon
        points={`${cx},${cy - 12} ${cx + 12},${cy - 2} ${cx},${cy + 12} ${cx - 12},${cy - 2}`}
        fill="white"
      />
      <line x1={cx - 8} y1={cy - 2} x2={cx + 8} y2={cy - 2} stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <line x1={cx} y1={cy - 12} x2={cx - 4} y2={cy - 2} stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <line x1={cx} y1={cy - 12} x2={cx + 4} y2={cy - 2} stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <line x1={cx - 4} y1={cy - 2} x2={cx} y2={cy + 12} stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <line x1={cx + 4} y1={cy - 2} x2={cx} y2={cy + 12} stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
    </g>
  ),
  // Fusée
  pioneer: (cx, cy) => (
    <g>
      <path
        d={`M${cx},${cy - 13} c0,0 6,5 6,13 c0,3 -2,5 -3,6 l-3,-4 -3,4 c-1,-1 -3,-3 -3,-6 c0,-8 6,-13 6,-13z`}
        fill="white"
      />
      <circle cx={cx} cy={cy - 2} r="2" fill="currentColor" opacity="0.3" />
      <path d={`M${cx - 3},${cy + 6} l-3,3 1,3 2,-2`} fill="white" opacity="0.8" />
      <path d={`M${cx + 3},${cy + 6} l3,3 -1,3 -2,-2`} fill="white" opacity="0.8" />
    </g>
  ),
};

function HexagonShape({ color, colorLight, earned }: { color: string; colorLight: string; earned: boolean }) {
  const gradId = `grad-${color.replace("#", "")}`;
  return (
    <>
      <defs>
        {earned && (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={colorLight} stopOpacity="0.8" />
          </linearGradient>
        )}
      </defs>
      <polygon
        points="32,2 58,17 58,47 32,62 6,47 6,17"
        fill={earned ? `url(#${gradId})` : "#D1D5DB"}
        stroke={earned ? color : "#9CA3AF"}
        strokeWidth="2"
      />
    </>
  );
}

export default function BadgeIcon({ badgeKey, earned, size = 64, pulse = false }: BadgeIconProps) {
  const def = BADGE_MAP.get(badgeKey);
  if (!def) return null;

  const symbolFn = BADGE_SYMBOLS[badgeKey];
  const cx = 32;
  const cy = 32;

  return (
    <div
      className={`relative inline-flex ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={`transition-all duration-300 ${
          earned
            ? "drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
            : "grayscale opacity-35"
        }`}
        style={earned ? { color: def.color } : { color: "#9CA3AF" }}
      >
        <HexagonShape color={def.color} colorLight={def.colorLight} earned={earned} />
        {earned && symbolFn ? (
          symbolFn(cx, cy)
        ) : !earned ? (
          // Cadenas pour badges verrouillés
          <g>
            <rect x="25" y="30" width="14" height="11" rx="2" fill="white" opacity="0.7" />
            <path
              d="M28,30 v-4 a4,4 0 0,1 8,0 v4"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.7"
            />
            <circle cx="32" cy="35" r="1.5" fill="#9CA3AF" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
