"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Preferences {
  photosAvailable: boolean;
  eventPublished: boolean;
  supportReply: boolean;
  badgeEarned: boolean;
  streakAtRisk: boolean;
  purchaseReminder: boolean;
  sortingReminder: boolean;
  stripeOnboarded: boolean;
  newSupportMessage: boolean;
  newSale: boolean;
  newFollower: boolean;
  lowCredits: boolean;
  productUpdates: boolean;
  referralCompleted: boolean;
  newsletter: boolean;
}

interface ToggleItem {
  key: keyof Preferences;
  label: string;
  desc: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

const SPORTIF_ITEMS: { group: string; items: ToggleItem[] }[] = [
  {
    group: "Photos & Événements",
    items: [
      { key: "photosAvailable", label: "Photos disponibles", desc: "Quand de nouvelles photos sont publiées pour un événement suivi" },
      { key: "eventPublished", label: "Événement publié", desc: "Quand un événement suivi est publié" },
    ],
  },
  {
    group: "Support",
    items: [
      { key: "supportReply", label: "Réponse support", desc: "Quand l'équipe répond à votre demande" },
    ],
  },
  {
    group: "Gamification",
    items: [
      { key: "badgeEarned", label: "Badge gagné", desc: "Quand vous gagnez votre premier badge" },
      { key: "streakAtRisk", label: "Série en danger", desc: "Quand votre série est sur le point d'expirer" },
      { key: "purchaseReminder", label: "Rappel d'achat", desc: "Quand vos photos sont disponibles depuis 48h" },
    ],
  },
  {
    group: "Général",
    items: [
      { key: "referralCompleted", label: "Parrainage complété", desc: "Quand un filleul rejoint la plateforme" },
      { key: "productUpdates", label: "Mises à jour produit", desc: "Nouvelles fonctionnalités de la plateforme" },
      { key: "newsletter", label: "Newsletter", desc: "Actualités et conseils Focus Racer" },
    ],
  },
];

const PRO_ITEMS: { group: string; items: ToggleItem[] }[] = [
  {
    group: "Ventes & Événements",
    items: [
      { key: "newSale", label: "Nouvelle vente", desc: "Quand un sportif achète vos photos" },
      { key: "newFollower", label: "Nouveau follower", desc: "Quand un sportif suit votre événement" },
      { key: "photosAvailable", label: "Photos disponibles", desc: "Quand de nouvelles photos sont publiées pour un événement suivi" },
      { key: "eventPublished", label: "Événement publié", desc: "Quand un événement suivi est publié" },
    ],
  },
  {
    group: "Support",
    items: [
      { key: "supportReply", label: "Réponse support", desc: "Quand l'équipe répond à votre demande" },
    ],
  },
  {
    group: "Gamification",
    items: [
      { key: "badgeEarned", label: "Badge gagné", desc: "Quand vous gagnez votre premier badge" },
      { key: "streakAtRisk", label: "Série en danger", desc: "Quand votre série est sur le point d'expirer" },
      { key: "sortingReminder", label: "Rappel de tri", desc: "Quand une galerie attend d'être publiée depuis 72h" },
    ],
  },
  {
    group: "Pro",
    items: [
      { key: "lowCredits", label: "Crédits bas", desc: "Quand votre solde passe sous 100 crédits" },
      { key: "stripeOnboarded", label: "Stripe Connect activé", desc: "Quand votre compte Stripe est opérationnel" },
      { key: "newSupportMessage", label: "Nouveau message reçu", desc: "Quand un utilisateur vous envoie un message" },
    ],
  },
  {
    group: "Général",
    items: [
      { key: "referralCompleted", label: "Parrainage complété", desc: "Quand un filleul rejoint la plateforme" },
      { key: "productUpdates", label: "Mises à jour produit", desc: "Nouvelles fonctionnalités de la plateforme" },
      { key: "newsletter", label: "Newsletter", desc: "Actualités et conseils Focus Racer" },
    ],
  },
];

const ADMIN_ITEMS: { group: string; items: ToggleItem[] }[] = [
  {
    group: "Administration",
    items: [
      { key: "newSupportMessage", label: "Nouveau message support", desc: "Quand un utilisateur envoie un message de support" },
    ],
  },
  {
    group: "Général",
    items: [
      { key: "newsletter", label: "Newsletter", desc: "Actualités et conseils Focus Racer" },
    ],
  },
];

export default function NotificationPreferencesCard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        setPrefs(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const togglePref = async (key: keyof Preferences) => {
    if (!prefs) return;
    const newVal = !prefs[key];

    // Optimistic update
    setPrefs({ ...prefs, [key]: newVal });
    setUpdatingKeys((s) => new Set(s).add(key));

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newVal }),
      });
      if (!res.ok) {
        setPrefs({ ...prefs, [key]: !newVal }); // Revert
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch {
      setPrefs({ ...prefs, [key]: !newVal }); // Revert
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setUpdatingKeys((s) => {
        const next = new Set(s);
        next.delete(key);
        return next;
      });
    }
  };

  // Determine which items to show based on role
  const role = (session?.user as { role?: string })?.role;
  const isPro = role && ["PHOTOGRAPHER", "ORGANIZER", "AGENCY", "CLUB", "FEDERATION"].includes(role);
  const isAdmin = role === "ADMIN";

  const groups = isAdmin ? ADMIN_ITEMS : isPro ? PRO_ITEMS : SPORTIF_ITEMS;

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 shadow-card rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-display text-gray-900">Notifications email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prefs) return null;

  return (
    <Card className="bg-white border-slate-200 shadow-card rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-display text-gray-900">Notifications email</CardTitle>
        <CardDescription className="text-gray-500">
          Choisissez les emails que vous souhaitez recevoir. Les emails transactionnels (achat, abonnement) sont toujours envoyés.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.map((group) => {
          const isOpen = openGroups.has(group.group);
          const enabledCount = prefs ? group.items.filter((i) => prefs[i.key]).length : 0;
          const totalCount = group.items.length;

          return (
            <div key={group.group} className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(group.group)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.group}</span>
                  <span className="text-[10px] font-medium text-gray-400 bg-slate-100 rounded-full px-2 py-0.5">
                    {enabledCount}/{totalCount}
                  </span>
                </div>
                <ChevronIcon open={isOpen} />
              </button>

              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-2 space-y-1">
                  {group.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="pr-4">
                        <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => togglePref(item.key)}
                        disabled={updatingKeys.has(item.key)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                          prefs[item.key] ? "bg-emerald-500" : "bg-slate-200"
                        } ${updatingKeys.has(item.key) ? "opacity-50" : ""}`}
                        role="switch"
                        aria-checked={prefs[item.key]}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full keep-white bg-white shadow ring-0 transition duration-200 ${
                            prefs[item.key] ? "translate-x-5" : "translate-x-0.5"
                          } mt-0.5`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
