"use client";

import Link from "next/link";
import { BADGE_MAP } from "@/lib/badges";

interface EarnedBadge {
  badgeKey: string;
  earnedAt: string;
}

interface BadgeRowProps {
  badges: EarnedBadge[];
  sportifId?: string;
  loading?: boolean;
}

export default function BadgeRow({ badges, sportifId, loading }: BadgeRowProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Participez pour débloquer vos premiers badges !
          </p>
          <Link
            href="/explore"
            className="text-sm text-emerald hover:text-emerald-dark transition-colors whitespace-nowrap ml-4"
          >
            Découvrir
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {badges.map((b) => {
            const def = BADGE_MAP.get(b.badgeKey);
            if (!def) return null;
            return (
              <span
                key={b.badgeKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium whitespace-nowrap"
                title={def.descriptionFr}
              >
                <span>{def.emoji}</span>
                {def.labelFr}
              </span>
            );
          })}
        </div>
        {sportifId && (
          <Link
            href={`/profil/${sportifId}`}
            className="text-sm text-emerald hover:text-emerald-dark transition-colors whitespace-nowrap"
          >
            Voir tous →
          </Link>
        )}
      </div>
    </div>
  );
}
