"use client";

import { useEffect, useState } from "react";
import { ORGANIZER_BADGE_DEFINITIONS } from "@/lib/organizer-badges";
import BadgeIcon from "@/components/sportif/BadgeIcon";

interface EarnedBadge {
  badgeKey: string;
  earnedAt: string;
}

export default function OrganizerBadgeRow() {
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [newlyEarned, setNewlyEarned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organizer/badges")
      .then((res) => res.json())
      .then((data) => {
        setBadges(data.earned || []);
        setNewlyEarned(data.newlyEarned || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const earnedKeys = new Set(badges.map((b) => b.badgeKey));

  if (loading) {
    return (
      <div className="bg-[#151C44] border border-[#2C3566] shadow-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-14 h-14 bg-white/10 rounded-full" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#151C44] border border-[#2C3566] shadow-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-display font-semibold text-gray-900">
          Mes Badges{" "}
          <span className="text-sm font-normal text-gray-500">
            ({earnedKeys.size}/{ORGANIZER_BADGE_DEFINITIONS.length})
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {ORGANIZER_BADGE_DEFINITIONS.map((def) => {
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
