"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Head from "next/head";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id: "ia", label: "IA & Tri" },
  { id: "golden-time", label: "Golden Time" },
  { id: "marketing", label: "Marketing" },
  { id: "simulateur", label: "Simulateur" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "pilotage", label: "Pilotage" },
  { id: "comparatif", label: "Comparatif" },
  { id: "tarifs", label: "Tarifs" },
];

const pipelineSteps = [
  { icon: "\u{1F4E4}", label: "Upload en masse", desc: "Drag & drop ou import dossier" },
  { icon: "\u{1F916}", label: "IA - Tri automatique", desc: "OCR dossards + visages + qualité" },
  { icon: "\u{1F3F7}️", label: "Indexation intelligente", desc: "Chaque photo liée au bon sportif" },
  { icon: "\u{1F4B0}", label: "Vente immédiate", desc: "Paiement direct Stripe Connect" },
];

const iaFeatures = [
  {
    icon: "\u{1F522}",
    title: "OCR automatique des dossards",
    desc: "Notre intelligence artificielle lit les numéros de dossard avec une précision de 99%, même sur des photos en mouvement, avec dossards bouchés, boueux ou partiellement masqués par un bras. Zéro tri manuel nécessaire.",
    stat: "99%",
    statLabel: "de précision",
  },
  {
    icon: "\u{1F464}",
    title: "Reconnaissance faciale avancée",
    desc: "Les photos sans dossard visible sont automatiquement liées au bon sportif grâce à la reconnaissance de visage. L’IA croise les visages avec les noms et numéros officiels pour garantir qu’aucun sportif ne manque à l’appel.",
    stat: "0.03s",
    statLabel: "par photo",
  },
  {
    icon: "\u{1F4CB}",
    title: "Compatibilité Start-Lists",
    desc: "Importez vos listes de participants (fichiers CSV, Excel ou connecteurs API Njuko/KMS) pour une indexation parfaite. L’IA croise automatiquement les visages avec les noms et dossards officiels.",
    stat: "100%",
    statLabel: "automatisé",
  },
  {
    icon: "\u{1F5BC}️",
    title: "Retouche automatique",
    desc: "Luminosité, contraste, saturation et netteté : vos photos sont optimisées automatiquement par notre algorithme de retouche. Option activable ou désactivable selon vos préférences créatives.",
    stat: "Auto",
    statLabel: "retouche IA",
  },
  {
    icon: "\u{1F4CA}",
    title: "Filtrage qualité & dédoublonnage",
    desc: "Les photos floues (détection Laplacian) et les doublons (pHash) sont automatiquement détectés et écartés AVANT le traitement IA. Vos crédits sont préservés, seules les meilleures photos sont conservées.",
    stat: "2x",
    statLabel: "moins de déchets",
  },
  {
    icon: "✂️",
    title: "Smart Crop par visage",
    desc: "Recadrage individuel automatique centré sur chaque visage détecté. Chaque sportif obtient son portrait optimisé en haute définition (800px), idéal pour les réseaux sociaux et l’identification rapide.",
    stat: "800px",
    statLabel: "portrait HD",
  },
];

const goldenTimeFeatures = [
  {
    icon: "\u{1F4F1}",
    title: "Interface 100% Mobile-First",
    headline: "Vendez quand l’émotion est au maximum",
    desc: "Les sportifs consultent leurs résultats sur leur smartphone, souvent encore sur la ligne d’arrivée. Notre plateforme est ultra-responsive pour un achat fluide en quelques clics, sans aucune friction.",
  },
  {
    icon: "\u{1F3AF}",
    title: "Tunnel de conversion stratégique",
    headline: "Chaque clic rapproche de l’achat",
    desc: "Navigation intuitive, panier simplifié et paiement sécurisé (Apple Pay, Google Pay, SEPA, CB). Nous avons éliminé tous les obstacles entre la découverte de la photo et la validation du paiement.",
  },
  {
    icon: "\u{1F3C6}",
    title: "Achat plaisir & valorisation",
    headline: "Transformez un cliché en trophée",
    desc: "Nos galeries web présentent vos médias sous leur meilleur jour, transformant un simple cliché en un trophée numérique que l’on est fier de s’offrir et de partager sur les réseaux sociaux.",
  },
];

