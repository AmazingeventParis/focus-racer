"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Course à obstacles",
  OTHER: "Autre",
};

interface Recommendation {
  id: string;
  name: string;
  date: string;
  location: string | null;
  sportType: string;
  coverImage: string | null;
  photoCount: number;
}

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  loading?: boolean;
}

export default function RecommendationCards({
  recommendations,
  loading,
}: RecommendationCardsProps) {
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-navy mb-4">Suggestions pour vous</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  const toggleFollow = async (eventId: string) => {
    setTogglingIds((prev) => new Set(prev).add(eventId));

    // Optimistic UI
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });

    try {
      await fetch(`/api/events/${eventId}/favorite`, { method: "POST" });
    } catch {
      // Revert on error
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  // Show max 3
  const shown = recommendations.slice(0, 3);

  return (
    <div>
      <h3 className="text-lg font-semibold text-navy mb-4">Suggestions pour vous</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {shown.map((event) => {
          const isFollowed = followedIds.has(event.id);
          const isToggling = togglingIds.has(event.id);

          return (
            <div key={event.id} className="glass-card rounded-2xl overflow-hidden">
              <Link href={`/events/${event.id}`}>
                <div className="aspect-video bg-gray-100 relative">
                  {event.coverImage ? (
                    <Image
                      src={event.coverImage}
                      alt={event.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/events/${event.id}`}>
                  <h4 className="font-medium text-gray-900 truncate hover:text-emerald transition-colors">
                    {event.name}
                  </h4>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(event.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}
                  {event.location && ` — ${event.location}`}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-xs">
                    {SPORT_LABELS[event.sportType] || event.sportType}
                  </Badge>
                  <button
                    onClick={() => toggleFollow(event.id)}
                    disabled={isToggling}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                      isFollowed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {isFollowed ? "✓ Suivi" : "Suivre"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
