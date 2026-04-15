"use client";

import dynamic from "next/dynamic";

const RaceMap = dynamic(() => import("@/components/gamification/RaceMap"), { ssr: false });

export default function PhotographerCartePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes événements</h1>
      <RaceMap apiUrl="/api/events/map" />
    </div>
  );
}
