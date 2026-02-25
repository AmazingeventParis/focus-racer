"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReferralData {
  code: string;
  shareUrl: string;
}

interface ReferralStats {
  sent: number;
  pending: number;
  completed: number;
  totalCreditsEarned: number;
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

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
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Rejoins Focus Racer et reçois 25 crédits offerts ! ${data.shareUrl}`)}`,
        "_blank"
      );
    }
  };

  if (!data) return null;

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          🎁 Parrainage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Votre code</p>
            <p className="text-lg font-mono font-bold text-gray-900">{data.code}</p>
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
            💬 WhatsApp
          </button>
          <button
            onClick={copyLink}
            className="flex-1 py-2 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
          >
            📋 Copier
          </button>
        </div>

        {/* Stats */}
        {stats && (stats.sent > 0 || stats.completed > 0) && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{stats.sent}</p>
              <p className="text-[10px] text-gray-400">Envoyés</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-[10px] text-gray-400">Validés</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{stats.totalCreditsEarned}</p>
              <p className="text-[10px] text-gray-400">Crédits</p>
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-400 text-center">
          Parrain : 50 crédits · Filleul : 25 crédits offerts
        </p>
      </CardContent>
    </Card>
  );
}
