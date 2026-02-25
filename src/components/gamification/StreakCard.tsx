"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StreakData {
  streakType: string;
  labelFr: string;
  periodDays: number;
  currentStreak: number;
  longestStreak: number;
  nextDeadline: string | null;
  isActive: boolean;
  nextMilestone: number | null;
}

export default function StreakCard() {
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gamification/streaks")
      .then((r) => r.json())
      .then((d) => setStreaks(d.streaks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeStreaks = streaks.filter((s) => s.currentStreak > 0);

  if (loading) {
    return (
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse h-20 bg-gray-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (activeStreaks.length === 0) return null;

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-orange-500">🔥</span> Mes séries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeStreaks.map((streak) => {
            const progressToMilestone = streak.nextMilestone
              ? Math.round((streak.currentStreak / streak.nextMilestone) * 100)
              : 100;

            const deadlineDate = streak.nextDeadline ? new Date(streak.nextDeadline) : null;
            const hoursLeft = deadlineDate
              ? Math.max(0, Math.round((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60)))
              : null;
            const isAtRisk = hoursLeft !== null && hoursLeft <= 24;

            return (
              <div key={streak.streakType} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={streak.isActive ? "text-orange-500" : "text-gray-300"}>
                      🔥
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {streak.labelFr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {streak.currentStreak}
                    </span>
                    <span className="text-xs text-gray-400">
                      {streak.periodDays === 7 ? "sem." : "mois"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {streak.nextMilestone && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                        style={{ width: `${progressToMilestone}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {streak.currentStreak}/{streak.nextMilestone}
                    </span>
                  </div>
                )}

                {isAtRisk && (
                  <p className="text-[10px] text-red-500 font-medium">
                    ⚠ Expire dans {hoursLeft}h
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Best streaks */}
        {activeStreaks.some((s) => s.longestStreak > s.currentStreak) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 mb-1">Records personnels</p>
            <div className="flex flex-wrap gap-2">
              {activeStreaks
                .filter((s) => s.longestStreak > 0)
                .map((s) => (
                  <span key={s.streakType} className="text-[10px] bg-gray-50 px-2 py-0.5 rounded-full text-gray-500">
                    {s.labelFr}: {s.longestStreak} max
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
