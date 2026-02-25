"use client";

import { useState, useCallback } from "react";
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
  HIGH_OCR_RATE: "OCR performant",
  EVENT_CREATED: "Événement créé",
  START_LIST_IMPORTED: "Start-list",
  HIGH_COVERAGE: "Couverture complète",
};

export default function XpToast() {
  const [toasts, setToasts] = useState<XpToastData[]>([]);

  const handleNotification = useCallback((data: { type: string; [key: string]: unknown }) => {
    if (data.type === "xp_gained" && data.amount) {
      const toast: XpToastData = {
        id: ++nextId,
        amount: data.amount as number,
        action: (data.action as string) || "",
      };
      setToasts((prev) => [...prev, toast]);

      // Auto-remove after 3s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    }
  }, []);

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
