"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id: "ia", label: "IA & Tri" },
  { id: "experience", label: "Expérience" },
  { id: "engagement", label: "Engagement" },
  { id: "simulateur", label: "Simulateur" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "pilotage", label: "Pilotage" },
  { id: "comparatif", label: "Comparatif" },
  { id: "tarifs", label: "Tarifs" },
];

const pipelineSteps = [
  { icon: "\u{1F3C1}", label: "Créez votre événement", desc: "Nom, date, parcours, start-list automatique" },
  { icon: "\u{1F4F7}", label: "Photographes accrédités", desc: "Marketplace ou vos propres photographes" },
  { icon: "\u{1F916}", label: "Tri IA en temps réel", desc: "OCR dossards + visages + qualité automatique" },
  { icon: "\u{1F389}", label: "Sportifs ravis", desc: "Galerie en ligne, achat instantané, partage social" },
];

const iaFeatures = [
  {
    icon: "\u{1F522}",
    title: "OCR automatique des dossards",
    desc: "Chaque photo est analysée par notre intelligence artificielle qui lit les numéros de dossard avec 99% de précision, même sur des dossards boueux, froissés ou partiellement masqués. Vos participants retrouvent leurs photos sans aucune intervention manuelle de votre part.",
    stat: "99%",
    statLabel: "de précision",
  },
  {
    icon: "\u{1F464}",
    title: "Reconnaissance faciale avancée",
    desc: "Les photos où le dossard n'est pas visible sont automatiquement liées au bon sportif grâce à la reconnaissance de visage. Idéal pour les disciplines où le dossard est masqué : natation, cyclisme, sports collectifs.",
    stat: "0.03s",
    statLabel: "par photo",
  },
  {
    icon: "\u{1F4CB}",
    title: "Import start-lists automatisé",
    desc: "Importez vos listes de participants depuis Njuko, KMS ou fichiers CSV/Excel. L'IA croise automatiquement les noms, dossards et visages pour une indexation parfaite sans aucun tri manuel.",
    stat: "100%",
    statLabel: "automatisé",
  },
  {
    icon: "\u{1F5BC}️",
    title: "Retouche automatique des photos",
    desc: "Luminosité, contraste et netteté optimisés automatiquement. Vos photographes livrent des photos prêtes à la vente sans post-production manuelle. Option activable selon vos préférences.",
    stat: "Auto",
    statLabel: "retouche IA",
  },
  {
    icon: "\u{1F4CA}",
    title: "Filtrage qualité & dédoublonnage",
    desc: "Les photos floues et les doublons sont automatiquement détectés et écartés AVANT le traitement. Seules les meilleures photos sont conservées, garantissant une galerie irréprochable pour vos participants.",
    stat: "2x",
    statLabel: "moins de déchets",
  },
  {
    icon: "✂️",
    title: "Smart Crop par visage",
    desc: "Recadrage automatique centré sur chaque visage détecté. Chaque sportif obtient son portrait individuel en haute définition, parfait pour les réseaux sociaux et le partage post-événement.",
    stat: "800px",
    statLabel: "portrait HD",
  },
];

const experienceFeatures = [
  {
    icon: "\u{1F4F1}",
    title: "Galerie 100% Mobile-First",
    headline: "Vos participants achètent dès la ligne d'arrivée",
    desc: "Les sportifs consultent leurs résultats sur smartphone, souvent encore sur le terrain. Notre galerie ultra-responsive permet un achat fluide en quelques clics, sans friction. Résultat : des ventes immédiates et des participants satisfaits.",
  },
  {
    icon: "\u{1F50D}",
    title: "Recherche instantanée multi-critères",
    headline: "Dossard, nom, selfie : 3 façons de se retrouver",
    desc: "Vos participants retrouvent leurs photos en tapant leur dossard, leur nom, ou même en prenant un selfie. La reconnaissance faciale fait le reste. Plus besoin de parcourir des milliers de photos manuellement.",
  },
  {
    icon: "\u{1F3C6}",
    title: "Souvenir premium & partage viral",
    headline: "Transformez un cliché en trophée",
    desc: "Nos galeries présentent les photos sous leur meilleur jour, transformant un simple cliché en un trophée numérique que les sportifs sont fiers de partager sur Instagram, Facebook et Strava. Chaque partage est une publicité gratuite pour votre événement.",
  },
];

