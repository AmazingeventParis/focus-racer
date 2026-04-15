import { UserRole } from "@prisma/client";

export interface LevelDef {
  level: number;
  name: string;
  xpMin: number;
  frame: string;      // CSS class for frame color
  discount: number;    // Percentage discount (0-15)
  perks: string[];
}

// Sportifs — progression mythologie sportive (XP lent)
export const SPORTIF_LEVELS: LevelDef[] = [
  { level: 1, name: "Novice",      xpMin: 0,      frame: "none",    discount: 0,  perks: [] },
  { level: 2, name: "Gladiateur",  xpMin: 100,    frame: "bronze",  discount: 0,  perks: ["Titre de profil"] },
  { level: 3, name: "Centaure",    xpMin: 350,    frame: "bronze",  discount: 0,  perks: ["Titre de profil", "Cadre profil bronze"] },
  { level: 4, name: "Titan",       xpMin: 1000,   frame: "silver",  discount: 5,  perks: ["Cadre profil argent", "5% de réduction"] },
  { level: 5, name: "Olympien",    xpMin: 3000,   frame: "gold",    discount: 10, perks: ["Cadre profil or", "10% de réduction", "Support prioritaire"] },
  { level: 6, name: "Hercule",     xpMin: 8000,   frame: "gold",    discount: 12, perks: ["Cadre profil or", "12% de réduction", "Support prioritaire", "Accès anticipé"] },
  { level: 7, name: "Immortel",    xpMin: 20000,  frame: "diamond", discount: 15, perks: ["Cadre profil diamant", "15% de réduction", "Support prioritaire", "Accès anticipé"] },
];

// Pros (photographes, organisateurs, agences, clubs, fédérations) — progression métier photo (XP rapide)
export const PRO_LEVELS: LevelDef[] = [
  { level: 1, name: "Stagiaire",    xpMin: 0,      frame: "none",    discount: 0,  perks: [] },
  { level: 2, name: "Assistant",    xpMin: 500,    frame: "bronze",  discount: 0,  perks: ["Titre de profil"] },
  { level: 3, name: "Opérateur",   xpMin: 2000,   frame: "bronze",  discount: 0,  perks: ["Titre de profil", "Cadre profil bronze"] },
  { level: 4, name: "Chef Op",     xpMin: 8000,   frame: "silver",  discount: 5,  perks: ["Cadre profil argent", "5% de réduction crédits"] },
  { level: 5, name: "Réalisateur", xpMin: 25000,  frame: "gold",    discount: 10, perks: ["Cadre profil or", "10% de réduction crédits", "Support prioritaire"] },
  { level: 6, name: "Maître",      xpMin: 60000,  frame: "gold",    discount: 12, perks: ["Cadre profil or", "12% de réduction crédits", "Support prioritaire", "Accès anticipé"] },
  { level: 7, name: "Magnum",      xpMin: 150000, frame: "diamond", discount: 15, perks: ["Cadre profil diamant", "15% de réduction crédits", "Support prioritaire", "Accès anticipé"] },
];

/** Kept for backward compatibility — defaults to sportif */
export const LEVELS = SPORTIF_LEVELS;

function isProRole(role?: UserRole | string): boolean {
  return !!role && ["PHOTOGRAPHER", "ORGANIZER", "AGENCY", "CLUB", "FEDERATION"].includes(role);
}

export function getLevelsForRole(role?: UserRole | string): LevelDef[] {
  return isProRole(role) ? PRO_LEVELS : SPORTIF_LEVELS;
}

export function getLevelForXp(totalXp: number, role?: UserRole | string): LevelDef {
  const levels = getLevelsForRole(role);
  let currentLevel = levels[0];
  for (const level of levels) {
    if (totalXp >= level.xpMin) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

export function getNextLevel(currentLevel: number, role?: UserRole | string): LevelDef | null {
  const levels = getLevelsForRole(role);
  const idx = levels.findIndex((l) => l.level === currentLevel);
  if (idx < 0 || idx >= levels.length - 1) return null;
  return levels[idx + 1];
}

export function getXpProgress(totalXp: number, role?: UserRole | string): {
  level: LevelDef;
  nextLevel: LevelDef | null;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
} {
  const level = getLevelForXp(totalXp, role);
  const nextLevel = getNextLevel(level.level, role);

  if (!nextLevel) {
    return {
      level,
      nextLevel: null,
      currentLevelXp: totalXp - level.xpMin,
      xpToNextLevel: 0,
      progressPercent: 100,
    };
  }

  const xpInLevel = totalXp - level.xpMin;
  const xpNeeded = nextLevel.xpMin - level.xpMin;
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return {
    level,
    nextLevel,
    currentLevelXp: xpInLevel,
    xpToNextLevel: xpNeeded - xpInLevel,
    progressPercent,
  };
}
