"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedImage from "@/components/protected-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import Footer from "@/components/layout/Footer";

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Course à obstacles",
  OTHER: "Autre",
};

interface PublicPhoto {
  id: string;
  src: string;
  originalName: string;
  bibNumbers: { id: string; number: string }[];
}

interface PublicEvent {
  id: string;
  name: string;
  date: string;
  location: string | null;
  description: string | null;
  sportType: string;
  coverImage: string | null;
  bannerImage: string | null;
  logoImage: string | null;
  primaryColor: string | null;
  photographer: string;
  photoCount: number;
  runnerCount: number;
  photos: PublicPhoto[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface SearchResult {
  runner: { firstName: string; lastName: string; bibNumber: string } | null;
  matchedRunners?: { firstName: string; lastName: string; bibNumber: string }[];
  count: number;
  photos: PublicPhoto[];
}

export default function PublicEventPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: session } = useSession();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewerPhoto, setViewerPhoto] = useState<PublicPhoto | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`favorites_${id}`);
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, [id]);

  const saveFavorites = useCallback((newFavs: Set<string>) => {
    setFavorites(newFavs);
    localStorage.setItem(`favorites_${id}`, JSON.stringify(Array.from(newFavs)));
  }, [id]);

  const toggleFavorite = (photoId: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(photoId)) {
      newFavs.delete(photoId);
    } else {
      newFavs.add(photoId);
    }
    saveFavorites(newFavs);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/public/${id}`);
        if (response.ok) {
          setEvent(await response.json());
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Check if user follows this event
  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/events/${id}/favorite`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setIsFollowing(data.isFavorite); })
      .catch(() => {});
  }, [id, session?.user]);

  const toggleFollow = async () => {
    if (!session?.user) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/events/${id}/favorite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFavorite);
      }
    } catch {}
    setFollowLoading(false);
  };

  const reportWrongBib = async (photoId: string, bibNumber: string) => {
    if (!confirm(`Signaler que le dossard #${bibNumber} ne vous correspond pas ?`)) return;
    try {
      const res = await fetch(`/api/photos/${photoId}/report-wrong`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bibNumber }),
      });
      if (res.ok) {
        // Remove bib from local state
        const updatePhotos = (photos: PublicPhoto[]) =>
          photos.map((p) =>
            p.id === photoId
              ? { ...p, bibNumbers: p.bibNumbers.filter((b) => b.number !== bibNumber) }
              : p
          );
        if (searchResult) {
          setSearchResult({ ...searchResult, photos: updatePhotos(searchResult.photos) });
        }
        if (event) {
          setEvent({ ...event, photos: updatePhotos(event.photos) });
        }
      }
    } catch {}
  };

  // Infinite scroll: load more photos when sentinel enters viewport
  const loadMorePhotos = useCallback(async () => {
    if (!event?.nextCursor || !event.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/events/public/${id}?cursor=${event.nextCursor}`);
      if (res.ok) {
        const data = await res.json();
        setEvent((prev) => prev ? {
          ...prev,
          photos: [...prev.photos, ...data.photos],
          nextCursor: data.nextCursor,
          hasMore: data.hasMore,
        } : prev);
      }
    } catch (error) {
      console.error("Error loading more photos:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [event?.nextCursor, event?.hasMore, isLoadingMore, id]);

  useEffect(() => {
    if (!event?.hasMore || searchResult) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMorePhotos(); },
      { rootMargin: "400px" }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [event?.hasMore, searchResult, loadMorePhotos]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }
    setIsSearching(true);
    try {
      const isNumber = /^\d+$/.test(searchQuery.trim());
      const param = isNumber ? `bib=${searchQuery.trim()}` : `name=${encodeURIComponent(searchQuery.trim())}`;
      const response = await fetch(`/api/photos/search?eventId=${id}&${param}`);
      if (response.ok) {
        setSearchResult(await response.json());
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
  };

  // Photos only shown on search results — no default gallery
  const displayPhotos = searchResult ? searchResult.photos : [];

  const openViewer = (photo: PublicPhoto, index: number) => {
    setViewerPhoto(photo);
    setViewerIndex(index);
  };

  // Prefetch adjacent images on hover for instant lightbox
  const prefetchImage = useCallback((index: number) => {
    const targets = [index - 1, index, index + 1];
    for (const i of targets) {
      if (i >= 0 && i < displayPhotos.length) {
        const img = new window.Image();
        img.src = displayPhotos[i].src;
      }
    }
  }, [displayPhotos]);

  const closeViewer = () => setViewerPhoto(null);

  const navigateViewer = (direction: number) => {
    const newIndex = viewerIndex + direction;
    if (newIndex >= 0 && newIndex < displayPhotos.length) {
      setViewerIndex(newIndex);
      setViewerPhoto(displayPhotos[newIndex]);
    }
  };

  // Keyboard navigation for viewer
  useEffect(() => {
    if (!viewerPhoto) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") navigateViewer(-1);
      if (e.key === "ArrowRight") navigateViewer(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Block Ctrl+S / Ctrl+Shift+I / Ctrl+U on gallery (deters casual save attempts)
  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.shiftKey && e.key === "I")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Événement non trouvé ou non publié</p>
          <Link href="/runner">
            <Button className="bg-emerald hover:bg-emerald-dark text-white shadow-emerald transition-all duration-200">Voir les événements</Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = event.primaryColor || "#14B8A6";
  const favCount = favorites.size;

  return (
    <div className="min-h-screen bg-gray-50 gallery-protected">
      {/* Header sticky */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-navy">
            Focus Racer
          </Link>
          <div className="flex items-center gap-3">
            {favCount > 0 && (
              <Link href={`/events/${id}/favorites`}>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <span className="text-emerald mr-1">&hearts;</span> {favCount} favori{favCount > 1 ? "s" : ""}
                </Button>
              </Link>
            )}
            <Link href="/runner">
              <Button variant="outline" size="sm" className="rounded-xl">Tous les événements</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Event — full width banner */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {event.bannerImage ? (
          <>
            <Image src={event.bannerImage} alt={event.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-emerald" />
        )}

        {/* Event info positioned at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 pb-20 pt-8 px-4 md:px-8">
          <div className="container mx-auto">
            <div className="flex items-end gap-4">
              {event.logoImage && (
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-white/80 flex-shrink-0 shadow-lg">
                  <Image src={event.logoImage} alt="Logo" fill className="object-contain bg-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg truncate">{event.name}</h1>
                <p className="text-white/80 mt-1 text-base md:text-lg">
                  {new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {event.location && ` \u2022 ${event.location}`}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {SPORT_LABELS[event.sportType] || event.sportType}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {event.photoCount} photos
                  </Badge>
                  {event.runnerCount > 0 && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {event.runnerCount} coureurs
                    </Badge>
                  )}
                  <span className="text-white/60 text-sm">par {event.photographer}</span>
                </div>
              </div>
            </div>
            {session?.user && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={followLoading}
                  onClick={toggleFollow}
                  className={isFollowing
                    ? "bg-emerald/20 border-emerald/50 text-white hover:bg-emerald/30 rounded-xl"
                    : "bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"
                  }
                >
                  {isFollowing ? "\u2605 Événement suivi" : "\u2606 Suivre cet événement"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search block — raised over hero */}
      <div className="-mt-14 relative z-10 px-4">
        <Card className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl border-0">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-navy text-center">Retrouvez vos photos</h2>
            <p className="text-muted-foreground text-center mt-1 text-sm md:text-base">
              Entrez votre numéro de dossard{event.runnerCount > 0 ? ", nom" : ""} ou prenez un selfie
            </p>

            <form onSubmit={handleSearch} className="mt-6">
              <div className="flex gap-3">
                <Input
                  ref={searchInputRef}
                  placeholder={event.runnerCount > 0 ? "N° de dossard ou nom..." : "N° de dossard..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-lg h-14 rounded-xl border-gray-200 focus:border-emerald focus:ring-emerald"
                />
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-14 px-6 md:px-8 bg-emerald hover:bg-emerald-dark text-white rounded-xl text-base md:text-lg shadow-emerald transition-all duration-200"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSearching ? "..." : "Rechercher"}
                </Button>
              </div>
            </form>

            <div className="flex justify-center gap-6 mt-4">
              {/* Selfie search */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsSearching(true);
                    try {
                      const formData = new FormData();
                      formData.append("selfie", file);
                      formData.append("eventId", id);
                      const res = await fetch("/api/photos/search-face", {
                        method: "POST",
                        body: formData,
                      });
                      if (res.ok) {
                        setSearchResult(await res.json());
                      }
                    } catch (err) {
                      console.error("Selfie search error:", err);
                    } finally {
                      setIsSearching(false);
                      e.target.value = "";
                    }
                  }}
                />
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald transition-colors">
                  <span className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center text-base">&#128247;</span>
                  Recherche par selfie
                </span>
              </label>
              {event.runnerCount > 0 && (
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center text-base">&#128269;</span>
                  Recherche par nom
                </button>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground mt-4 text-center">{event.description}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search results — only visible after search */}
      {searchResult && (
        <div className="container mx-auto px-4 py-8">
          {/* Result header */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex-1">
              {searchResult.runner && (
                <div className="bg-white rounded-xl p-4 mb-3 border-l-4 shadow-sm" style={{ borderLeftColor: primaryColor }}>
                  <p className="font-semibold text-navy">
                    {searchResult.runner.firstName} {searchResult.runner.lastName}
                    <Badge variant="secondary" className="ml-2 bg-emerald/10 text-emerald">#{searchResult.runner.bibNumber}</Badge>
                  </p>
                </div>
              )}
              {searchResult.matchedRunners && searchResult.matchedRunners.length > 1 && (
                <p className="text-sm text-muted-foreground mb-2">
                  {searchResult.matchedRunners.length} coureurs correspondent
                </p>
              )}
              <p className="text-navy font-medium">
                {searchResult.count > 0
                  ? `${searchResult.count} photo${searchResult.count > 1 ? "s" : ""} trouvée${searchResult.count > 1 ? "s" : ""}`
                  : "Aucune photo trouvée pour cette recherche"}
              </p>
            </div>
            <Button variant="outline" onClick={clearSearch} className="rounded-xl flex-shrink-0">
              Nouvelle recherche
            </Button>
          </div>

          {/* Photo grid */}
          {displayPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {displayPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => openViewer(photo, index)}
                  onMouseEnter={() => prefetchImage(index)}
                >
                  <div className="aspect-[4/3] relative">
                    <ProtectedImage
                      src={photo.src}
                      alt={photo.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors z-10"
                    >
                      <span className={favorites.has(photo.id) ? "text-emerald fill-emerald" : "text-muted-foreground"}>
                        {favorites.has(photo.id) ? "\u2665" : "\u2661"}
                      </span>
                    </button>
                  </div>
                  {photo.bibNumbers.length > 0 && (
                    <div className="p-2 flex flex-wrap gap-1">
                      {photo.bibNumbers.map((bib) => (
                        <span key={bib.id} className="inline-flex items-center gap-0.5">
                          <Badge variant="secondary" className="text-xs bg-emerald/10 text-emerald">
                            #{bib.number}
                          </Badge>
                          {session?.user && (
                            <button
                              onClick={(e) => { e.stopPropagation(); reportWrongBib(photo.id, bib.number); }}
                              className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors px-1"
                              title="Ce n'est pas moi"
                            >
                              &times;
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state — no search yet */}
      {!searchResult && (
        <div className="container mx-auto px-4 py-12">
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#128247;</span>
              </div>
              <p className="text-2xl font-bold text-navy">{event.photoCount}</p>
              <p className="text-sm text-muted-foreground">photos disponibles</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#127939;</span>
              </div>
              <p className="text-2xl font-bold text-navy">{event.runnerCount}</p>
              <p className="text-sm text-muted-foreground">coureurs identifiés</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#9889;</span>
              </div>
              <p className="text-2xl font-bold text-navy">Instantanée</p>
              <p className="text-sm text-muted-foreground">recherche par IA</p>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center mt-10">
            <p className="text-xl md:text-2xl font-semibold text-navy">Vos photos vous attendent !</p>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Tapez votre numéro de dossard ci-dessus pour retrouver toutes vos photos de course.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Photo Viewer / Lightbox */}
      {viewerPhoto && (
        <div
          className="fixed inset-0 z-50 bg-navy/90 flex items-center justify-center"
          onClick={closeViewer}
        >
          {/* Close button */}
          <button className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-white/70" onClick={closeViewer}>
            &times;
          </button>

          {/* Favorite button */}
          <button
            className="absolute top-4 left-4 text-2xl z-10"
            onClick={(e) => { e.stopPropagation(); toggleFavorite(viewerPhoto.id); }}
          >
            <span className={favorites.has(viewerPhoto.id) ? "text-emerald fill-emerald" : "text-white/70"}>
              {favorites.has(viewerPhoto.id) ? "\u2665" : "\u2661"}
            </span>
          </button>

          {/* Navigation arrows */}
          {viewerIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-white/70 z-10"
              onClick={(e) => { e.stopPropagation(); navigateViewer(-1); }}
            >
              &lsaquo;
            </button>
          )}
          {viewerIndex < displayPhotos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-white/70 z-10"
              onClick={(e) => { e.stopPropagation(); navigateViewer(1); }}
            >
              &rsaquo;
            </button>
          )}

          {/* Photo */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ProtectedImage
              src={viewerPhoto.src}
              alt={viewerPhoto.originalName}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Info bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy/60 rounded-lg px-4 py-2 text-white text-sm flex items-center gap-3">
            <span>{viewerIndex + 1} / {displayPhotos.length}</span>
            {viewerPhoto.bibNumbers.length > 0 && (
              <>
                <span className="text-white/40">|</span>
                {viewerPhoto.bibNumbers.map((bib) => (
                  <span key={bib.id} className="inline-flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs bg-emerald/10 text-emerald">
                      #{bib.number}
                    </Badge>
                    {searchResult && session?.user && (
                      <button
                        onClick={(e) => { e.stopPropagation(); reportWrongBib(viewerPhoto.id, bib.number); }}
                        className="text-xs text-white/50 hover:text-red-400 transition-colors"
                        title="Ce n'est pas moi"
                      >
                        Pas moi
                      </button>
                    )}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
