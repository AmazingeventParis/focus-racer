"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Obstacles",
  OTHER: "Autre",
};

const SPORT_ICONS: Record<string, string> = {
  RUNNING: "\u{1F3C3}",
  TRAIL: "⛰️",
  TRIATHLON: "\u{1F3CA}",
  CYCLING: "\u{1F6B4}",
  SWIMMING: "\u{1F3CA}",
  OBSTACLE: "\u{1F94D}",
  OTHER: "\u{1F3C5}",
};

const TIME_FILTERS = [
  { label: "Tous", value: "all" },
  { label: "Aujourd'hui", value: "today" },
  { label: "Ce mois", value: "month" },
  { label: "Cette année", value: "year" },
  { label: "Passés", value: "past" },
];

const RETENTION_DAYS = 30;

function getDaysBeforeDeletion(eventDate: string): number | null {
  const now = new Date();
  const d = new Date(eventDate);
  if (d >= now) return null; // event not past yet
  const daysSince = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = RETENTION_DAYS - daysSince;
  return remaining > 0 ? remaining : null;
}

const SORT_OPTIONS = [
  { label: "Plus récents", value: "date-desc" },
  { label: "Plus anciens", value: "date-asc" },
  { label: "Plus de photos", value: "photos-desc" },
  { label: "Nom A-Z", value: "name-asc" },
];

