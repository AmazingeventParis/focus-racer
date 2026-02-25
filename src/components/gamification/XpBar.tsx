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
  none: "from-gray-400 to-gray-300",
  bronze: "from-amber-600 to-amber-400",
  silver: "from-gray-400 to-gray-200",
  gold: "from-yellow-500 to-yellow-300",
  diamond: "from-cyan-400 to-purple-400",
};

const FRAME_BAR: Record<string, string> = {
  none: "from-gray-400 to-gray-300",
  bronze: "from-amber-600 to-amber-400",
  silver: "from-gray-300 to-gray-100",
  gold: "from-yellow-500 to-yellow-300",
  diamond: "from-cyan-400 to-purple-400",
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
  }, []);

  useSSENotifications(["xp_gained", "level_up"], fetchXp);

  if (loading) {
    return (
      <div className="animate-pulse h-10 bg-white/5 rounded-xl mx-3 mb-3" />
    );
  }

  if (!xpData) return null;

  const frame = xpData.frame || "none";

  return (
    <div className="mx-3 mb-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2.5">
        {/* Level badge */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br",
          FRAME_COLORS[frame]
        )}>
          {xpData.level}
        </div>

        {/* Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-white/80">
              {xpData.levelName}
            </span>
            <span className="text-[10px] text-white/50">
              {xpData.totalXp} XP
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", FRAME_BAR[frame])}
              style={{ width: `${xpData.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
