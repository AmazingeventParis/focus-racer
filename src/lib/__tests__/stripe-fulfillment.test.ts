/**
 * Unit tests for fulfillOrder — atomic + idempotent webhook fulfillment.
 *
 * Mocks all I/O so these run without a DB or network.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── All vi.mock calls must use only literals / vi.fn() inside the factory ──
// (vi.mock is hoisted and runs before variable declarations)

vi.mock("@/lib/prisma", () => ({
  default: {
    order: { updateMany: vi.fn(), findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/email", () => ({
  sendPurchaseConfirmation: vi.fn().mockResolvedValue(undefined),
  sendNewSaleEmail: vi.fn().mockResolvedValue(undefined),
  sendSubscriptionPaymentFailedEmail: vi.fn(),
  sendSubscriptionRenewalEmail: vi.fn(),
  sendSubscriptionCanceledEmail: vi.fn(),
  sendStripeOnboardedEmail: vi.fn(),
}));

vi.mock("@/lib/gamification/streak-service", () => ({
  recordStreakActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/gamification/referral-service", () => ({
  completeReferral: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/notification-preferences", () => ({
  canSendEmail: vi.fn().mockResolvedValue(true),
  generateUnsubscribeUrl: vi.fn().mockReturnValue("https://example.com/unsub"),
}));

vi.mock("@/lib/notify", () => ({
  notifyNewSale: vi.fn().mockResolvedValue(undefined),
}));

// ─── Imports (after mocks are registered) ───────────────────────────────────
import prisma from "@/lib/prisma";
import * as emailMod from "@/lib/email";
import * as streakMod from "@/lib/gamification/streak-service";
import * as referralMod from "@/lib/gamification/referral-service";
import * as prefsMod from "@/lib/notification-preferences";
import * as notifyMod from "@/lib/notify";
import { fulfillOrder } from "@/lib/stripe-fulfillment";

// ─── Typed references to mocked functions ───────────────────────────────────
const mockUpdateMany = vi.mocked(prisma.order.updateMany);
const mockOrderFindUnique = vi.mocked(prisma.order.findUnique);
const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockSendPurchaseConfirmation = vi.mocked(emailMod.sendPurchaseConfirmation);
const mockSendNewSaleEmail = vi.mocked(emailMod.sendNewSaleEmail);
const mockRecordStreakActivity = vi.mocked(streakMod.recordStreakActivity);
const mockCompleteReferral = vi.mocked(referralMod.completeReferral);
const mockCanSendEmail = vi.mocked(prefsMod.canSendEmail);
const mockNotifyNewSale = vi.mocked(notifyMod.notifyNewSale);

// ─── Fake order fixture ──────────────────────────────────────────────────────
const fakeOrder = {
  id: "order_1",
  userId: "user_1",
  guestEmail: null as string | null,
  guestName: null as string | null,
  totalAmount: 15,
  downloadToken: "tok_abc",
  downloadExpiresAt: new Date(Date.now() + 72 * 3600 * 1000),
  stripePaymentId: "pi_1",
  status: "PAID",
  event: { id: "event_1", name: "Paris Trail 2026", userId: "photographer_1" },
  items: [{ id: "item_1", photo: { id: "photo_1" } }],
  user: { id: "user_1", email: "runner@example.com", name: "Alice" },
};

const fakePhotographer = { email: "photographer@example.com", name: "Bob" };

// ─── Tests ───────────────────────────────────────────────────────────────────
describe("fulfillOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanSendEmail.mockResolvedValue(true);
  });

  it("case 1 (first delivery): runs all side effects when count === 1", async () => {
    // Arrange
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    mockOrderFindUnique.mockResolvedValueOnce(fakeOrder as never);
    mockUserFindUnique.mockResolvedValueOnce(fakePhotographer as never);

    // Act
    await fulfillOrder("order_1", "pi_1");

    // Assert atomic claim was performed with correct where + data
    expect(mockUpdateMany).toHaveBeenCalledOnce();
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order_1", status: "PENDING" },
        data: expect.objectContaining({ status: "PAID", stripePaymentId: "pi_1" }),
      })
    );

    // Assert order was loaded (to run side effects)
    expect(mockOrderFindUnique).toHaveBeenCalledOnce();

    // Assert side effects each ran exactly once
    expect(mockSendPurchaseConfirmation).toHaveBeenCalledOnce();
    expect(mockRecordStreakActivity).toHaveBeenCalledOnce();
    expect(mockCompleteReferral).toHaveBeenCalledOnce();
    expect(mockCanSendEmail).toHaveBeenCalledOnce();
    expect(mockSendNewSaleEmail).toHaveBeenCalledOnce();
    expect(mockNotifyNewSale).toHaveBeenCalledOnce();
  });

  it("case 2 (retry): no side effects run when count === 0", async () => {
    // Arrange — simulate a second webhook delivery where order is already PAID
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });

    // Act
    await fulfillOrder("order_1", "pi_1");

    // Assert: bail out immediately after the atomic claim
    expect(mockUpdateMany).toHaveBeenCalledOnce();
    expect(mockOrderFindUnique).not.toHaveBeenCalled();
    expect(mockSendPurchaseConfirmation).not.toHaveBeenCalled();
    expect(mockRecordStreakActivity).not.toHaveBeenCalled();
    expect(mockCompleteReferral).not.toHaveBeenCalled();
    expect(mockSendNewSaleEmail).not.toHaveBeenCalled();
    expect(mockNotifyNewSale).not.toHaveBeenCalled();
  });
});
