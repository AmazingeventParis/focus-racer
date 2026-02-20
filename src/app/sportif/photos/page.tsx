"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PhotoItem {
  id: string;
  thumbnail: string | null;
  webPath: string | null;
  purchased: boolean;
}

interface EventGroup {
  event: {
    id: string;
    name: string;
    date: string;
    location: string | null;
    sportType: string;
    coverImage: string | null;
  };
  photos: PhotoItem[];
}

export default function SportifPhotosPage() {
  const [groups, setGroups] = useState<EventGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "purchased" | "available">("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/sportif/photos")
      .then((r) => r.json())
      .then(setGroups)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const toggleCollapse = (eventId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const filteredGroups = groups
    .map((g) => ({
      ...g,
      photos: g.photos.filter((p) => {
        if (filter === "purchased") return p.purchased;
        if (filter === "available") return !p.purchased;
        return true;
      }),
    }))
    .filter((g) => g.photos.length > 0);

  const totalPhotos = groups.reduce((sum, g) => sum + g.photos.length, 0);
  const purchasedCount = groups.reduce((sum, g) => sum + g.photos.filter((p) => p.purchased).length, 0);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Mes photos</h1>
        <p className="text-muted-foreground mt-1">
          {totalPhotos} photo(s) — {purchasedCount} achetée(s)
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all" as const, label: "Toutes" },
          { key: "purchased" as const, label: "Achetées" },
          { key: "available" as const, label: "Disponibles" },
        ].map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? "bg-emerald hover:bg-emerald-dark text-white" : ""}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filteredGroups.length === 0 ? (
        <Card className="glass-card rounded-2xl">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
            <p className="text-muted-foreground mb-2">Aucune photo trouvée</p>
            <p className="text-sm text-gray-400 mb-6">
              Vos photos apparaîtront ici lorsque vous serez inscrit sur une start-list ou après un achat.
            </p>
            <Link href="/runner">
              <Button variant="outline">Rechercher mes photos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            const isCollapsed = collapsed.has(group.event.id);

            return (
              <div key={group.event.id}>
                {/* Event header */}
                <button
                  onClick={() => toggleCollapse(group.event.id)}
                  className="w-full flex items-center gap-3 mb-3 group"
                >
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <h2 className="text-lg font-semibold text-navy truncate">{group.event.name}</h2>
                    <span className="text-sm text-muted-foreground flex-shrink-0">
                      {new Date(group.event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{group.photos.length} photos</Badge>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Photos grid */}
                {!isCollapsed && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {group.photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        {photo.thumbnail ? (
                          <Image src={photo.thumbnail} alt="Photo" fill className="object-cover" sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                            </svg>
                          </div>
                        )}
                        {/* Badge overlay */}
                        <div className="absolute top-2 right-2">
                          {photo.purchased ? (
                            <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">Achetée</Badge>
                          ) : (
                            <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">Disponible</Badge>
                          )}
                        </div>
                        {/* Click to view/buy */}
                        {!photo.purchased && (
                          <Link
                            href={`/events/${group.event.id}`}
                            className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/50 to-transparent"
                          >
                            <span className="text-white text-xs font-medium">Voir</span>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