const engagementFeatures = [
  {
    icon: "\u{1F514}",
    title: "Alertes photo instantanées",
    desc: "Les sportifs s'inscrivent et reçoivent une notification dès que leurs photos sont en ligne. C'est le déclencheur n°1 d'achat : l'émotion est encore fraîche, le souvenir est intense.",
  },
  {
    icon: "\u{1F4E6}",
    title: "Packs & upselling automatique",
    desc: "Le système propose intelligemment des packs (« Toutes mes photos pour X€ »). Panier moyen multiplié sans effort. Vos photographes vendent plus, vos participants dépensent avec plaisir.",
  },
  {
    icon: "\u{1F310}",
    title: "Viralité sociale intégrée",
    desc: "Partage facilité sur Instagram, Facebook, Strava avec filigrane dynamique portant le nom de votre événement. Chaque partage devient une publicité organique gratuite pour votre prochaine édition.",
  },
  {
    icon: "\u{1F91D}",
    title: "Communauté sportive",
    desc: "Les sportifs créent leur groupe d'amis, partagent et achètent ensemble. Effet réseau qui multiplie les ventes et fidélise vos participants d'une édition à l'autre.",
  },
];

const infraFeatures = [
  {
    icon: "⚡",
    title: "Serveur dédié hautes performances",
    desc: "AMD EPYC 16 cœurs, 64 Go RAM, NVMe 960 Go. Notre infrastructure encaisse les pics de trafic post-événement sans broncher : 100 ou 50 000 visiteurs simultanés, la vitesse reste constante.",
  },
  {
    icon: "\u{1F50D}",
    title: "SEO localisé pour votre événement",
    desc: "Chaque galerie est optimisée pour le référencement : « Photos Marathon de Lyon 2026 », « Trail du Mont-Blanc 2026 ». Vous dominez les résultats Google et attirez du trafic organique gratuit vers votre événement.",
  },
  {
    icon: "\u{1F512}",
    title: "Sécurité & RGPD natif",
    desc: "Stockage S3 chiffré, protection hotlink, watermark anti-vol, conformité RGPD complète. Vos participants, vos photographes et vos sponsors évoluent dans un environnement professionnel et sécurisé.",
  },
  {
    icon: "\u{1F680}",
    title: "CDN & chargement instantané",
    desc: "Images WebP optimisées, compression Brotli, cache immutable. Vos galeries chargent en moins d'une seconde, même sur mobile 4G au milieu d'un parcours montagneux.",
  },
];

const pilotageFeatures = [
  {
    icon: "\u{1F4CA}",
    title: "Tableau de bord événement",
    desc: "Suivez en temps réel les ventes, le taux de couverture photo, la satisfaction des participants. KPIs, graphiques et tendances par événement et par édition.",
  },
  {
    icon: "\u{1F3A8}",
    title: "Branding & identité visuelle",
    desc: "Logo, couleurs, watermark personnalisé aux couleurs de votre événement. Vos galeries reflètent votre identité de marque et celle de vos sponsors.",
  },
  {
    icon: "\u{1F4B3}",
    title: "Paiements directs & transparents",
    desc: "Stripe Connect intégré : les photographes reçoivent leurs paiements directement. Aucun intermédiaire, aucune gestion de trésorerie côté organisateur.",
  },
  {
    icon: "\u{1F4E5}",
    title: "Export CSV & reporting",
    desc: "Exportez vos données de ventes, statistiques de couverture et KPIs. Présentez des bilans chiffrés à vos sponsors, partenaires et collectivités.",
  },
];

