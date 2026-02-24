"use client";

import Image from "next/image";
import { BADGE_MAP, BadgeDef } from "@/lib/badges";
import { PHOTOGRAPHER_BADGE_MAP } from "@/lib/photographer-badges";
import { ORGANIZER_BADGE_MAP } from "@/lib/organizer-badges";

interface BadgeIconProps {
  badgeKey: string;
  earned: boolean;
  size?: number;
  pulse?: boolean;
}

function findBadge(key: string): BadgeDef | undefined {
  return BADGE_MAP.get(key) || PHOTOGRAPHER_BADGE_MAP.get(key) || ORGANIZER_BADGE_MAP.get(key);
}

export default function BadgeIcon({ badgeKey, earned, size = 64, pulse = false }: BadgeIconProps) {
  const def = findBadge(badgeKey);
  if (!def) return null;

  return (
    <div
      className={`relative inline-flex ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/badges/${badgeKey}.png`}
        alt={def.labelFr}
        width={size}
        height={size}
        className={`rounded-full transition-all duration-300 ${
          earned
            ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
            : "grayscale opacity-30"
        }`}
      />
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
      )}
    </div>
  );
}
