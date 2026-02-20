"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  eventId: string | null;
  read: boolean;
  createdAt: string;
  event?: { id: string; name: string } | null;
}

interface FavoriteEvent {
  id: string;
  event: {
    id: string;
    name: string;
    date: string;
    location: string | null;
    sportType: string;
  };
  createdAt: string;
}

export default function AccountProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasFaceImage, setHasFaceImage] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceUploading, setFaceUploading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch face status
  useEffect(() => {
    if (!session?.user) return;
    setFaceLoading(true);
    fetch("/api/account/face")
      .then((r) => r.json())
      .then((data) => setHasFaceImage(data.hasFaceImage))
      .catch(() => {})
      .finally(() => setFaceLoading(false));
  }, [session?.user]);

  // Fetch notifications
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, [session?.user]);

  // Fetch favorite events
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/account/favorites")
      .then((r) => r.json())
      .then((data) => setFavorites(data.favorites || []))
      .catch(() => {})
      .finally(() => setFavLoading(false));
  }, [session?.user]);

  const uploadFace = async (file: File) => {
    setFaceUploading(true);
    try {
      const formData = new FormData();
      formData.append("face", file);
      const res = await fetch("/api/account/face", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setHasFaceImage(true);
      }
    } catch {}
    setFaceUploading(false);
  };

  const deleteFace = async () => {
    if (!confirm("Supprimer votre photo de profil ?")) return;
    try {
      const res = await fetch("/api/account/face", { method: "DELETE" });
      if (res.ok) setHasFaceImage(false);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  if (status === "loading" || !session?.user) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen gradient-bg-subtle pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl font-bold text-navy mb-6">Mon profil</h1>

          <div className="grid gap-6">
            {/* Face image section */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-navy flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Photo de visage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajoutez une photo de votre visage pour retrouver automatiquement vos photos sur toutes les courses.
                  L&apos;IA utilisera cette image pour vous identifier parmi les coureurs.
                </p>
                {faceLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : hasFaceImage ? (
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald/10 text-emerald border-emerald/20">Photo enregistree</Badge>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Remplacer
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={deleteFace}>
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={faceUploading}
                    className="bg-emerald hover:bg-emerald-dark text-white"
                  >
                    {faceUploading ? "Envoi en cours..." : "Ajouter ma photo"}
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFace(file);
                    e.target.value = "";
                  }}
                />
              </CardContent>
            </Card>

            {/* Notifications section */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-navy flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    Notifications
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs ml-1">{unreadCount}</Badge>
                    )}
                  </CardTitle>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-muted-foreground">
                      Tout marquer comme lu
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notifLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune notification. Suivez des evenements pour recevoir des alertes.</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          notif.read ? "bg-white border-gray-100" : "bg-emerald-50/50 border-emerald/20"
                        }`}
                        onClick={() => !notif.read && markRead(notif.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notif.read ? "text-muted-foreground" : "text-navy font-medium"}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        {notif.event && (
                          <Link
                            href={`/events/${notif.event.id}`}
                            className="text-xs text-emerald hover:underline mt-1 inline-block"
                          >
                            Voir les photos &rarr;
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite events section */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-navy flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  Evenements suivis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : favorites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun evenement suivi. Cliquez sur &quot;Suivre&quot; sur la page d&apos;un evenement pour etre alerte.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((fav) => (
                      <Link
                        key={fav.id}
                        href={`/events/${fav.event.id}`}
                        className="block p-3 rounded-lg border hover:border-emerald/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-navy">{fav.event.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(fav.event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                              {fav.event.location && ` \u2022 ${fav.event.location}`}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">{fav.event.sportType}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick links */}
            <div className="flex flex-wrap gap-3">
              <Link href="/account/purchases">
                <Button variant="outline" size="sm">Mes achats</Button>
              </Link>
              <Link href="/account/statistics">
                <Button variant="outline" size="sm">Mes statistiques</Button>
              </Link>
              <Link href="/account/support">
                <Button variant="outline" size="sm">Support</Button>
              </Link>
              <Link href="/account/gdpr">
                <Button variant="outline" size="sm">RGPD</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
