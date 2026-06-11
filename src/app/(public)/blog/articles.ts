export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  icon: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "comment-retrouver-photos-course",
    title: "Comment retrouver ses photos de course : le guide complet",
    excerpt:
      "Dossard, selfie ou nom : découvrez les 3 méthodes pour retrouver vos photos d'événement sportif grâce à l'intelligence artificielle.",
    category: "Sportifs",
    readTime: "6 min",
    date: "18 février 2026",
    icon: "🏃",
  },
  {
    slug: "golden-time-vente-photo-sportive",
    title: "Le Golden Time : pourquoi les 24 premières heures décident de vos ventes",
    excerpt:
      "70 % des ventes de photos sportives se font dans les 24 h suivant la course. Découvrez comment capitaliser sur cette fenêtre d'opportunité unique.",
    category: "Photographes",
    readTime: "7 min",
    date: "14 février 2026",
    icon: "📸",
  },
  {
    slug: "ia-tri-automatique-photo-sport",
    title: "Comment l'IA révolutionne le tri des photos sportives en 2026",
    excerpt:
      "OCR de dossards, reconnaissance faciale, filtrage qualité : plongez dans le pipeline d'intelligence artificielle qui trie 10 000 photos en 5 minutes.",
    category: "IA & Tech",
    readTime: "8 min",
    date: "10 février 2026",
    icon: "🤖",
  },
  {
    slug: "organiser-couverture-photo-evenement",
    title: "Guide : organiser la couverture photo de votre événement sportif",
    excerpt:
      "Du choix des photographes au workflow de livraison, tout ce qu'un organisateur doit savoir pour offrir une expérience photo irréprochable.",
    category: "Organisateurs",
    readTime: "9 min",
    date: "5 février 2026",
    icon: "🏆",
  },
  {
    slug: "photographe-sport-revenus-2026",
    title: "Photographe sportif : comment maximiser ses revenus en 2026",
    excerpt:
      "Marché, commissions, stratégies de vente, upselling et partage social : le guide ultime pour vivre de la photo sportive cette année.",
    category: "Conseils",
    readTime: "7 min",
    date: "1er février 2026",
    icon: "💰",
  },
];
