"use client";

import { useEffect, useState, useCallback } from "react";
import { useSSENotifications } from "@/hooks/useSSENotifications";

interface LevelUpData {
  newLevel: number;
  newName: string;
}

export default function LevelUpCelebration() {
  const [levelUp, setLevelUp] = useState<LevelUpData | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  const handleNotification = useCallback(() => {
    // Refetch via polling since SSE data isn't passed
  }, []);

  useSSENotifications(["level_up"], handleNotification);

  // Listen for level_up events
  useEffect(() => {
    const handler = (event: Event) => {
      try {
        const data = (event as MessageEvent).data;
        if (!data) return;
        const parsed = JSON.parse(data);
        if (parsed.type === "level_up") {
          setLevelUp({ newLevel: parsed.newLevel, newName: parsed.newName });

          // Generate confetti particles
          const colors = ["#10B981", "#14B8A6", "#F59E0B", "#8B5CF6", "#EF4444", "#3B82F6"];
          const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.5,
          }));
          setParticles(newParticles);

          // Auto-dismiss after 5s
          setTimeout(() => {
            setLevelUp(null);
            setParticles([]);
          }, 5000);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("focusracer-levelup", handler);
    return () => window.removeEventListener("focusracer-levelup", handler);
  }, []);

  if (!levelUp) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => { setLevelUp(null); setParticles([]); }}
    >
      {/* Confetti */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Level up card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm mx-4 animate-bounce-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {levelUp.newLevel}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Niveau supérieur !
        </h2>
        <p className="text-lg font-semibold text-emerald-600 mb-2">
          {levelUp.newName}
        </p>
        <p className="text-sm text-gray-500">
          Continuez comme ça pour débloquer de nouvelles récompenses !
        </p>
        <button
          onClick={() => { setLevelUp(null); setParticles([]); }}
          className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
        >
          Génial !
        </button>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
