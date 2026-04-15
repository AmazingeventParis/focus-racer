import prisma from "@/lib/prisma";
import { grantXp } from "./xp-service";

const REFERRER_CREDITS = 100;
const REFEREE_CREDITS = 100;

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

  // Create referral and immediately complete it (registration = validation)
  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId,
      referralCode,
      status: "COMPLETED",
      completedAction: "registration",
      completedAt: new Date(),
    },
  });

  // Complete the referral rewards
  await completeReferralRewards(referrer.id, refereeId);

  return true;
}

/**
 * Complete referral rewards based on the referrer's role.
 * - Sportifs: badge "Ambassadeur" + 100 XP (no credits)
 * - Pros: 50 credits referrer + 25 credits referee + 100 XP
 */
async function completeReferralRewards(
  referrerId: string,
  refereeId: string
): Promise<void> {
  const referrer = await prisma.user.findUnique({
    where: { id: referrerId },
    select: { role: true, credits: true },
  });

  if (!referrer) return;

  const isRunner = referrer.role === "RUNNER";

  if (isRunner) {
    // Sportif referrer: badge + XP only (no credits)
    // Badge "ambassadeur" will be auto-evaluated by the badges API
    // Just grant XP
    await grantXp(referrerId, "REFERRAL_COMPLETED", {
      refereeId,
      action: "registration",
    });

    // Smart alert
    await prisma.smartAlert.create({
      data: {
        userId: referrerId,
        alertType: "REFERRAL_COMPLETED",
        title: "Parrainage réussi !",
        message: "Votre filleul s'est inscrit. Vous avez débloqué le badge Ambassadeur et gagné 100 XP !",
        metadata: JSON.stringify({ refereeId, reward: "badge_ambassadeur" }),
      },
    });
  } else {
    // Pro referrer: credits + XP
    const referee = await prisma.user.findUnique({
      where: { id: refereeId },
      select: { credits: true },
    });
    const referrerBalance = referrer.credits ?? 0;
    const refereeBalance = referee?.credits ?? 0;

    await prisma.$transaction([
      // Update referral rewards
      prisma.referral.updateMany({
        where: { referrerId, refereeId, status: "COMPLETED" },
        data: {
          referrerReward: REFERRER_CREDITS,
          refereeReward: REFEREE_CREDITS,
        },
      }),
      // Referrer credits
      prisma.user.update({
        where: { id: referrerId },
        data: { credits: { increment: REFERRER_CREDITS } },
      }),
      prisma.creditTransaction.create({
        data: {
          userId: referrerId,
          type: "ADMIN_GRANT",
          amount: REFERRER_CREDITS,
          balanceBefore: referrerBalance,
          balanceAfter: referrerBalance + REFERRER_CREDITS,
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
          balanceBefore: refereeBalance,
          balanceAfter: refereeBalance + REFEREE_CREDITS,
          reason: `Bonus parrainage bienvenue (+${REFEREE_CREDITS} crédits)`,
        },
      }),
    ]);

    // XP for referrer
    await grantXp(referrerId, "REFERRAL_COMPLETED", {
      refereeId,
      action: "registration",
    });

    // Smart alert
    await prisma.smartAlert.create({
      data: {
        userId: referrerId,
        alertType: "REFERRAL_COMPLETED",
        title: "Parrainage réussi !",
        message: `Votre filleul s'est inscrit. Vous recevez ${REFERRER_CREDITS} crédits.`,
        metadata: JSON.stringify({ refereeId, credits: REFERRER_CREDITS }),
      },
    });
  }
}

/**
 * Legacy: complete referral for pro users (called from Stripe webhook).
 * Now only used for pro referrers whose referrals were created before the auto-complete change.
 */
export async function completeReferral(
  refereeId: string,
  completedAction: string
): Promise<boolean> {
  const referral = await prisma.referral.findFirst({
    where: { refereeId, status: "PENDING" },
  });

  if (!referral) return false;

  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: "COMPLETED",
      completedAction,
      completedAt: new Date(),
    },
  });

  await completeReferralRewards(referral.referrerId, refereeId);

  return true;
}

/**
 * Get referral stats for a user.
 */
export async function getReferralStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

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
    isRunner: user?.role === "RUNNER",
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
