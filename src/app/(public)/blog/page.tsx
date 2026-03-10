"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   ARTICLE DATA
   ═══════════════════════════════════════════════════════════════ */

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

const CATEGORIES = ["Tous", "Sportifs", "Photographes", "Organisateurs", "IA & Tech", "Conseils"];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered =
    activeCategory === "Tous"
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((a) => a.category === activeCategory);

  /* Scroll reveal for cards */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            if (!isNaN(idx)) {
              setVisibleCards((prev) => new Set(prev).add(idx));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-blog-card]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-16">
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white mb-6 animate-fade-in">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
              Blog Focus Racer
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 animate-fade-in animation-delay-100">
              Le Blog Focus Racer
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              Conseils, guides et actualités pour les sportifs, photographes et organisateurs d'événements.
            </p>
          </div>
        </section>

        {/* ═══════════ CATEGORY FILTER ═══════════ */}
        <section className="py-8 bg-gray-50 border-b border-gray-200 sticky top-16 z-30 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-emerald text-white shadow-emerald"
                      : "bg-gray-100 text-gray-600 hover:bg-emerald-400/10 hover:text-emerald"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ ARTICLE GRID ═══════════ */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">Aucun article dans cette catégorie pour le moment.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filtered.map((article, i) => (
                    <Link
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      data-blog-card
                      data-idx={i}
                      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-500 flex flex-col ${
                        visibleCards.has(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      {/* Card header with gradient */}
                      <div className="h-48 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-emerald-700 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-[60px]" />
                        </div>
                        <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                          {article.icon}
                        </span>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/10">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span dangerouslySetInnerHTML={{ __html: article.date }} />
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {article.readTime} de lecture
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald transition-colors line-clamp-2">
                          <span dangerouslySetInnerHTML={{ __html: article.title }} />
                        </h2>

                        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">
                          <span dangerouslySetInnerHTML={{ __html: article.excerpt }} />
                        </p>

                        <div className="flex items-center gap-1 text-emerald font-semibold text-sm group-hover:gap-2 transition-all">
                          Lire l'article
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════ NEWSLETTER ═══════════ */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 md:p-12 border border-emerald-100 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Restez informé
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Recevez nos derniers articles, guides et actualités directement dans votre boîte mail. Pas de spam, promis.
                </p>

                {subscribed ? (
                  <div className="flex items-center justify-center gap-2 text-emerald font-medium py-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Merci ! Vous êtes inscrit à notre newsletter.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald hover:bg-emerald-dark text-white rounded-xl font-medium shadow-emerald transition-all duration-200 whitespace-nowrap"
                    >
                      S'inscrire
                    </button>
                  </form>
                )}

                <p className="text-xs text-gray-400 mt-4">
                  En vous inscrivant, vous acceptez notre{" "}
                  <Link href="/legal/confidentialite" className="underline hover:text-emerald">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ SEO CTA ═══════════ */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px]" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Prêt à découvrir Focus Racer ?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Rejoignez la plateforme qui révolutionne la photo sportive en France.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/explore"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg"
              >
                Trouver mes photos
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
