"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedImage from "@/components/protected-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import Footer from "@/components/layout/Footer";
import GuestFollowForm from "@/components/GuestFollowForm";

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Course à obstacles",
  OTHER: "Autre",
};

// Hand-drawn style sport SVG icons per sport type (24x24 viewBox, stroke paths)
const SPORT_ICON_PATHS: Record<string, string[][]> = {
  RUNNING: [
    ["M12 4a2 2 0 100-4 2 2 0 000 4z", "M8 22l2-8 4 2v6", "M16 10l-4 4-3-2-3 4"],
    ["M4 17l2-4c1-2 3-3 5-3h3l2 2h3c1 0 1.5.7 1.5 1.5S20 15 19 15H4z"],
    ["M12 14a6 6 0 110-.01", "M12 8v6l4-3", "M12 2v3", "M10 2h4"],
    ["M5 3v18", "M5 4h9l-3 3.5L14 11H5"],
    ["M12 17a4 4 0 110-.01", "M9 4h6l-1.5 8h-3z"],
    ["M2 12h4l2-5 2 10 2-10 2 5h6"],
  ],
  TRAIL: [
    ["M2 20l5-10 4 5 5-13 4 18"],
    ["M12 4v8", "M12 12c-3 0-5 2.5-5 6", "M12 12c3 0 5 2.5 5 6", "M7 22h10"],
    ["M12 12a7 7 0 110-.01", "M12 5v7", "M12 12l5 3"],
    ["M3 18l2-3c1-2 3-3 5-3h4l2 1h3c.6 0 1 .5 1 1s-.4 1-1 1H3z"],
    ["M12 3c0 3-4 5.5-4 9a4 4 0 108 0c0-3.5-4-6-4-9z"],
    ["M2 20l3-5 3 2 4-8 3 4 3-9 2 16"],
  ],
  TRIATHLON: [
    ["M4 14c2-4 4.5-5 6-5s3 1 4.5 3c1.5 2 3.5 2 5.5 2", "M4 17c2-3 4-4 6-4s4 1 5 3"],
    ["M6 18a4 4 0 118 0 4 4 0 01-8 0z", "M14 18a4 4 0 118 0 4 4 0 01-8 0z", "M10 18l2-7 4 3", "M12 11l4-5"],
    ["M12 4a2 2 0 100-4 2 2 0 000 4z", "M8 22l2-8 4 2v6", "M16 10l-4 4-3-2-3 4"],
    ["M2 8c2-2 4-1 6 0s4 2 6 0 4-1 6 0", "M2 14c2-2 4-1 6 0s4 2 6 0 4-1 6 0"],
    ["M8 12a4 4 0 118 0", "M6 12a2 2 0 114 0", "M14 12a2 2 0 114 0"],
    ["M5 3v18", "M5 4h9l-3 3.5L14 11H5"],
  ],
  CYCLING: [
    ["M5 18a4 4 0 118-.01", "M15 18a4 4 0 118-.01", "M9 18l3-7 4 3", "M12 11l5-5"],
    ["M12 12a7 7 0 110-.01", "M12 5v14", "M5 12h14"],
    ["M7 18c0-3 2.2-5.5 5-5.5S17 15 17 18", "M12 12.5V9", "M8 9h8c.5 0 1-.5 1-1.2 0-.6-.5-1.3-1-1.3H8c-.5 0-1 .7-1 1.3 0 .7.5 1.2 1 1.2z"],
    ["M7 3h10v7c0 1-.9 2-2 2H9c-1 0-2-1-2-2V3z", "M5 3h14", "M10 3v4", "M14 3v4"],
    ["M12 12a5 5 0 110-.01", "M12 12a2 2 0 110-.01", "M14.5 7l-5 10", "M9.5 7l5 10"],
    ["M2 18h20", "M2 18c2-2 4-6 10-6s8 4 10 6"],
  ],
  SWIMMING: [
    ["M4 14c2-3 4-5 6-5s3 2 4 4 3 2 6 1", "M4 10c2-3 4-4 6-4s3 1 4 3 3 2 6 1"],
    ["M2 8c2-2 4-1 6 0s4 2 6 0 4-1 6 0", "M2 14c2-2 4-1 6 0s4 2 6 0 4-1 6 0", "M2 20c2-2 4-1 6 0s4 2 6 0 4-1 6 0"],
    ["M4 11c1.5-1.5 3.5-2.5 4.5-2.5s2 1 3.5 2.5 3 2.5 4.5 2.5 2.5-1 4-2.5", "M5.5 11a2.5 2.5 0 115 0", "M13 11a2.5 2.5 0 115 0"],
    ["M3 6h18v14H3V6z", "M3 10h18", "M3 14h18", "M3 18h18"],
    ["M12 3v3", "M12 6c-2 0-3 2-3 5l3 5 3-5c0-3-1-5-3-5z"],
    ["M12 3c0 3-4 5-4 8a4 4 0 008 0c0-3-4-5-4-8z"],
  ],
  OBSTACLE: [
    ["M5 4v16", "M19 4v16", "M5 10h14", "M5 16h14", "M5 4h14"],
    ["M12 2v20", "M8 6c2 2 6 2 8 0", "M8 11c2 2 6 2 8 0", "M8 16c2 2 6 2 8 0"],
    ["M12 12a7 7 0 110-.01", "M12 5v14", "M5 12h14", "M7.5 6l9 12", "M16.5 6l-9 12"],
    ["M2 12h2l1.5-2 2 4 2-4 2 4 2-4 2 4 2-4 1.5 2h2"],
    ["M3 20c1-3 3-5 5-5s3 2 4.5 0S15 13 17 13s4 3 4.5 7"],
    ["M4 20V8h4v12", "M10 20V4h4v16", "M16 20V8h4v12", "M4 8h16"],
  ],
  OTHER: [
    ["M6.8 6.2c-.6.3-1.1.9-1.3 1.5l-1.2.2c-1 .2-1.8 1.1-1.8 2.1v8.3c0 1.2 1 2.2 2.2 2.2H18c1.2 0 2.2-1 2.2-2.2V10c0-1-1-2-2-2.2l-1.1-.2c-.7-.1-1.3-.5-1.6-1l-.8-1.3c-.4-.6-1-1-1.7-1h-2.5c-.8 0-1.5.4-1.9 1l-.8 1.3z", "M16 13a4 4 0 11-8 0 4 4 0 018 0z"],
    ["M12 17a4 4 0 110-.01", "M9 4h6l-1.5 8h-3z"],
    ["M8 21h8", "M10 21l-.5-3h5l-.5 3", "M7 18h10", "M8 18V9l4-6 4 6v9"],
    ["M5 3v18", "M5 4h9l-3 3.5L14 11H5"],
    ["M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2-6.2-4.5-6.2 4.5 2.4-7.2-6-4.4h7.5z"],
    ["M13 2L3 14h8l-1 8 10-12h-8l1-8z"],
  ],
};