interface PublicEvent {
  id: string;
  name: string;
  date: string;
  location: string | null;
  sportType: string;
  coverImage: string | null;
  primaryColor: string | null;
  user: { name: string };
  _count: { photos: number };
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ExplorePage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/public");
        if (response.ok) {
          setEvents(await response.json());
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.count || "0");
            const suffix = el.dataset.suffix || "";
            const duration = 2000;
            const start = performance.now();
            function animate(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(target * eased);
              if (current >= 1000) el.textContent = Math.floor(current / 1000) + "K" + suffix;
              else el.textContent = current + suffix;
              if (progress < 1) requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const reveal = useCallback((id: string) => visibleSections.has(id), [visibleSections]);

  // Available sport types from actual data
  const availableSports = useMemo(() => {
    const sports = new Set(events.map((e) => e.sportType));
    return Array.from(sports).sort();
  }, [events]);

  // Stats
  const stats = useMemo(() => {
    const totalPhotos = events.reduce((sum, e) => sum + e._count.photos, 0);
    const totalEvents = events.length;
    const totalSports = new Set(events.map((e) => e.sportType)).size;
    const upcomingCount = events.filter((e) => new Date(e.date) >= new Date()).length;
    return { totalPhotos, totalEvents, totalSports, upcomingCount };
  }, [events]);

  // Filtered & sorted events
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let filtered = events.filter((event) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (SPORT_LABELS[event.sportType] || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Sport filter
      const matchesSport = selectedSport === "all" || event.sportType === selectedSport;

      // Time filter
      const eventDate = new Date(event.date);
      const eventDateStr = eventDate.toISOString().slice(0, 10);
      const todayStr = now.toISOString().slice(0, 10);
      let matchesTime = true;
      if (selectedDate) {
        matchesTime = eventDateStr === selectedDate;
      } else if (selectedTime === "today") matchesTime = eventDateStr === todayStr;
      else if (selectedTime === "month") matchesTime = eventDate >= startOfMonth;
      else if (selectedTime === "year") matchesTime = eventDate >= startOfYear;
      else if (selectedTime === "past") matchesTime = eventDate < now;

      return matchesSearch && matchesSport && matchesTime;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "photos-desc") return b._count.photos - a._count.photos;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name, "fr");
      return 0;
    });

    return filtered;
  }, [events, searchQuery, selectedSport, selectedTime, selectedDate, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDate("");
    setSelectedSport("all");
    setSelectedTime("all");
    setSortBy("date-desc");
  };

  const hasActiveFilters = searchQuery || selectedSport !== "all" || selectedTime !== "all" || selectedDate || sortBy !== "date-desc";

  return (
    <main className="bg-white min-h-screen">
      {/* ═══════════ SEO HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-[120px]" />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Recherche gratuite par dossard, selfie ou nom
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Trouvez vos photos de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                course
              </span>
            </h1>
            <p className="text-white/70 max-w-lg mx-auto mb-8 text-lg">
              Sélectionnez un événement, puis recherchez vos photos par dossard, selfie ou nom.
              Notre IA vous trouve instantanément parmi des milliers d'images.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="Rechercher par nom d'événement, ville ou sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 bg-white/95 backdrop-blur-sm border-white/30 shadow-lg h-14 rounded-2xl text-gray-900 placeholder:text-gray-400 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="py-2 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center">
            <div>
              <span className="text-xl font-bold text-gray-900" data-count={stats.totalEvents} data-suffix="">0</span>
              <p className="text-xs text-gray-500">événements</p>
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-xl font-bold text-gray-900" data-count={Math.floor(stats.totalPhotos / 1000)} data-suffix="K+">0</span>
              <p className="text-xs text-gray-500">photos</p>
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-xl font-bold text-gray-900">{stats.totalSports}</span>
              <p className="text-xs text-gray-500">sports</p>
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-xl font-bold text-emerald-600">{stats.upcomingCount}</span>
              <p className="text-xs text-gray-500">à venir</p>
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-xl font-bold text-gray-900">99%</span>
              <p className="text-xs text-gray-500">précision IA</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FILTERS + GRID ═══════════ */}
      <section id="tous" className="pb-10">
        <div className="container mx-auto px-4 pt-4">
          {/* Filters bar */}
          <div className="mb-6 space-y-3">
            {/* Sport pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-500 mr-1">Sport :</span>
              <button
                onClick={() => setSelectedSport("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSport === "all"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tous
              </button>
              {availableSports.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(selectedSport === sport ? "all" : sport)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    selectedSport === sport
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{SPORT_ICONS[sport] || ""}</span>
                  {SPORT_LABELS[sport] || sport}
                </button>
              ))}
            </div>

            {/* Time + Sort row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-500 mr-1">Date d&apos;événement :</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); if (e.target.value) setSelectedTime("all"); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                    selectedDate
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                  }`}
                />
                {TIME_FILTERS.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => { setSelectedTime(tf.value); setSelectedDate(""); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      !selectedDate && selectedTime === tf.value
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium text-gray-500">Tri :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-gray-100 border-0 rounded-lg px-3 py-1.5 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {filteredEvents.length} événement{filteredEvents.length !== 1 ? "s" : ""}
                {hasActiveFilters && ` (sur ${events.length} au total)`}
              </p>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    <div className="flex gap-1.5">
                      <div className="h-5 w-12 bg-gray-100 rounded-full animate-pulse" />
                      <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {events.length === 0 ? "Aucun événement publié" : "Aucun résultat"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {events.length === 0
                  ? "Les premiers événements seront bientôt disponibles."
                  : "Essayez de modifier vos filtres ou votre recherche pour trouver un événement."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-400 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredEvents.map((event, i) => {
                const isPast = new Date(event.date) < new Date();
                const daysLeft = getDaysBeforeDeletion(event.date);
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block group"
                  >
                    <Card className="rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-gray-100 hover:border-emerald-200 hover:-translate-y-0.5 bg-white">
                      {event.coverImage ? (
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <Image
                            src={event.coverImage}
                            alt={`Photos ${event.name}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                          {isPast && (
                            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                              {daysLeft !== null && (
                                <span className={`px-1.5 py-0.5 backdrop-blur-sm text-[9px] rounded-full font-medium ${daysLeft <= 7 ? "bg-red-500/80 text-white" : "bg-amber-500/80 text-white"}`}>
                                  {daysLeft}j restant{daysLeft > 1 ? "s" : ""}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[9px] rounded-full font-medium">Terminé</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[3/4] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100 relative">
                          <span className="text-4xl mb-2 opacity-60">{SPORT_ICONS[event.sportType] || "\u{1F3C5}"}</span>
                          <span className="text-xs font-bold text-gray-700 text-center px-3 leading-tight">
                            {event.name}
                          </span>
                          {isPast && (
                            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                              {daysLeft !== null && (
                                <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-medium ${daysLeft <= 7 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                                  {daysLeft}j restant{daysLeft > 1 ? "s" : ""}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[9px] rounded-full font-medium">Terminé</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-2.5">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{event.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {event.location && ` • ${event.location}`}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <Badge variant="outline" className="border-emerald-200 text-emerald-600 text-[10px] px-1.5 py-0">
                            {SPORT_ICONS[event.sportType]} {SPORT_LABELS[event.sportType] || event.sportType}
                          </Badge>
                          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 text-[10px] px-1.5 py-0">
                            {event._count.photos} photo{event._count.photos !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS (SEO) ═══════════ */}
      <section id="comment-ca-marche" data-reveal className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${reveal("comment-ca-marche") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Simple comme 1-2-3
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Comment retrouver vos photos ?
            </h2>
            <p className="text-gray-600">
              Trois méthodes de recherche propulsées par l'intelligence artificielle.
              Gratuit et sans inscription obligatoire.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                num: "1",
                icon: "\u{1F522}",
                title: "Par numéro de dossard",
                desc: "Tapez votre numéro de dossard. L'IA a déjà lu et indexé chaque dossard visible sur les photos avec 99% de précision.",
              },
              {
                num: "2",
                icon: "\u{1F933}",
                title: "Par selfie",
                desc: "Prenez un selfie depuis votre smartphone. La reconnaissance faciale trouve toutes vos photos, même celles sans dossard visible.",
              },
              {
                num: "3",
                icon: "\u{1F464}",
                title: "Par nom",
                desc: "Si la start-list est importée, tapez simplement votre nom. L'IA croise les participants avec les dossards et les visages.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`relative text-center transition-all duration-700 ${
                  reveal("comment-ca-marche") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                  {step.icon}
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-600">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SPORTS SUPPORTED (SEO) ═══════════ */}
      <section id="sports" data-reveal className="py-12 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-8 transition-all duration-700 ${reveal("sports") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Tous les sports, une seule plateforme
            </h2>
            <p className="text-white/60 text-sm">Photos de course à pied, trail, triathlon, cyclisme, natation et bien plus encore.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {[
              "Marathon", "Semi-marathon", "10 km", "5 km", "Trail", "Ultra-trail",
              "Triathlon", "Ironman", "Duathlon", "Swimrun", "Cyclisme", "VTT",
              "Course à pied", "Cross-country", "Canicross", "Course d'obstacles",
              "Natation", "Aviron", "Kayak", "Running", "Marche nordique",
              "Équitation", "CrossFit", "Ski de fond", "Biathlon",
            ].map((sport, i) => (
              <span
                key={i}
                className={`px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 cursor-default ${
                  reveal("sports") ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Vous êtes photographe ou organisateur ?
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Publiez vos photos et vendez-les directement aux sportifs. 0% de commission, tri IA automatique.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/solutions/photographes">
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5">
                Je suis photographe
              </button>
            </Link>
            <Link href="/solutions/organisateurs">
              <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border border-gray-200 transition-all duration-300 hover:-translate-y-0.5">
                Je suis organisateur
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
