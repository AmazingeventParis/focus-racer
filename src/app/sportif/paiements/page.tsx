"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.ok ? r.json() : [])
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => ["PAID", "DELIVERED"].includes(o.status));

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
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
        <p className="text-muted-foreground mt-1">Retrouvez l'historique de vos commandes</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Commandes</p>
            <p className="text-2xl font-bold text-navy mt-1">{paidOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Photos achetées</p>
            <p className="text-2xl font-bold text-navy mt-1">{paidOrders.reduce((sum, o) => sum + o.items.length, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <Card className="glass-card rounded-2xl">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun achat pour le moment</p>
            <Link href="/explore">
              <Button variant="outline">Parcourir les événements</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;

            return (
              <Card key={order.id} className="glass-card rounded-2xl hover:shadow-glass-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-lg">{order.event.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Commande #{order.id.slice(-8).toUpperCase()} •{" "}
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
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} photo{order.items.length > 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
