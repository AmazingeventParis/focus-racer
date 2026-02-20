"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderPhoto {
  id: string;
  thumbnail: string | null;
  name: string;
}

interface OrderData {
  id: string;
  status: string;
  totalAmount: number;
  downloadToken: string | null;
  downloadExpiresAt: string | null;
  downloadCount: number;
  createdAt: string;
  event: {
    id: string;
    name: string;
    date: string;
    coverImage: string | null;
  };
  items: { photo: OrderPhoto }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Payé", color: "bg-emerald-100 text-emerald-700" },
  DELIVERED: { label: "Livré", color: "bg-teal-100 text-teal-800" },
  REFUNDED: { label: "Remboursé", color: "bg-white/50 text-muted-foreground" },
  EXPIRED: { label: "Expiré", color: "bg-red-100 text-red-800" },
};

export default function SportifPaiementsPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.ok ? r.json() : [])
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const regenerateToken = async (orderId: string) => {
    setRegenerating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/regenerate-token`, { method: "POST" });
      if (res.ok) {
        const updated = await fetch("/api/orders").then((r) => r.json());
        setOrders(updated);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setRegenerating(null);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return true;
    return new Date() > new Date(expiresAt);
  };

  // Compute summary
  const paidOrders = orders.filter((o) => ["PAID", "DELIVERED"].includes(o.status));
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrder = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
          </div>
          {[1, 2].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Paiements</h1>
        <p className="text-muted-foreground mt-1">Retrouvez vos commandes et téléchargez vos photos</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total dépensé</p>
            <p className="text-2xl font-bold text-navy mt-1">{totalSpent.toFixed(2)}€</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Commandes</p>
            <p className="text-2xl font-bold text-navy mt-1">{paidOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Panier moyen</p>
            <p className="text-2xl font-bold text-navy mt-1">{avgOrder.toFixed(2)}€</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <Card className="glass-card rounded-2xl">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun achat pour le moment</p>
            <Link href="/runner">
              <Button variant="outline">Parcourir les événements</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
            const tokenExpired = isExpired(order.downloadExpiresAt);

            return (
              <Card key={order.id} className="glass-card rounded-2xl hover:shadow-glass-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-lg">{order.event.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Commande #{order.id.slice(-8).toUpperCase()} &bull;{" "}
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      <span className="font-bold">{order.totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Photo thumbnails */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {order.items.slice(0, 8).map((item) => (
                      <div key={item.photo.id} className="w-16 h-16 flex-shrink-0 relative rounded overflow-hidden bg-emerald-50">
                        {item.photo.thumbnail ? (
                          <Image src={item.photo.thumbnail} alt={item.photo.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Photo</div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 8 && (
                      <div className="w-16 h-16 flex-shrink-0 rounded bg-emerald-50 flex items-center justify-center text-sm text-muted-foreground">
                        +{order.items.length - 8}
                      </div>
                    )}
                  </div>

                  {/* Download */}
                  {order.status === "PAID" && (
                    <div className="flex flex-wrap gap-3 items-center">
                      {order.downloadToken && !tokenExpired ? (
                        <>
                          <a href={`/api/downloads/${order.downloadToken}`}>
                            <Button size="sm" className="bg-emerald hover:bg-emerald-dark text-white shadow-emerald transition-all duration-200">
                              Télécharger (ZIP)
                            </Button>
                          </a>
                          <span className="text-xs text-muted-foreground">
                            Expire le{" "}
                            {new Date(order.downloadExpiresAt!).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateToken(order.id)}
                          disabled={regenerating === order.id}
                        >
                          {regenerating === order.id ? "Génération..." : "Régénérer le lien de téléchargement"}
                        </Button>
                      )}
                      {order.downloadCount > 0 && (
                        <span className="text-xs text-muted-foreground">Téléchargé {order.downloadCount} fois</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
