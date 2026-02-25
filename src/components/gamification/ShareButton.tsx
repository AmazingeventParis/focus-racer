"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  photoId: string;
}

export default function ShareButton({ photoId }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const createShare = async (platform?: string): Promise<string | null> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos/${photoId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.shareUrl;
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleCopyLink = async () => {
    const url = await createShare("link");
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  };

  const handleWhatsApp = async () => {
    const url = await createShare("whatsapp");
    if (url) {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Regarde ma photo de course ! ${url}`)}`, "_blank");
    }
    setOpen(false);
  };

  const handleTwitter = async () => {
    const url = await createShare("twitter");
    if (url) {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ma photo de course`)} ${encodeURIComponent(url)}`, "_blank");
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors",
          "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
        )}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        Partager
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px]">
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copié !
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l-4.5 4.5a4.5 4.5 0 010 6.364L5.25 15.82" />
                  </svg>
                  Copier le lien
                </>
              )}
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="text-base">💬</span>
              WhatsApp
            </button>
            <button
              onClick={handleTwitter}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="text-base">𝕏</span>
              Twitter / X
            </button>
          </div>
        </>
      )}
    </div>
  );
}
