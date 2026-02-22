"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const values = [
  {
    icon: "🎯",
    title: "Précision",
    desc: "Notre IA détecte les dossards avec 95% de précision, même en conditions difficiles.",
  },
  {
    icon: "⚡",
    title: "Rapidité",
    desc: "1000 photos triées en 2 minutes. Le sportif trouve ses photos en 3 secondes.",
  },
  {
    icon: "🤝",
    title: "Équité",
    desc: "0% de commission sur les ventes. Les photographes gardent le contrôle de leurs revenus.",
  },
  {
    icon: "🔒",
    title: "Confiance",
    desc: "RGPD natif, données sécurisées, watermark de protection. La sécurité n'est pas une option.",
  },
];

const techStack = [
  { name: "AWS Rekognition", desc: "OCR & reconnaissance faciale", icon: "🧠" },
  { name: "Sharp", desc: "Traitement d'image haute performance", icon: "🖼️" },
  { name: "Stripe Connect", desc: "Paiements directs sécurisés", icon: "💳" },
  { name: "Next.js", desc: "Framework React fullstack", icon: "⚛️" },
  { name: "PostgreSQL", desc: "Base de données relationnelle", icon: "🗄️" },
  { name: "WebP", desc: "Format d'image optimisé", icon: "📷" },
];

const milestones = [
  { year: "2024", title: "L'idée", desc: "Frustré de ne pas retrouver ses photos de course, notre fondateur imagine une solution automatisée." },
  { year: "2025", title: "Le développement", desc: "Construction de la plateforme avec IA intégrée : OCR, reconnaissance faciale, pipeline automatisé." },
  { year: "2026", title: "Le lancement", desc: "Mise en production avec couverture multi-sports, Stripe Connect et application mobile PWA." },
  { year: "2027", title: "L'expansion", desc: "Objectif : couvrir 1000 événements par an à travers l'Europe." },
];

export default function AboutPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

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
              if (current >= 1000000) el.textContent = (current / 1000000).toFixed(1).replace(".0", "") + "M" + suffix;
              else if (current >= 1000) el.textContent = Math.floor(current / 1000) + "K" + suffix;
              else el.textContent = current + suffix;
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
    <>
      <Header />
      <main className="bg-white">
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]" />
          </div>
          <div className="container mx-auto px-4 pt-24 pb-16 relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white">
                <span>🇫🇷</span>
                Conçu et développé en France
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                La technologie au service du{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  sport
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Focus Racer est né d&apos;une frustration simple : passer des heures à chercher ses photos
                après une course. Nous avons créé la solution que nous aurions aimé avoir.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ STATS ═══════════ */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="500000" data-suffix="+">0</div>
                <div className="text-sm text-white/80 mt-1">Photos traitées</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="150" data-suffix="+">0</div>
                <div className="text-sm text-white/80 mt-1">Événements</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="30" data-suffix="+">0</div>
                <div className="text-sm text-white/80 mt-1">Sports couverts</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="95" data-suffix="%">0</div>
                <div className="text-sm text-white/80 mt-1">Précision IA</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ MISSION ═══════════ */}
        <section id="mission" data-reveal className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <div className={`transition-all duration-700 ${reveal("mission") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-6">
                  Notre mission
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Chaque sportif mérite ses photos de course
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Après chaque course, des milliers de photos sont prises par des photographes talentueux.
                    Mais retrouver les siennes dans cette masse relève du parcours du combattant.
                  </p>
                  <p>
                    <strong className="text-gray-900">Focus Racer résout ce problème</strong> en combinant intelligence artificielle
                    et expérience utilisateur soignée. Notre IA lit les dossards, reconnaît les visages et trie
                    automatiquement chaque photo vers le bon sportif.
                  </p>
                  <p>
                    Notre ambition : devenir la plateforme de référence en Europe pour la photo sportive,
                    en créant de la valeur pour les trois acteurs de l&apos;écosystème — sportifs, photographes et organisateurs.
                  </p>
                </div>
              </div>
              <div className={`transition-all duration-700 delay-200 ${reveal("mission") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 border border-gray-200">
                  <div className="grid grid-cols-2 gap-6">
                    {values.map((v, i) => (
                      <div key={i} className="text-center">
                        <span className="text-4xl block mb-3">{v.icon}</span>
                        <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                        <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ TIMELINE ═══════════ */}
        <section id="timeline" data-reveal className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("timeline") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Notre histoire
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                De l&apos;idée à la réalité
              </h2>
            </div>

            <div className="max-w-3xl mx-auto relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-emerald-200 -translate-x-1/2" />

              {milestones.map((ms, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-8 mb-12 last:mb-0 transition-all duration-700 ${
                    reveal("timeline") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  } ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right pr-12" : "text-left pl-12"}`}>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 inline-block text-left">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{ms.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{ms.desc}</p>
                    </div>
                  </div>
                  {/* Center dot */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/30 z-10">
                    {ms.year.slice(2)}
                  </div>
                  <div className="flex-1 ml-16 md:ml-0 md:hidden">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="text-emerald-600 font-bold text-sm mb-1">{ms.year}</div>
                      <h3 className="font-bold text-gray-900 mb-2">{ms.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{ms.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ TECH ═══════════ */}
        <section id="tech" data-reveal className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("tech") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Technologies
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Propulsé par les meilleures technologies
              </h2>
              <p className="text-gray-600 text-lg">
                Une stack moderne et performante pour une expérience sans compromis.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-500 ${
                    reveal("tech") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="text-3xl">{tech.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{tech.name}</h3>
                    <p className="text-gray-500 text-sm">{tech.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ AUDIENCES ═══════════ */}
        <section id="audiences" data-reveal className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("audiences") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Une plateforme, trois audiences
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: "🏃",
                  title: "Sportifs",
                  desc: "Retrouvez vos photos en un clic grâce à l'IA. Recherche gratuite par dossard, selfie ou nom.",
                  link: "/solutions/sportifs",
                  cta: "En savoir plus",
                },
                {
                  icon: "📸",
                  title: "Photographes",
                  desc: "Automatisez le tri, vendez directement, gardez 100% de vos revenus. 0% commission.",
                  link: "/solutions/photographes",
                  cta: "En savoir plus",
                },
                {
                  icon: "🏆",
                  title: "Organisateurs",
                  desc: "Offrez une couverture photo pro à vos participants. Solution clé en main.",
                  link: "/solutions/organisateurs",
                  cta: "En savoir plus",
                },
              ].map((a, i) => (
                <Link
                  key={i}
                  href={a.link}
                  className={`group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 block ${
                    reveal("audiences") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <span className="text-5xl block mb-6">{a.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{a.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{a.desc}</p>
                  <span className="text-emerald-600 font-semibold text-sm group-hover:underline underline-offset-4">
                    {a.cta} &rarr;
                  </span>
                </Link>
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
              Rejoignez l&apos;aventure Focus Racer
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Que vous soyez sportif, photographe ou organisateur, Focus Racer a été conçu pour vous.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/explore">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                  Trouver mes photos
                </button>
              </Link>
              <Link href="/register">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                  Créer un compte
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
