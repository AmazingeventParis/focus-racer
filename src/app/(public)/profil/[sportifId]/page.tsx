import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import BadgeIcon from "@/components/sportif/BadgeIcon";

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

interface ProfileData {
  name: string;
  sportifId: string;
  memberSince: string;
  eventCount: number;
  hordeSize: number;
  sportBreakdown: Record<string, number>;
  badges: { badgeKey: string; earnedAt: string }[];
}

async function getProfile(sportifId: string): Promise<ProfileData | null> {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/profil/${sportifId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { sportifId: string };
}): Promise<Metadata> {
  const profile = await getProfile(params.sportifId);
  if (!profile) {
    return { title: "Profil introuvable | Focus Racer" };
  }
  return {
    title: `${profile.name} — Profil sportif | Focus Racer`,
    description: `Découvrez le profil sportif de ${profile.name} sur Focus Racer. ${profile.eventCount} événement${profile.eventCount !== 1 ? "s" : ""} suivi${profile.eventCount !== 1 ? "s" : ""}.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { sportifId: string };
}) {
  const profile = await getProfile(params.sportifId);
  if (!profile) notFound();

  const earnedKeys = new Set(profile.badges.map((b) => b.badgeKey));
  const memberDate = new Date(profile.memberSince);
  const initials = profile.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Avatar + Name */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-700 text-2xl font-bold mb-4">
            {initials}
          </div>
          <h1 className="text-2xl font-bold text-navy">{profile.name}</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {profile.sportifId}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-navy">{profile.eventCount}</p>
            <p className="text-xs text-muted-foreground">
              Événement{profile.eventCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-navy">{profile.hordeSize}</p>
            <p className="text-xs text-muted-foreground">
              Ami{profile.hordeSize !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-navy">
              {memberDate.toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">Membre depuis</p>
          </div>
        </div>

        {/* Sport disciplines */}
        {Object.keys(profile.sportBreakdown).length > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold text-navy mb-3">
              Disciplines sportives
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.sportBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([sport, count]) => (
                  <span
                    key={sport}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                      SPORT_COLORS[sport] || SPORT_COLORS.OTHER
                    }`}
                  >
                    {SPORT_LABELS[sport] || sport}
                    <span className="opacity-60">({count})</span>
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-base font-semibold text-navy mb-4">
            Badges{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({earnedKeys.size}/{BADGE_DEFINITIONS.length})
            </span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {BADGE_DEFINITIONS.map((def) => {
              const isEarned = earnedKeys.has(def.key);
              return (
                <div
                  key={def.key}
                  className="flex flex-col items-center gap-1.5"
                  title={def.descriptionFr}
                >
                  <BadgeIcon badgeKey={def.key} earned={isEarned} size={56} />
                  <span
                    className={`text-xs font-medium text-center leading-tight ${
                      isEarned ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {def.labelFr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald hover:bg-emerald-dark text-white font-medium rounded-full transition-colors"
          >
            Rejoindre Focus Racer
          </a>
        </div>
      </div>
    </div>
  );
}
