"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Obstacles",
  OTHER: "Autre",
};

interface PublicEvent {
  id: string;
  name: string;
  date: string;
  location: string | null;
  sportType: string;
  coverImage: string | null;
  user: { name: string };
  _count: { photos: number };
}

export function HomeEvents() {
  const [events, setEvents] = useState<PublicEvent[]>([]);

  useEffect(() => {
    fetch("/api/events/public")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEvents(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Événements récents
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Retrouvez vos photos parmi les dernières courses
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block group">
              <div className="glass-card rounded-2xl overflow-hidden hover:shadow-glass-lg transition-all duration-300 h-full">
                {event.coverImage ? (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={event.coverImage}
                      alt={event.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-white px-4">
                    <span className="text-lg font-bold text-gray-800 text-center leading-tight">
                      {event.name}
                    </span>
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-navy group-hover:text-emerald transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.location && ` \u2022 ${event.location}`}
                  </p>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-emerald/30 text-emerald text-xs">
                        {SPORT_LABELS[event.sportType] || event.sportType}
                      </Badge>
                      <Badge className="bg-emerald/10 text-emerald hover:bg-emerald/10 text-xs">
                        {event._count.photos} photo{event._count.photos !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">par {event.user.name}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/runner"
            className="inline-flex items-center gap-2 text-emerald hover:text-emerald-dark font-medium transition-colors"
          >
            Voir tous les événements
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
