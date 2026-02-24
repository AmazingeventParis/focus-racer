import { BadgeDef } from "@/lib/badges";

export const ORGANIZER_BADGE_DEFINITIONS: BadgeDef[] = [
  {
    key: "first_departure",
    emoji: "🏁",
    labelFr: "Premier Départ",
    descriptionFr: "Premier événement publié",
    color: "#F59E0B",
    colorLight: "#FEF3C7",
  },
  {
    key: "peloton",
    emoji: "👥",
    labelFr: "Peloton",
    descriptionFr: "500 sportifs inscrits au total",
    color: "#3B82F6",
    colorLight: "#DBEAFE",
  },
  {
    key: "serial_organizer",
    emoji: "🎪",
    labelFr: "Organisateur Série",
    descriptionFr: "5 événements organisés",
    color: "#8B5CF6",
    colorLight: "#EDE9FE",
  },
  {
    key: "full_gallery",
    emoji: "📸",
    labelFr: "Galerie Complète",
    descriptionFr: "100% des dossards ont au moins 1 photo",
    color: "#10B981",
    colorLight: "#D1FAE5",
  },
  {
    key: "data_fan",
    emoji: "📊",
    labelFr: "Fan de Data",
    descriptionFr: "Consulter les analytics de 10 événements",
    color: "#06B6D4",
    colorLight: "#CFFAFE",
  },
  {
    key: "pro_importer",
    emoji: "📥",
    labelFr: "Importateur Pro",
    descriptionFr: "Importer une start-list (Njuko, KMS, CSV)",
    color: "#F97316",
    colorLight: "#FFF7ED",
  },
  {
    key: "godfather",
    emoji: "🤝",
    labelFr: "Parrain",
    descriptionFr: "3 photographes accrédités via la marketplace",
    color: "#EC4899",
    colorLight: "#FCE7F3",
  },
  {
    key: "multi_discipline",
    emoji: "🎯",
    labelFr: "Multi-Discipline",
    descriptionFr: "Événements dans 3 sports différents",
    color: "#EAB308",
    colorLight: "#FEF9C3",
  },
  {
    key: "branding_king",
    emoji: "👑",
    labelFr: "Roi du Branding",
    descriptionFr: "Logo + affiche + couleur personnalisée sur un événement",
    color: "#A855F7",
    colorLight: "#F3E8FF",
  },
  {
    key: "veteran",
    emoji: "🏛",
    labelFr: "Vétéran",
    descriptionFr: "Événements organisés sur 2 années consécutives",
    color: "#EF4444",
    colorLight: "#FEE2E2",
  },
];

export const ORGANIZER_BADGE_MAP = new Map(
  ORGANIZER_BADGE_DEFINITIONS.map((b) => [b.key, b])
);

export interface OrganizerBadgeEvalData {
  publishedEvents: number;
  totalStartListEntries: number;
  totalEvents: number;
  hasFullCoverage: boolean;
  distinctSportTypes: number;
  hasStartListImport: boolean;
  accreditedPhotographers: number;
  hasBranding: boolean;
  activeYears: number[];
}

export function evaluateOrganizerBadges(data: OrganizerBadgeEvalData): string[] {
  const earned: string[] = [];

  if (data.publishedEvents >= 1) earned.push("first_departure");
  if (data.totalStartListEntries >= 500) earned.push("peloton");
  if (data.totalEvents >= 5) earned.push("serial_organizer");
  if (data.hasFullCoverage) earned.push("full_gallery");
  // data_fan: simplifié — on l'accorde si l'organisateur a >=10 événements (proxy analytics)
  if (data.totalEvents >= 10) earned.push("data_fan");
  if (data.hasStartListImport) earned.push("pro_importer");
  if (data.accreditedPhotographers >= 3) earned.push("godfather");
  if (data.distinctSportTypes >= 3) earned.push("multi_discipline");
  if (data.hasBranding) earned.push("branding_king");

  // Vétéran: 2 années consécutives
  const sorted = [...data.activeYears].sort();
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === 1) {
      earned.push("veteran");
      break;
    }
  }

  return earned;
}