const comparatif = [
  { feature: "Tri IA automatique (OCR + visages)", focus: true, others: false },
  { feature: "Commission sur ventes photos", focus: "0%", others: "15–40%" },
  { feature: "Import start-lists automatique", focus: true, others: false },
  { feature: "Temps de mise en ligne 10 000 photos", focus: "~5 min", others: "1–2 jours manuel" },
  { feature: "Reconnaissance faciale", focus: true, others: false },
  { feature: "Recherche par selfie", focus: true, others: false },
  { feature: "Filtrage qualité automatique", focus: true, others: false },
  { feature: "Mode Live (upload en direct)", focus: true, others: "Partiel" },
  { feature: "Apple Pay / Google Pay", focus: true, others: "Partiel" },
  { feature: "SEO galeries automatisé", focus: true, others: false },
  { feature: "Alertes photo participants", focus: true, others: false },
  { feature: "RGPD intégré", focus: true, others: "Partiel" },
  { feature: "Branding événement personnalisé", focus: true, others: "Partiel" },
  { feature: "Connecteurs chronométrage (Njuko, KMS)", focus: true, others: false },
];

const pricing = [
  { name: "Pack 1K", credits: "1 000", price: "19", perPhoto: "0,019" },
  { name: "Pack 5K", credits: "5 000", price: "85", perPhoto: "0,017", popular: true },
  { name: "Pack 15K", credits: "15 000", price: "225", perPhoto: "0,015" },
];

const testimonials = [
  {
    quote: "Avant Focus Racer, nos photographes mettaient 3 jours à trier et mettre en ligne les photos. Maintenant tout est disponible le jour même. Nos participants adorent et les ventes ont triplé.",
    author: "Directeur de course — Marathon régional",
    role: "3 500+ participants / édition",
  },
  {
    quote: "Pour notre trail caritatif, les photos sont un vrai levier de communication. Grâce au partage social intégré, notre visibilité a explosé sur Instagram. Et les revenus photo financent l'association.",
    author: "Présidente — Association sportive caritative",
    role: "Course solidaire annuelle",
  },
  {
    quote: "En tant que mairie, nous organisons 4 événements sportifs par an. Focus Racer nous offre une solution professionnelle clé en main, sans mobiliser d'équipe technique supplémentaire.",
    author: "Directeur des sports — Collectivité territoriale",
    role: "4 événements / an",
  },
];

const faqItems = [
  {
    q: "Comment fonctionne le tri automatique pour mon événement ?",
    a: "Vos photographes uploadent leurs photos sur Focus Racer. Notre IA analyse chaque cliché en temps réel : lecture du dossard (OCR), reconnaissance faciale, filtrage qualité. 10 000 photos traitées en 5 minutes (30ms par photo), chaque sportif retrouve automatiquement ses photos dans la galerie. Aucun tri manuel nécessaire.",
  },
  {
    q: "Combien ça coûte pour un organisateur ?",
    a: "Focus Racer se rémunère uniquement sur les crédits de tri IA (dès 0,008€/photo). Aucune commission sur les ventes de photos, aucun abonnement obligatoire, aucun frais d'installation. Le coût est minimal par rapport à la valeur ajoutée : revenus photo, satisfaction participants, visibilité sociale.",
  },
  {
    q: "Puis-je utiliser mes propres photographes ou dois-je passer par votre marketplace ?",
    a: "Les deux ! Vous pouvez accréditer vos propres photographes (bénévoles ou professionnels) qui uploadent directement sur la plateforme. Ou bien, utilisez notre marketplace pour trouver des photographes professionnels disponibles dans votre région.",
  },
  {
    q: "Est-ce adapté aux petits événements locaux (moins de 500 participants) ?",
    a: "Absolument. Focus Racer s'adapte à toutes les tailles : course de village de 50 participants, course caritative de 200 personnes, semi-marathon municipal de 2 000 inscrits, ou marathon international de 40 000 participants. Le modèle au crédit (1 crédit = 1 photo) vous permet de payer uniquement ce que vous consommez.",
  },
  {
    q: "Comment fonctionne le branding événement ?",
    a: "Vous personnalisez votre galerie avec le logo de l'événement, vos couleurs, et un watermark personnalisé. Les galeries deviennent une extension naturelle de votre identité visuelle. Vous pouvez également intégrer les logos de vos sponsors pour valoriser vos partenariats.",
  },
  {
    q: "Les données des participants sont-elles protégées ?",
    a: "Focus Racer est 100% conforme RGPD. Stockage chiffré (S3), formulaire de suppression intégré, audit trail complet. Les participants peuvent demander la suppression de leurs données à tout moment. Vos collectivités et sponsors peuvent être rassurés sur la conformité.",
  },
];

