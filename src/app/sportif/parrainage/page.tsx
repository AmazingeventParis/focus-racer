"use client";

import ReferralCard from "@/components/gamification/ReferralCard";

export default function SportifParrainagePage() {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-6">Parrainage</h1>
      <p className="text-sm text-gray-500 mb-6">
        Invitez vos amis sportifs et recevez des crédits gratuits pour chaque inscription validée.
      </p>
      <ReferralCard />
    </div>
  );
}
