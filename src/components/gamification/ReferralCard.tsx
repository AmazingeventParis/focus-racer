"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ReferralData {
  code: string;
  shareUrl: string;
}

interface ReferralStats {
  sent: number;
  pending: number;
  completed: number;
  totalCreditsEarned: number;
  isRunner: boolean;
}

export default function ReferralCard() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  const isRunner = session?.user?.role === "RUNNER" || stats?.isRunner;

  useEffect(() => {
    Promise.all([
      fetch("/api/referral/my-code").then((r) => r.json()),
      fetch("/api/referral/stats").then((r) => r.json()),
    ])
      .then(([codeData, statsData]) => {
        setData(codeData);
        setStats(statsData);
      })
      .catch(() => {});
  }, []);

  const copyLink = async () => {
    if (data?.shareUrl) {
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    if (data?.shareUrl) {
      const message = isRunner
        ? `Rejoins Focus Racer pour retrouver tes photos de course ! ${data.shareUrl}`
        : `Rejoins Focus Racer et reçois 100 crédits offerts ! ${data.shareUrl}`;
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }
  };

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Code */}
      <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Votre code</p>
          <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{data.code}</p>
        </div>
        <button
          onClick={copyLink}
          className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
        >
          {copied ? "Copié !" : "Copier le lien"}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button
          onClick={shareWhatsApp}
          className="flex-1 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
        >
          WhatsApp
        </button>
        <button
          onClick={copyLink}
          className="flex-1 py-2 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
        >
          Copier
        </button>
      </div>

      {/* Stats */}
      {stats && (stats.sent > 0 || stats.completed > 0) && (
        <div className={`grid ${isRunner ? "grid-cols-2" : "grid-cols-3"} gap-2 pt-2 border-t border-gray-100`}>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{stats.sent}</p>
            <p className="text-[10px] text-gray-400">Invités</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">{stats.completed}</p>
            <p className="text-[10px] text-gray-400">Inscrits</p>
          </div>
          {!isRunner && (
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{stats.totalCreditsEarned}</p>
              <p className="text-[10px] text-gray-400">Crédits gagnés</p>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        {isRunner
          ? "Parrainez un ami : débloquez le badge exclusif Ambassadeur + 100 XP"
          : "Parrain : 100 crédits · Filleul : 100 crédits offerts"}
      </p>
    </div>
  );
}
