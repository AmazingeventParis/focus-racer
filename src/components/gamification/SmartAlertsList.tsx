"use client";

import { useEffect, useState, useCallback } from "react";
import { useSSENotifications } from "@/hooks/useSSENotifications";

interface Alert {
  id: string;
  alertType: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const ALERT_ICONS: Record<string, string> = {
  PHOTOS_AVAILABLE: "📸",
  PURCHASE_REMINDER: "🛒",
  SORTING_REMINDER: "📁",
  WEEKLY_STATS: "📊",
  STREAK_AT_RISK: "🔥",
  BADGE_EARNED: "🏅",
  LEVEL_UP: "⬆️",
  REFERRAL_COMPLETED: "🎁",
};

export default function SmartAlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/gamification/alerts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useSSENotifications(["smart_alert", "level_up", "xp_gained"], fetchAlerts);

  const markRead = async (id: string) => {
    await fetch(`/api/gamification/alerts/${id}`, { method: "PATCH" }).catch(() => {});
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  if (loading) return null;

  const unread = alerts.filter((a) => !a.read);
  if (unread.length === 0) return null;

  return (
    <div className="space-y-2">
      {unread.slice(0, 5).map((alert) => (
        <div
          key={alert.id}
          onClick={() => markRead(alert.id)}
          className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100/50 transition-colors"
        >
          <span className="text-lg flex-shrink-0 mt-0.5">
            {ALERT_ICONS[alert.alertType] || "🔔"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{alert.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button className="text-[10px] text-gray-400 hover:text-gray-600 flex-shrink-0">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
