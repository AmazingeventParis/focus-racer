import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock must be declared before imports that use it (hoisted by Vitest).
vi.mock("@/lib/prisma", () => ({
  default: {
    $transaction: vi.fn(),
  },
}));

import prisma from "@/lib/prisma";
import { deductUploadCredits } from "../credits";

const BASE_PARAMS = {
  userId: "user-123",
  totalCredits: 3,
  planLabel: "Standard",
  nbPhotos: 3,
  creditsPerPhoto: 1,
  eventName: "Marathon Paris 2026",
  eventId: "event-abc",
};

describe("deductUploadCredits", () => {
  let mockUpdateMany: ReturnType<typeof vi.fn>;
  let mockFindUnique: ReturnType<typeof vi.fn>;
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateMany = vi.fn();
    mockFindUnique = vi.fn();
    mockCreate = vi.fn().mockResolvedValue({});

    // Simulate $transaction by calling the callback with a fake tx object.
    // Cast via unknown to bypass Prisma's strict interactive-transaction overload.
    (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          user: {
            updateMany: mockUpdateMany,
            findUnique: mockFindUnique,
          },
          creditTransaction: {
            create: mockCreate,
          },
        };
        return fn(tx);
      }
    );
  });

  it("returns null (insufficient) when updateMany resolves count=0, and does not create a CreditTransaction", async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 });

    const result = await deductUploadCredits(BASE_PARAMS);

    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns { balanceAfter } and records correct balanceBefore/balanceAfter when count=1", async () => {
    // After decrement, user has 5 credits left; cost was 3, so balanceBefore = 8.
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockFindUnique.mockResolvedValue({ credits: 5 });

    const result = await deductUploadCredits({ ...BASE_PARAMS, totalCredits: 3 });

    expect(result).toEqual({ balanceAfter: 5 });

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-123",
        type: "DEDUCTION",
        amount: 3,
        balanceBefore: 8, // 5 + 3
        balanceAfter: 5,
      }),
    });
  });

  it("uses the exact reason string from the route (planLabel, nbPhotos, creditsPerPhoto, eventName)", async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockFindUnique.mockResolvedValue({ credits: 12 });

    await deductUploadCredits({
      userId: "u1",
      totalCredits: 5,
      planLabel: "Standard",
      nbPhotos: 5,
      creditsPerPhoto: 1,
      eventName: "Trail des Crêtes",
      eventId: "ev-1",
    });

    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.data.reason).toBe(
      "Import Standard de 5 photos (1 cr/photo) - Trail des Crêtes"
    );
  });

  it("reason string uses singular 'photo' when nbPhotos=1", async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockFindUnique.mockResolvedValue({ credits: 9 });

    await deductUploadCredits({
      ...BASE_PARAMS,
      totalCredits: 1,
      nbPhotos: 1,
    });

    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.data.reason).toBe(
      "Import Standard de 1 photo (1 cr/photo) - Marathon Paris 2026"
    );
  });

  it("updateMany is called with guard gte:totalCredits and decrement", async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockFindUnique.mockResolvedValue({ credits: 0 });

    await deductUploadCredits({ ...BASE_PARAMS, totalCredits: 10 });

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "user-123", credits: { gte: 10 } },
      data: { credits: { decrement: 10 } },
    });
  });

  it("propagates unexpected errors from the transaction", async () => {
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error("DB connection lost"));

    await expect(deductUploadCredits(BASE_PARAMS)).rejects.toThrow("DB connection lost");
  });
});
