import prisma from "./prisma";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateSportifId(): string {
  let id = "FR-";
  for (let i = 0; i < 6; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

export async function ensureSportifId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sportifId: true },
  });

  if (user?.sportifId) return user.sportifId;

  // Generate unique sportifId with retry
  for (let attempt = 0; attempt < 10; attempt++) {
    const sportifId = generateSportifId();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { sportifId },
        select: { sportifId: true },
      });
      return updated.sportifId!;
    } catch {
      // Unique constraint violation — retry
      continue;
    }
  }

  throw new Error("Impossible de générer un ID sportif unique");
}
