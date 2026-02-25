export interface BadgeDef {
  key: string;
  labelFr: string;
  descriptionFr: string;
  emoji: string;
  color: string;
  colorLight: string;
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    key: "first_purchase",
    emoji: "\u{1F3C5}",
    labelFr: "Premier achat",
    descriptionFr: "Première commande payée sur Focus Racer",
    color: "#F59E0B",
    colorLight: "#FEF3C7",
  },
  {
    key: "collector_50",
    emoji: "\u{1F4F8}",
    labelFr: "Collectionneur",
    descriptionFr: "50 photos achetées",
    color: "#3B82F6",
    colorLight: "#DBEAFE",
  },
  {
    key: "collector_100",
    emoji: "\u{1F3C6}",
    labelFr: "Passionné",
    descriptionFr: "100 photos achetées",
    color: "#6366F1",
    colorLight: "#E0E7FF",
  },
  {
    key: "multi_sport",
    emoji: "\u{1F3AF}",
    labelFr: "Multi-sport",
    descriptionFr: "3 disciplines sportives différentes",
    color: "#10B981",
    colorLight: "#D1FAE5",
  },
  {
    key: "loyal_5",
    emoji: "⭐",
    labelFr: "Fidèle",
    descriptionFr: "5 événements suivis",
    color: "#06B6D4",
    colorLight: "#CFFAFE",
  },
  {
    key: "explorer_10",
    emoji: "\u{1F9ED}",
    labelFr: "Explorateur",
    descriptionFr: "10 événements suivis",
    color: "#F97316",
    colorLight: "#FFF7ED",
  },
  {
    key: "social_3",
    emoji: "\u{1F91D}",
    labelFr: "Social",
    descriptionFr: "3 amis ajoutés",
    color: "#EC4899",
    colorLight: "#FCE7F3",
  },
  {
    key: "leader_10",
    emoji: "\u{1F451}",
    labelFr: "Leader",
    descriptionFr: "10 amis ajoutés",
    color: "#EAB308",
    colorLight: "#FEF9C3",
  },
  {
    key: "patron_100",
    emoji: "\u{1F48E}",
    labelFr: "Mécène",
    descriptionFr: "100€ dépensés au total",
    color: "#A855F7",
    colorLight: "#F3E8FF",
  },
  {
    key: "pioneer",
    emoji: "\u{1F680}",
    labelFr: "Pionnier",
    descriptionFr: "Compte créé en 2026",
    color: "#EF4444",
    colorLight: "#FEE2E2",
  },
  {
    key: "ambassadeur",
    emoji: "\u{1F31F}",
    labelFr: "Ambassadeur",
    descriptionFr: "Parrainage réussi — exclusif",
    color: "#D946EF",
    colorLight: "#FAE8FF",
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
  completedReferrals: number;
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
  if (data.completedReferrals >= 1) earned.push("ambassadeur");

  return earned;
}
