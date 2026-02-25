"use client";

import { useEffect, useState } from "react";
import { useSSENotifications } from "@/hooks/useSSENotifications";
import { cn } from "@/lib/utils";

interface XpData {
  totalXp: number;
  level: number;
  levelName: string;
  progressPercent: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  nextLevelName: string | null;
  frame: string;
}

const FRAME_COLORS: Record<string, string> = {
  none: "from-gray-200 to-gray-300",
  bronze: "from-amber-600 to-amber-400",
  silver: "from-gray-400 to-gray-200",
  gold: "from-yellow-500 to-yellow-300",
  diamond: "from-cyan-400 to-purple-400",
};

const FRAME_TEXT: Record<string, string> = {
  none: "text-gray-500",
  bronze: "text-amber-600",
  silver: "text-gray-500",
  gold: "text-yellow-600",
  diamond: "text-cyan-500",
};

export default function XpBar() {
  const [xpData, setXpData] = useState<XpData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchXp = async () => {
    try {
      const res = await fetch("/api/gamification/xp", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setXpData(data);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXp();
    // Daily login XP
    fetch("/api/gamification/daily-login", { method: "POST" }).catch(() => {});
  }, []);

  useSSENotifications(["xp_gained", "level_up"], fetchXp);

  if (loading) {
    return (
      <div className="animate-pulse h-14 bg-gray-100 rounded-xl" />
    );
  }

  if (!xpData) return null;

  const frame = xpData.frame || "none";

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/80 backdrop-blur border border-gray-100 shadow-sm">
      {/* Level badge */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br",
        FRAME_COLORS[frame]
      )}>
        {xpData.level}
      </div>

      {/* Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn("text-xs font-semibold", FRAME_TEXT[frame])}>
            {xpData.levelName}
          </span>
          <span className="text-xs text-gray-400">
            {xpData.totalXp} XP
            {xpData.nextLevelName && (
              <> &middot; {xpData.xpToNextLevel} XP pour {xpData.nextLevelName}</>
            )}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", FRAME_COLORS[frame])}
            style={{ width: `${xpData.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
