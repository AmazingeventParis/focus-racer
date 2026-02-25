import prisma from "@/lib/prisma";
import { grantXp } from "./xp-service";

const REFERRER_CREDITS = 50;
const REFEREE_CREDITS = 25;

/**
 * Get referral code for a user. Uses sportifId for runners, generates one for pros.
 */
export async function getReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, sportifId: true, role: true },
  });

  if (!user) throw new Error("Utilisateur introuvable");

  // If already has a code, return it
  if (user.referralCode) return user.referralCode;

  // For runners, use sportifId
  if (user.role === "RUNNER" && user.sportifId) {
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: user.sportifId },
    });
    return user.sportifId;
  }

  // Generate code for pros
  const code = `FR-${generateCode(6)}`;
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });
  return code;
}

/**
 * Track a new referral after registration.
 */
export async function trackReferral(referralCode: string, refereeId: string): Promise<boolean> {
  // Find referrer by code
  const referrer = await prisma.user.findFirst({
    where: {
      OR: [
        { referralCode: referralCode },
        { sportifId: referralCode },
      ],
    },
    select: { id: true },
  });

  if (!referrer || referrer.id === refereeId) return false;

  // Check if referral already exists
  const existing = await prisma.referral.findFirst({
    where: { refereeId },
  });
  if (existing) return false;

  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId,
      referralCode,
      status: "PENDING",
    },
  });

  return true;
}

/**
 * Complete a referral when the referee performs the qualifying action.
 */
export async function completeReferral(
  refereeId: string,
  completedAction: string
): Promise<boolean> {
  const referral = await prisma.referral.findFirst({
    where: { refereeId, status: "PENDING" },
  });

  if (!referral) return false;

  // Grant credits to both
  await prisma.$transaction([
    prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "COMPLETED",
        completedAction,
        completedAt: new Date(),
        referrerReward: REFERRER_CREDITS,
        refereeReward: REFEREE_CREDITS,
      },
    }),
    // Referrer credits
    prisma.user.update({
      where: { id: referral.referrerId },
      data: { credits: { increment: REFERRER_CREDITS } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: referral.referrerId,
        type: "ADMIN_GRANT",
        amount: REFERRER_CREDITS,
        balanceBefore: 0, // Will be approximate
        balanceAfter: 0,
        reason: `Parrainage réussi (+${REFERRER_CREDITS} crédits)`,
      },
    }),
    // Referee credits
    prisma.user.update({
      where: { id: refereeId },
      data: { credits: { increment: REFEREE_CREDITS } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: refereeId,
        type: "ADMIN_GRANT",
        amount: REFEREE_CREDITS,
        balanceBefore: 0,
        balanceAfter: 0,
        reason: `Bonus parrainage bienvenue (+${REFEREE_CREDITS} crédits)`,
      },
    }),
  ]);

  // Grant XP to referrer
  await grantXp(referral.referrerId, "REFERRAL_COMPLETED", {
    refereeId,
    action: completedAction,
  });

  // Smart alert for referrer
  await prisma.smartAlert.create({
    data: {
      userId: referral.referrerId,
      alertType: "REFERRAL_COMPLETED",
      title: "Parrainage réussi !",
      message: `Votre filleul a complété son inscription. Vous recevez ${REFERRER_CREDITS} crédits.`,
      metadata: JSON.stringify({ refereeId, credits: REFERRER_CREDITS }),
    },
  });

  return true;
}

/**
 * Get referral stats for a user.
 */
export async function getReferralStats(userId: string) {
  const [sent, completed, totalCredits] = await Promise.all([
    prisma.referral.count({ where: { referrerId: userId } }),
    prisma.referral.count({ where: { referrerId: userId, status: "COMPLETED" } }),
    prisma.referral.aggregate({
      where: { referrerId: userId, status: "COMPLETED" },
      _sum: { referrerReward: true },
    }),
  ]);

  return {
    sent,
    pending: sent - completed,
    completed,
    totalCreditsEarned: totalCredits._sum.referrerReward ?? 0,
  };
}

function generateCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
