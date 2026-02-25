"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Reward {
  actionKey: string;
  labelFr: string;
  credits: number;
  autoClaim: boolean;
  claimed: boolean;
  claimedAt: string | null;
}

export default function CreditRewardChecklist() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/gamification/rewards");
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const claimReward = async (actionKey: string) => {
    try {
      const res = await fetch("/api/gamification/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionKey }),
      });
      if (res.ok) {
        fetchRewards();
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const claimedCount = rewards.filter((r) => r.claimed).length;

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            🎯 Crédits gratuits
          </CardTitle>
          <span className="text-xs text-gray-400">{claimedCount}/{rewards.length}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rewards.map((reward) => (
            <div
              key={reward.actionKey}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50"
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {reward.claimed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{reward.labelFr}</p>
              </div>

              {/* Credits/Action */}
              {reward.claimed ? (
                <span className="text-xs text-emerald-600 font-medium">+{reward.credits}</span>
              ) : !reward.autoClaim ? (
                <button
                  onClick={() => claimReward(reward.actionKey)}
                  className="px-2 py-1 text-xs bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
                >
                  Réclamer
                </button>
              ) : (
                <span className="text-xs text-gray-400">+{reward.credits}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
