"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Member {
  userId: string;
  user: { id: string; name: string; sportifId: string | null; faceImagePath: string | null };
}

interface CreateGroupDialogProps {
  members: Member[];
  hordeId: string;
  onCreated: (conv: { id: string }) => void;
  children: React.ReactNode;
}

export default function CreateGroupDialog({
  members,
  onCreated,
  children,
}: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim() || selected.size === 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/sportif/horde/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GROUP",
          name: name.trim(),
          participantIds: Array.from(selected),
        }),
      });
      if (res.ok) {
        const conv = await res.json();
        setOpen(false);
        setName("");
        setSelected(new Set());
        onCreated(conv);
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau groupe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Nom du groupe</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              placeholder="Ex : Team Trail 2026"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">{name.length}/50</p>
          </div>
          <div>
            <Label>Membres ({selected.size} sélectionnés)</Label>
            <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
              {members.map((m) => (
                <button
                  key={m.userId}
                  onClick={() => toggle(m.userId)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    selected.has(m.userId)
                      ? "bg-emerald-50 border border-emerald-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      selected.has(m.userId)
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.user.name}</p>
                    {m.user.sportifId && (
                      <p className="text-xs text-muted-foreground font-mono">{m.user.sportifId}</p>
                    )}
                  </div>
                  {selected.has(m.userId) && (
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun membre dans la horde
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating || !name.trim() || selected.size === 0}
            className="w-full bg-emerald hover:bg-emerald-dark text-white"
          >
            {creating ? "Création..." : "Créer le groupe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
