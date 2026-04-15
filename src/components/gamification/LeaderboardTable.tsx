"use client";

import { useEffect, useState } from "react";
import LevelBadge from "./LevelBadge";
import { cn } from "@/lib/utils";

interface LeaderboardRow {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  level: number;
  levelName: string;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  entries: LeaderboardRow[];
  userRank: LeaderboardRow | null;
  total: number;
  categories: { key: string; labelFr: string }[];
}

interface Props {
  role: string;
}

const PERIOD_OPTIONS = [
  { value: "WEEKLY", label: "Cette semaine" },
  { value: "MONTHLY", label: "Ce mois" },
  { value: "ALL_TIME", label: "Tous les temps" },
];

export default function LeaderboardTable({ role }: Props) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("WEEKLY");
  const [category, setCategory] = useState("xp");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&category=${category}&role=${role}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period, category, role]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex rounded-lg bg-white/5 p-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                period === opt.value
                  ? "bg-[#151C44] text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {data?.categories && data.categories.length > 1 && (
          <div className="flex rounded-lg bg-white/5 p-0.5">
            {data.categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  category === cat.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {cat.labelFr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !data || data.entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Aucune donnée pour cette période</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {data.entries.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                entry.isCurrentUser
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {entry.rank <= 3 ? (
                  <span className="text-lg">
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar initials */}
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500">
                {entry.userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>

              {/* Name + Level */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium truncate", entry.isCurrentUser ? "text-emerald-400" : "text-gray-900")}>
                    {entry.userName}
                  </span>
                  <LevelBadge level={entry.level} levelName={entry.levelName} size="sm" />
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{entry.score.toLocaleString()}</span>
              </div>
            </div>
          ))}

          {/* User's rank if not in top */}
          {data.userRank && !data.entries.find((e) => e.isCurrentUser) && (
            <>
              <div className="text-center text-gray-400 text-xs py-1">...</div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-8 text-center">
                  <span className="text-sm font-bold text-emerald-400">#{data.userRank.rank}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {data.userRank.userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-emerald-400">{data.userRank.userName} (vous)</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{data.userRank.score.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      )}

      {data && data.total > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          {data.total} participant{data.total > 1 ? "s" : ""} au classement
        </p>
      )}
    </div>
  );
}
