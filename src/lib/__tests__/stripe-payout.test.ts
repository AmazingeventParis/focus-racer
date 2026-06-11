import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    order: {
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { transferPhotographerPayout } from "../stripe-payout";

const BASE_PARAMS = {
  orderId: "order-abc",
  photographerStripeAccountId: "acct_xyz",
  transferAmountCents: 1446,
  photographerPayout: 14.46,
  stripeFee: 0.54,
  chargeId: "ch_test",
};

describe("transferPhotographerPayout", () => {
  let mockTransferCreate: ReturnType<typeof vi.fn>;
  let mockUpdateMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTransferCreate = vi.fn().mockResolvedValue({ id: "tr_idempotent" });
    vi.mocked(getStripe).mockReturnValue({
      transfers: { create: mockTransferCreate },
    } as unknown as ReturnType<typeof getStripe>);

    mockUpdateMany = vi.mocked(prisma.order.updateMany);
  });

  it("first delivery — guard returns count=1, calls transfers.create with deterministic idempotencyKey", async () => {
    // Guard resolves count=1, TRANSFERRED update also resolves count=1
    mockUpdateMany
      .mockResolvedValueOnce({ count: 1 }) // guard
      .mockResolvedValueOnce({ count: 1 }); // TRANSFERRED update

    const result = await transferPhotographerPayout(BASE_PARAMS);

    expect(result).toEqual({ status: "transferred", transferId: "tr_idempotent" });

    // Guard must precede transfers.create
    expect(mockUpdateMany).toHaveBeenNthCalledWith(1, {
      where: { id: "order-abc", stripeTransferId: null },
      data: { payoutStatus: "PENDING" },
    });

    // transfers.create receives the deterministic idempotency key
    expect(mockTransferCreate).toHaveBeenCalledOnce();
    expect(mockTransferCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1446,
        currency: "eur",
        destination: "acct_xyz",
        source_transaction: "ch_test",
        metadata: { orderId: "order-abc", type: "photo_sale_payout" },
      }),
      { idempotencyKey: "payout_order-abc" }
    );

    // TRANSFERRED update includes financial fields
    expect(mockUpdateMany).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        where: { id: "order-abc" },
        data: expect.objectContaining({
          payoutStatus: "TRANSFERRED",
          stripeTransferId: "tr_idempotent",
          photographerPayout: 14.46,
          stripeFee: 0.54,
        }),
      })
    );
  });

  it("retry — guard returns count=0 (already transferred), skips transfers.create entirely", async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });

    const result = await transferPhotographerPayout(BASE_PARAMS);

    expect(result).toEqual({ status: "already_transferred" });

    // Guard ran once
    expect(mockUpdateMany).toHaveBeenCalledOnce();
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "order-abc", stripeTransferId: null },
      data: { payoutStatus: "PENDING" },
    });

    // transfers.create must NOT have been called
    expect(mockTransferCreate).not.toHaveBeenCalled();
  });

  it("stripe error — throws so caller can set payoutStatus PENDING", async () => {
    mockUpdateMany.mockResolvedValueOnce({ count: 1 }); // guard succeeds
    mockTransferCreate.mockRejectedValue(new Error("Stripe error"));

    await expect(transferPhotographerPayout(BASE_PARAMS)).rejects.toThrow("Stripe error");

    // Guard ran
    expect(mockUpdateMany).toHaveBeenCalledOnce();
    // TRANSFERRED update must NOT have been called
    expect(mockUpdateMany).toHaveBeenCalledTimes(1);
  });

  it("omits stripeFee from TRANSFERRED update when not provided", async () => {
    mockUpdateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });

    await transferPhotographerPayout({
      orderId: "order-no-fee",
      photographerStripeAccountId: "acct_xyz",
      transferAmountCents: 1500,
      photographerPayout: 15,
      // stripeFee intentionally omitted
    });

    const transferredCall = mockUpdateMany.mock.calls[1][0];
    expect(transferredCall.data).not.toHaveProperty("stripeFee");
  });
});