const useCases = [
  {
    icon: "\u{1F3C3}",
    title: "Marathons & courses sur route",
    desc: "De 500 à 40 000 participants. Couverture multi-points, résultats instantanés. L'IA gère le volume sans ralentir.",
    tag: "Grand événement",
  },
  {
    icon: "⛰️",
    title: "Trails & ultra-trails",
    desc: "Parcours montagneux, conditions extrêmes. Notre IA s'adapte aux dossards sales, boueux ou déchirés.",
    tag: "Outdoor",
  },
  {
    icon: "\u{1F3CA}",
    title: "Triathlons & multi-sports",
    desc: "Natation, vélo, course : 3 disciplines, un seul système. La reconnaissance faciale couvre les transitions sans dossard visible.",
    tag: "Multi-discipline",
  },
  {
    icon: "\u{1F6B4}",
    title: "Courses cyclistes & VTT",
    desc: "Haute vitesse, dossards dorsaux, angles variés. Notre OCR gère la déformation et le mouvement.",
    tag: "Vélo",
  },
  {
    icon: "\u{1F49A}",
    title: "Courses caritatives & solidaires",
    desc: "Color runs, courses roses, défis solidaires. Les photos deviennent un levier de communication et de collecte de fonds pour votre cause.",
    tag: "Caritatif",
  },
  {
    icon: "\u{1F3DB}️",
    title: "Événements municipaux & de collectivités",
    desc: "Fêtes du sport, courses de quartier, jeux intercommunaux. Solution clé en main, sans équipe technique, rapport chiffré pour le conseil municipal.",
    tag: "Collectivité",
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SolutionsOrganisateursPage() {
  const [activePipeline, setActivePipeline] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeNav, setActiveNav] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Simulator state
  const [simParticipants, setSimParticipants] = useState(2000);
  const [simPhotosPerRunner, setSimPhotosPerRunner] = useState(5);
  const [simPricePerPhoto, setSimPricePerPhoto] = useState(5);
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
  const simTotalPhotos = simParticipants * simPhotosPerRunner;
  const simPhotosSold = Math.round(simParticipants * simPhotosPerRunner * (simConversion / 100));
  const simRevenuBrut = simPhotosSold * simPricePerPhoto;
  const simCostPerPhoto = 0.008;
  const simCostIA = Math.round(simTotalPhotos * simCostPerPhoto * 100) / 100;
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
        <div className="absolute right-[5px] top-0 bottom-0 w-[2px] bg-gray-200/60 rounded-full" />
        <div
          className="absolute right-[5px] top-0 w-[2px] bg-emerald-500 rounded-full transition-all duration-300"
          style={{ height: `${scrollProgress * 100}%` }}
        />
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
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-orange-400 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Solution photo clé en main pour organisateurs
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Offrez une{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  expérience photo
                </span>
                {" "}inoubliable
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl text-white/90">
                  à chaque participant de votre événement
                </span>
              </h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                Course locale, marathon international, trail caritatif ou fête du sport municipale :
                Focus Racer automatise le tri, la mise en ligne et la vente des photos de votre événement.
                <strong className="text-white"> Zéro logistique photo, 100% de satisfaction participants.</strong>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5">
                    Créer mon événement
                  </button>
                </Link>
                <a href="#simulateur">
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm">
                    Simuler les revenus
                  </button>
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-400" data-count="0" data-suffix="%">0%</div>
                  <div className="text-white/60 text-sm">logistique photo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">0.03s</div>
                  <div className="text-white/60 text-sm">par photo 000 photos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400" data-count="95" data-suffix="%">0%</div>
                  <div className="text-white/60 text-sm">précision IA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">24/7</div>
                  <div className="text-white/60 text-sm">galerie disponible</div>
                </div>
              </div>
            </div>

            {/* Pipeline animation */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-medium">Processus automatisé</p>
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
                    <span className="text-white/80 text-sm">Aucune commission sur les ventes</span>
                    <span className="text-emerald-400 font-bold">0% de frais</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <span className="text-2xl font-bold text-gray-900">0%</span>
              <p className="text-xs text-gray-500 mt-0.5">commission</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">0</span>
              <p className="text-xs text-gray-500 mt-0.5">logistique requise</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">+40%</span>
              <p className="text-xs text-gray-500 mt-0.5">satisfaction participants</p>
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
              L'IA qui transforme la couverture photo de votre événement
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Fini le tri manuel de milliers de photos. Notre intelligence artificielle identifie chaque sportif par son dossard ou son visage,
              filtre les clichés ratés et organise la galerie automatiquement.
              <strong className="text-gray-900"> Vos photographes uploadent, l'IA fait le reste.</strong>
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

      {/* ═══════════ EXPÉRIENCE PARTICIPANT ═══════════ */}
      <section id="experience" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-amber-50 via-orange-50 to-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("experience") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
              Expérience participant
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              La satisfaction de vos participants, notre priorité
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Un sportif qui retrouve facilement ses photos est un sportif heureux. Un sportif heureux revient l'année prochaine,
              parle de votre événement et partage ses photos sur les réseaux.
              <strong className="text-gray-900"> La photo devient un vecteur de fidélisation.</strong>
            </p>
          </div>

          {/* Timeline: parcours participant */}
          <div className={`max-w-4xl mx-auto mb-16 transition-all duration-700 ${reveal("experience") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-400 rounded-full -translate-y-1/2" />
              <div className="relative flex justify-between">
                {[
                  { time: "Arrivée", label: "Fin de course", action: "Alerte photo", color: "bg-emerald-500 text-white" },
                  { time: "30 min", label: "Recherche", action: "Selfie ou dossard", color: "bg-emerald-400 text-white" },
                  { time: "1h", label: "Achat", action: "Apple Pay, 1 clic", color: "bg-amber-400 text-white" },
                  { time: "2h", label: "Partage", action: "Instagram, Strava", color: "bg-orange-400 text-white" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-[10px] font-bold shadow-lg z-10 leading-tight text-center px-1`}>
                      {step.time}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-bold text-gray-900 text-sm">{step.label}</p>
                      <p className="text-xs text-gray-500">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">
              Parcours type d'un participant après la course
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {experienceFeatures.map((feat, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${
                  reveal("experience") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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

      {/* ═══════════ ENGAGEMENT & MARKETING ═══════════ */}
      <section id="engagement" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("engagement") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mb-4">
              Engagement & visibilité
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Chaque photo vendue est une publicité pour votre événement
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Les photos partagées sur les réseaux sociaux portent le nom de votre événement. Chaque sportif devient un ambassadeur.
              Résultat : une visibilité organique massive et un{" "}
              <strong className="text-gray-900">taux de réinscription en hausse de 25%</strong>.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {engagementFeatures.map((feat, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("engagement") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
              Simulateur de revenus événement
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Estimez les revenus photo que votre événement peut générer avec Focus Racer. 0% de commission, revenus maximisés.
            </p>
          </div>

          <div className={`max-w-5xl mx-auto transition-all duration-700 ${reveal("simulateur") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Sliders */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Participants</label>
                    <span className="text-emerald-400 font-bold">{simParticipants.toLocaleString("fr-FR")}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={20000}
                    step={50}
                    value={simParticipants}
                    onChange={(e) => setSimParticipants(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>50</span><span>20 000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Photos / participant</label>
                    <span className="text-emerald-400 font-bold">{simPhotosPerRunner}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={simPhotosPerRunner}
                    onChange={(e) => setSimPhotosPerRunner(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>1</span><span>20</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Prix moyen / photo</label>
                    <span className="text-emerald-400 font-bold">{simPricePerPhoto}€</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={simPricePerPhoto}
                    onChange={(e) => setSimPricePerPhoto(Number(e.target.value))}
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
                    <span>Total photos événement</span>
                    <span className="text-white font-medium">{simTotalPhotos.toLocaleString("fr-FR")}</span>
                  </div>
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
                      ROI : {simROI.toLocaleString("fr-FR")}x l'investissement IA
                    </p>
                  </div>
                </div>

                {/* Projection annuelle */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <h3 className="text-white font-semibold">Projection annuelle</h3>
                    <span className="ml-auto px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold">×4 éditions</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {(simRevenuNet * 4).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}€
                  </div>
                  <p className="text-white/60 text-sm">revenu net estimé sur 4 éditions/an</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CAS D'USAGE ═══════════ */}
      <section data-reveal id="cas-usage" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("cas-usage") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Tous les formats
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une solution qui s'adapte à votre événement
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              De la course de village à 50 participants au marathon international de 40 000 inscrits,
              en passant par la marche solidaire ou le raid aventure municipal. Focus Racer s'adapte.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("cas-usage") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{uc.icon}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{uc.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{uc.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{uc.desc}</p>
              </div>
            ))}
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
              Une plateforme qui tient le choc le jour J
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Le jour de votre événement, des milliers de participants vont chercher leurs photos simultanément.
              Notre infrastructure est dimensionnée pour absorber ces pics sans ralentissement.
              <strong className="text-gray-900"> Zéro downtime, zéro frustration.</strong>
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
              Pilotez la couverture photo comme un pro
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Tableau de bord dédié, branding événement, paiements transparents et export de données.
              Présentez des bilans chiffrés à vos sponsors, partenaires et collectivités.
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
              Focus Racer vs solutions classiques
            </h2>
            <p className="text-gray-600 text-lg">
              Pourquoi les organisateurs choisissent Focus Racer : une comparaison fonctionnalité par fonctionnalité.
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
              Ils organisent avec Focus Racer
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
              1 crédit = 1 photo traitée par l'IA. Pas d'abonnement obligatoire, pas de commission sur les ventes, pas de frais d'installation.
              Vous ne payez que ce que vous consommez.
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
      <section data-reveal id="faq-organisateurs" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("faq-organisateurs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes des organisateurs
            </h2>
            <p className="text-gray-600 text-lg">
              Tout ce que vous devez savoir avant de proposer Focus Racer sur votre événement.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className={`border border-gray-100 rounded-xl overflow-hidden transition-all duration-500 ${
                  reveal("faq-organisateurs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
            Prêt à révolutionner l'expérience photo de votre événement ?
          </h2>
          <p className="text-white/80 text-lg mb-4 max-w-2xl mx-auto">
            Course locale, marathon, trail caritatif ou événement municipal : offrez à vos participants
            un service photo professionnel sans mobiliser d'équipe supplémentaire.
            L'IA gère le tri, la mise en ligne et la vente.
          </p>
          <p className="text-emerald-400 font-semibold text-lg mb-10 max-w-2xl mx-auto">
            Zéro logistique. Zéro commission. 100% de satisfaction participants.
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
