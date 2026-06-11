import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export interface TransferPayoutParams {
  orderId: string;
  photographerStripeAccountId: string;
  /** Amount in cents to transfer */
  transferAmountCents: number;
  /** Photographer's net payout in euros — written into the TRANSFERRED DB row */
  photographerPayout: number;
  /** Stripe fee in euros — written into the TRANSFERRED DB row when provided */
  stripeFee?: number;
  /** source_transaction on the Stripe transfer (optional — from the charge ID) */
  chargeId?: string | null;
}

export type TransferPayoutResult =
  | { status: "transferred"; transferId: string }
  | { status: "already_transferred" };

/**
 * Idempotent Stripe Connect payout: claim-then-transfer.
 *
 * Two-layer protection against double payment:
 *  1. `stripeTransferId IS NULL` DB guard — atomic claim that short-circuits any
 *     retry whose first attempt already completed (guard returns count=0 → skip).
 *  2. Deterministic Stripe idempotency key `payout_<orderId>` — within the 24-h
 *     window, concurrent deliveries of the same webhook hit Stripe only once.
 *
 * Throws on Stripe / DB error so callers can catch and update `payoutStatus` to
 * PENDING for the retry-payouts cron to pick up.
 */
export async function transferPhotographerPayout(
  params: TransferPayoutParams
): Promise<TransferPayoutResult> {
  const {
    orderId,
    photographerStripeAccountId,
    transferAmountCents,
    photographerPayout,
    stripeFee,
    chargeId,
  } = params;

  // Atomic guard: if stripeTransferId is already set, a previous delivery
  // already transferred — return count=0 and skip to avoid double payment.
  const claim = await prisma.order.updateMany({
    where: { id: orderId, stripeTransferId: null },
    data: { payoutStatus: "PENDING" },
  });

  if (claim.count === 0) {
    return { status: "already_transferred" };
  }

  // Stripe idempotency key: deterministic per order, prevents a second real
  // charge within the 24-h Stripe idempotency window.
  const stripeClient = getStripe();
  const transfer = await stripeClient.transfers.create(
    {
      amount: transferAmountCents,
      currency: "eur",
      destination: photographerStripeAccountId,
      source_transaction: chargeId ?? undefined,
      metadata: { orderId, type: "photo_sale_payout" },
    },
    { idempotencyKey: `payout_${orderId}` }
  );

  await prisma.order.updateMany({
    where: { id: orderId },
    data: {
      payoutStatus: "TRANSFERRED",
      transferredAt: new Date(),
      stripeTransferId: transfer.id,
      photographerPayout,
      ...(stripeFee !== undefined ? { stripeFee } : {}),
    },
  });

  return { status: "transferred", transferId: transfer.id };
}
