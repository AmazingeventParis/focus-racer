"use client";

import Link from "next/link";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import BadgeIcon from "@/components/sportif/BadgeIcon";

interface EarnedBadge {
  badgeKey: string;
  earnedAt: string;
}

interface BadgeRowProps {
  badges: EarnedBadge[];
  newlyEarned?: string[];
  sportifId?: string;
  loading?: boolean;
}

export default function BadgeRow({ badges, newlyEarned = [], sportifId, loading }: BadgeRowProps) {
  const earnedKeys = new Set(badges.map((b) => b.badgeKey));

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-full" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-navy">
          Mes Badges{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({earnedKeys.size}/{BADGE_DEFINITIONS.length})
          </span>
        </h2>
        {sportifId && (
          <Link
            href={`/profil/${sportifId}`}
            className="text-sm text-emerald hover:text-emerald-dark transition-colors whitespace-nowrap"
          >
            Voir mon profil →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {BADGE_DEFINITIONS.map((def) => {
          const isEarned = earnedKeys.has(def.key);
          const isNew = newlyEarned.includes(def.key);
          return (
            <div
              key={def.key}
              className="flex flex-col items-center gap-1.5 group"
              title={def.descriptionFr}
            >
              <BadgeIcon
                badgeKey={def.key}
                earned={isEarned}
                size={56}
                pulse={isNew}
              />
              <span
                className={`text-xs font-medium text-center leading-tight ${
                  isEarned ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {def.labelFr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
