"use client";

import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  levelName?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const SIZE_CLASSES = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-12 h-12 text-sm",
};

const FRAME_GRADIENT: Record<number, string> = {
  1: "from-gray-300 to-gray-400",
  2: "from-amber-600 to-amber-400",
  3: "from-amber-600 to-amber-400",
  4: "from-gray-400 to-gray-200",
  5: "from-yellow-500 to-yellow-300",
  6: "from-cyan-400 to-purple-400",
};

const FRAME_RING: Record<number, string> = {
  1: "ring-gray-300",
  2: "ring-amber-400",
  3: "ring-amber-500",
  4: "ring-gray-300",
  5: "ring-yellow-400",
  6: "ring-cyan-400",
};

export default function LevelBadge({ level, levelName, size = "md", showName = false }: LevelBadgeProps) {
  const gradient = FRAME_GRADIENT[level] || FRAME_GRADIENT[1];
  const ring = FRAME_RING[level] || FRAME_RING[1];

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ring-2",
          SIZE_CLASSES[size],
          gradient,
          ring
        )}
        title={levelName || `Niveau ${level}`}
      >
        {level}
      </div>
      {showName && levelName && (
        <span className="text-xs font-medium text-gray-500">{levelName}</span>
      )}
    </div>
  );
}
