"use client";

import LeaderboardTable from "@/components/gamification/LeaderboardTable";

export default function SportifClassementPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-6">Classement</h1>
      <LeaderboardTable role="RUNNER" />
    </div>
  );
}
