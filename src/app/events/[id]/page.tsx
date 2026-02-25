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
  const [showCamera, setShowCamera] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertBib, setAlertBib] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);
  const [packs, setPacks] = useState<{ id: string; name: string; type: string; price: number; quantity: number | null }[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    const fetchPacks = async () => {
      try {
        const res = await fetch(`/api/events/${id}/packs/public`);
        if (res.ok) setPacks(await res.json());
      } catch {}
    };
    fetchEvent();
    fetchPacks();
  }, [id]);

  // Check if user follows this event
  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/events/${id}/favorite`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setIsFollowing(data.favorited); })
      .catch(() => {});
  }, [id, session?.user]);

  const toggleFollow = async () => {
    if (!session?.user) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/events/${id}/favorite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.favorited);
      }
    } catch {}
    setFollowLoading(false);
  };

  const createPhotoAlert = async () => {
    if (!alertBib.trim()) return;
    setAlertLoading(true);
    try {
      const res = await fetch("/api/photo-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, bibNumber: alertBib.trim() }),
      });
      if (res.ok) {
        setAlertCreated(true);
        setShowAlertModal(false);
        setAlertBib("");
        setTimeout(() => setAlertCreated(false), 5000);
      }
    } catch {}
    setAlertLoading(false);
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

  // Shared selfie search logic
  const handleSelfieSearch = async (file: File | Blob) => {
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
    }
  };

  // Camera functions
  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      // Wait for video element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setShowCamera(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the capture to match the preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    closeCamera();
    canvas.toBlob((blob) => {
      if (blob) handleSelfieSearch(blob);
    }, "image/jpeg", 0.9);
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
          <Link href="/explore">
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
            <Link href={`/events/${id}/favorites`}>
              <Button variant="outline" size="sm" className="rounded-xl relative">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Panier{favCount > 0 ? ` (${favCount})` : ""}
                {favCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="sm" className="rounded-xl">Tous les événements</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Event — full width banner */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {(event.coverImage || event.bannerImage) ? (
          <>
            <Image src={(event.coverImage || event.bannerImage)!} alt={event.name} fill className="object-cover" />
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
                  {event.location && ` • ${event.location}`}
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
                      {event.runnerCount} sportifs
                    </Badge>
                  )}
                  <span className="text-white/60 text-sm">par {event.photographer}</span>
                </div>
              </div>
            </div>
            {session?.user && (
              <div className="mt-4 flex flex-wrap gap-2">
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
                  {isFollowing ? "★ Événement suivi" : "☆ Suivre cet événement"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlertModal(true)}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {alertCreated ? "Alerte créée !" : "Créer une alerte"}
                </Button>
              </div>
            )}

            {/* Alert Modal */}
            {showAlertModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAlertModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Créer une alerte photo</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Recevez une notification quand de nouvelles photos de votre dossard sont mises en ligne.
                  </p>
                  <Input
                    placeholder="Numéro de dossard"
                    value={alertBib}
                    onChange={(e) => setAlertBib(e.target.value)}
                    className="h-12 rounded-xl text-lg mb-4"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") createPhotoAlert(); }}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => setShowAlertModal(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="flex-1 rounded-xl bg-emerald hover:bg-emerald-dark text-white"
                      onClick={createPhotoAlert}
                      disabled={alertLoading || !alertBib.trim()}
                    >
                      {alertLoading ? "..." : "Activer l’alerte"}
                    </Button>
                  </div>
                </div>
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

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {/* Import selfie from gallery */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleSelfieSearch(file);
                    e.target.value = "";
                  }}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-emerald hover:text-emerald transition-colors bg-gray-50 hover:bg-emerald/5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Importer un selfie
                </span>
              </label>
              {/* Take selfie with camera */}
              <button
                type="button"
                onClick={openCamera}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-emerald hover:text-emerald transition-colors bg-gray-50 hover:bg-emerald/5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Prendre un selfie
              </button>
              {/* Search by name */}
              {event.runnerCount > 0 && (
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-emerald hover:text-emerald transition-colors bg-gray-50 hover:bg-emerald/5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
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
                  {searchResult.matchedRunners.length} sportifs correspondent
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
                      className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 ${
                        favorites.has(photo.id)
                          ? "bg-emerald text-white"
                          : "bg-white/80 text-muted-foreground hover:bg-white"
                      }`}
                    >
                      <svg className="w-4 h-4" fill={favorites.has(photo.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
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
                              ×
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
              <p className="text-sm text-muted-foreground">sportifs identifiés</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#9889;</span>
              </div>
              <p className="text-2xl font-bold text-navy">Instantanée</p>
              <p className="text-sm text-muted-foreground">recherche par IA</p>
            </div>
          </div>

          {/* Tarifs */}
          {packs.length > 0 && (
            <div className="mt-12 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-navy text-center mb-6">Tarifs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {packs.map((pack) => {
                  const unitPrice = pack.quantity && pack.quantity > 1
                    ? (pack.price / pack.quantity).toFixed(2).replace(".", ",")
                    : null;
                  return (
                    <div
                      key={pack.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{pack.name}</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: primaryColor }}>
                        {pack.price.toFixed(2).replace(".", ",")}€
                      </p>
                      {pack.quantity && pack.quantity > 1 ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          {pack.quantity} photos — {unitPrice}€/photo
                        </p>
                      ) : pack.type === "ALL_INCLUSIVE" ? (
                        <p className="text-xs text-muted-foreground mt-1">Toutes vos photos</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">1 photo</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

      {/* Camera modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={closeCamera}>
          <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <p className="text-white text-center mb-4 text-lg font-medium">Prenez un selfie</p>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-white/40 border-dashed" />
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={closeCamera}
                className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={capturePhoto}
                className="px-8 py-3 rounded-xl bg-emerald text-white hover:bg-emerald-dark transition-colors font-medium shadow-emerald"
              >
                Capturer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer / Lightbox */}
      {viewerPhoto && (
        <div
          className="fixed inset-0 z-50 bg-navy/90 flex items-center justify-center"
          onClick={closeViewer}
        >
          {/* Close button */}
          <button className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-white/70" onClick={closeViewer}>
            ×
          </button>

          {/* Cart button */}
          <button
            className={`absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
              favorites.has(viewerPhoto.id)
                ? "bg-emerald text-white"
                : "bg-white/20 text-white/80 hover:bg-white/30"
            }`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(viewerPhoto.id); }}
          >
            <svg className="w-5 h-5" fill={favorites.has(viewerPhoto.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <span className="text-sm font-medium">
              {favorites.has(viewerPhoto.id) ? "Dans le panier" : "Ajouter au panier"}
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
