"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FavoriteEvent {
  id: string;
  name: string;
  date: string;
  location: string | null;
  sportType: string;
  coverImage: string | null;
  _count?: { photos: number };
}

interface HordeFeedItem {
  event: {
    id: string;
    name: string;
    date: string;
    location: string | null;
    sportType: string;
    coverImage: string | null;
  };
  members: { name: string; sportifId: string | null }[];
}

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Course à obstacles",
  OTHER: "Autre",
};

export default function SportifCoursesPage() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [hordeFeed, setHordeFeed] = useState<HordeFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/account/favorites").then((r) => r.json()),
      fetch("/api/sportif/horde/feed").then((r) => r.json()),
    ])
      .then(([favData, feedData]) => {
        const favs = favData?.favorites || [];
        setFavorites(favs.map((f: { event: FavoriteEvent }) => f.event));
        setHordeFeed(Array.isArray(feedData) ? feedData : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const removeFavorite = async (eventId: string) => {
    setRemovingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/favorite`, { method: "POST" });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== eventId));
        toast({ title: "Événement retiré des favoris" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de retirer le favori", variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Mes courses</h1>
        <p className="text-muted-foreground mt-1">Événements que vous suivez</p>
      </div>

      {/* Favorites list */}
      {favorites.length > 0 ? (
        <div className="space-y-3 mb-12">
          {favorites.map((event) => (
            <Card key={event.id} className="glass-card rounded-2xl hover:shadow-glass-lg transition-all duration-200">
              <CardContent className="p-4 flex items-center gap-4">
                <Link href={`/events/${event.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 relative overflow-hidden">
                    {event.coverImage ? (
                      <Image src={event.coverImage} alt={event.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      {event.location && ` — ${event.location}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{SPORT_LABELS[event.sportType] || event.sportType}</Badge>
                      {event._count && <span className="text-xs text-muted-foreground">{event._count.photos} photos</span>}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFavorite(event.id)}
                  disabled={removingId === event.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  {removingId === event.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card rounded-2xl mb-12">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Vous ne suivez aucun événement</p>
            <Link href="/runner">
              <Button variant="outline">Découvrir des événements</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Horde feed */}
      {hordeFeed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy mb-4">Activité de la Horde</h2>
          <div className="space-y-3">
            {hordeFeed.map((item) => (
              <Link key={item.event.id} href={`/events/${item.event.id}`}>
                <Card className="glass-card rounded-2xl hover:shadow-glass-lg transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.event.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.members.map((m) => m.name).join(", ")} — {new Date(item.event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Discover link */}
      <div className="mt-12 text-center">
        <Link href="/runner">
          <Button variant="outline" className="rounded-xl">
            Découvrir de nouveaux événements
          </Button>
        </Link>
      </div>
    </div>
  );
}
