"use client";

import { useEffect, useState, useCallback } from "react";
import { useSSENotifications } from "@/hooks/useSSENotifications";

interface XpToastData {
  id: number;
  amount: number;
  action: string;
}

let nextId = 0;

const ACTION_LABELS: Record<string, string> = {
  PHOTO_PURCHASE: "Achat photo",
  EVENT_FAVORITE: "Favori",
  PROFILE_COMPLETE: "Profil complet",
  FRIEND_ADDED: "Ami ajouté",
  PHOTO_SHARED: "Partage",
  PHOTO_REACTION: "Réaction",
  REFERRAL_COMPLETED: "Parrainage",
  PHOTO_UPLOADED: "Upload",
  EVENT_PUBLISHED: "Publication",
  PHOTO_SOLD: "Vente",
  BADGE_EARNED: "Badge",
  STRIPE_CONNECTED: "Stripe",
  DAILY_LOGIN: "Connexion",
  STREAK_BONUS: "Série",
};

export default function XpToast() {
  const [toasts, setToasts] = useState<XpToastData[]>([]);

  const handleNotification = useCallback(() => {
    // The SSE data is not passed directly, so we'll use a workaround
    // by listening to the event source directly
  }, []);

  // Listen for xp_gained SSE events
  useEffect(() => {
    const handler = (event: Event) => {
      try {
        const data = (event as MessageEvent).data;
        if (!data) return;
        const parsed = JSON.parse(data);
        if (parsed.type === "xp_gained" && parsed.amount) {
          const toast: XpToastData = {
            id: ++nextId,
            amount: parsed.amount,
            action: parsed.action || "",
          };
          setToasts((prev) => [...prev, toast]);

          // Auto-remove after 3s
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 3000);
        }
      } catch {
        // ignore
      }
    };

    // Subscribe to SSE events via custom event
    window.addEventListener("focusracer-xp", handler);
    return () => window.removeEventListener("focusracer-xp", handler);
  }, []);

  // Also use SSE hook as fallback
  useSSENotifications(["xp_gained"], handleNotification);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-up bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2"
        >
          <span className="text-lg">+{toast.amount}</span>
          <span className="text-emerald-100">XP</span>
          {toast.action && ACTION_LABELS[toast.action] && (
            <span className="text-xs text-emerald-200 ml-1">
              {ACTION_LABELS[toast.action]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
