"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface WrappedData {
  year: number;
  eventsOrganized?: number;
  runnersManaged?: number;
  badgesEarned?: number;
  levelReached?: number;
  totalXp?: number;
}

export default function OrganizerWrappedPage() {
  const params = useParams();
  const year = params.year as string;
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wrapped/${year}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Génération de votre récap...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Pas de données pour {year}</p>
        <Link href="/organizer/dashboard" className="text-emerald text-sm mt-2 inline-block">Retour</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <Card className="rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Votre année {year}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">Événements</p>
              <p className="text-2xl font-bold">{data.eventsOrganized || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">Sportifs</p>
              <p className="text-2xl font-bold">{data.runnersManaged || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">Badges</p>
              <p className="text-2xl font-bold">{data.badgesEarned || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50">XP total</p>
              <p className="text-2xl font-bold">{data.totalXp || 0}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/40">Niveau {data.levelReached || 1}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
