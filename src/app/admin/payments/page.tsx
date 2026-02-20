"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OrderRow {
  id: string;
  status: string;
  totalAmount: number;
  serviceFee: number;
  stripeFee: number;
  photographerPayout: number;
  guestEmail: string | null;
  guestName: string | null;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  downloadCount: number;
  createdAt: string;
  user: { id: string; name: string; email: string; sportifId?: string | null } | null;
  event: {
    id: string;
    name: string;
    user: { id: string; name: string; stripeOnboarded: boolean };
  };
  pack: { name: string; type: string } | null;
  _count: { items: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface PackBreakdown {
  pack_type: string | null;
  revenue: number;
  orders: number;
}

interface TopEvent {
  id: string;
  name: string;
  date: string;
  revenue: number;
  orders: number;
}

interface CreditBreakdownItem {
  total: number;
  count: number;
}

interface PaymentStats {
  revenue: {
    total: number;
    avgBasket: number;
    paidOrders: number;
  };
  totalOrders: number;
  refundedOrders: number;
  refundRate: string;
  monthlyRevenue: MonthlyRevenue[];
  packBreakdown: PackBreakdown[];
  topEvents: TopEvent[];
  connect: {
    totalServiceFees: number;
    totalStripeFees: number;
    totalPhotographerPayouts: number;
    onboardedAccounts: number;
    totalAccounts: number;
  };
  credits: {
    inCirculation: number;
    purchaseRevenue: number;
    purchases: CreditBreakdownItem;
    importDeductions: CreditBreakdownItem;
    apiDeductions: CreditBreakdownItem;
    adminGrants: CreditBreakdownItem;
  };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Payé", color: "bg-emerald-100 text-emerald-700" },
  DELIVERED: { label: "Livré", color: "bg-teal-100 text-teal-800" },
  REFUNDED: { label: "Remboursé", color: "bg-red-100 text-red-700" },
  EXPIRED: { label: "Expiré", color: "bg-gray-100 text-gray-600" },
};

const PACK_LABELS: Record<string, string> = {
  SINGLE: "Photo unique",
  PACK_5: "Pack 5",
  PACK_10: "Pack 10",
  ALL_INCLUSIVE: "All inclusive",
};

const QUICK_RANGES = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
  { label: "Tout", days: -1 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function euro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function dateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function pct(value: number, total: number): string {
  if (total === 0) return "0%";
  return ((value / total) * 100).toFixed(1) + "%";
}

// SVG Donut Pie Chart
interface PieSlice { value: number; color: string; label: string }

function PieChart({ slices, size = 160 }: { slices: PieSlice[]; size?: number }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400">N/A</span>
        </div>
      </div>
    );
  }
  const r = size / 2;
  const innerR = r * 0.55;
  let cumAngle = -90;
  const paths = slices.filter(s => s.value > 0).map((slice) => {
    const angle = (slice.value / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = r + r * Math.cos(startRad);
    const y1 = r + r * Math.sin(startRad);
    const x2 = r + r * Math.cos(endRad);
    const y2 = r + r * Math.sin(endRad);
    const ix1 = r + innerR * Math.cos(startRad);
    const iy1 = r + innerR * Math.sin(startRad);
    const ix2 = r + innerR * Math.cos(endRad);
    const iy2 = r + innerR * Math.sin(endRad);
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    return <path key={slice.label} d={d} fill={slice.color} className="transition-all duration-500"><title>{slice.label}: {pct(slice.value, total)}</title></path>;
  });
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>;
}

function monthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
    "fr-FR",
    { month: "short", year: "numeric" }
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminPaymentsPage() {
  /* ----- state ----- */
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  // Derived date strings for API calls
  const dateFrom = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const dateTo = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM yyyy", { locale: fr })} - ${format(dateRange.to, "dd MMM yyyy", { locale: fr })}`
      : format(dateRange.from, "dd MMM yyyy", { locale: fr })
    : "Toutes les periodes";

  /* ----- calendar handlers ----- */
  const applyQuickRange = (days: number) => {
    if (days === -1) {
      setDateRange(undefined);
    } else {
      const now = new Date();
      const from = new Date(now.getTime() - days * 86400000);
      setDateRange({ from, to: now });
    }
    setCalendarOpen(false);
  };

  useEffect(() => {
    if (!calendarOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [calendarOpen]);

  /* ----- data fetching ----- */
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`/api/admin/payments-stats?${params}`);
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [dateFrom, dateTo]);

  const fetchOrders = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (search) params.set("search", search);
        if (statusFilter && statusFilter !== "all")
          params.set("status", statusFilter);
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);

        const res = await fetch(`/api/admin/orders?${params}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter, dateFrom, dateTo]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  /* ----- CSV export ----- */
  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter && statusFilter !== "all")
      params.set("status", statusFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    window.location.href = `/api/admin/export/orders?${params}`;
  };

  /* ----- refund handler ----- */
  const handleRefund = async (orderId: string) => {
    if (
      !window.confirm(
        "Confirmer le remboursement de cette commande ? Cette action est irreversible."
      )
    )
      return;
    setRefundingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
      });
      if (res.ok) {
        fetchOrders(pagination.page);
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors du remboursement");
      }
    } catch {
      alert("Erreur reseau");
    } finally {
      setRefundingId(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Derived values                                                   */
  /* ---------------------------------------------------------------- */

  const maxMonthlyRevenue =
    stats && stats.monthlyRevenue.length > 0
      ? Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1)
      : 1;

  const totalPackRevenue =
    stats && stats.packBreakdown.length > 0
      ? stats.packBreakdown.reduce((s, p) => s + p.revenue, 0)
      : 1;

  // Average credit price based on actual purchase revenue
  const avgCreditPrice = stats && stats.credits.purchases.total > 0
    ? stats.credits.purchaseRevenue / stats.credits.purchases.total
    : 0.019;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="animate-fade-in space-y-8">
      {/* ============================================================ */}
      {/*  Header + Date Picker + Export                                */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Paiements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d&apos;ensemble du chiffre d&apos;affaires et gestion des
            commandes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range picker */}
          <div className="relative" ref={calendarRef}>
            <Button
              variant="outline"
              className="min-w-[240px] justify-start text-left font-normal rounded-xl"
              onClick={() => setCalendarOpen((v) => !v)}
            >
              <svg className="h-4 w-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="truncate">{dateRangeLabel}</span>
            </Button>
            {calendarOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 rounded-lg border bg-white shadow-lg">
                <div className="flex">
                  <div className="border-r p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Raccourcis</p>
                    {QUICK_RANGES.map((qr) => (
                      <button
                        key={qr.label}
                        onClick={() => applyQuickRange(qr.days)}
                        className="block w-full text-left text-sm px-3 py-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition-colors whitespace-nowrap"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-3">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range?.from && range?.to) {
                          setTimeout(() => setCalendarOpen(false), 400);
                        }
                      }}
                      numberOfMonths={2}
                      defaultMonth={dateRange?.from || new Date()}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Export CSV */}
          <Button
            onClick={handleExport}
            className="gradient-emerald text-white hover:opacity-90 rounded-xl gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  1) KPI Cards — CA, Commission ventes, Vente credits          */}
      {/* ============================================================ */}
      {isStatsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card rounded-2xl animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CA total */}
          <Card className="glass-card rounded-2xl border-l-4 border-l-emerald overflow-hidden">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Chiffre d&apos;affaires
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-emerald">
                {euro(stats.revenue.total)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stats.revenue.paidOrders} commandes &middot; Panier moy. {euro(stats.revenue.avgBasket)}
              </p>
            </CardContent>
          </Card>

          {/* Commission ventes (frais de service) */}
          <Card className="glass-card rounded-2xl border-l-4 border-l-violet-500 overflow-hidden">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Commission ventes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-violet-600">
                {euro(stats.connect.totalServiceFees)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                1&euro; / commande &middot; {stats.revenue.paidOrders} commandes
              </p>
            </CardContent>
          </Card>

          {/* Vente de credits */}
          <Card className="glass-card rounded-2xl border-l-4 border-l-blue-500 overflow-hidden">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Vente de credits
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-blue-600">
                {euro(stats.credits.purchaseRevenue)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stats.credits.purchases.total.toLocaleString("fr-FR")} credits &middot; {stats.credits.purchases.count} transactions
              </p>
            </CardContent>
          </Card>

          {/* CA API */}
          <Card className="glass-card rounded-2xl border-l-4 border-l-orange-500 overflow-hidden">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                CA API
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-orange-600">
                {euro(Math.abs(stats.credits.apiDeductions.total) * avgCreditPrice)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {Math.abs(stats.credits.apiDeductions.total).toLocaleString("fr-FR")} credits &middot; {stats.credits.apiDeductions.count} appels
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/*  2) Revenue Sources Pie Charts                                */}
      {/* ============================================================ */}
      {stats && (() => {
        const salesAmount = stats.connect.totalServiceFees;
        const creditPurchaseAmount = stats.credits.purchaseRevenue;
        const apiAmount = Math.abs(stats.credits.apiDeductions.total) * avgCreditPrice;
        const totalSources = salesAmount + creditPurchaseAmount + apiAmount;

        const revenueSlices: PieSlice[] = [
          { value: salesAmount, color: "#8b5cf6", label: "Commission ventes" },
          { value: creditPurchaseAmount, color: "#2563eb", label: "Vente credits" },
          { value: apiAmount, color: "#ea580c", label: "API" },
        ];

        const feeSlices: PieSlice[] = [
          { value: stats.connect.totalPhotographerPayouts, color: "#059669", label: "Reverse photographes" },
          { value: stats.connect.totalStripeFees, color: "#7c3aed", label: "Frais Stripe" },
          { value: stats.connect.totalServiceFees, color: "#6b7280", label: "Commission plateforme" },
        ];

        return (
          <>
            {/* Pie Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-navy">Sources de revenus plateforme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <PieChart slices={revenueSlices} size={160} />
                    <div className="flex-1 space-y-3">
                      {revenueSlices.map(slice => (
                        <div key={slice.label} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-navy">{slice.label}</p>
                            <p className="text-xs text-muted-foreground">{pct(slice.value, totalSources)}</p>
                          </div>
                          <p className="font-semibold text-sm text-navy">{euro(slice.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-navy">Repartition du CA brut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <PieChart slices={feeSlices} size={160} />
                    <div className="flex-1 space-y-3">
                      {feeSlices.map(slice => (
                        <div key={slice.label} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-navy">{slice.label}</p>
                            <p className="text-xs text-muted-foreground">{pct(slice.value, stats.revenue.total)}</p>
                          </div>
                          <p className="font-semibold text-sm text-navy">{euro(slice.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Credits Summary */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Resume credits plateforme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-navy">{stats.credits.inCirculation.toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-muted-foreground mt-1">En circulation</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">+{stats.credits.purchases.total.toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-blue-500 font-medium">{euro(stats.credits.purchaseRevenue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Achetes ({stats.credits.purchases.count})</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-2xl font-bold text-red-600">{stats.credits.importDeductions.total.toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-red-400 font-medium">{euro(Math.abs(stats.credits.importDeductions.total) * avgCreditPrice)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Import ({stats.credits.importDeductions.count})</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-600">{stats.credits.apiDeductions.total.toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-orange-400 font-medium">{euro(Math.abs(stats.credits.apiDeductions.total) * avgCreditPrice)}</p>
                    <p className="text-xs text-muted-foreground mt-1">API ({stats.credits.apiDeductions.count})</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">+{stats.credits.adminGrants.total.toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-emerald-400 font-medium">{euro(stats.credits.adminGrants.total * avgCreditPrice)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Offerts ({stats.credits.adminGrants.count})</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
      })()}

      {/* ============================================================ */}
      {/*  3) Revenue Chart + Pack Breakdown                            */}
      {/* ============================================================ */}
      {stats && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly revenue chart */}
          <Card className="glass-card rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
                Revenus mensuels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.monthlyRevenue.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  Aucune donnée disponible
                </p>
              ) : (
                <div className="flex items-end gap-3 h-48">
                  {stats.monthlyRevenue.map((m) => {
                    const barPct = (m.revenue / maxMonthlyRevenue) * 100;
                    return (
                      <div
                        key={m.month}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-xs font-semibold text-navy whitespace-nowrap">
                          {euro(m.revenue)}
                        </span>
                        <div className="w-full bg-emerald-50 rounded-t-lg relative flex-1 flex items-end">
                          <div
                            className="w-full gradient-emerald rounded-t-lg transition-all duration-700 ease-out"
                            style={{
                              height: `${Math.max(barPct, 4)}%`,
                              minHeight: "4px",
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                          {monthLabel(m.month)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {m.orders} cmd{m.orders > 1 ? "s" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by pack type */}
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-teal-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                  />
                </svg>
                Revenus par pack
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.packBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  Aucune donnée
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.packBreakdown.map((pack) => {
                    const label =
                      PACK_LABELS[pack.pack_type || ""] ||
                      pack.pack_type ||
                      "Sans pack";
                    const packPct =
                      totalPackRevenue > 0
                        ? ((pack.revenue / totalPackRevenue) * 100).toFixed(1)
                        : "0";
                    return (
                      <div key={pack.pack_type || "none"}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-navy">
                            {label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {euro(pack.revenue)}{" "}
                            <span className="text-xs">({packPct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-emerald-50 rounded-full h-2.5">
                          <div
                            className="gradient-emerald h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(parseFloat(packPct), 2)}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {pack.orders} commande{pack.orders > 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top events by revenue */}
      {stats && stats.topEvents.length > 0 && (
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-navy flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.894m0 0a6.023 6.023 0 01-2.77-.894"
                />
              </svg>
              Top 5 événements par revenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-3">
              {stats.topEvents.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="relative p-4 rounded-xl bg-white/60 hover:bg-white/80 transition-colors border border-white/40"
                >
                  <div
                    className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      idx === 0
                        ? "bg-amber-500"
                        : idx === 1
                          ? "bg-gray-400"
                          : idx === 2
                            ? "bg-amber-700"
                            : "bg-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p
                    className="font-semibold text-sm text-navy truncate mt-1"
                    title={evt.name}
                  >
                    {evt.name}
                  </p>
                  <p className="text-lg font-bold text-emerald mt-1">
                    {euro(evt.revenue)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {evt.orders} commande{evt.orders > 1 ? "s" : ""} &middot;{" "}
                    {dateFR(evt.date)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Connect accounts summary */}
      {stats && (
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-navy flex items-center gap-2">
              <svg className="w-5 h-5 text-[#635BFF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
              Comptes Stripe Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-700">{stats.connect.onboardedAccounts}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Photographes connect&eacute;s</p>
                  <p className="text-xs text-muted-foreground">Compte Stripe actif</p>
                </div>
              </div>
              <div className="text-2xl text-gray-300">/</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">{stats.connect.totalAccounts}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Photographes total</p>
                  <p className="text-xs text-muted-foreground">Photographes, organisateurs, agences</p>
                </div>
              </div>
              <div className="ml-auto flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Reverse :</span>{" "}
                  <span className="font-semibold text-navy">{euro(stats.connect.totalPhotographerPayouts)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Frais Stripe :</span>{" "}
                  <span className="font-semibold text-navy">{euro(stats.connect.totalStripeFees)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  4) Orders Table                                              */}
      {/* ============================================================ */}
      <Card className="glass-card rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <CardTitle className="text-navy">Liste des commandes</CardTitle>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <Input
                  placeholder="Rechercher client, email, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-9 rounded-xl"
                />
              </div>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 rounded-xl">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="PAID">Payé</SelectItem>
                  <SelectItem value="DELIVERED">Livré</SelectItem>
                  <SelectItem value="REFUNDED">Remboursé</SelectItem>
                  <SelectItem value="EXPIRED">Expiré</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {(search || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-navy rounded-xl"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald border-r-transparent" />
              <p className="text-muted-foreground mt-3">Chargement...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="w-12 h-12 mx-auto text-muted-foreground/40"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <p className="text-muted-foreground mt-2">
                Aucune commande trouvée
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl overflow-hidden border border-white/40">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/30">
                      <TableHead className="font-semibold text-navy">
                        ID
                      </TableHead>
                      <TableHead className="font-semibold text-navy">
                        Client
                      </TableHead>
                      <TableHead className="font-semibold text-navy">
                        Événement
                      </TableHead>
                      <TableHead className="font-semibold text-navy">
                        Pack
                      </TableHead>
                      <TableHead className="font-semibold text-navy text-center">
                        Photos
                      </TableHead>
                      <TableHead className="font-semibold text-navy">
                        Photographe
                      </TableHead>
                      <TableHead className="font-semibold text-navy text-right">
                        Montant
                      </TableHead>
                      <TableHead className="font-semibold text-navy text-right">
                        Frais svc
                      </TableHead>
                      <TableHead className="font-semibold text-navy text-right">
                        Net photo.
                      </TableHead>
                      <TableHead className="font-semibold text-navy text-center">
                        Statut
                      </TableHead>
                      <TableHead className="font-semibold text-navy">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-navy text-center">
                        DL
                      </TableHead>
                      <TableHead className="font-semibold text-navy text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const statusCfg =
                        STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                      const clientName =
                        order.user?.name || order.guestName || "Invité";
                      const clientEmail =
                        order.user?.email || order.guestEmail || "";
                      const packLabel = order.pack
                        ? PACK_LABELS[order.pack.type] || order.pack.name
                        : "-";

                      return (
                        <TableRow
                          key={order.id}
                          className="hover:bg-white/50 transition-colors"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(-8).toUpperCase()}
                          </TableCell>

                          <TableCell>
                            <div className="max-w-[180px]">
                              <p className="font-medium text-sm text-navy truncate">
                                {clientName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {clientEmail}
                              </p>
                              {order.user?.sportifId && (
                                <p className="text-xs font-mono text-emerald">{order.user.sportifId}</p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Link
                              href={`/focus-mgr-7k9x/events?id=${order.event.id}`}
                              className="text-sm text-emerald hover:text-emerald-dark transition-colors hover:underline"
                            >
                              {order.event.name}
                            </Link>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-medium text-navy/70 bg-white/60 px-2 py-0.5 rounded-full">
                              {packLabel}
                            </span>
                          </TableCell>

                          <TableCell className="text-center text-sm">
                            {order._count.items}
                          </TableCell>

                          <TableCell>
                            <div className="max-w-[140px]">
                              <p className="text-sm text-navy truncate">{order.event.user?.name || "-"}</p>
                              {order.event.user?.stripeOnboarded && (
                                <Badge className="bg-[#635BFF]/10 text-[#635BFF] border-0 text-[10px] px-1.5">Connect</Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right font-semibold text-sm text-navy">
                            {euro(order.totalAmount)}
                          </TableCell>

                          <TableCell className="text-right text-sm text-muted-foreground">
                            {order.serviceFee > 0 ? euro(order.serviceFee) : "-"}
                          </TableCell>

                          <TableCell className="text-right text-sm text-blue-600">
                            {order.photographerPayout > 0 ? euro(order.photographerPayout) : "-"}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              className={`${statusCfg.color} rounded-full text-xs px-2.5`}
                            >
                              {statusCfg.label}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {dateFR(order.createdAt)}
                          </TableCell>

                          <TableCell className="text-center text-sm text-muted-foreground">
                            {order.downloadCount || 0}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Link
                                href={`/focus-mgr-7k9x/disputes?order=${order.id}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg text-xs h-7 px-2"
                                >
                                  Détails
                                </Button>
                              </Link>
                              {order.status === "PAID" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg text-xs h-7 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  disabled={refundingId === order.id}
                                  onClick={() => handleRefund(order.id)}
                                >
                                  {refundingId === order.id
                                    ? "..."
                                    : "Rembourser"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                <p className="text-sm text-muted-foreground">
                  {pagination.total} commande
                  {pagination.total !== 1 ? "s" : ""} au total
                  {statusFilter !== "all" && (
                    <span className="ml-1">
                      (filtre:{" "}
                      {STATUS_CONFIG[statusFilter]?.label || statusFilter})
                    </span>
                  )}
                </p>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchOrders(pagination.page - 1)}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                      </svg>
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground px-3 py-1 bg-white/50 rounded-lg">
                      Page {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchOrders(pagination.page + 1)}
                    >
                      Suivant
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
