"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function LightboxShareButtons({ eventName, eventId }: { eventName: string; eventId: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/events/${eventId}`);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [eventId]);

  const shareText = `Mes photos de ${eventName} sur Focus Racer`;

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: eventName, text: shareText, url: shareUrl });
      } catch {
        // User cancelled
      }
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
        title="Facebook"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        title="X (Twitter)"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
        title="WhatsApp"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <button
        onClick={handleCopyLink}
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        title={copied ? "Copié !" : "Copier le lien"}
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.44a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.5 8.688" />
          </svg>
        )}
      </button>
      {canNativeShare && (
        <button
          onClick={handleNativeShare}
          className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
          title="Partager"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        </button>
      )}
    </div>
  );
}

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

  // Lightbox state
  const [lightboxEventId, setLightboxEventId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState<string | null>(null);

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

  // Lightbox helpers
  const lightboxGroup = lightboxEventId
    ? filteredGroups.find((g) => g.event.id === lightboxEventId)
    : null;
  const lightboxPhotos = lightboxGroup?.photos || [];
  const lightboxPhoto = lightboxPhotos[lightboxIndex] || null;

  const openLightbox = (eventId: string, photoIndex: number) => {
    setLightboxEventId(eventId);
    setLightboxIndex(photoIndex);
  };

  const closeLightbox = useCallback(() => {
    setLightboxEventId(null);
    setLightboxIndex(0);
  }, []);

  const goLightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i > 0 ? i - 1 : lightboxPhotos.length - 1));
  }, [lightboxPhotos.length]);

  const goLightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i < lightboxPhotos.length - 1 ? i + 1 : 0));
  }, [lightboxPhotos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxEventId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goLightboxPrev();
      if (e.key === "ArrowRight") goLightboxNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxEventId, closeLightbox, goLightboxPrev, goLightboxNext]);

  // Download individual photo
  const downloadPhoto = async (photoId: string) => {
    setDownloading(photoId);
    try {
      const res = await fetch(`/api/sportif/photos/${photoId}/download`);
      if (!res.ok) throw new Error("Erreur téléchargement");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `photo_${photoId}.jpg`;
      if (disposition) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match) filename = decodeURIComponent(match[1]);
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement");
    } finally {
      setDownloading(null);
    }
  };

  // Download all purchased photos for an event
  const downloadEvent = async (eventId: string) => {
    setDownloadingAll(eventId);
    try {
      const res = await fetch(`/api/sportif/photos/download-event/${eventId}`);
      if (!res.ok) throw new Error("Erreur téléchargement");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `FocusRacer_photos.zip`;
      if (disposition) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match) filename = decodeURIComponent(match[1]);
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement");
    } finally {
      setDownloadingAll(null);
    }
  };

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
            <Link href="/explore">
              <Button variant="outline">Rechercher mes photos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            const isCollapsed = collapsed.has(group.event.id);
            const purchasedInGroup = group.photos.filter((p) => p.purchased).length;

            return (
              <div key={group.event.id}>
                {/* Event header */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => toggleCollapse(group.event.id)}
                    className="flex-1 flex items-center gap-3 group min-w-0"
                  >
                    <h2 className="text-lg font-semibold text-navy truncate">{group.event.name}</h2>
                    <span className="text-sm text-muted-foreground flex-shrink-0">
                      {new Date(group.event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{group.photos.length} photos</Badge>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {/* Download all button */}
                  {purchasedInGroup > 0 && !isCollapsed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadEvent(group.event.id)}
                      disabled={downloadingAll === group.event.id}
                      className="flex-shrink-0 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                      {downloadingAll === group.event.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      )}
                      <span className="hidden sm:inline">Tout télécharger</span>
                      <span className="sm:hidden">Tout</span>
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px] ml-1">{purchasedInGroup}</Badge>
                    </Button>
                  )}
                </div>

                {/* Photos grid */}
                {!isCollapsed && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {group.photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
                        onClick={() => openLightbox(group.event.id, idx)}
                      >
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
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox overlay */}
      {lightboxEventId && lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 text-white/70 text-sm">
            {lightboxIndex + 1} / {lightboxPhotos.length}
          </div>

          {/* Previous button */}
          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goLightboxPrev(); }}
              className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Photo */}
          <div
            className="relative max-w-[90vw] max-h-[80vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Use webPath for purchased (no watermark), thumbnail for non-purchased */}
            <Image
              src={(lightboxPhoto.purchased ? lightboxPhoto.webPath : lightboxPhoto.thumbnail) || lightboxPhoto.thumbnail || ""}
              alt="Photo"
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next button */}
          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goLightboxNext(); }}
              className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
            <div className="flex items-center justify-between max-w-3xl mx-auto gap-3">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{lightboxGroup?.event.name}</p>
                {lightboxPhoto.purchased ? (
                  <p className="text-emerald-400 text-xs">Achetée — HD disponible</p>
                ) : (
                  <p className="text-blue-300 text-xs">Disponible à l&apos;achat</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Social share buttons */}
                {lightboxGroup && (
                  <LightboxShareButtons eventName={lightboxGroup.event.name} eventId={lightboxGroup.event.id} />
                )}
                {/* Separator */}
                <div className="w-px h-6 bg-white/20" />
                {/* Action button */}
                {lightboxPhoto.purchased ? (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); downloadPhoto(lightboxPhoto.id); }}
                    disabled={downloading === lightboxPhoto.id}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
                  >
                    {downloading === lightboxPhoto.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    )}
                    <span className="hidden sm:inline">Télécharger HD</span>
                    <span className="sm:hidden">HD</span>
                  </Button>
                ) : (
                  <Link href={`/events/${lightboxGroup?.event.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      Acheter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
