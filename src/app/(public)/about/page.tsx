"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const missionValues = [
  {
    icon: "🎯",
    title: "Précision",
    desc: "Notre IA détecte les dossards avec 99% de précision, même en conditions difficiles.",
  },
  {
    icon: "⚡",
    title: "Rapidité",
    desc: "10 000 photos triées en 5 minutes. Le sportif trouve ses photos en une fraction de seconde.",
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

const milestones = [
  {
    year: "2024",
    short: "24",
    title: "L'idée",
    desc: "Un sportif passionné termine son premier marathon. Frustré de ne pas retrouver ses photos parmi des milliers de clichés, il imagine une solution automatisée. L'idée de Focus Racer est née.",
    icon: "💡",
  },
  {
    year: "2025",
    short: "25",
    title: "Le développement",
    desc: "Construction du pipeline IA complet : OCR des dossards, reconnaissance faciale, filtrage qualité, smart crop. Intégration de notre moteur de vision, Stripe Connect et architecture cloud. Un an de R&D intensive.",
    icon: "⚙️",
  },
  {
    year: "2026 Q1",
    short: "26",
    title: "Le lancement",
    desc: "Mise en production sur serveur dédié haute performance. Premiers événements couverts, marketplace photographes-organisateurs, paiements directs Stripe Connect Express. La plateforme est opérationnelle.",
    icon: "🚀",
  },
  {
    year: "2026 Q2",
    short: "Q2",
    title: "La croissance",
    desc: "150+ événements couverts, couverture multi-sports (trail, triathlon, cyclisme, natation, obstacle race...). Adoption par les agences photo et fédérations sportives. Le bouche-à-oreille s'accélère.",
    icon: "📈",
  },
  {
    year: "2027",
    short: "27",
    title: "La vision",
    desc: "Objectif : 1 000 événements par an à travers l'Europe. Application mobile native, partenariats avec les grandes fédérations sportives, expansion vers de nouvelles disciplines.",
    icon: "🌍",
  },
];

const teamMembers = [
  {
    initials: "AL",
    name: "Alexandre Lefèvre",
    role: "Fondateur & CEO",
    bio: "Ex-marathonien et passionné de technologie, Alexandre a couru plus de 30 courses avant de se lancer dans l'aventure Focus Racer. Sa vision : démocratiser l'accès à la photo sportive grâce à l'IA.",
    funFact: "A terminé l'UTMB en 38h12 sous la pluie — et n'a retrouvé que 2 photos de lui sur 15 000.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    initials: "SC",
    name: "Sophie Chen",
    role: "CTO",
    bio: "Experte en intelligence artificielle et computer vision, ex-ingénieure AWS. Sophie a conçu le pipeline de reconnaissance d'images qui permet de traiter 10 000 photos en 5 minutes (30ms par image).",
    funFact: "A entraîné son premier modèle de deep learning à 19 ans — pour reconnaître les races de chats.",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    initials: "MB",
    name: "Marie Bertrand",
    role: "Directrice Commerciale",
    bio: "10 ans d'expérience dans l'événementiel sportif. Marie a travaillé avec les plus grands organisateurs d'événements en France avant de rejoindre Focus Racer pour développer le réseau de partenaires.",
    funFact: "A organisé 200+ événements sportifs et affirme que le pire cauchemar d'un organisateur, c'est la pluie à J-1.",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    initials: "TN",
    name: "Thomas Nguyen",
    role: "Lead Designer",
    bio: "Spécialiste UX/UI mobile-first, Thomas conçoit des interfaces qui convertissent. Son obsession : réduire le nombre de clics entre la découverte d'une photo et son achat.",
    funFact: "Teste chaque maquette en courant sur un tapis roulant pour simuler les conditions réelles d'utilisation.",
    gradient: "from-orange-400 to-red-500",
  },
];

const coreValues = [
  {
    icon: "🎯",
    title: "Précision",
    desc: "Notre IA lit les dossards et reconnaît les visages avec une fiabilité de référence, même dans les conditions les plus difficiles.",
    metric: "99%",
    metricLabel: "de précision IA",
  },
  {
    icon: "⚡",
    title: "Rapidité",
    desc: "Le temps est précieux. Notre pipeline parallélisé trie, indexe et publie vos photos à une vitesse inégalée sur le marché.",
    metric: "2 min",
    metricLabel: "pour 1 000 photos",
  },
  {
    icon: "🤝",
    title: "Équité",
    desc: "Zéro commission sur les ventes. Les photographes fixent leurs prix et gardent 100% de leurs revenus. Un modèle économique juste.",
    metric: "0%",
    metricLabel: "de commission",
  },
  {
    icon: "🔒",
    title: "Confiance",
    desc: "RGPD natif, stockage chiffré S3, watermark anti-vol, protection hotlink. La sécurité des données n'est pas une option, c'est un fondement.",
    metric: "RGPD",
    metricLabel: "conformité native",
  },
  {
    icon: "🧠",
    title: "Innovation",
    desc: "Vision par ordinateur, reconnaissance faciale, smart crop, dédoublonnage pHash, retouche automatique. Nous repoussons les limites de l'IA appliquée au sport.",
    metric: "6+",
    metricLabel: "algorithmes IA",
  },
  {
    icon: "🆓",
    title: "Accessibilité",
    desc: "La recherche et la consultation des galeries sont 100% gratuites pour les sportifs. Aucune barrière à l'entrée, aucun compte obligatoire pour chercher.",
    metric: "100%",
    metricLabel: "gratuit pour chercher",
  },
];

const techStack = [
  { name: "Vision IA", desc: "OCR des dossards et reconnaissance faciale avec une précision de 99%", icon: "🧠", category: "IA" },
  { name: "Sharp", desc: "Traitement d'image haute performance : retouche, smart crop, watermark, WebP", icon: "🖼️", category: "Traitement" },
  { name: "Stripe Connect", desc: "Paiements directs sécurisés avec Apple Pay, Google Pay, SEPA et CB", icon: "💳", category: "Paiement" },
  { name: "Next.js 14", desc: "Framework React fullstack avec App Router et rendu côté serveur", icon: "⚛️", category: "Infrastructure" },
  { name: "PostgreSQL", desc: "Base de données relationnelle robuste avec Prisma ORM", icon: "🗄️", category: "Infrastructure" },
  { name: "WebP & Brotli", desc: "Formats optimisés pour des galeries ultra-rapides, même en 4G", icon: "📷", category: "Performance" },
  { name: "Amazon S3", desc: "Stockage cloud sécurisé et illimité pour toutes les photos HD", icon: "☁️", category: "Infrastructure" },
  { name: "Tailwind CSS", desc: "Interfaces modernes et responsive, optimisées mobile-first", icon: "🎨", category: "Design" },
];

const pipelineSteps = [
  { icon: "📤", label: "Upload", desc: "Compression client-side + upload chunké" },
  { icon: "🤖", label: "IA", desc: "OCR, visages, qualité, dédoublonnage" },
  { icon: "🖼️", label: "Galerie", desc: "Indexation, watermark, smart crop" },
  { icon: "💰", label: "Vente", desc: "Paiement direct Stripe Connect" },
];

const stats = [
  { value: 500000, suffix: "+", label: "Photos traitées" },
  { value: 150, suffix: "+", label: "Événements couverts" },
  { value: 30, suffix: "+", label: "Sports différents" },
  { value: 99, suffix: "%", label: "Précision IA" },
  { value: 0, suffix: "%", label: "Commission sur ventes", display: "0%" },
  { value: 2, suffix: " min", label: "Pour 1 000 photos", display: "2 min" },
];

const audiences = [
  {
    icon: "🏃",
    title: "Sportifs",
    desc: "Retrouvez vos photos en un clic grâce à l'IA. Recherche gratuite par dossard, selfie ou nom. Achat en un clic.",
    link: "/solutions/sportifs",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: "📸",
    title: "Photographes",
    desc: "Automatisez le tri, vendez directement, gardez 100% de vos revenus. Pipeline IA complet et 0% de commission.",
    link: "/solutions/photographes",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: "🏆",
    title: "Organisateurs",
    desc: "Offrez une couverture photo professionnelle à vos participants. Solution clé en main avec marketplace intégrée.",
    link: "/solutions/organisateurs",
    color: "from-purple-400 to-pink-500",
  },
];

const engagements = [
  { icon: "🇪🇺", title: "RGPD natif", desc: "Conformité complète avec le règlement européen sur la protection des données. Formulaire de suppression intégré, audit trail, chiffrement." },
  { icon: "🇫🇷", title: "Made in France", desc: "Conçu, développé et hébergé en France sur serveur dédié OVH. Données stockées en Europe (AWS eu-west-1)." },
  { icon: "🌱", title: "Éco-responsable", desc: "Images optimisées WebP (-60% de bande passante), compression Brotli, cache immutable. Moins de données transférées = moins d'énergie consommée." },
  { icon: "💎", title: "Tarifs transparents", desc: "Pas de frais cachés, pas de commission sur les ventes, pas d'abonnement obligatoire. Vous payez uniquement le tri IA à la photo." },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AboutPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activePipeline, setActivePipeline] = useState(0);
  const [hoveredTeamMember, setHoveredTeamMember] = useState<number | null>(null);

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

  // Pipeline animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipeline((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const reveal = useCallback((id: string) => visibleSections.has(id), [visibleSections]);

  return (
    <main className="bg-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-[120px]" />
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
              Focus Racer est né d'une frustration simple : passer des heures à chercher ses photos
              après une course, sans jamais les retrouver. Nous avons créé la solution que nous aurions
              aimé avoir — une plateforme où l'intelligence artificielle fait le travail à votre place.
            </p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-400 max-w-3xl mx-auto">
              500 000+ photos traitées. 150+ événements. 0% de commission.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/explore">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                  Découvrir la plateforme
                </button>
              </Link>
              <Link href="/register">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                  Créer un compte
                </button>
              </Link>
            </div>
          </div>
        </div>
        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-bold" data-count="500000" data-suffix="+">0</div>
              <div className="text-sm text-white/80 mt-1">Photos traitées</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold" data-count="150" data-suffix="+">0</div>
              <div className="text-sm text-white/80 mt-1">Événements couverts</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold" data-count="30" data-suffix="+">0</div>
              <div className="text-sm text-white/80 mt-1">Sports différents</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold" data-count="99" data-suffix="%">0</div>
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
                  Après chaque événement sportif, des milliers de photos sont prises par des photographes
                  talentueux. Mais retrouver les siennes dans cette masse relève du parcours du combattant :
                  défiler des centaines de pages, plisser les yeux sur des miniatures, abandonner au bout
                  de 30 minutes.
                </p>
                <p>
                  <strong className="text-gray-900">Focus Racer résout ce problème</strong> en combinant intelligence
                  artificielle de pointe et expérience utilisateur soignée. Notre IA lit les dossards, reconnaît
                  les visages et trie automatiquement chaque photo vers le bon sportif — en seulement 30 millisecondes
                  par image.
                </p>
                <p>
                  Nous créons de la valeur pour les <strong className="text-gray-900">trois acteurs</strong> de
                  l'écosystème :
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span><strong className="text-gray-900">Les sportifs</strong> retrouvent leurs photos instantanément, gratuitement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span><strong className="text-gray-900">Les photographes</strong> automatisent le tri et vendent sans commission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span><strong className="text-gray-900">Les organisateurs</strong> offrent une couverture photo pro clé en main</span>
                  </li>
                </ul>
                <p className="pt-2">
                  <strong className="text-emerald-600">Notre ambition</strong> : devenir la plateforme de référence en Europe
                  pour la photographie sportive événementielle.
                </p>
              </div>
            </div>
            <div className={`transition-all duration-700 delay-200 ${reveal("mission") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 border border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  {missionValues.map((v, i) => (
                    <div key={i} className="text-center group">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        {v.icon}
                      </div>
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
      <section id="histoire" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("histoire") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Notre histoire
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              De l'idée à la réalité
            </h2>
            <p className="text-gray-600 text-lg">
              Chaque grande aventure commence par une frustration. La nôtre a commencé sur la ligne
              d'arrivée d'un marathon.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Timeline gradient line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2">
              <div className="w-full h-full bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-700 rounded-full" />
            </div>

            {milestones.map((ms, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-8 mb-16 last:mb-0 transition-all duration-700 ${
                  reveal("histoire") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                {/* Desktop card */}
                <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right pr-12" : "text-left pl-12"}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 inline-block text-left hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{ms.icon}</span>
                      <span className="text-emerald-600 font-bold text-sm">{ms.year}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{ms.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{ms.desc}</p>
                  </div>
                </div>
                {/* Center dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/30 z-10 border-4 border-white">
                  {ms.short}
                </div>
                {/* Mobile card */}
                <div className="flex-1 ml-16 md:ml-0 md:hidden">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{ms.icon}</span>
                      <span className="text-emerald-600 font-bold text-sm">{ms.year}</span>
                    </div>
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

      {/* ═══════════ ÉQUIPE ═══════════ */}
      <section id="equipe" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("equipe") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              L'équipe
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              L'équipe derrière Focus Racer
            </h2>
            <p className="text-gray-600 text-lg">
              Des passionnés de sport et de technologie, réunis par une même conviction :
              l'IA peut transformer l'expérience de la photo sportive.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className={`group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-500 text-center ${
                  reveal("equipe") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
                onMouseEnter={() => setHoveredTeamMember(i)}
                onMouseLeave={() => setHoveredTeamMember(null)}
              >
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-emerald-600 text-sm font-medium mb-4">{member.role}</p>

                {/* Bio / Fun fact toggle */}
                <div className="relative min-h-[100px]">
                  <p className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
                    hoveredTeamMember === i ? "opacity-0 absolute inset-0" : "opacity-100"
                  }`}>
                    {member.bio}
                  </p>
                  <div className={`transition-all duration-300 ${
                    hoveredTeamMember === i ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
                  }`}>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Fun fact</p>
                      <p className="text-gray-700 text-sm leading-relaxed italic">{member.funFact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ VALEURS ═══════════ */}
      <section id="valeurs" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("valeurs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Nos valeurs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce qui nous guide au quotidien
            </h2>
            <p className="text-gray-600 text-lg">
              Six principes fondateurs qui définissent notre approche et orientent chacune de nos décisions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {coreValues.map((value, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 ${
                  reveal("valeurs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-3xl border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{value.metric}</div>
                    <div className="text-xs text-gray-500">{value.metricLabel}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TECHNOLOGIE ═══════════ */}
      <section id="technologie" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("technologie") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Technologies
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Propulsé par l'IA de pointe
            </h2>
            <p className="text-gray-600 text-lg">
              Une stack technologique moderne et performante, sélectionnée pour offrir
              la meilleure expérience sans compromis.
            </p>
          </div>

          {/* Pipeline visual */}
          <div className={`max-w-4xl mx-auto mb-16 transition-all duration-700 ${reveal("technologie") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
              </div>
              <div className="relative z-10">
                <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-medium text-center">
                  Le parcours d'une photo sur Focus Racer
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pipelineSteps.map((step, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-500 ${
                        activePipeline === i
                          ? "bg-emerald-500/20 border border-emerald-400/40 scale-105"
                          : activePipeline > i
                          ? "bg-white/5 border border-emerald-400/20 opacity-60"
                          : "bg-white/5 border border-transparent opacity-40"
                      }`}
                    >
                      <span className="text-3xl">{step.icon}</span>
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">{step.label}</p>
                        <p className="text-white/60 text-xs mt-1">{step.desc}</p>
                      </div>
                      {activePipeline === i && (
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                      )}
                      {activePipeline > i && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Connecting arrows on desktop */}
                <div className="hidden md:flex justify-center gap-[calc(25%-3rem)] mt-4">
                  {[0, 1, 2].map((i) => (
                    <svg key={i} className="w-6 h-6 text-emerald-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tech cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className={`group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("technologie") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{tech.icon}</span>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                    {tech.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{tech.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CHIFFRES ═══════════ */}
      <section id="chiffres" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-teal-400 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-700 ${reveal("chiffres") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Focus Racer en chiffres
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Des chiffres qui parlent d'eux-mêmes. Notre plateforme grandit chaque jour
              grâce à la confiance de nos utilisateurs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`text-center transition-all duration-700 ${
                  reveal("chiffres") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {stat.display ? (
                  <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">{stat.display}</div>
                ) : (
                  <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2" data-count={stat.value} data-suffix={stat.suffix}>0</div>
                )}
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ AUDIENCES ═══════════ */}
      <section id="audiences" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("audiences") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Trois audiences
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une plateforme, trois audiences
            </h2>
            <p className="text-gray-600 text-lg">
              Que vous soyez sportif, photographe ou organisateur, Focus Racer a été conçu pour répondre
              à vos besoins spécifiques.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {audiences.map((a, i) => (
              <Link
                key={i}
                href={a.link}
                className={`group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 block ${
                  reveal("audiences") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {a.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{a.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{a.desc}</p>
                <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  En savoir plus
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ENGAGEMENTS ═══════════ */}
      <section id="engagements" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("engagements") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Engagements
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos engagements
            </h2>
            <p className="text-gray-600 text-lg">
              Des engagements concrets qui reflètent notre vision d'une plateforme responsable et transparente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {engagements.map((eng, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-500 text-center ${
                  reveal("engagements") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                  {eng.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{eng.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{eng.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Rejoignez l'aventure Focus Racer
          </h2>
          <p className="text-white/80 text-lg mb-4 max-w-2xl mx-auto">
            Que vous soyez sportif à la recherche de vos photos, photographe souhaitant automatiser
            votre activité, ou organisateur désireux d'offrir le meilleur à vos participants —
            Focus Racer a été conçu pour vous.
          </p>
          <p className="text-emerald-400 font-semibold text-lg mb-10 max-w-2xl mx-auto">
            Rejoignez les milliers d'utilisateurs qui nous font déjà confiance.
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
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                Nous contacter
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
