"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const pipelineSteps = [
  { icon: "📤", label: "Upload", desc: "Drag & drop en masse" },
  { icon: "🤖", label: "IA", desc: "OCR + visages + qualité" },
  { icon: "🏷️", label: "Tri auto", desc: "Par dossard en 0.3s" },
  { icon: "💰", label: "Vente", desc: "Paiement direct Stripe" },
];

const features = [
  {
    icon: "🔢",
    title: "OCR automatique",
    desc: "Notre IA lit les dossards avec 95% de précision, même sur des photos en mouvement. Zéro tri manuel.",
    stat: "95%",
    statLabel: "de précision",
  },
  {
    icon: "👤",
    title: "Reconnaissance faciale",
    desc: "Les photos sans dossard visible sont automatiquement liées au bon sportif grâce à la reconnaissance de visage.",
    stat: "0.3s",
    statLabel: "par photo",
  },
  {
    icon: "🖼️",
    title: "Retouche automatique",
    desc: "Luminosité, contraste, netteté : vos photos sont optimisées automatiquement. Option activable/désactivable.",
    stat: "100%",
    statLabel: "automatique",
  },
  {
    icon: "📊",
    title: "Filtrage qualité",
    desc: "Les photos floues et les doublons sont détectés et écartés avant le traitement IA. Économisez vos crédits.",
    stat: "2x",
    statLabel: "moins de déchets",
  },
  {
    icon: "✂️",
    title: "Smart Crop",
    desc: "Recadrage individuel automatique par visage détecté. Chaque sportif obtient son portrait optimisé.",
    stat: "800px",
    statLabel: "portrait HD",
  },
  {
    icon: "🎨",
    title: "Branding personnalisé",
    desc: "Logo, watermark, couleurs : personnalisez vos galeries à votre image pour renforcer votre marque.",
    stat: "100%",
    statLabel: "sur mesure",
  },
];

const pricing = [
  { name: "Pack 1K", credits: "1 000", price: "19", perPhoto: "0,019" },
  { name: "Pack 5K", credits: "5 000", price: "85", perPhoto: "0,017", popular: true },
  { name: "Pack 15K", credits: "15 000", price: "225", perPhoto: "0,015" },
];

const advantages = [
  { icon: "💸", title: "0% de commission", desc: "Vous fixez vos prix et gardez 100% de vos revenus. Focus Racer se rémunère sur les crédits de tri IA." },
  { icon: "⚡", title: "Stripe Connect Express", desc: "Recevez vos paiements directement sur votre compte. Onboarding en 3 minutes." },
  { icon: "📈", title: "Dashboard analytics", desc: "Suivez vos ventes, vos revenus, vos statistiques par événement. Exportez en CSV." },
  { icon: "🔴", title: "Mode Live", desc: "Uploadez en direct pendant l'événement. Les sportifs voient leurs photos en temps réel." },
];

export default function SolutionsPhotographesPage() {
  const [activePipeline, setActivePipeline] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Animate pipeline
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipeline((prev) => (prev + 1) % 4);
    }, 2500);
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
    <>
      <Header />
      <main className="bg-white">
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          </div>
          <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                  <span>📸</span>
                  Pour les photographes professionnels
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Triez{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    1000 photos
                  </span>{" "}
                  en 2 minutes
                </h1>
                <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                  Upload, tri automatique par IA, galerie, vente et paiement direct.
                  Concentrez-vous sur la photo, Focus Racer s&apos;occupe du reste.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register">
                    <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5">
                      Essai gratuit
                    </button>
                  </Link>
                  <Link href="/pricing">
                    <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm">
                      Voir les tarifs
                    </button>
                  </Link>
                </div>
                <div className="flex gap-8 pt-4">
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">0%</div>
                    <div className="text-white/60 text-sm">commission sur ventes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">~2min</div>
                    <div className="text-white/60 text-sm">pour 1000 photos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">95%</div>
                    <div className="text-white/60 text-sm">précision OCR</div>
                  </div>
                </div>
              </div>

              {/* Pipeline animation */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                  <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-medium">Pipeline IA automatisé</p>
                  <div className="space-y-3">
                    {pipelineSteps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                          activePipeline === i
                            ? "bg-emerald-500/20 border border-emerald-400/40 scale-105"
                            : activePipeline > i
                            ? "bg-white/5 border border-emerald-400/20 opacity-60"
                            : "bg-white/5 border border-transparent opacity-40"
                        }`}
                      >
                        <span className="text-3xl">{step.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{step.label}</p>
                          <p className="text-white/60 text-sm">{step.desc}</p>
                        </div>
                        {activePipeline === i && (
                          <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                        )}
                        {activePipeline > i && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">1 crédit par photo traitée</span>
                      <span className="text-emerald-400 font-bold">à partir de 0,015 &euro;/photo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURES IA ═══════════ */}
        <section id="ia-features" data-reveal className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("ia-features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Intelligence artificielle
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                6 technologies IA intégrées
              </h2>
              <p className="text-gray-600 text-lg">
                Uploadez vos photos, notre IA fait le tri et optimise tout automatiquement.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 ${
                    reveal("ia-features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-4xl">{feat.icon}</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{feat.stat}</div>
                      <div className="text-xs text-gray-500">{feat.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ ADVANTAGES ═══════════ */}
        <section id="advantages" data-reveal className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("advantages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Avantages
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Maximisez vos revenus
              </h2>
              <p className="text-gray-600 text-lg">
                Focus Racer est conçu pour que les photographes gardent le contrôle et le maximum de leurs revenus.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {advantages.map((adv, i) => (
                <div
                  key={i}
                  className={`flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-500 ${
                    reveal("advantages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span className="text-3xl flex-shrink-0 mt-1">{adv.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{adv.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ PRICING PREVIEW ═══════════ */}
        <section id="pricing-preview" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("pricing-preview") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                Tarifs simples
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Payez uniquement le tri IA
              </h2>
              <p className="text-gray-600 text-lg">
                1 crédit = 1 photo traitée. Pas d&apos;abonnement obligatoire, pas de commission sur vos ventes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {pricing.map((pack, i) => (
                <div
                  key={i}
                  className={`relative bg-white rounded-2xl p-8 shadow-sm border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                    pack.popular ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-100"
                  } ${reveal("pricing-preview") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      Best-seller
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pack.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{pack.credits} crédits</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{pack.price}</span>
                    <span className="text-gray-500 ml-1">&euro;</span>
                  </div>
                  <p className="text-sm text-emerald-600 font-medium mb-6">{pack.perPhoto} &euro;/photo</p>
                  <Link href="/pricing">
                    <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      pack.popular
                        ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}>
                      Choisir ce pack
                    </button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/pricing" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm underline underline-offset-4">
                Voir tous les tarifs et abonnements &rarr;
              </Link>
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
              Prêt à automatiser votre tri photo ?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Rejoignez les photographes qui gagnent du temps et augmentent leurs ventes grâce à l&apos;IA Focus Racer.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                  Créer mon compte gratuit
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                  Nous contacter
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
