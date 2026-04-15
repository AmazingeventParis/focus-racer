"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface WrappedData {
  year: number;
  eventsFollowed?: number;
  photosBought?: number;
  totalSpent?: number;
  topSport?: string | null;
  topEvent?: { name: string; photoCount: number } | null;
  badgesEarned?: number;
  levelReached?: number;
  longestStreak?: number;
  reactionsGiven?: number;
  hordeSize?: number;
  totalXp?: number;
}

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied", TRAIL: "Trail", TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme", SWIMMING: "Natation", OBSTACLE: "Obstacles", OTHER: "Autre",
};

export default function SportifWrappedPage() {
  const params = useParams();
  const year = params.year as string;
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    fetch(`/api/wrapped/${year}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

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
        <Link href="/sportif/dashboard" className="text-emerald text-sm mt-2 inline-block">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  const slides = [
    {
      title: `Votre année ${year} en chiffres`,
      content: (
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Événements suivis" value={data.eventsFollowed || 0} />
          <StatBox label="Photos achetées" value={data.photosBought || 0} />
          <StatBox label="Total dépensé" value={`${(data.totalSpent || 0).toFixed(0)}€`} />
          <StatBox label="XP total" value={data.totalXp || 0} />
        </div>
      ),
    },
    {
      title: "Vos performances",
      content: (
        <div className="space-y-4">
          <StatBox label="Niveau atteint" value={data.levelReached || 1} big />
          <StatBox label="Badges gagnés" value={data.badgesEarned || 0} big />
          <StatBox label="Record de série" value={`${data.longestStreak || 0} semaines`} big />
        </div>
      ),
    },
    {
      title: "Vos moments forts",
      content: (
        <div className="space-y-4">
          {data.topSport && (
            <StatBox label="Sport préféré" value={SPORT_LABELS[data.topSport] || data.topSport} big />
          )}
          {data.topEvent && (
            <StatBox label="Événement favori" value={`${data.topEvent.name} (${data.topEvent.photoCount} photos)`} big />
          )}
          <StatBox label="Réactions données" value={data.reactionsGiven || 0} big />
          <StatBox label="Taille de la horde" value={`${data.hordeSize || 0} amis`} big />
        </div>
      ),
    },
    {
      title: `${year} — Focus Racer Wrapped`,
      content: (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
            {data.levelReached || 1}
          </div>
          <p className="text-lg font-semibold text-white/80">
            {data.photosBought || 0} photos · {data.eventsFollowed || 0} événements · {data.totalXp || 0} XP
          </p>
          <p className="text-sm text-gray-400">Merci d'avoir été avec nous en {year} !</p>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-lg mx-auto">
      <Card className="rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-[500px] flex flex-col">
        <CardContent className="flex-1 flex flex-col justify-center p-8">
          <h2 className="text-2xl font-bold text-center mb-8 animate-fade-in">
            {slides[step].title}
          </h2>
          <div className="animate-fade-in">
            {slides[step].content}
          </div>
        </CardContent>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="text-sm text-white/50 hover:text-white disabled:invisible transition-colors"
          >
            Précédent
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-emerald-400" : "bg-white/20"}`}
              />
            ))}
          </div>
          <button
            onClick={nextStep}
            disabled={step === slides.length - 1}
            className="text-sm text-emerald-400 hover:text-emerald-300 disabled:invisible transition-colors"
          >
            Suivant
          </button>
        </div>
      </Card>
    </div>
  );
}

function StatBox({ label, value, big }: { label: string; value: string | number; big?: boolean }) {
  return (
    <div className={`bg-white/10 rounded-xl p-4 ${big ? "" : ""}`}>
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className={`font-bold ${big ? "text-2xl" : "text-xl"}`}>{value}</p>
    </div>
  );
}
