"use client";

import LeaderboardTable from "@/components/gamification/LeaderboardTable";

export default function OrganizerClassementPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Classement organisateurs</h1>
      <LeaderboardTable role="ORGANIZER" />
    </div>
  );
}
