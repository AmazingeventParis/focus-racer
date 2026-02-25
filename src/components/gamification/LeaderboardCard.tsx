"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LevelBadge from "./LevelBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardRow {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  level: number;
  isCurrentUser: boolean;
}

interface Props {
  role: string;
  linkHref: string;
}

export default function LeaderboardCard({ role, linkHref }: Props) {
  const [top3, setTop3] = useState<LeaderboardRow[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leaderboard?period=WEEKLY&category=xp&role=${role}`)
      .then((r) => r.json())
      .then((d) => {
        setTop3((d.entries || []).slice(0, 3));
        setUserRank(d.userRank || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) {
    return (
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-100 rounded" />
            <div className="h-8 bg-gray-100 rounded" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Classement hebdo</CardTitle>
          <Link href={linkHref} className="text-xs text-emerald hover:text-emerald-dark transition-colors">
            Voir tout
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {top3.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun classement cette semaine</p>
        ) : (
          <div className="space-y-2">
            {top3.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-2 py-1.5"
              >
                <span className="w-6 text-center text-sm">
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                  {entry.userName}
                </span>
                <LevelBadge level={entry.level} size="sm" />
                <span className="text-xs font-bold text-gray-500">{entry.score}</span>
              </div>
            ))}

            {userRank && userRank.rank > 3 && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <div className="flex items-center gap-2 py-1.5 bg-emerald-50 rounded-lg px-2 -mx-2">
                  <span className="w-6 text-center text-xs font-bold text-emerald-600">#{userRank.rank}</span>
                  <span className="flex-1 text-sm font-medium text-emerald-700 truncate">
                    Vous
                  </span>
                  <span className="text-xs font-bold text-emerald-600">{userRank.score}</span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
