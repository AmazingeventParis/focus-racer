export interface LevelDef {
  level: number;
  name: string;
  xpMin: number;
  frame: string;      // CSS class for frame color
  discount: number;    // Percentage discount (0-15)
  perks: string[];
}

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    name: "Débutant",
    xpMin: 0,
    frame: "none",
    discount: 0,
    perks: [],
  },
  {
    level: 2,
    name: "Amateur",
    xpMin: 100,
    frame: "bronze",
    discount: 0,
    perks: ["Titre de profil"],
  },
  {
    level: 3,
    name: "Confirmé",
    xpMin: 500,
    frame: "bronze",
    discount: 0,
    perks: ["Titre de profil", "Cadre profil bronze"],
  },
  {
    level: 4,
    name: "Expert",
    xpMin: 1500,
    frame: "silver",
    discount: 5,
    perks: ["Cadre profil argent", "5% de réduction"],
  },
  {
    level: 5,
    name: "Élite",
    xpMin: 4000,
    frame: "gold",
    discount: 10,
    perks: ["Cadre profil or", "10% de réduction", "Support prioritaire"],
  },
  {
    level: 6,
    name: "Légende",
    xpMin: 10000,
    frame: "diamond",
    discount: 15,
    perks: ["Cadre profil diamant", "15% de réduction", "Accès anticipé"],
  },
];

export function getLevelForXp(totalXp: number): LevelDef {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (totalXp >= level.xpMin) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

export function getNextLevel(currentLevel: number): LevelDef | null {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  if (idx < 0 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function getXpProgress(totalXp: number): {
  level: LevelDef;
  nextLevel: LevelDef | null;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
} {
  const level = getLevelForXp(totalXp);
  const nextLevel = getNextLevel(level.level);

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
