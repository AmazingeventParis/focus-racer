"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface HordeMember {
  id: string;
  status: string;
  invitedAt: string;
  joinedAt: string | null;
  user: { id: string; name: string; sportifId: string | null; faceImagePath: string | null };
}

interface HordeData {
  id: string;
  name: string;
  members: HordeMember[];
}

interface Invitation {
  id: string;
  horde: {
    name: string;
    owner: { name: string; sportifId: string | null };
  };
}

interface HordeFeedItem {
  event: {
    id: string;
    name: string;
    date: string;
    location: string | null;
    sportType: string;
    coverImage: string | null;
  };
  members: { name: string; sportifId: string | null }[];
}

const SPORT_LABELS: Record<string, string> = {
  RUNNING: "Course à pied",
  TRAIL: "Trail",
  TRIATHLON: "Triathlon",
  CYCLING: "Cyclisme",
  SWIMMING: "Natation",
  OBSTACLE: "Course à obstacles",
  OTHER: "Autre",
};

export default function SportifHordePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [horde, setHorde] = useState<HordeData | null>(null);
  const [hordeName, setHordeName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [inviteId, setInviteId] = useState("");
  const [inviting, setInviting] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [hordeFeed, setHordeFeed] = useState<HordeFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchHorde = useCallback(async () => {
    try {
      const [hordeRes, invRes, feedRes] = await Promise.all([
        fetch("/api/sportif/horde"),
        fetch("/api/sportif/horde/invitations"),
        fetch("/api/sportif/horde/feed"),
      ]);
      if (hordeRes.ok) {
        const data = await hordeRes.json();
        setHorde(data);
        setHordeName(data.name);
      }
      if (invRes.ok) setInvitations(await invRes.json());
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setHordeFeed(Array.isArray(feedData) ? feedData : []);
      }
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchHorde();
  }, [fetchHorde]);

  const saveHordeName = async () => {
    if (!hordeName.trim()) return;
    try {
      const res = await fetch("/api/sportif/horde", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: hordeName.trim() }),
      });
      if (res.ok) {
        toast({ title: "Nom de la horde mis à jour" });
        setEditingName(false);
        fetchHorde();
      }
    } catch { /* silent */ }
  };

  const inviteMember = async () => {
    if (!inviteId.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/sportif/horde/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sportifId: inviteId.trim().toUpperCase() }),
      });
      if (res.ok) {
        toast({ title: "Invitation envoyée !" });
        setInviteId("");
        fetchHorde();
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleInvitation = async (id: string, action: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/sportif/horde/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast({ title: action === "accept" ? "Invitation acceptée !" : "Invitation déclinée" });
        fetchHorde();
      }
    } catch { /* silent */ }
  };

  const removeMember = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/sportif/horde/members/${memberId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Membre retiré" });
        fetchHorde();
      }
    } catch { /* silent */ }
    finally { setRemovingId(null); }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const acceptedMembers = horde?.members.filter((m) => m.status === "ACCEPTED") || [];
  const pendingMembers = horde?.members.filter((m) => m.status === "PENDING") || [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={hordeName}
                  onChange={(e) => setHordeName(e.target.value)}
                  className="text-2xl font-bold border-gray-200 rounded-lg h-10 max-w-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") saveHordeName(); if (e.key === "Escape") setEditingName(false); }}
                  autoFocus
                />
                <Button size="sm" onClick={saveHordeName} className="bg-emerald hover:bg-emerald-dark text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setHordeName(horde?.name || ""); }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ) : (
              <button onClick={() => setEditingName(true)} className="group flex items-center gap-2">
                <h1 className="text-2xl font-bold text-navy">{horde?.name || "Ma Horde"}</h1>
                <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {acceptedMembers.length} membre{acceptedMembers.length > 1 ? "s" : ""}
            {pendingMembers.length > 0 && ` · ${pendingMembers.length} en attente`}
          </p>
        </div>
      </div>

      {/* Invitations received */}
      {invitations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Invitations reçues ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100">
                <div>
                  <p className="font-medium text-gray-900">
                    {inv.horde.owner.name} vous invite dans &laquo; {inv.horde.name} &raquo;
                  </p>
                  {inv.horde.owner.sportifId && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{inv.horde.owner.sportifId}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleInvitation(inv.id, "accept")} className="bg-emerald hover:bg-emerald-dark text-white">
                    Accepter
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleInvitation(inv.id, "decline")}>
                    Décliner
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column — Members + Invite */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invite */}
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inviter un sportif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Entrez l&apos;ID sportif (FR-XXXXXX) d&apos;un ami pour l&apos;inviter dans votre horde.
              </p>
              <div className="flex gap-2">
                <Input
                  value={inviteId}
                  onChange={(e) => setInviteId(e.target.value)}
                  placeholder="FR-XXXXXX"
                  className="bg-gray-50 border-gray-200 rounded-lg font-mono max-w-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") inviteMember(); }}
                />
                <Button onClick={inviteMember} disabled={inviting || !inviteId.trim()} className="bg-emerald hover:bg-emerald-dark text-white">
                  {inviting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      Inviter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Membres ({acceptedMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedMembers.length > 0 ? (
                <div className="space-y-2">
                  {acceptedMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        {m.user.faceImagePath ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                            <Image src={m.user.faceImagePath} alt={m.user.name} fill className="object-cover" sizes="40px" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                            {m.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{m.user.name}</p>
                          <div className="flex items-center gap-2">
                            {m.user.sportifId && (
                              <span className="text-xs text-muted-foreground font-mono">{m.user.sportifId}</span>
                            )}
                            {m.joinedAt && (
                              <span className="text-xs text-muted-foreground">
                                Depuis {new Date(m.joinedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMember(m.id)}
                        disabled={removingId === m.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                      >
                        {removingId === m.id ? "..." : "Retirer"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm">Aucun membre dans votre horde</p>
                  <p className="text-muted-foreground text-xs mt-1">Invitez vos amis avec leur ID sportif !</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending invites sent */}
          {pendingMembers.length > 0 && (
            <Card className="glass-card rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  En attente
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    {pendingMembers.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-yellow-50/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold flex-shrink-0">
                          {m.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{m.user.name}</p>
                          <div className="flex items-center gap-2">
                            {m.user.sportifId && (
                              <span className="text-xs text-muted-foreground font-mono">{m.user.sportifId}</span>
                            )}
                            <span className="text-xs text-yellow-600">
                              Invité le {new Date(m.invitedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMember(m.id)}
                        disabled={removingId === m.id}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        Annuler
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — Horde Activity Feed */}
        <div className="space-y-6">
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Activité de la Horde
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hordeFeed.length > 0 ? (
                <div className="space-y-3">
                  {hordeFeed.map((item) => (
                    <Link key={item.event.id} href={`/events/${item.event.id}`} className="block group">
                      <div className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 relative overflow-hidden">
                            {item.event.coverImage ? (
                              <Image src={item.event.coverImage} alt={item.event.name} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald transition-colors">
                              {item.event.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              {item.event.location && ` · ${item.event.location}`}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              <span className="text-xs text-purple-600">
                                {item.members.map((m) => m.name).join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground text-sm">Aucune activité récente</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Quand vos membres suivent des événements, leur activité apparaîtra ici
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Comment ça marche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald-700">1</span>
                </div>
                <p className="text-sm text-gray-600">
                  Invitez vos amis en saisissant leur ID sportif (format FR-XXXXXX)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald-700">2</span>
                </div>
                <p className="text-sm text-gray-600">
                  Ils acceptent votre invitation depuis leur espace sportif
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald-700">3</span>
                </div>
                <p className="text-sm text-gray-600">
                  Suivez les événements de votre horde et retrouvez-vous sur les courses !
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
