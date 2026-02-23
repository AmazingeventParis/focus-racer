"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const benefits = [
  {
    icon: "📸",
    title: "Couverture photo clé en main",
    desc: "Accréditez des photographes professionnels via notre marketplace. Ils gèrent la couverture, vous récoltez les bénéfices.",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    icon: "🤖",
    title: "Tri automatique par IA",
    desc: "Les photos sont triées instantanément par dossard et visage. Chaque sportif retrouve ses photos en quelques secondes.",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: "🔗",
    title: "Connecteurs chronométrage",
    desc: "Import automatique des start-lists depuis Njuko, KMS, ou fichiers CSV. Synchronisation avec vos outils existants.",
    color: "from-purple-400 to-purple-600",
  },
  {
    icon: "🎨",
    title: "Branding événement",
    desc: "Logo, couleurs, watermark personnalisé. Vos galeries reflètent l'identité visuelle de votre événement.",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: "💰",
    title: "Revenus supplémentaires",
    desc: "Les ventes de photos génèrent des revenus additionnels pour votre événement. Sans investissement initial.",
    color: "from-pink-400 to-pink-600",
  },
  {
    icon: "📊",
    title: "Statistiques détaillées",
    desc: "Couverture photo par zone, taux de satisfaction, revenus par édition. Pilotez vos décisions avec la data.",
    color: "from-teal-400 to-teal-600",
  },
];

const connectors = [
  { name: "Njuko", desc: "Import start-lists automatique", icon: "⚡" },
  { name: "KMS", desc: "Synchronisation chronométrage", icon: "⏱️" },
  { name: "CSV", desc: "Import universel par fichier", icon: "📄" },
  { name: "API REST", desc: "Intégration sur mesure", icon: "🔌" },
];

const useCases = [
  {
    title: "Marathons & semi-marathons",
    desc: "10 000+ participants, couverture multi-points, résultats instantanés.",
    participants: "10K+",
    icon: "🏃",
  },
  {
    title: "Trails & ultra-trails",
    desc: "Parcours montagneux, conditions extrêmes. Notre IA s'adapte aux dossards sales ou froissés.",
    participants: "2K+",
    icon: "⛰️",
  },
  {
    title: "Triathlons & duathlons",
    desc: "Multi-disciplines, transitions. Reconnaissance faciale pour les photos sans dossard visible.",
    participants: "5K+",
    icon: "🏊",
  },
  {
    title: "Courses cyclistes",
    desc: "Haute vitesse, dossards dorsaux. Notre OCR gère les angles et la déformation.",
    participants: "1K+",
    icon: "🚴",
  },
];

const steps = [
  { num: "1", title: "Créez votre événement", desc: "Nom, date, lieu, parcours. Importez votre start-list automatiquement." },
  { num: "2", title: "Accréditez vos photographes", desc: "Invitez des photographes de notre marketplace ou vos propres photographes." },
  { num: "3", title: "L'IA trie en temps réel", desc: "Les photos sont triées par dossard dès l'upload. Mode Live disponible." },
  { num: "4", title: "Les sportifs achètent", desc: "Galerie en ligne, recherche instantanée, paiement sécurisé. Revenus directs." },
];

export default function SolutionsOrganisateursPage() {
  const [activeConnector, setActiveConnector] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Rotate connectors
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnector((prev) => (prev + 1) % connectors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.count || "0");
            const suffix = el.dataset.suffix || "";
            const duration = 2000;
            const start = performance.now();
            function animate(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(target * eased);
              el.textContent = current + suffix;
              if (progress < 1) requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const reveal = useCallback((id: string) => visibleSections.has(id), [visibleSections]);

  return (
    <main className="bg-white">
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-orange-400 rounded-full blur-[120px]" />
          </div>
          <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                  <span>🏆</span>
                  Pour les organisateurs d&apos;événements sportifs
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  La photo de votre événement,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    automatisée
                  </span>
                </h1>
                <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                  De l&apos;accréditation des photographes à la vente aux sportifs, Focus Racer
                  gère tout le processus. Générez des revenus sans effort supplémentaire.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register">
                    <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5">
                      Créer mon événement
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm">
                      Demander une démo
                    </button>
                  </Link>
                </div>
              </div>

              {/* Connector widget */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                  <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-medium">Intégrations & connecteurs</p>
                  <div className="space-y-3">
                    {connectors.map((conn, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                          activeConnector === i
                            ? "bg-emerald-500/20 border border-emerald-400/40 scale-105"
                            : "bg-white/5 border border-transparent"
                        }`}
                      >
                        <span className="text-3xl">{conn.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{conn.name}</p>
                          <p className="text-white/60 text-sm">{conn.desc}</p>
                        </div>
                        {activeConnector === i && (
                          <span className="text-emerald-400 text-sm font-medium px-3 py-1 rounded-full bg-emerald-500/20">Connecté</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ STATS BAR ═══════════ */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="150" data-suffix="+">0</div>
                <div className="text-sm text-white/80 mt-1">Événements gérés</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="50" data-suffix="K+">0</div>
                <div className="text-sm text-white/80 mt-1">Participants couverts</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="500" data-suffix="K+">0</div>
                <div className="text-sm text-white/80 mt-1">Photos triées</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="2" data-suffix="min">0</div>
                <div className="text-sm text-white/80 mt-1">/ 1000 photos</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ BENEFITS ═══════════ */}
        <section id="org-benefits" data-reveal className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("org-benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Avantages organisateurs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tout est inclus
              </h2>
              <p className="text-gray-600 text-lg">
                Focus Racer simplifie la gestion photo de vos événements de A à Z.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 ${
                    reveal("org-benefits") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {b.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section id="org-how" data-reveal className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("org-how") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                En 4 étapes
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`relative text-center transition-all duration-700 ${
                    reveal("org-how") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ USE CASES ═══════════ */}
        <section id="use-cases" data-reveal className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("use-cases") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Cas d&apos;usage
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Adapté à tous les formats
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-500 ${
                    reveal("use-cases") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{uc.icon}</span>
                    <span className="text-emerald-600 font-bold text-lg bg-emerald-50 px-3 py-1 rounded-full">{uc.participants}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{uc.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ CTA ═══════════ */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px]" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Prêt à transformer votre événement ?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Offrez une expérience photo professionnelle à vos participants.
              Solution clé en main, sans coût initial.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                  Créer mon événement
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                  Demander une démo
                </button>
              </Link>
            </div>
          </div>
        </section>
    </main>
  );
}
