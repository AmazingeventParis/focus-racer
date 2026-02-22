"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const searchSteps = [
  { icon: "🔢", label: "Dossard", desc: "Entrez votre numéro", time: "0.3s" },
  { icon: "🤳", label: "Selfie", desc: "Prenez un selfie", time: "1.2s" },
  { icon: "👤", label: "Nom", desc: "Tapez votre nom", time: "0.5s" },
];

const features = [
  {
    icon: "🔍",
    title: "3 modes de recherche",
    desc: "Dossard, selfie ou nom. Trouvez vos photos en moins de 3 secondes, quelle que soit la méthode.",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    icon: "🤖",
    title: "IA de reconnaissance",
    desc: "Notre intelligence artificielle détecte automatiquement votre dossard et votre visage sur chaque photo.",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: "📱",
    title: "Accès mobile optimisé",
    desc: "Retrouvez vos photos directement sur votre smartphone, en bord de course ou après l'arrivée.",
    color: "from-purple-400 to-purple-600",
  },
  {
    icon: "💾",
    title: "Téléchargement HD",
    desc: "Photos en haute définition sans filigrane après achat. Qualité professionnelle garantie.",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: "👥",
    title: "Ma Horde",
    desc: "Créez votre groupe de sportifs, partagez vos photos et chattez avec vos coéquipiers.",
    color: "from-pink-400 to-pink-600",
  },
  {
    icon: "🔒",
    title: "Gratuit pour chercher",
    desc: "La recherche et la consultation des galeries sont 100% gratuites. Vous ne payez que si vous achetez.",
    color: "from-teal-400 to-teal-600",
  },
];

const steps = [
  { num: "1", title: "Trouvez votre événement", desc: "Parcourez les événements récents ou recherchez par nom, date ou lieu." },
  { num: "2", title: "Recherchez vos photos", desc: "Entrez votre dossard, prenez un selfie ou tapez votre nom. Résultat en quelques secondes." },
  { num: "3", title: "Achetez & téléchargez", desc: "Sélectionnez vos photos préférées et téléchargez-les en HD sans filigrane." },
];

const sports = [
  "Marathon", "Trail", "Triathlon", "Cyclisme", "Natation", "Running",
  "Duathlon", "Canicross", "Obstacle Race", "Swimrun", "Cross-country",
  "Aviron", "Ironman", "Équitation", "Kayak", "CrossFit",
];

const testimonials = [
  {
    name: "Marie D.",
    sport: "Marathon de Paris",
    text: "J'ai retrouvé toutes mes photos en tapant juste mon dossard. Incroyable ! La qualité est top.",
    rating: 5,
  },
  {
    name: "Thomas R.",
    sport: "Trail du Mont-Blanc",
    text: "Le selfie a trouvé 47 photos de moi sur 3 photographes différents. Jamais vu ça ailleurs.",
    rating: 5,
  },
  {
    name: "Sophie L.",
    sport: "Triathlon de Nice",
    text: "Ma Horde nous permet de partager les photos de notre club facilement. Super fonctionnalité !",
    rating: 5,
  },
];

export default function SolutionsSportifsPage() {
  const [activeSearch, setActiveSearch] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Rotate search methods
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSearch((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-[120px]" />
          </div>
          <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  100% gratuit pour les sportifs
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Retrouvez vos photos de{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    course
                  </span>{" "}
                  en un clic
                </h1>
                <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                  Dossard, selfie ou nom : notre IA retrouve automatiquement toutes vos photos
                  parmi des milliers d&apos;images. Résultat en quelques secondes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/explore">
                    <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5">
                      Trouver mes photos
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm">
                      Créer un compte gratuit
                    </button>
                  </Link>
                </div>
              </div>

              {/* Search demo widget */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                  <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-medium">3 méthodes de recherche</p>
                  <div className="space-y-4">
                    {searchSteps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                          activeSearch === i
                            ? "bg-emerald-500/20 border border-emerald-400/40 scale-105"
                            : "bg-white/5 border border-transparent"
                        }`}
                      >
                        <span className="text-3xl">{step.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{step.label}</p>
                          <p className="text-white/60 text-sm">{step.desc}</p>
                        </div>
                        {activeSearch === i && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 text-sm font-mono">{step.time}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="text-white/60 text-sm">Précision moyenne</div>
                    <div className="text-emerald-400 font-bold text-xl">95.2%</div>
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
                <div className="text-3xl md:text-4xl font-bold" data-count="500000" data-suffix="+">0</div>
                <div className="text-sm text-white/80 mt-1">Photos triées</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="150" data-suffix="+">0</div>
                <div className="text-sm text-white/80 mt-1">Événements</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="95" data-suffix="%">0</div>
                <div className="text-sm text-white/80 mt-1">Précision IA</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold" data-count="3" data-suffix="s">0</div>
                <div className="text-sm text-white/80 mt-1">Temps de recherche</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURES ═══════════ */}
        <section id="features" data-reveal className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Fonctionnalités
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-gray-600 text-lg">
                Focus Racer met la technologie au service de votre expérience sportive.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 ${
                    reveal("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section id="how" data-reveal className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("how") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Simple comme 1-2-3
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`relative text-center transition-all duration-700 ${
                    reveal("how") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                    {step.num}
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-300 to-transparent" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ SPORTS SUPPORTED ═══════════ */}
        <section id="sports" data-reveal className="py-16 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] overflow-hidden">
          <div className="container mx-auto px-4">
            <div className={`text-center mb-10 transition-all duration-700 ${reveal("sports") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Tous les sports, une seule plateforme
              </h2>
              <p className="text-white/70 text-lg">Focus Racer s&apos;adapte à toutes les disciplines sportives.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {sports.map((sport, i) => (
                <span
                  key={i}
                  className={`px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 cursor-default ${
                    reveal("sports") ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section id="testimonials" data-reveal className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("testimonials") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Témoignages
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ils nous font confiance
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-700 ${
                    reveal("testimonials") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.sport}</p>
                    </div>
                  </div>
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
              Prêt à retrouver vos photos ?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Recherche gratuite, résultat en quelques secondes. Rejoignez des milliers de sportifs
              qui utilisent déjà Focus Racer.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/explore">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                  Trouver mes photos
                </button>
              </Link>
              <Link href="/register">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                  Créer un compte gratuit
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
