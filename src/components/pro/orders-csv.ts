/**
 * Pure helpers for the shared Orders page — no React imports, fully testable.
 */

export type ProRole = "photographer" | "organizer";

export interface OrderRow {
  id: string;
  totalAmount: number;
  platformFee: number;
  serviceFee: number;
  stripeFee: number;
  photographerPayout: number;
  payoutStatus: "NOT_APPLICABLE" | "PENDING" | "TRANSFERRED";
  transferredAt: string | null;
  status: string;
  createdAt: string;
  guestEmail: string | null;
  guestName: string | null;
  user: { id: string; name: string; email: string; sportifId?: string | null } | null;
  event: { id: string; name: string; date: string };
  _count: { items: number };
}

/** CSV column header for the net payout amount — role-specific label */
export const CSV_NET_LABEL: Record<ProRole, string> = {
  photographer: "Net photographe",
  organizer: "Net organisateur",
};

/** API endpoint for stats — organizer re-exports photographer's handler (same shape) */
export const STATS_ENDPOINT: Record<ProRole, string> = {
  photographer: "/api/stats/photographer",
  organizer: "/api/stats/organizer",
};

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PAID: { label: "Payé", className: "bg-emerald-500/100/10 text-emerald-400" },
  DELIVERED: { label: "Livré", className: "bg-blue-500/100/10 text-blue-400" },
  REFUNDED: { label: "Remboursé", className: "bg-red-500/10 text-red-400" },
  PENDING: { label: "En attente", className: "bg-amber-500/100/10 text-amber-400" },
  EXPIRED: { label: "Expiré", className: "bg-gray-500/10 text-gray-400" },
};

/**
 * Build a UTF-8 BOM CSV string from a sorted list of orders.
 * The "Net" column header is role-specific; all other columns are shared.
 */
export function buildOrdersCsv(orders: OrderRow[], role: ProRole): string {
  const bom = "﻿";
  const headers = [
    "Date",
    "Client",
    "Email",
    "SportifId",
    "Événement",
    "Photos",
    "Montant TTC",
    "Frais service",
    "Frais Stripe",
    CSV_NET_LABEL[role],
    "Versement",
    "Statut",
  ];
  const rows = orders.map((o) => [
    new Date(o.createdAt).toLocaleDateString("fr-FR"),
    o.user?.name || o.guestName || "Anonyme",
    o.user?.email || o.guestEmail || "",
    o.user?.sportifId || "",
    o.event.name,
    o._count.items,
    o.totalAmount.toFixed(2),
    (o.serviceFee || 0).toFixed(2),
    (o.stripeFee || 0).toFixed(2),
    o.photographerPayout.toFixed(2),
    o.payoutStatus === "TRANSFERRED"
      ? "Versé"
      : o.payoutStatus === "PENDING"
        ? "En attente"
        : "—",
    STATUS_CONFIG[o.status]?.label || o.status,
  ]);
  return bom + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
}
