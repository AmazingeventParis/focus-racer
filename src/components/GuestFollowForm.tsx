"use client";

import { useState } from "react";

interface GuestFollowFormProps {
  eventId: string;
}

export default function GuestFollowForm({ eventId }: GuestFollowFormProps) {
  const [email, setEmail] = useState("");
  const [bibNumber, setBibNumber] = useState("");
  const [showBib, setShowBib] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/events/${eventId}/follow-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          bibNumber: bibNumber.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inattendue");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 bg-emerald/10 border border-emerald/30 rounded-xl px-4 py-2.5 mt-4">
        <svg className="w-5 h-5 text-emerald-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-emerald-200">
          Vous serez notifié(e) par email dès que de nouvelles photos seront disponibles.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
            Recevoir les photos par email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:border-emerald/50"
          />
        </div>

        {showBib && (
          <div className="w-28">
            <label className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">
              Dossard
            </label>
            <input
              type="text"
              value={bibNumber}
              onChange={(e) => setBibNumber(e.target.value)}
              placeholder="N°"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:border-emerald/50"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="bg-emerald hover:bg-emerald/90 disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5"
        >
          {status === "loading" ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          )}
          Me notifier
        </button>
      </div>

      {!showBib && (
        <button
          type="button"
          onClick={() => setShowBib(true)}
          className="text-[11px] text-white/40 hover:text-white/60 mt-1.5 transition-colors"
        >
          + Ajouter mon numéro de dossard
        </button>
      )}

      {status === "error" && (
        <p className="text-red-300 text-xs mt-1.5">{errorMsg}</p>
      )}
    </form>
  );
}
