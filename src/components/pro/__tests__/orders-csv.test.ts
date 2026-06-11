import { describe, it, expect } from "vitest";
import { buildOrdersCsv, CSV_NET_LABEL, STATUS_CONFIG } from "../orders-csv";
import type { OrderRow } from "../orders-csv";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeOrder = (overrides: Partial<OrderRow> = {}): OrderRow => ({
  id: "order-1",
  totalAmount: 16.0,
  platformFee: 0,
  serviceFee: 1.0,
  stripeFee: 0.54,
  photographerPayout: 14.46,
  payoutStatus: "TRANSFERRED",
  transferredAt: "2026-06-01T00:00:00Z",
  status: "PAID",
  createdAt: "2026-06-01T10:00:00Z",
  guestEmail: null,
  guestName: null,
  user: { id: "u1", name: "Alice Dupont", email: "alice@example.com", sportifId: "SP-001" },
  event: { id: "ev1", name: "Trail des Vosges", date: "2026-06-01" },
  _count: { items: 3 },
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("buildOrdersCsv", () => {
  it("uses 'Net photographe' header for photographer role", () => {
    const csv = buildOrdersCsv([makeOrder()], "photographer");
    const headerLine = csv.split("\n")[0];
    expect(headerLine).toContain("Net photographe");
    expect(headerLine).not.toContain("Net organisateur");
  });

  it("uses 'Net organisateur' header for organizer role", () => {
    const csv = buildOrdersCsv([makeOrder()], "organizer");
    const headerLine = csv.split("\n")[0];
    expect(headerLine).toContain("Net organisateur");
    expect(headerLine).not.toContain("Net photographe");
  });

  it("starts with UTF-8 BOM", () => {
    const csv = buildOrdersCsv([], "photographer");
    // BOM is U+FEFF
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("has exactly 12 semicolon-separated columns in the header", () => {
    const csv = buildOrdersCsv([], "photographer");
    // Strip the BOM before splitting
    const headerLine = csv.slice(1).split("\n")[0];
    const cols = headerLine.split(";");
    expect(cols).toHaveLength(12);
  });

  it("emits one data row per order", () => {
    const csv = buildOrdersCsv([makeOrder(), makeOrder({ id: "order-2" })], "photographer");
    const lines = csv.split("\n");
    // BOM header line + 2 data rows = 3 lines
    expect(lines).toHaveLength(3);
  });

  it("formats payout status labels correctly", () => {
    const transferred = buildOrdersCsv([makeOrder({ payoutStatus: "TRANSFERRED" })], "photographer");
    const pending = buildOrdersCsv([makeOrder({ payoutStatus: "PENDING" })], "photographer");
    const notApplicable = buildOrdersCsv([makeOrder({ payoutStatus: "NOT_APPLICABLE" })], "photographer");

    const dataLine = (csv: string) => csv.split("\n")[1];
    expect(dataLine(transferred)).toContain("Versé");
    expect(dataLine(pending)).toContain("En attente");
    expect(dataLine(notApplicable)).toContain("—");
  });

  it("uses STATUS_CONFIG label for order status", () => {
    const csv = buildOrdersCsv([makeOrder({ status: "REFUNDED" })], "photographer");
    expect(csv).toContain(STATUS_CONFIG.REFUNDED.label);
  });

  it("falls back to 'Anonyme' when user and guest info are absent", () => {
    const csv = buildOrdersCsv(
      [makeOrder({ user: null, guestName: null, guestEmail: null })],
      "photographer"
    );
    expect(csv).toContain("Anonyme");
  });

  it("CSV_NET_LABEL entries match expected strings", () => {
    expect(CSV_NET_LABEL.photographer).toBe("Net photographe");
    expect(CSV_NET_LABEL.organizer).toBe("Net organisateur");
  });
});
