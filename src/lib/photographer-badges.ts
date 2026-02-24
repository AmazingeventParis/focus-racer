import { BadgeDef } from "@/lib/badges";

export const PHOTOGRAPHER_BADGE_DEFINITIONS: BadgeDef[] = [
  {
    key: "first_shoot",
    emoji: "📷",
    labelFr: "Premier Shoot",
    descriptionFr: "Premier événement avec photos uploadées",
    color: "#F59E0B",
    colorLight: "#FEF3C7",
  },
  {
    key: "eagle_eye",
    emoji: "👁",
    labelFr: "Œil de Lynx",
    descriptionFr: "95%+ de dossards détectés sur un événement",
    color: "#0EA5E9",
    colorLight: "#E0F2FE",
  },
  {
    key: "marathon_image",
    emoji: "🏃",
    labelFr: "Marathonien de l'Image",
    descriptionFr: "1 000 photos uploadées au total",
    color: "#8B5CF6",
    colorLight: "#EDE9FE",
  },
  {
    key: "golden_photographer",
    emoji: "🏆",
    labelFr: "Photographe d'Or",
    descriptionFr: "10 000 photos uploadées au total",
    color: "#F59E0B",
    colorLight: "#FEF3C7",
  },
  {
    key: "best_seller",
    emoji: "🛒",
    labelFr: "Best-Seller",
    descriptionFr: "100 photos vendues au total",
    color: "#10B981",
    colorLight: "#D1FAE5",
  },
  {
    key: "cash_machine",
    emoji: "💰",
    labelFr: "Machine à Cash",
    descriptionFr: "1 000 € de revenus générés",
    color: "#059669",
    colorLight: "#D1FAE5",
  },
  {
    key: "multi_terrain",
    emoji: "🎯",
    labelFr: "Multi-Terrain",
    descriptionFr: "5 disciplines sportives couvertes",
    color: "#EC4899",
    colorLight: "#FCE7F3",
  },
  {
    key: "faithful",
    emoji: "⭐",
    labelFr: "Fidèle au Poste",
    descriptionFr: "10 événements couverts",
    color: "#6366F1",
    colorLight: "#E0E7FF",
  },
  {
    key: "stripe_connected",
    emoji: "💳",
    labelFr: "Connecté Stripe",
    descriptionFr: "Compte Stripe Connect activé",
    color: "#7C3AED",
    colorLight: "#EDE9FE",
  },
  {
    key: "zero_waste",
    emoji: "✨",
    labelFr: "Zéro Déchet",
    descriptionFr: "0% de photos floues sur un événement (min 100 photos)",
    color: "#14B8A6",
    colorLight: "#CCFBF1",
  },
];

export const PHOTOGRAPHER_BADGE_MAP = new Map(
  PHOTOGRAPHER_BADGE_DEFINITIONS.map((b) => [b.key, b])
);

export interface PhotographerBadgeEvalData {
  eventsWithPhotos: number;
  totalPhotos: number;
  totalPhotosSold: number;
  totalRevenue: number;
  distinctSportTypes: number;
  stripeOnboarded: boolean;
  bestOcrRate: number;       // meilleur taux OCR sur un événement (0-100)
  bestCleanRate: number;     // meilleur taux non-flou sur un événement (0-100), min 100 photos
}

export function evaluatePhotographerBadges(data: PhotographerBadgeEvalData): string[] {
  const earned: string[] = [];

  if (data.eventsWithPhotos >= 1) earned.push("first_shoot");
  if (data.bestOcrRate >= 95) earned.push("eagle_eye");
  if (data.totalPhotos >= 1000) earned.push("marathon_image");
  if (data.totalPhotos >= 10000) earned.push("golden_photographer");
  if (data.totalPhotosSold >= 100) earned.push("best_seller");
  if (data.totalRevenue >= 1000) earned.push("cash_machine");
  if (data.distinctSportTypes >= 5) earned.push("multi_terrain");
  if (data.eventsWithPhotos >= 10) earned.push("faithful");
  if (data.stripeOnboarded) earned.push("stripe_connected");
  if (data.bestCleanRate >= 100) earned.push("zero_waste");

  return earned;
}