const marketingFeatures = [
  {
    icon: "\u{1F514}",
    title: "Alertes photo instantanées",
    desc: "Les sportifs s’inscrivent et reçoivent une notification dès que leurs photos sont prêtes. C’est le levier n°1 pour déclencher l’achat à chaud, quand l’adrénaline est encore là.",
  },
  {
    icon: "\u{1F4E6}",
    title: "Upselling automatique",
    desc: "Le système propose intelligemment des packs (« Toutes mes photos pour X€ »), augmentant mécaniquement votre panier moyen sans effort supplémentaire de votre part.",
  },
  {
    icon: "\u{1F310}",
    title: "Viralité sociale intégrée",
    desc: "Partage facilité sur Instagram, Facebook, Strava avec filigrane dynamique. Chaque partage de photo watermarkée devient une publicité gratuite pour votre travail.",
  },
  {
    icon: "\u{1F91D}",
    title: "Communauté sportive",
    desc: "Les sportifs créent leur groupe d'amis, partagent et achètent ensemble. Effet réseau qui multiplie vos ventes par le bouche-à-oreille numérique.",
  },
];

const infraFeatures = [
  {
    icon: "⚡",
    title: "Serveur dédié hautes performances",
    desc: "AMD EPYC 16 cœurs / 32 threads, 64 Go RAM, 2× NVMe 960 Go. Notre infrastructure encaisse les pics de trafic sans sourciller : 100 ou 50 000 visiteurs simultanés, la vitesse reste constante.",
  },
  {
    icon: "\u{1F50D}",
    title: "SEO localisé & performant",
    desc: "Chaque galerie d’événement est optimisée pour le référencement naturel. Exemple : « Photos Marathon de Lyon 2026 ». Vous dominez les résultats Google dès la fin de la course.",
  },
  {
    icon: "\u{1F512}",
    title: "Sécurité & RGPD natif",
    desc: "Stockage S3 chiffré, protection hotlink, watermark anti-vol, conformité RGPD complète avec formulaire de suppression intégré. Vos clients et organisateurs évoluent dans un environnement professionnel et rassurant.",
  },
  {
    icon: "\u{1F680}",
    title: "CDN & compression Brotli",
    desc: "Images WebP optimisées, compression Brotli/zstd, cache immutable 1 an. Vos galeries chargent instantanément, même sur mobile en 4G. Temps de chargement < 1 seconde.",
  },
];

const pilotageFeatures = [
  {
    icon: "\u{1F4CA}",
    title: "Tableau de bord temps réel",
    desc: "Suivez vos ventes, analysez vos clichés les plus populaires, comprenez le comportement de vos acheteurs. KPIs, graphiques et tendances par événement.",
  },
  {
    icon: "\u{1F3A8}",
    title: "Branding & marque blanche",
    desc: "Personnalisez vos galeries avec votre logo, watermark et couleurs pour renforcer votre identité de marque auprès des organisateurs et des sportifs.",
  },
  {
    icon: "\u{1F4B3}",
    title: "Stripe Connect intégré",
    desc: "Recevez vos paiements directement sur votre compte bancaire. Onboarding en 3 minutes. Aucun intermédiaire, aucune commission sur vos ventes.",
  },
  {
    icon: "\u{1F4E5}",
    title: "Export CSV & reporting",
    desc: "Exportez vos données de ventes, commandes et statistiques en CSV. Facturez vos clients, déclarez vos revenus, pilotez votre activité comme un pro.",
  },
];

const comparatif = [
  { feature: "Tri IA automatique (OCR + visages)", focus: true, others: false },
  { feature: "Commission sur ventes", focus: "0%", others: "15–40%" },
  { feature: "Paiement direct photographe", focus: true, others: false },
  { feature: "Temps de tri 10 000 photos", focus: "~5 min", others: "1–2 jours manuel" },
  { feature: "Reconnaissance faciale", focus: true, others: false },
  { feature: "Smart Crop par visage", focus: true, others: false },
  { feature: "Filtrage qualité automatique", focus: true, others: false },
  { feature: "Mode Live (upload en direct)", focus: true, others: "Partiel" },
  { feature: "Apple Pay / Google Pay", focus: true, others: "Partiel" },
  { feature: "SEO galeries automatisé", focus: true, others: false },
  { feature: "Alertes photo sportifs", focus: true, others: false },
  { feature: "RGPD intégré", focus: true, others: "Partiel" },
  { feature: "Branding personnalisé", focus: true, others: "Partiel" },
  { feature: "Analytics temps réel", focus: true, others: "Partiel" },
];

