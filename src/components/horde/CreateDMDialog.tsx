"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Member {
  userId: string;
  user: { id: string; name: string; sportifId: string | null; faceImagePath: string | null };
}

interface CreateDMDialogProps {
  members: Member[];
  onCreated: (conv: { id: string }) => void;
  children: React.ReactNode;
}

export default function CreateDMDialog({
  members,
  onCreated,
  children,
}: CreateDMDialogProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const handleSelect = async (partnerId: string) => {
    setCreating(partnerId);
    try {
      const res = await fetch("/api/sportif/horde/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DM",
          participantIds: [partnerId],
        }),
      });
      if (res.ok) {
        const conv = await res.json();
        setOpen(false);
        onCreated(conv);
      }
    } catch {
      // silent
    } finally {
      setCreating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau message direct</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto space-y-1">
          {members.map((m) => (
            <button
              key={m.userId}
              onClick={() => handleSelect(m.userId)}
              disabled={creating === m.userId}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                {m.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.user.name}</p>
                {m.user.sportifId && (
                  <p className="text-xs text-muted-foreground font-mono">{m.user.sportifId}</p>
                )}
              </div>
              {creating === m.userId ? (
                <svg className="w-5 h-5 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
            </button>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun membre dans la horde
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
