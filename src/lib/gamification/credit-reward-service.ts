import prisma from "@/lib/prisma";

export interface RewardDef {
  actionKey: string;
  labelFr: string;
  credits: number;
  roles: string[]; // "ALL" or specific roles
  autoClaim: boolean;
}

export const CREDIT_REWARDS: RewardDef[] = [
  { actionKey: "profile_complete", labelFr: "Profil complété", credits: 10, roles: ["ALL"], autoClaim: true },
  { actionKey: "first_reaction", labelFr: "Première réaction", credits: 5, roles: ["RUNNER"], autoClaim: true },
  { actionKey: "first_review", labelFr: "Premier avis marketplace", credits: 5, roles: ["RUNNER"], autoClaim: true },
  { actionKey: "bug_report", labelFr: "Bug signalé (validé)", credits: 20, roles: ["ALL"], autoClaim: false },
  { actionKey: "first_event", labelFr: "Premier événement publié", credits: 10, roles: ["PHOTOGRAPHER", "ORGANIZER"], autoClaim: true },
];

/**
 * Claim a credit reward. Returns credits granted or null if already claimed.
 */
export async function claimCreditReward(
  userId: string,
  actionKey: string
): Promise<{ credits: number } | null> {
  const def = CREDIT_REWARDS.find((r) => r.actionKey === actionKey);
  if (!def) return null;

  // Check if already claimed
  const existing = await prisma.creditReward.findUnique({
    where: { userId_actionKey: { userId, actionKey } },
  });
  if (existing) return null;

  // Claim
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  if (!user) return null;

  await prisma.$transaction([
    prisma.creditReward.create({
      data: { userId, actionKey, credits: def.credits },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: def.credits } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type: "ADMIN_GRANT",
        amount: def.credits,
        balanceBefore: user.credits,
        balanceAfter: user.credits + def.credits,
        reason: `Récompense : ${def.labelFr}`,
      },
    }),
  ]);

  return { credits: def.credits };
}

/**
 * Get all rewards with claim status for a user.
 */
export async function getUserRewards(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return [];

  const claimed = await prisma.creditReward.findMany({
    where: { userId },
    select: { actionKey: true, claimedAt: true },
  });

  const claimedMap = new Map(claimed.map((c) => [c.actionKey, c.claimedAt]));

  return CREDIT_REWARDS.filter(
    (r) => r.roles.includes("ALL") || r.roles.includes(user.role)
  ).map((r) => ({
    ...r,
    claimed: claimedMap.has(r.actionKey),
    claimedAt: claimedMap.get(r.actionKey) ?? null,
  }));
}
