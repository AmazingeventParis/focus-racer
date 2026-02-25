"use client";

import ReferralCard from "@/components/gamification/ReferralCard";

export default function OrganizerParrainagePage() {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Parrainage</h1>
      <p className="text-sm text-gray-500 mb-6">
        Parrainez des organisateurs et recevez des crédits gratuits pour chaque inscription validée.
      </p>
      <ReferralCard />
    </div>
  );
}
