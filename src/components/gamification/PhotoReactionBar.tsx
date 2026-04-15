"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  photoId: string;
}

const REACTIONS = [
  { type: "LIKE", emoji: "👍", label: "J'aime" },
  { type: "LOVE", emoji: "❤️", label: "Coup de coeur" },
  { type: "FIRE", emoji: "🔥", label: "Photo de ouf" },
  { type: "WOW", emoji: "✨", label: "Impressionnant" },
] as const;

export default function PhotoReactionBar({ photoId }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [animating, setAnimating] = useState<string | null>(null);

  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/photos/${photoId}/reactions`);
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts || {});
        setUserReactions(data.userReactions || []);
      }
    } catch {
      // ignore
    }
  }, [photoId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const toggleReaction = async (type: string) => {
    setAnimating(type);
    setTimeout(() => setAnimating(null), 300);

    // Optimistic update
    const isActive = userReactions.includes(type);
    if (isActive) {
      setUserReactions((prev) => prev.filter((r) => r !== type));
      setCounts((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }));
    } else {
      setUserReactions((prev) => [...prev, type]);
      setCounts((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
    }

    try {
      const res = await fetch(`/api/photos/${photoId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        // Revert optimistic update
        fetchReactions();
      }
    } catch {
      fetchReactions();
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {REACTIONS.map(({ type, emoji, label }) => {
        const isActive = userReactions.includes(type);
        const count = counts[type] || 0;

        return (
          <button
            key={type}
            onClick={() => toggleReaction(type)}
            title={label}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
              isActive
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100",
              animating === type && "scale-125"
            )}
          >
            <span className={cn("transition-transform", animating === type && "scale-110")}>
              {emoji}
            </span>
            {count > 0 && <span className="font-medium">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
