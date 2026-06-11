import prisma from "@/lib/prisma";

export interface DeductUploadCreditsParams {
  userId: string;
  totalCredits: number;
  planLabel: string;
  nbPhotos: number;
  creditsPerPhoto: number;
  eventName: string;
  eventId: string;
}

/**
 * Atomically deducts upload credits using a conditional decrement.
 *
 * Uses `updateMany` with a `credits: { gte: totalCredits }` guard so the
 * decrement only applies when the balance is still sufficient.  This closes
 * the READ COMMITTED race where two concurrent uploads from the same
 * photographer could both pass the balance check and both write the same
 * absolute value back, effectively paying for only one deduction.
 *
 * Returns `{ balanceAfter }` on success, or `null` when credits are
 * insufficient (caller should return HTTP 402).
 */
export async function deductUploadCredits(
  params: DeductUploadCreditsParams
): Promise<{ balanceAfter: number } | null> {
  const { userId, totalCredits, planLabel, nbPhotos, creditsPerPhoto, eventName, eventId } =
    params;

  return prisma.$transaction(async (tx) => {
    // Atomic conditional decrement: only succeeds if balance still covers the cost.
    const deducted = await tx.user.updateMany({
      where: { id: userId, credits: { gte: totalCredits } },
      data: { credits: { decrement: totalCredits } },
    });

    if (deducted.count === 0) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    const balanceAfter = user!.credits;
    const balanceBefore = balanceAfter + totalCredits;

    await tx.creditTransaction.create({
      data: {
        userId,
        type: "DEDUCTION",
        amount: totalCredits,
        balanceBefore,
        balanceAfter,
        reason: `Import ${planLabel} de ${nbPhotos} photo${nbPhotos > 1 ? "s" : ""} (${creditsPerPhoto} cr/photo) - ${eventName}`,
        eventId,
      },
    });

    return { balanceAfter };
  }).catch((err: Error) => {
    if (err.message === "INSUFFICIENT_CREDITS") return null;
    throw err;
  });
}
