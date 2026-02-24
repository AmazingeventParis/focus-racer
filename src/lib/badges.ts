export interface BadgeDef {
  key: string;
  labelFr: string;
  descriptionFr: string;
  emoji: string;
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    key: "first_purchase",
    emoji: "\u{1F3C5}",
    labelFr: "Premier achat",
    descriptionFr: "Première commande payée sur Focus Racer",
  },
  {
    key: "collector_50",
    emoji: "\u{1F4F8}",
    labelFr: "Collectionneur",
    descriptionFr: "50 photos achetées",
  },
  {
    key: "collector_100",
    emoji: "\u{1F3C6}",
    labelFr: "Passionné",
    descriptionFr: "100 photos achetées",
  },
  {
    key: "multi_sport",
    emoji: "\u{1F3AF}",
    labelFr: "Multi-sport",
    descriptionFr: "3 disciplines sportives différentes",
  },
  {
    key: "loyal_5",
    emoji: "⭐",
    labelFr: "Fidèle",
    descriptionFr: "5 événements suivis",
  },
  {
    key: "explorer_10",
    emoji: "\u{1F9ED}",
    labelFr: "Explorateur",
    descriptionFr: "10 événements suivis",
  },
  {
    key: "social_3",
    emoji: "\u{1F91D}",
    labelFr: "Social",
    descriptionFr: "3 membres dans la Horde",
  },
  {
    key: "leader_10",
    emoji: "\u{1F451}",
    labelFr: "Leader",
    descriptionFr: "10 membres dans la Horde",
  },
  {
    key: "patron_100",
    emoji: "\u{1F48E}",
    labelFr: "Mécène",
    descriptionFr: "100€ dépensés au total",
  },
  {
    key: "pioneer",
    emoji: "\u{1F680}",
    labelFr: "Pionnier",
    descriptionFr: "Compte créé en 2026",
  },
];

export const BADGE_MAP = new Map(BADGE_DEFINITIONS.map((b) => [b.key, b]));

export interface BadgeEvalData {
  orderCount: number;
  photosCount: number;
  favoritesCount: number;
  distinctSportTypes: number;
  hordeSize: number;
  totalSpent: number;
  createdAt: Date;
}

export function evaluateBadges(data: BadgeEvalData): string[] {
  const earned: string[] = [];

  if (data.orderCount >= 1) earned.push("first_purchase");
  if (data.photosCount >= 50) earned.push("collector_50");
  if (data.photosCount >= 100) earned.push("collector_100");
  if (data.distinctSportTypes >= 3) earned.push("multi_sport");
  if (data.favoritesCount >= 5) earned.push("loyal_5");
  if (data.favoritesCount >= 10) earned.push("explorer_10");
  if (data.hordeSize >= 3) earned.push("social_3");
  if (data.hordeSize >= 10) earned.push("leader_10");
  if (data.totalSpent >= 100) earned.push("patron_100");
  if (data.createdAt.getFullYear() === 2026) earned.push("pioneer");

  return earned;
}
