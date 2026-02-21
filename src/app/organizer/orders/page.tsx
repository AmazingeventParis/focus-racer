"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  totalAmount: number;
  platformFee: number;
  serviceFee: number;
  status: string;
  createdAt: string;
  guestEmail: string | null;
  guestName: string | null;
  user: { id: string; name: string; email: string; sportifId?: string | null } | null;
  event: { id: string; name: string; date: string };
  _count: { items: number };
}

interface EventOption {
  id: string;
  name: string;
  date: string;
}

interface ConnectStatus {
  hasAccount: boolean;
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

interface RevenueData {
  total: number;
  photographerPayout: number;
  stripeFees: number;
  serviceFees: number;
}

function euro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PAID: { label: "Payé", className: "bg-emerald-100 text-emerald-800" },
  DELIVERED: { label: "Livré", className: "bg-blue-100 text-blue-800" },
  REFUNDED: { label: "Remboursé", className: "bg-red-100 text-red-700" },
  PENDING: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  EXPIRED: { label: "Expiré", className: "bg-gray-100 text-gray-600" },
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stripe Connect
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<"date" | "amount" | "photos">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ view: "seller" });
      if (eventFilter !== "all") params.set("eventId", eventFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventFilter, statusFilter, dateFrom, dateTo, search]);

  const fetchStripeData = useCallback(async () => {
    try {
      const [connectRes, statsRes] = await Promise.all([
        fetch("/api/stripe/connect/status"),
        fetch("/api/stats/organizer"),
      ]);
      if (connectRes.ok) setConnectStatus(await connectRes.json());
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.revenue) setRevenueData(data.revenue);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (session) {
      fetchOrders();
      fetchStripeData();
    }
  }, [session, fetchOrders, fetchStripeData]);

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Erreur Stripe", description: data.error || "Impossible de configurer Stripe", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur de connexion au serveur.", variant: "destructive" });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleStripeDashboard = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/dashboard", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        window.open(data.url, "_blank");
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ouvrir le dashboard", variant: "destructive" });
    } finally {
      setConnectLoading(false);
    }
  };

  // Computed KPIs
  const kpis = useMemo(() => {
    const paid = orders.filter((o) => o.status === "PAID" || o.status === "DELIVERED");
    const refunded = orders.filter((o) => o.status === "REFUNDED");
    const totalRevenue = paid.reduce((s, o) => s + o.totalAmount, 0);
    const netRevenue = paid.reduce((s, o) => s + (o.totalAmount - o.platformFee), 0);
    const totalPhotos = paid.reduce((s, o) => s + o._count.items, 0);
    const avgOrder = paid.length > 0 ? totalRevenue / paid.length : 0;
    const uniqueCustomers = new Set(
      paid.map((o) => o.user?.id || o.guestEmail || o.id)
    ).size;

    return {
      totalRevenue,
      netRevenue,
      paidCount: paid.length,
      refundedCount: refunded.length,
      totalPhotos,
      avgOrder,
      uniqueCustomers,
    };
  }, [orders]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    const sorted = [...orders];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "amount") cmp = a.totalAmount - b.totalAmount;
      else if (sortField === "photos") cmp = a._count.items - b._count.items;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return sorted;
  }, [orders, sortField, sortDir]);

  const toggleSort = (field: "date" | "amount" | "photos") => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <svg className="w-3.5 h-3.5 text-gray-300 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>;
    return <svg className="w-3.5 h-3.5 text-emerald ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={sortDir === "desc" ? "M19.5 8.25l-7.5 7.5-7.5-7.5" : "M4.5 15.75l7.5-7.5 7.5 7.5"} /></svg>;
  };

  const resetFilters = () => {
    setSearch("");
    setEventFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = search || eventFilter !== "all" || statusFilter !== "all" || dateFrom || dateTo;

  const handleExportCSV = () => {
    const bom = "\uFEFF";
    const headers = ["Date", "Client", "Email", "SportifId", "Événement", "Photos", "Montant TTC", "Commission", "Net", "Statut"];
    const rows = sortedOrders.map((o) => [
      new Date(o.createdAt).toLocaleDateString("fr-FR"),
      o.user?.name || o.guestName || "Anonyme",
      o.user?.email || o.guestEmail || "",
      o.user?.sportifId || "",
      o.event.name,
      o._count.items,
      o.totalAmount.toFixed(2),
      o.platformFee.toFixed(2),
      (o.totalAmount - o.platformFee).toFixed(2),
      STATUS_CONFIG[o.status]?.label || o.status,
    ]);
    const csv = bom + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Revenue by event (top 5)
  const revenueByEvent = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    orders
      .filter((o) => o.status === "PAID" || o.status === "DELIVERED")
      .forEach((o) => {
        if (!map[o.event.id]) map[o.event.id] = { name: o.event.name, revenue: 0, count: 0 };
        map[o.event.id].revenue += o.totalAmount - o.platformFee;
        map[o.event.id].count++;
      });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const maxEventRevenue = revenueByEvent.length > 0 ? Math.max(...revenueByEvent.map((e) => e.revenue)) : 1;

  // Recent trend (daily totals for last 30 days)
  const dailyTrend = useMemo(() => {
    const now = new Date();
    const days: { date: string; label: string; revenue: number; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), revenue: 0, count: 0 });
    }
    orders
      .filter((o) => o.status === "PAID" || o.status === "DELIVERED")
      .forEach((o) => {
        const key = new Date(o.createdAt).toISOString().slice(0, 10);
        const day = days.find((d) => d.date === key);
        if (day) {
          day.revenue += o.totalAmount - o.platformFee;
          day.count++;
        }
      });
    return days;
  }, [orders]);

  const maxDailyRevenue = Math.max(...dailyTrend.map((d) => d.revenue), 1);

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Ventes</h1>
          <p className="text-gray-500 mt-1">Pilotez vos ventes, paiements et performances</p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
          disabled={sortedOrders.length === 0}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exporter CSV
        </Button>
      </div>

      {/* Stripe Connect Status Card */}
      <Card className="bg-white border-0 shadow-card rounded-2xl mb-6">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#635BFF]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">Stripe Connect</p>
                  {connectStatus?.isOnboarded ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Actif</Badge>
                  ) : connectStatus?.hasAccount ? (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">En cours</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Non configuré</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {connectStatus?.isOnboarded
                    ? "Les paiements de vos ventes sont versés directement sur votre compte"
                    : "Connectez votre compte pour recevoir les paiements de vos ventes"}
                </p>
              </div>
            </div>
            {connectStatus?.isOnboarded ? (
              <Button
                className="text-[#635BFF] border-[#635BFF]/30 hover:bg-[#635BFF]/5 rounded-xl flex-shrink-0"
                variant="outline"
                onClick={handleStripeDashboard}
                disabled={connectLoading}
              >
                {connectLoading ? "..." : "Dashboard Stripe"}
              </Button>
            ) : (
              <Button
                className="bg-[#635BFF] hover:bg-[#5249d9] text-white rounded-xl flex-shrink-0"
                onClick={handleConnectStripe}
                disabled={connectLoading}
              >
                {connectLoading ? "..." : connectStatus?.hasAccount ? "Reprendre" : "Connecter Stripe"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-0 shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Chiffre d&apos;affaires</p>
                <p className="text-xl font-bold text-gray-900">{euro(kpis.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Revenus nets</p>
                <p className="text-xl font-bold text-green-600">{euro(kpis.netRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Commandes</p>
                <p className="text-xl font-bold text-gray-900">
                  {kpis.paidCount}
                  {kpis.refundedCount > 0 && (
                    <span className="text-sm font-normal text-red-500 ml-1">({kpis.refundedCount} remb.)</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-card rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Photos vendues</p>
                <p className="text-xl font-bold text-gray-900">{kpis.totalPhotos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border-0 shadow-card rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Panier moyen</p>
              <p className="text-lg font-bold text-gray-900">{euro(kpis.avgOrder)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-card rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Clients uniques</p>
              <p className="text-lg font-bold text-gray-900">{kpis.uniqueCustomers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-card rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Photos/commande</p>
              <p className="text-lg font-bold text-gray-900">
                {kpis.paidCount > 0 ? (kpis.totalPhotos / kpis.paidCount).toFixed(1) : "0"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Bar */}
      {revenueData && revenueData.total > 0 && (
        <Card className="bg-white border-0 shadow-card rounded-xl mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Répartition des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.max((revenueData.photographerPayout / revenueData.total) * 100, 2)}%` }}
                  title={`Vous recevez: ${euro(revenueData.photographerPayout)}`}
                />
                <div
                  className="h-full bg-violet-400 transition-all duration-700"
                  style={{ width: `${Math.max((revenueData.stripeFees / revenueData.total) * 100, 1)}%` }}
                  title={`Frais Stripe: ${euro(revenueData.stripeFees)}`}
                />
                <div
                  className="h-full bg-gray-400 transition-all duration-700"
                  style={{ width: `${Math.max((revenueData.serviceFees / revenueData.total) * 100, 1)}%` }}
                  title={`Frais de service: ${euro(revenueData.serviceFees)}`}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">Vous recevez</span>
                  <span className="font-semibold text-gray-900">{euro(revenueData.photographerPayout)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-400" />
                  <span className="text-gray-600">Frais Stripe</span>
                  <span className="font-semibold text-gray-900">{euro(revenueData.stripeFees)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-gray-600">Frais de service</span>
                  <span className="font-semibold text-gray-900">{euro(revenueData.serviceFees)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      {!isLoading && orders.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Daily Trend */}
          <Card className="bg-white border-0 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Revenus nets — 30 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-[2px] h-32">
                {dailyTrend.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-emerald/20 hover:bg-emerald/40 rounded-t transition-colors cursor-default"
                      style={{ height: `${Math.max((d.revenue / maxDailyRevenue) * 100, d.revenue > 0 ? 4 : 0)}%`, minHeight: d.revenue > 0 ? "3px" : "0" }}
                    />
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                        <p className="font-medium">{d.label}</p>
                        <p>{euro(d.revenue)} — {d.count} cmd</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>{dailyTrend[0]?.label}</span>
                <span>{dailyTrend[dailyTrend.length - 1]?.label}</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Events */}
          <Card className="bg-white border-0 shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Top événements par revenus</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByEvent.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune donnée</p>
              ) : (
                <div className="space-y-3">
                  {revenueByEvent.map((ev, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate max-w-[60%]">{ev.name}</span>
                        <span className="font-semibold text-gray-900">{euro(ev.revenue)} <span className="font-normal text-gray-400 text-xs">({ev.count})</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald to-emerald-dark rounded-full transition-all duration-500"
                          style={{ width: `${(ev.revenue / maxEventRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-white border-0 shadow-card rounded-xl mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-500 mb-1 block">Rechercher</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Client, email, événement..."
                  className="pl-9 bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-xs text-gray-500 mb-1 block">Événement</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-36">
              <label className="text-xs text-gray-500 mb-1 block">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="PAID">Payé</SelectItem>
                  <SelectItem value="DELIVERED">Livré</SelectItem>
                  <SelectItem value="REFUNDED">Remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <label className="text-xs text-gray-500 mb-1 block">Du</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald"
              />
            </div>
            <div className="w-full md:w-40">
              <label className="text-xs text-gray-500 mb-1 block">Au</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700 h-10 px-3 flex-shrink-0"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white border-0 shadow-card rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display text-gray-900">
              Historique des ventes
              <span className="text-sm font-normal text-gray-400 ml-2">({sortedOrders.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                    <div className="h-5 w-12 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <p className="text-gray-500">
                {hasActiveFilters
                  ? "Aucune vente ne correspond à vos filtres"
                  : "Aucune vente pour le moment"}
              </p>
              {hasActiveFilters && (
                <Button variant="link" onClick={resetFilters} className="text-emerald mt-2">
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2">
                <button className="col-span-2 flex items-center text-left hover:text-gray-700" onClick={() => toggleSort("date")}>
                  Date <SortIcon field="date" />
                </button>
                <div className="col-span-3">Client</div>
                <div className="col-span-2">Événement</div>
                <button className="col-span-1 flex items-center hover:text-gray-700" onClick={() => toggleSort("photos")}>
                  Photos <SortIcon field="photos" />
                </button>
                <button className="col-span-2 flex items-center hover:text-gray-700" onClick={() => toggleSort("amount")}>
                  Montant <SortIcon field="amount" />
                </button>
                <div className="col-span-1">Net</div>
                <div className="col-span-1 text-right">Statut</div>
              </div>

              <div className="space-y-2">
                {sortedOrders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const customerName = order.user?.name || order.guestName || order.guestEmail || "Anonyme";
                  const customerEmail = order.user?.email || order.guestEmail || "";
                  const net = order.totalAmount - order.platformFee;

                  return (
                    <div
                      key={order.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 items-center"
                    >
                      <div className="md:col-span-2">
                        <span className="text-sm text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="text-xs text-gray-400 ml-1 md:block md:ml-0">
                          {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="md:col-span-3">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {customerName}
                          {order.user?.sportifId && (
                            <Badge variant="outline" className="ml-1.5 text-[10px] font-mono py-0">{order.user.sportifId}</Badge>
                          )}
                        </p>
                        {customerEmail && (
                          <p className="text-xs text-gray-400 truncate">{customerEmail}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 truncate">{order.event.name}</p>
                      </div>
                      <div className="md:col-span-1">
                        <span className="text-sm text-gray-700">
                          {order._count.items} <span className="text-gray-400 text-xs">photo{order._count.items > 1 ? "s" : ""}</span>
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-semibold text-gray-900 text-sm">{euro(order.totalAmount)}</p>
                        {order.platformFee > 0 && (
                          <p className="text-[10px] text-gray-400">comm. {euro(order.platformFee)}</p>
                        )}
                      </div>
                      <div className="md:col-span-1">
                        <p className="font-semibold text-green-600 text-sm">{euro(net)}</p>
                      </div>
                      <div className="md:col-span-1 md:text-right">
                        <Badge className={`text-xs ${statusCfg.className}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
