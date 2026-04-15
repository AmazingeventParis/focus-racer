"use client";

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Course à obstacles",
  OTHER: "Autre",
};

const SPORT_COLORS: Record<string, string> = {
  RUNNING: "bg-blue-100 text-blue-700",
  TRAIL: "bg-green-100 text-green-700",
  TRIATHLON: "bg-purple-100 text-purple-700",
  CYCLING: "bg-orange-100 text-orange-700",
  SWIMMING: "bg-cyan-100 text-cyan-700",
  OBSTACLE: "bg-red-100 text-red-700",
  OTHER: "bg-gray-100 text-gray-700",
};

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

interface SeasonRecapProps {
  sportBreakdown: Record<string, number>;
  monthlySpending: { month: string; spent: number; orders: number; photos: number }[];
  overview: {
    totalEvents: number;
    favoriteSport: string | null;
    memberSince: string;
  };
  loading?: boolean;
}

export default function SeasonRecap({
  sportBreakdown,
  monthlySpending,
  overview,
  loading,
}: SeasonRecapProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-20 bg-gray-200 rounded-full" />
          ))}
        </div>
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  const hasSports = Object.keys(sportBreakdown).length > 0;
  const hasMonthly = monthlySpending.length > 0;

  if (!hasSports && !hasMonthly) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-navy mb-3">Ma Saison</h3>
        <p className="text-sm text-muted-foreground">
          Aucune activité pour le moment.{" "}
          <a href="/explore" className="text-emerald hover:text-emerald-dark transition-colors">
            Découvrir des événements
          </a>
        </p>
      </div>
    );
  }

  // Prepare last 6 months for chart
  const now = new Date();
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: d.toISOString().slice(0, 7),
      label: MONTH_LABELS[d.getMonth()],
    };
  });

  const monthMap = new Map(monthlySpending.map((m) => [m.month, m]));
  const chartData = last6.map((m) => ({
    label: m.label,
    value: monthMap.get(m.key)?.spent ?? 0,
  }));
  const maxVal = Math.max(...chartData.map((d) => d.value), 1);

  const memberDate = new Date(overview.memberSince);
  const memberLabel = memberDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-base font-semibold text-navy mb-4">Ma Saison</h3>

      {/* Sport tags */}
      {hasSports && (
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(sportBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([sport, count]) => (
              <span
                key={sport}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  SPORT_COLORS[sport] || SPORT_COLORS.OTHER
                }`}
              >
                {SPORT_LABELS[sport] || sport}
                <span className="opacity-60">({count})</span>
              </span>
            ))}
        </div>
      )}

      {/* Mini bar chart */}
      {hasMonthly && (
        <div className="mb-5">
          <div className="flex items-end gap-2 h-20">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-[32px] rounded-t bg-emerald/70 transition-all duration-500"
                    style={{
                      height: `${Math.max((d.value / maxVal) * 64, d.value > 0 ? 4 : 0)}px`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {overview.favoriteSport && (
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            {SPORT_LABELS[overview.favoriteSport] || overview.favoriteSport}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Membre depuis {memberLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          {overview.totalEvents} événement{overview.totalEvents !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
