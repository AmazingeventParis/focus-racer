"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

interface MapEvent {
  id: string;
  name: string;
  date: string;
  location: string | null;
  sportType: string;
  latitude: number;
  longitude: number;
  coverImage: string | null;
  _count: { photos: number };
}

interface Props {
  apiUrl: string;
}

const SPORT_COLORS: Record<string, string> = {
  RUNNING: "#10B981",
  TRAIL: "#8B5CF6",
  TRIATHLON: "#3B82F6",
  CYCLING: "#F59E0B",
  SWIMMING: "#06B6D4",
  OBSTACLE: "#EF4444",
  OTHER: "#6B7280",
};

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Obstacles",
  OTHER: "Autre",
};

function createIcon(sportType: string) {
  const color = SPORT_COLORS[sportType] || SPORT_COLORS.OTHER;
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

export default function RaceMap({ apiUrl }: Props) {
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (sportFilter) params.set("sportType", sportFilter);
    if (yearFilter) params.set("year", yearFilter);
    const url = `${apiUrl}${params.toString() ? `?${params}` : ""}`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl, sportFilter, yearFilter]);

  // Compute center from events
  const center: [number, number] = events.length > 0
    ? [
        events.reduce((sum, e) => sum + e.latitude, 0) / events.length,
        events.reduce((sum, e) => sum + e.longitude, 0) / events.length,
      ]
    : [46.603354, 1.888334]; // France center

  const uniqueSports = [...new Set(events.map((e) => e.sportType))];
  const uniqueLocations = new Set(events.map((e) => e.location).filter(Boolean));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="text-sm border border-[#2C3566] rounded-lg px-3 py-1.5 bg-[#151C44] text-gray-900"
        >
          <option value="">Tous les sports</option>
          {Object.entries(SPORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="text-sm border border-[#2C3566] rounded-lg px-3 py-1.5 bg-[#151C44] text-gray-900"
        >
          <option value="">Toutes les années</option>
          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-[#2C3566] shadow-sm" style={{ height: "500px" }}>
        {loading ? (
          <div className="w-full h-full bg-[#151C44] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Chargement de la carte...</div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={events.length > 0 ? 6 : 5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={createIcon(event.sportType)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-sm text-gray-900">{event.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-400">{event.location}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {event._count.photos} photos ·{" "}
                      <span style={{ color: SPORT_COLORS[event.sportType] }}>
                        {SPORT_LABELS[event.sportType] || event.sportType}
                      </span>
                    </p>
                    <Link
                      href={`/events/${event.id}`}
                      className="inline-block mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Voir la galerie →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{events.length} événement{events.length > 1 ? "s" : ""}</span>
        <span>·</span>
        <span>{uniqueLocations.size} ville{uniqueLocations.size > 1 ? "s" : ""}</span>
        <span>·</span>
        <span>{uniqueSports.length} sport{uniqueSports.length > 1 ? "s" : ""}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {uniqueSports.map((sport) => (
          <div key={sport} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: SPORT_COLORS[sport] || SPORT_COLORS.OTHER }}
            />
            <span className="text-xs text-gray-500">{SPORT_LABELS[sport] || sport}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