const pricing = [
  { name: "Pack 1K", credits: "1 000", price: "19", perPhoto: "0,019" },
  { name: "Pack 5K", credits: "5 000", price: "85", perPhoto: "0,017", popular: true },
  { name: "Pack 15K", credits: "15 000", price: "225", perPhoto: "0,015" },
];

const testimonials = [
  {
    quote: "Avant Focus Racer, je passais 2 jours à trier 3 000 photos après chaque course. Maintenant c’est fait en 6 minutes. Mes ventes ont explosé parce que je mets en ligne le jour même.",
    author: "Photographe Marathon de Paris",
    role: "3 000+ photos / événement",
  },
  {
    quote: "Le zéro commission change tout. Sur une saison à 50 événements, je gardais 100% de mes 45 000€ de ventes au lieu d’en céder 15 000€ à la plateforme.",
    author: "Agence photo trail & ultra",
    role: "50+ événements / an",
  },
  {
    quote: "Les alertes photo sont magiques. Les sportifs reçoivent la notif en finissant la course et achètent dans les 30 minutes. Mon taux de conversion a triplé.",
    author: "Photographe triathlon",
    role: "Spécialiste multi-sport",
  },
];

const faqItems = [
  {
    q: "Comment fonctionne le tri automatique par intelligence artificielle ?",
    a: "Notre IA combine reconnaissance optique de caractères (OCR) pour lire les dossards et reconnaissance faciale pour identifier les sportifs. Les photos sont automatiquement liées au bon participant en seulement 30 millisecondes chacune (10 000 photos en 5 minutes). Vous uploadez en masse, l’IA organise tout en arrière-plan.",
  },
  {
    q: "Pourquoi 0% de commission sur les ventes ?",
    a: "Focus Racer se rémunère uniquement sur les crédits de tri IA (dès 0,008€/photo). Vous fixez vos prix librement et gardez 100% de vos revenus de vente. Les paiements arrivent directement sur votre compte via Stripe Connect Express.",
  },
  {
    q: "Est-ce compatible avec mes événements et mes start-lists ?",
    a: "Oui. Focus Racer accepte les imports CSV, Excel et dispose de connecteurs API pour les principales plateformes d’inscription (Njuko, KMS). L’IA croise automatiquement les participants avec les visages détectés.",
  },
  {
    q: "Qu’est-ce que le « Golden Time » et pourquoi est-ce important ?",
    a: "Le Golden Time désigne les 24 premières heures après une course, quand l’adrénaline est au maximum. C’est pendant cette fenêtre que 70% des ventes ont lieu. Focus Racer vous permet de mettre en ligne le jour même grâce au tri IA instantané.",
  },
  {
    q: "Mes photos sont-elles protégées contre le vol ?",
    a: "Absolument. Watermark dynamique, protection hotlink, blocage clic droit, anti-screenshot CSS, headers de sécurité avancés. Les originaux HD ne sont jamais exposés : seules les versions watermarkées sont visibles. L’accès aux HD nécessite un achat validé.",
  },
  {
    q: "Combien coûte Focus Racer ?",
    a: "Vous payez uniquement le tri IA : 1 crédit = 1 photo traitée. Les packs démarrent à 19€ pour 1 000 crédits (0,019€/photo), jusqu’à 0,008€/photo pour les gros volumes. Zéro commission sur vos ventes, zéro abonnement obligatoire.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SolutionsPhotographesPage() {
  const [activePipeline, setActivePipeline] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeNav, setActiveNav] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Simulator state
  const [simPhotos, setSimPhotos] = useState(2000);
  const [simPrice, setSimPrice] = useState(5);
  const [simConversion, setSimConversion] = useState(15);

  // Pipeline animation
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

  // Active nav tracking + scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-80px 0px -60% 0px" }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
      setShowNav(scrollTop > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
              el.textContent = Math.floor(target * eased) + suffix;
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

  // Simulator calculations
  const simPhotosSold = Math.round(simPhotos * (simConversion / 100));
  const simRevenuBrut = simPhotosSold * simPrice;
  const simCostPerPhoto = 0.008;
  const simCostIA = Math.round(simPhotos * simCostPerPhoto * 100) / 100;
  const simRevenuNet = simRevenuBrut - simCostIA;
  const simROI = simCostIA > 0 ? Math.round((simRevenuNet / simCostIA) * 100) / 100 : 0;

  // Comparison: traditional (30% commission)
  const simTraditionalNet = simRevenuBrut * 0.7;
  const simGain = simRevenuNet - simTraditionalNet;

  return (
    <main className="bg-white">
      {/* ═══════════ VERTICAL PROGRESS NAV ═══════════ */}
      <nav
        className={`hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col items-end gap-0 transition-all duration-500 ${
          showNav ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
        }`}
      >
        {/* Track background */}
        <div className="absolute right-[5px] top-0 bottom-0 w-[2px] bg-gray-200/60 rounded-full" />
        {/* Fill */}
        <div
          className="absolute right-[5px] top-0 w-[2px] bg-emerald-500 rounded-full transition-all duration-300"
          style={{ height: `${scrollProgress * 100}%` }}
        />
        {/* Markers */}
        <div className="relative flex flex-col gap-5 py-1">
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = activeNav === id;
            const activeIdx = NAV_ITEMS.findIndex((n) => n.id === activeNav);
            const thisIdx = NAV_ITEMS.findIndex((n) => n.id === id);
            const isPassed = thisIdx <= activeIdx;
            return (
              <a
                key={id}
                href={`#${id}`}
                className="group flex items-center gap-3 justify-end"
                title={label}
              >
                <span
                  className={`text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "opacity-100 text-emerald-600 translate-x-0"
                      : "opacity-0 group-hover:opacity-100 text-gray-500 translate-x-2 group-hover:translate-x-0"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`relative z-10 rounded-full transition-all duration-300 flex-shrink-0 ${
                    isActive
                      ? "w-3 h-3 bg-emerald-500 shadow-md shadow-emerald-500/40"
                      : isPassed
                      ? "w-2 h-2 bg-emerald-400"
                      : "w-2 h-2 bg-gray-300 group-hover:bg-gray-400"
                  }`}
                />
              </a>
            );
          })}
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Plateforme de vente photo propulsée par l'IA
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Transformez vos clichés en{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  profit
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl text-white/90">
                  10 000 photos triées en 5 minutes
                </span>
              </h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                Upload, tri automatique par intelligence artificielle, galerie optimisée, vente et paiement direct.
                Concentrez-vous sur la photo, Focus Racer s'occupe du tri, de la vente et du marketing.
                <strong className="text-white"> 0% de commission sur vos ventes.</strong>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5">
                    Créer mon compte gratuit
                  </button>
                </Link>
                <a href="#simulateur">
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm">
                    Simuler mes revenus
                  </button>
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-400" data-count="0" data-suffix="%">0%</div>
                  <div className="text-white/60 text-sm">commission sur ventes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">0.03s</div>
                  <div className="text-white/60 text-sm">par photo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400" data-count="95" data-suffix="%">0%</div>
                  <div className="text-white/60 text-sm">précision OCR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">+40%</div>
                  <div className="text-white/60 text-sm">de ventes en moyenne</div>
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
                    <span className="text-white/80 text-sm">1 crédit = 1 photo traitée</span>
                    <span className="text-emerald-400 font-bold">à partir de 0,008 €/photo</span>
                  </div>
                </div>
              </div>
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

      {/* ═══════════ SOCIAL PROOF BAR ═══════════ */}
      <section className="py-6 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
            <div>
              <span className="text-2xl font-bold text-gray-900" data-count="95" data-suffix="%">0%</span>
              <p className="text-xs text-gray-500 mt-0.5">précision IA</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">0,03s</span>
              <p className="text-xs text-gray-500 mt-0.5">par photo</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">0%</span>
              <p className="text-xs text-gray-500 mt-0.5">commission</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">+40%</span>
              <p className="text-xs text-gray-500 mt-0.5">de ventes en +</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">24/7</span>
              <p className="text-xs text-gray-500 mt-0.5">disponibilité</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ IA & TRI ═══════════ */}
      <section id="ia" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("ia") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Intelligence artificielle
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              L'IA au service de votre liberté : le tri sans effort
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Notre intelligence artificielle identifie les athlètes même si le dossard est masqué, boueux ou partiellement caché.
              Importez vos photos en masse, l'IA s'occupe de l'organisation en arrière-plan pendant que vous vous reposez ou préparez votre prochain shooting.
              <strong className="text-gray-900"> Workflow « Zéro Latence ».</strong>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {iaFeatures.map((feat, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 ${
                  reveal("ia") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <span className="text-4xl">{feat.icon}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{feat.stat}</div>
                    <div className="text-xs text-gray-500">{feat.statLabel}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ GOLDEN TIME ═══════════ */}
      <section id="golden-time" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-amber-50 via-orange-50 to-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("golden-time") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              Stratégie de vente
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Le « Golden Time » : vendez quand l'émotion est au maximum
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              En photographie événementielle, le temps est votre pire ennemi.
              <strong className="text-gray-900"> 70% des ventes se font dans les 24 premières heures</strong> après la course.
              Passé ce délai, l'adrénaline redescend, et vos chances de conversion aussi. Focus Racer vous permet de mettre en ligne le jour même.
            </p>
          </div>

          {/* Timeline visuelle */}
          <div className={`max-w-4xl mx-auto mb-16 transition-all duration-700 ${reveal("golden-time") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-red-300 via-amber-400 to-emerald-400 rounded-full -translate-y-1/2" />
              <div className="relative flex justify-between">
                {[
                  { time: "J+0", label: "Fin de course", pct: "70%", color: "bg-emerald-500 text-white" },
                  { time: "J+1", label: "24h après", pct: "20%", color: "bg-amber-400 text-white" },
                  { time: "J+3", label: "3 jours après", pct: "8%", color: "bg-orange-400 text-white" },
                  { time: "J+7", label: "1 semaine", pct: "2%", color: "bg-red-400 text-white" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-sm font-bold shadow-lg z-10`}>
                      {step.pct}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-bold text-gray-900 text-sm">{step.time}</p>
                      <p className="text-xs text-gray-500">{step.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">
              Répartition des ventes selon le délai de mise en ligne après la course
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {goldenTimeFeatures.map((feat, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${
                  reveal("golden-time") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className="text-4xl block mb-4">{feat.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MARKETING PREDICTIF ═══════════ */}
      <section id="marketing" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("marketing") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mb-4">
              Marketing & engagement
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Marketing prédictif & engagement client
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Un photographe utilisant notre système d'alertes et d'identification IA voit ses ventes augmenter en moyenne de{" "}
              <strong className="text-gray-900">40% par rapport à une mise en ligne classique à J+3</strong>.
              Activez les leviers de conversion intégrés.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {marketingFeatures.map((feat, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("marketing") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-3xl flex-shrink-0 mt-1">{feat.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SIMULATEUR DE REVENUS ═══════════ */}
      <section id="simulateur" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-12 transition-all duration-700 ${reveal("simulateur") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-300 text-sm font-medium mb-4 border border-white/20">
              Outil interactif
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simulateur de revenus photographe
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Estimez vos gains par événement avec Focus Racer. 0% de commission, vous gardez 100% de vos revenus.
            </p>
          </div>

          <div className={`max-w-5xl mx-auto transition-all duration-700 ${reveal("simulateur") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Sliders */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Photos par événement</label>
                    <span className="text-emerald-400 font-bold">{simPhotos.toLocaleString("fr-FR")}</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={10000}
                    step={100}
                    value={simPhotos}
                    onChange={(e) => setSimPhotos(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>100</span><span>10 000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Prix moyen par photo</label>
                    <span className="text-emerald-400 font-bold">{simPrice}€</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={simPrice}
                    onChange={(e) => setSimPrice(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>1€</span><span>20€</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Taux de conversion</label>
                    <span className="text-emerald-400 font-bold">{simConversion}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={simConversion}
                    onChange={(e) => setSimConversion(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>1%</span><span>50%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Photos vendues</span>
                    <span className="text-white font-medium">{simPhotosSold.toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Coût IA (à partir de {simCostPerPhoto}€/photo)</span>
                    <span className="text-white font-medium">{simCostIA.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}€</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-6">
                {/* Focus Racer result */}
                <div className="bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <h3 className="text-white font-semibold">Avec Focus Racer</h3>
                    <span className="ml-auto px-3 py-1 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold">0% commission</span>
                  </div>
                  <div className="text-5xl font-bold text-emerald-400 mb-2">
                    {simRevenuNet.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}€
                  </div>
                  <p className="text-white/60 text-sm">revenu net par événement</p>
                  <div className="mt-4 px-4 py-3 bg-white/5 rounded-xl">
                    <p className="text-emerald-300 text-sm font-medium">
                      ROI : {simROI.toLocaleString("fr-FR")}x votre investissement IA
                    </p>
                  </div>
                </div>

                {/* Projection annuelle */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <h3 className="text-white font-semibold">Projection annuelle</h3>
                    <span className="ml-auto px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold">×12 événements</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {(simRevenuNet * 12).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}€
                  </div>
                  <p className="text-white/60 text-sm">revenu net estimé sur 12 événements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ INFRASTRUCTURE ═══════════ */}
      <section id="infrastructure" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("infrastructure") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
              Infrastructure & sécurité
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une infrastructure « indestructible » & visibilité web
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Serveur dédié haute performance, SEO localisé pour chaque événement, sécurité de niveau professionnel.
              Que vous ayez 100 ou 50 000 visiteurs simultanés, la vitesse reste constante.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {infraFeatures.map((feat, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("infrastructure") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-3xl flex-shrink-0 mt-1">{feat.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PILOTAGE ═══════════ */}
      <section id="pilotage" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("pilotage") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Gestion professionnelle
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pilotez votre activité comme un pro
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Tableau de bord complet, branding personnalisé, paiement direct et export de données.
              Tout ce dont vous avez besoin pour gérer votre activité photo de manière professionnelle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pilotageFeatures.map((feat, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("pilotage") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-3xl flex-shrink-0 mt-1">{feat.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TABLEAU COMPARATIF ═══════════ */}
      <section id="comparatif" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("comparatif") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Comparaison
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Focus Racer vs plateformes classiques
            </h2>
            <p className="text-gray-600 text-lg">
              Pourquoi les photographes passent à Focus Racer : une comparaison fonctionnalité par fonctionnalité.
            </p>
          </div>

          <div className={`max-w-4xl mx-auto transition-all duration-700 ${reveal("comparatif") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Fonctionnalité</th>
                      <th className="text-center py-4 px-6">
                        <span className="text-sm font-bold text-emerald-600">Focus Racer</span>
                      </th>
                      <th className="text-center py-4 px-6">
                        <span className="text-sm font-medium text-gray-400">Autres</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparatif.map((row, i) => (
                      <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                        <td className="py-3.5 px-6 text-sm text-gray-700">{row.feature}</td>
                        <td className="py-3.5 px-6 text-center">
                          {typeof row.focus === "boolean" ? (
                            row.focus ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </span>
                            )
                          ) : (
                            <span className="text-sm font-bold text-emerald-600">{row.focus}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {typeof row.others === "boolean" ? (
                            row.others ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </span>
                            )
                          ) : (
                            <span className="text-sm text-gray-400">{row.others}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section data-reveal id="temoignages" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-700 ${reveal("temoignages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils ont choisi Focus Racer
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`bg-gray-50 rounded-2xl p-8 border border-gray-100 transition-all duration-500 ${
                  reveal("temoignages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">« {t.quote} »</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.author}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="tarifs" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("tarifs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Tarifs transparents
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Payez uniquement le tri IA
            </h2>
            <p className="text-gray-600 text-lg">
              1 crédit = 1 photo traitée par l'IA. Pas d'abonnement obligatoire, pas de commission sur vos ventes. Vous ne payez que ce que vous consommez.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((pack, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl p-8 shadow-sm border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  pack.popular ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-100"
                } ${reveal("tarifs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
                  <span className="text-gray-500 ml-1">€</span>
                </div>
                <p className="text-sm text-emerald-600 font-medium mb-6">{pack.perPhoto} €/photo</p>
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
              Voir tous les tarifs et abonnements →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ SEO ═══════════ */}
      <section data-reveal id="faq-photographes" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("faq-photographes") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes des photographes
            </h2>
            <p className="text-gray-600 text-lg">
              Tout ce que vous devez savoir avant de commencer avec Focus Racer.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className={`border border-gray-100 rounded-xl overflow-hidden transition-all duration-500 ${
                  reveal("faq-photographes") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 pr-4">{item.q}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96" : "max-h-0"}`}>
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">{item.a}</p>
                </div>
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
            Prêt à révolutionner votre activité photo ?
          </h2>
          <p className="text-white/80 text-lg mb-4 max-w-2xl mx-auto">
            Nous ne vous offrons pas juste une galerie : nous vous offrons un levier pour multiplier vos revenus actuels.
            En combinant l'identification IA la plus rapide du marché avec une stratégie de vente axée sur la psychologie de l'acheteur.
          </p>
          <p className="text-emerald-400 font-semibold text-lg mb-10 max-w-2xl mx-auto">
            Un photographe utilisant Focus Racer voit ses ventes augmenter en moyenne de 40% par rapport à une mise en ligne classique à J+3.
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
  );
}