const RETENTION_DAYS = 30;

function getDaysBeforeDeletion(eventDate: string): number | null {
  const now = new Date();
  const d = new Date(eventDate);
  if (d >= now) return null;
  const daysSince = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = RETENTION_DAYS - daysSince;
  return remaining > 0 ? remaining : null;
}

function SportPatternOverlay({ sportType }: { sportType: string }) {
  const elements = useMemo(() => {
    const icons = SPORT_ICON_PATHS[sportType] || SPORT_ICON_PATHS.OTHER;
    const items = [];
    const cols = 12;
    const rows = 8;
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const idx = i % icons.length;
      const rot = ((row * 17 + col * 31) % 70) - 35;
      const x = (col + 0.5) / cols * 100 + ((row * 7 + col * 3) % 6 - 3);
      const y = (row + 0.5) / rows * 100 + ((col * 11 + row * 5) % 6 - 3);
      items.push(
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute w-8 h-8 md:w-12 md:h-12"
          style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) rotate(${rot}deg)` }}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icons[idx].map((d, j) => <path key={j} d={d} />)}
        </svg>
      );
    }
    return items;
  }, [sportType]);

  return (
    <div className="absolute inset-0 text-white overflow-hidden pointer-events-none" style={{ opacity: 0.05 }}>
      {elements}
    </div>
  );
}

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
      <div className="min-h-screen bg-[#070B1F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#070B1F] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#070B1F] gallery-protected">
      {/* Header sticky */}
      <header className="sticky top-0 z-40 bg-[#151C44]/95 backdrop-blur-sm border-b border-[#2C3566]">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
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

      {/* Hero Event — gradient bg with sport pictograms */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-emerald/70" />
        {/* Sport pictograms pattern */}
        <SportPatternOverlay sportType={event.sportType} />

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-24">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Left: Event poster */}
            {event.coverImage && (
              <div className="flex-shrink-0">
                <div className="relative w-40 sm:w-48 md:w-52 lg:w-60 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 ring-4 ring-white/10">
                  <Image src={event.coverImage} alt={`Affiche ${event.name}`} fill className="object-cover" />
                </div>
              </div>
            )}

            {/* Right: Event info */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              {/* Logo + title */}
              <div className="flex items-center gap-3 justify-center md:justify-start">
                {event.logoImage && (
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-white/40 flex-shrink-0 shadow-lg">
                    <Image src={event.logoImage} alt="Logo" fill className="object-contain bg-[#151C44]" />
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg truncate">{event.name}</h1>
              </div>

              {/* Date + location */}
              <p className="text-white/75 mt-2 text-sm md:text-base">
                {new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {event.location && ` \u2014 ${event.location}`}
              </p>
              <p className="text-white/40 text-xs mt-1">Photos par {event.photographer}</p>

              {/* Stats pills: sport, photos, sportifs, IA */}
              <div className="flex flex-wrap items-center gap-2 mt-4 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 bg-white/12 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-sm text-white font-medium">
                  {SPORT_LABELS[event.sportType] || event.sportType}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/12 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-sm text-white">
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <span className="font-bold">{event.photoCount}</span> photos
                </span>
                {event.runnerCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-white/12 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-sm text-white">
                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <span className="font-bold">{event.runnerCount}</span> sportifs
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-emerald/20 backdrop-blur-sm border border-emerald/30 rounded-full px-3 py-1.5 text-sm text-emerald-200 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Recherche IA
                </span>
                {(() => {
                  const daysLeft = getDaysBeforeDeletion(event.date);
                  if (daysLeft === null) return null;
                  return (
                    <span className={`inline-flex items-center gap-1.5 backdrop-blur-sm border rounded-full px-3 py-1.5 text-sm font-medium ${
                      daysLeft <= 7
                        ? "bg-red-500/20 border-red-400/30 text-red-200"
                        : "bg-amber-500/20 border-amber-400/30 text-amber-200"
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {daysLeft}j avant suppression
                    </span>
                  );
                })()}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-white/50 text-sm mt-3 max-w-lg mx-auto md:mx-0">{event.description}</p>
              )}

              {/* Tarifs row */}
              {packs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 justify-center md:justify-start">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Tarifs</span>
                  {packs.map((pack) => (
                    <div key={pack.id} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg px-2.5 py-1">
                      <span className="text-xs text-white/60">{pack.name}</span>
                      <span className="text-sm font-bold text-white ml-1.5">{pack.price.toFixed(2).replace(".", ",")}€</span>
                      {pack.quantity && pack.quantity > 1 && (
                        <span className="text-[10px] text-white/35 ml-1">({(pack.price / pack.quantity).toFixed(2).replace(".", ",")}€/photo)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {session?.user && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button variant="outline" size="sm" disabled={followLoading} onClick={toggleFollow}
                    className={isFollowing ? "bg-emerald/20 border-emerald/50 text-white hover:bg-emerald/30 rounded-xl" : "bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"}>
                    {isFollowing ? "★ Événement suivi" : "☆ Suivre cet événement"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAlertModal(true)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {alertCreated ? "Alerte créée !" : "Créer une alerte"}
                  </Button>
                </div>
              )}

              {/* Guest follow form for non-authenticated visitors */}
              {!session?.user && (
                <GuestFollowForm eventId={id} />
              )}
            </div>
          </div>
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAlertModal(false)}>
            <div className="bg-[#151C44] rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-[#2C3566]" onClick={(e) => e.stopPropagation()}>
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
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAlertModal(false)}>Annuler</Button>
                <Button className="flex-1 rounded-xl bg-emerald hover:bg-emerald-dark text-white" onClick={createPhotoAlert} disabled={alertLoading || !alertBib.trim()}>
                  {alertLoading ? "..." : "Activer l’alerte"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search block — raised over hero */}
      <div className="-mt-14 relative z-10 px-4">
        <Card className="max-w-2xl mx-auto bg-[#151C44] shadow-2xl rounded-3xl border border-[#2C3566]">
          <CardContent className="p-5 md:p-8">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 text-center">Retrouvez vos photos</h2>
            <p className="text-muted-foreground text-center mt-1 text-xs md:text-sm">
              Entrez votre numéro de dossard{event.runnerCount > 0 ? ", nom" : ""} ou prenez un selfie
            </p>

            <form onSubmit={handleSearch} className="mt-4">
              <div className="flex gap-2">
                <Input
                  ref={searchInputRef}
                  placeholder={event.runnerCount > 0 ? "N° de dossard ou nom..." : "N° de dossard..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-lg h-12 md:h-14 rounded-xl border-[#2C3566] bg-[#0C1029] text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
                />
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-12 md:h-14 px-5 md:px-8 bg-emerald hover:bg-emerald-dark text-white rounded-xl text-base md:text-lg shadow-emerald transition-all duration-200"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSearching ? "..." : "Rechercher"}
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-3 mt-3">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; await handleSelfieSearch(file); e.target.value = ""; }} />
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2C3566] text-xs text-gray-500 hover:border-emerald hover:text-emerald transition-colors bg-[#0C1029] hover:bg-emerald/5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Importer un selfie
                </span>
              </label>
              <button type="button" onClick={openCamera} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2C3566] text-xs text-gray-500 hover:border-emerald hover:text-emerald transition-colors bg-[#0C1029] hover:bg-emerald/5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Prendre un selfie
              </button>
              {event.runnerCount > 0 && (
                <button type="button" onClick={() => searchInputRef.current?.focus()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2C3566] text-xs text-gray-500 hover:border-emerald hover:text-emerald transition-colors bg-[#0C1029] hover:bg-emerald/5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Recherche par nom
                </button>
              )}
            </div>
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
                <div className="bg-[#151C44] rounded-xl p-4 mb-3 border-l-4 shadow-sm border border-[#2C3566]" style={{ borderLeftColor: primaryColor }}>
                  <p className="font-semibold text-gray-900">
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
              <p className="text-gray-900 font-medium">
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
                  className="group relative bg-[#151C44] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-[#2C3566]"
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
                          : "bg-[#151C44]/80 text-muted-foreground hover:bg-[#151C44]"
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
        <div className="container mx-auto px-4 py-10">
          <div className="text-center max-w-md mx-auto">
            <p className="text-lg md:text-xl font-semibold text-gray-900">Vos photos vous attendent !</p>
            <p className="text-muted-foreground mt-2 text-sm">
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
