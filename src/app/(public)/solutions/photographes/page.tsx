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
  { icon: "\u{1F916}", label: "IA - Tri automatique", desc: "OCR dossards + visages + qualit\u00E9" },
  { icon: "\u{1F3F7}\uFE0F", label: "Indexation intelligente", desc: "Chaque photo li\u00E9e au bon sportif" },
  { icon: "\u{1F4B0}", label: "Vente imm\u00E9diate", desc: "Paiement direct Stripe Connect" },
];

const iaFeatures = [
  {
    icon: "\u{1F522}",
    title: "OCR automatique des dossards",
    desc: "Notre intelligence artificielle lit les num\u00E9ros de dossard avec une pr\u00E9cision de 95%, m\u00EAme sur des photos en mouvement, avec dossards bouch\u00E9s, boueux ou partiellement masqu\u00E9s par un bras. Z\u00E9ro tri manuel n\u00E9cessaire.",
    stat: "95%",
    statLabel: "de pr\u00E9cision",
  },
  {
    icon: "\u{1F464}",
    title: "Reconnaissance faciale avanc\u00E9e",
    desc: "Les photos sans dossard visible sont automatiquement li\u00E9es au bon sportif gr\u00E2ce \u00E0 la reconnaissance de visage. L\u2019IA croise les visages avec les noms et num\u00E9ros officiels pour garantir qu\u2019aucun sportif ne manque \u00E0 l\u2019appel.",
    stat: "0.3s",
    statLabel: "par photo",
  },
  {
    icon: "\u{1F4CB}",
    title: "Compatibilit\u00E9 Start-Lists",
    desc: "Importez vos listes de participants (fichiers CSV, Excel ou connecteurs API Njuko/KMS) pour une indexation parfaite. L\u2019IA croise automatiquement les visages avec les noms et dossards officiels.",
    stat: "100%",
    statLabel: "automatis\u00E9",
  },
  {
    icon: "\u{1F5BC}\uFE0F",
    title: "Retouche automatique",
    desc: "Luminosit\u00E9, contraste, saturation et nettet\u00E9 : vos photos sont optimis\u00E9es automatiquement par notre algorithme de retouche. Option activable ou d\u00E9sactivable selon vos pr\u00E9f\u00E9rences cr\u00E9atives.",
    stat: "Auto",
    statLabel: "retouche IA",
  },
  {
    icon: "\u{1F4CA}",
    title: "Filtrage qualit\u00E9 & d\u00E9doublonnage",
    desc: "Les photos floues (d\u00E9tection Laplacian) et les doublons (pHash) sont automatiquement d\u00E9tect\u00E9s et \u00E9cart\u00E9s AVANT le traitement IA. Vos cr\u00E9dits sont pr\u00E9serv\u00E9s, seules les meilleures photos sont conserv\u00E9es.",
    stat: "2x",
    statLabel: "moins de d\u00E9chets",
  },
  {
    icon: "\u2702\uFE0F",
    title: "Smart Crop par visage",
    desc: "Recadrage individuel automatique centr\u00E9 sur chaque visage d\u00E9tect\u00E9. Chaque sportif obtient son portrait optimis\u00E9 en haute d\u00E9finition (800px), id\u00E9al pour les r\u00E9seaux sociaux et l\u2019identification rapide.",
    stat: "800px",
    statLabel: "portrait HD",
  },
];

const goldenTimeFeatures = [
  {
    icon: "\u{1F4F1}",
    title: "Interface 100% Mobile-First",
    headline: "Vendez quand l\u2019\u00E9motion est au maximum",
    desc: "Les sportifs consultent leurs r\u00E9sultats sur leur smartphone, souvent encore sur la ligne d\u2019arriv\u00E9e. Notre plateforme est ultra-responsive pour un achat fluide en quelques clics, sans aucune friction.",
  },
  {
    icon: "\u{1F3AF}",
    title: "Tunnel de conversion strat\u00E9gique",
    headline: "Chaque clic rapproche de l\u2019achat",
    desc: "Navigation intuitive, panier simplifi\u00E9 et paiement s\u00E9curis\u00E9 (Apple Pay, Google Pay, SEPA, CB). Nous avons \u00E9limin\u00E9 tous les obstacles entre la d\u00E9couverte de la photo et la validation du paiement.",
  },
  {
    icon: "\u{1F3C6}",
    title: "Achat plaisir & valorisation",
    headline: "Transformez un clich\u00E9 en troph\u00E9e",
    desc: "Nos galeries web pr\u00E9sentent vos m\u00E9dias sous leur meilleur jour, transformant un simple clich\u00E9 en un troph\u00E9e num\u00E9rique que l\u2019on est fier de s\u2019offrir et de partager sur les r\u00E9seaux sociaux.",
  },
];

const marketingFeatures = [
  {
    icon: "\u{1F514}",
    title: "Alertes photo instantan\u00E9es",
    desc: "Les sportifs s\u2019inscrivent et re\u00E7oivent une notification d\u00E8s que leurs photos sont pr\u00EAtes. C\u2019est le levier n\u00B01 pour d\u00E9clencher l\u2019achat \u00E0 chaud, quand l\u2019adr\u00E9naline est encore l\u00E0.",
  },
  {
    icon: "\u{1F4E6}",
    title: "Upselling automatique",
    desc: "Le syst\u00E8me propose intelligemment des packs (\u00AB Toutes mes photos pour X\u20AC \u00BB), augmentant m\u00E9caniquement votre panier moyen sans effort suppl\u00E9mentaire de votre part.",
  },
  {
    icon: "\u{1F310}",
    title: "Viralit\u00E9 sociale int\u00E9gr\u00E9e",
    desc: "Partage facilit\u00E9 sur Instagram, Facebook, Strava avec filigrane dynamique. Chaque partage de photo watermark\u00E9e devient une publicit\u00E9 gratuite pour votre travail.",
  },
  {
    icon: "\u{1F91D}",
    title: "Horde : communaut\u00E9 sportive",
    desc: "Les sportifs cr\u00E9ent leur \u00AB Horde \u00BB (groupe d\u2019amis), partagent et ach\u00E8tent ensemble. Effet r\u00E9seau qui multiplie vos ventes par le bouche-\u00E0-oreille num\u00E9rique.",
  },
];

const infraFeatures = [
  {
    icon: "\u26A1",
    title: "Serveur d\u00E9di\u00E9 hautes performances",
    desc: "AMD EPYC 16 c\u0153urs / 32 threads, 64 Go RAM, 2\u00D7 NVMe 960 Go. Notre infrastructure encaisse les pics de trafic sans sourciller : 100 ou 50\u00A0000 visiteurs simultan\u00E9s, la vitesse reste constante.",
  },
  {
    icon: "\u{1F50D}",
    title: "SEO localis\u00E9 & performant",
    desc: "Chaque galerie d\u2019\u00E9v\u00E9nement est optimis\u00E9e pour le r\u00E9f\u00E9rencement naturel. Exemple : \u00AB Photos Marathon de Lyon 2026 \u00BB. Vous dominez les r\u00E9sultats Google d\u00E8s la fin de la course.",
  },
  {
    icon: "\u{1F512}",
    title: "S\u00E9curit\u00E9 & RGPD natif",
    desc: "Stockage S3 chiffr\u00E9, protection hotlink, watermark anti-vol, conformit\u00E9 RGPD compl\u00E8te avec formulaire de suppression int\u00E9gr\u00E9. Vos clients et organisateurs \u00E9voluent dans un environnement professionnel et rassurant.",
  },
  {
    icon: "\u{1F680}",
    title: "CDN & compression Brotli",
    desc: "Images WebP optimis\u00E9es, compression Brotli/zstd, cache immutable 1 an. Vos galeries chargent instantan\u00E9ment, m\u00EAme sur mobile en 4G. Temps de chargement < 1 seconde.",
  },
];

const pilotageFeatures = [
  {
    icon: "\u{1F4CA}",
    title: "Tableau de bord temps r\u00E9el",
    desc: "Suivez vos ventes, analysez vos clich\u00E9s les plus populaires, comprenez le comportement de vos acheteurs. KPIs, graphiques et tendances par \u00E9v\u00E9nement.",
  },
  {
    icon: "\u{1F3A8}",
    title: "Branding & marque blanche",
    desc: "Personnalisez vos galeries avec votre logo, watermark et couleurs pour renforcer votre identit\u00E9 de marque aupr\u00E8s des organisateurs et des sportifs.",
  },
  {
    icon: "\u{1F4B3}",
    title: "Stripe Connect int\u00E9gr\u00E9",
    desc: "Recevez vos paiements directement sur votre compte bancaire. Onboarding en 3 minutes. Aucun interm\u00E9diaire, aucune commission sur vos ventes.",
  },
  {
    icon: "\u{1F4E5}",
    title: "Export CSV & reporting",
    desc: "Exportez vos donn\u00E9es de ventes, commandes et statistiques en CSV. Facturez vos clients, d\u00E9clarez vos revenus, pilotez votre activit\u00E9 comme un pro.",
  },
];

const comparatif = [
  { feature: "Tri IA automatique (OCR + visages)", focus: true, others: false },
  { feature: "Commission sur ventes", focus: "0%", others: "15\u201340%" },
  { feature: "Paiement direct photographe", focus: true, others: false },
  { feature: "Temps de tri 1\u00A0000 photos", focus: "~2 min", others: "2\u20134h manuel" },
  { feature: "Reconnaissance faciale", focus: true, others: false },
  { feature: "Smart Crop par visage", focus: true, others: false },
  { feature: "Filtrage qualit\u00E9 automatique", focus: true, others: false },
  { feature: "Mode Live (upload en direct)", focus: true, others: "Partiel" },
  { feature: "Apple Pay / Google Pay", focus: true, others: "Partiel" },
  { feature: "SEO galeries automatis\u00E9", focus: true, others: false },
  { feature: "Alertes photo sportifs", focus: true, others: false },
  { feature: "RGPD int\u00E9gr\u00E9", focus: true, others: "Partiel" },
  { feature: "Branding personnalis\u00E9", focus: true, others: "Partiel" },
  { feature: "Analytics temps r\u00E9el", focus: true, others: "Partiel" },
];

const pricing = [
  { name: "Pack 1K", credits: "1\u00A0000", price: "19", perPhoto: "0,019" },
  { name: "Pack 5K", credits: "5\u00A0000", price: "85", perPhoto: "0,017", popular: true },
  { name: "Pack 15K", credits: "15\u00A0000", price: "225", perPhoto: "0,008" },
];

const testimonials = [
  {
    quote: "Avant Focus Racer, je passais 2 jours \u00E0 trier 3\u00A0000 photos apr\u00E8s chaque course. Maintenant c\u2019est fait en 6 minutes. Mes ventes ont explos\u00E9 parce que je mets en ligne le jour m\u00EAme.",
    author: "Photographe Marathon de Paris",
    role: "3\u00A0000+ photos / \u00E9v\u00E9nement",
  },
  {
    quote: "Le z\u00E9ro commission change tout. Sur une saison \u00E0 50 \u00E9v\u00E9nements, je gardais 100% de mes 45\u00A0000\u20AC de ventes au lieu d\u2019en c\u00E9der 15\u00A0000\u20AC \u00E0 la plateforme.",
    author: "Agence photo trail & ultra",
    role: "50+ \u00E9v\u00E9nements / an",
  },
  {
    quote: "Les alertes photo sont magiques. Les sportifs re\u00E7oivent la notif en finissant la course et ach\u00E8tent dans les 30 minutes. Mon taux de conversion a tripl\u00E9.",
    author: "Photographe triathlon",
    role: "Sp\u00E9cialiste multi-sport",
  },
];

const faqItems = [
  {
    q: "Comment fonctionne le tri automatique par intelligence artificielle ?",
    a: "Notre IA combine reconnaissance optique de caract\u00E8res (OCR) pour lire les dossards et reconnaissance faciale pour identifier les sportifs. Les photos sont automatiquement li\u00E9es au bon participant en moins de 0,3 seconde chacune. Vous uploadez en masse, l\u2019IA organise tout en arri\u00E8re-plan.",
  },
  {
    q: "Pourquoi 0% de commission sur les ventes ?",
    a: "Focus Racer se r\u00E9mun\u00E8re uniquement sur les cr\u00E9dits de tri IA (d\u00E8s 0,008\u20AC/photo). Vous fixez vos prix librement et gardez 100% de vos revenus de vente. Les paiements arrivent directement sur votre compte via Stripe Connect Express.",
  },
  {
    q: "Est-ce compatible avec mes \u00E9v\u00E9nements et mes start-lists ?",
    a: "Oui. Focus Racer accepte les imports CSV, Excel et dispose de connecteurs API pour les principales plateformes d\u2019inscription (Njuko, KMS). L\u2019IA croise automatiquement les participants avec les visages d\u00E9tect\u00E9s.",
  },
  {
    q: "Qu\u2019est-ce que le \u00AB Golden Time \u00BB et pourquoi est-ce important ?",
    a: "Le Golden Time d\u00E9signe les 24 premi\u00E8res heures apr\u00E8s une course, quand l\u2019adr\u00E9naline est au maximum. C\u2019est pendant cette fen\u00EAtre que 70% des ventes ont lieu. Focus Racer vous permet de mettre en ligne le jour m\u00EAme gr\u00E2ce au tri IA instantan\u00E9.",
  },
  {
    q: "Mes photos sont-elles prot\u00E9g\u00E9es contre le vol ?",
    a: "Absolument. Watermark dynamique, protection hotlink, blocage clic droit, anti-screenshot CSS, headers de s\u00E9curit\u00E9 avanc\u00E9s. Les originaux HD ne sont jamais expos\u00E9s : seules les versions watermark\u00E9es sont visibles. L\u2019acc\u00E8s aux HD n\u00E9cessite un achat valid\u00E9.",
  },
  {
    q: "Combien co\u00FBte Focus Racer ?",
    a: "Vous payez uniquement le tri IA : 1 cr\u00E9dit = 1 photo trait\u00E9e. Les packs d\u00E9marrent \u00E0 19\u20AC pour 1\u00A0000 cr\u00E9dits (0,019\u20AC/photo), jusqu\u2019\u00E0 0,008\u20AC/photo pour les gros volumes. Z\u00E9ro commission sur vos ventes, z\u00E9ro abonnement obligatoire.",
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

  // Active nav tracking
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
  const simCostPerPhoto = simPhotos <= 1000 ? 0.019 : simPhotos <= 5000 ? 0.017 : 0.008;
  const simCostIA = Math.round(simPhotos * simCostPerPhoto * 100) / 100;
  const simRevenuNet = simRevenuBrut - simCostIA;
  const simROI = simCostIA > 0 ? Math.round((simRevenuNet / simCostIA) * 100) / 100 : 0;

  // Comparison: traditional (30% commission)
  const simTraditionalNet = simRevenuBrut * 0.7;
  const simGain = simRevenuNet - simTraditionalNet;

  return (
    <main className="bg-white">
      {/* ═══════════ STICKY NAV ═══════════ */}
      <nav className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-3">
            {NAV_ITEMS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeNav === id
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {label}
              </a>
            ))}
            <div className="flex-1" />
            <Link href="/register">
              <button className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-full text-sm transition-all duration-300 shadow-md shadow-emerald-500/20 whitespace-nowrap">
                Essai gratuit
              </button>
            </Link>
          </div>
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
                Plateforme de vente photo propuls\u00E9e par l&apos;IA
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Transformez vos clich\u00E9s en{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  profit
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl text-white/90">
                  1\u00A0000 photos tri\u00E9es en 2 minutes
                </span>
              </h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                Upload, tri automatique par intelligence artificielle, galerie optimis\u00E9e, vente et paiement direct.
                Concentrez-vous sur la photo, Focus Racer s&apos;occupe du tri, de la vente et du marketing.
                <strong className="text-white"> 0% de commission sur vos ventes.</strong>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5">
                    Cr\u00E9er mon compte gratuit
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
                  <div className="text-2xl font-bold text-emerald-400">~2 min</div>
                  <div className="text-white/60 text-sm">pour 1\u00A0000 photos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400" data-count="95" data-suffix="%">0%</div>
                  <div className="text-white/60 text-sm">pr\u00E9cision OCR</div>
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
                <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-medium">Pipeline IA automatis\u00E9</p>
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
                    <span className="text-white/80 text-sm">1 cr\u00E9dit = 1 photo trait\u00E9e</span>
                    <span className="text-emerald-400 font-bold">\u00E0 partir de 0,008 &euro;/photo</span>
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
              <p className="text-xs text-gray-500 mt-0.5">pr\u00E9cision IA</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">0,3s</span>
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
              <p className="text-xs text-gray-500 mt-0.5">disponibilit\u00E9</p>
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
              L&apos;IA au service de votre libert\u00E9 : le tri sans effort
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Notre intelligence artificielle identifie les athl\u00E8tes m\u00EAme si le dossard est masqu\u00E9, boueux ou partiellement cach\u00E9.
              Importez vos photos en masse, l&apos;IA s&apos;occupe de l&apos;organisation en arri\u00E8re-plan pendant que vous vous reposez ou pr\u00E9parez votre prochain shooting.
              <strong className="text-gray-900"> Workflow &laquo;&nbsp;Z\u00E9ro Latence&nbsp;&raquo;.</strong>
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
              Strat\u00E9gie de vente
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Le &laquo;&nbsp;Golden Time&nbsp;&raquo; : vendez quand l&apos;\u00E9motion est au maximum
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              En photographie \u00E9v\u00E9nementielle, le temps est votre pire ennemi.
              <strong className="text-gray-900"> 70% des ventes se font dans les 24 premi\u00E8res heures</strong> apr\u00E8s la course.
              Pass\u00E9 ce d\u00E9lai, l&apos;adr\u00E9naline redescend, et vos chances de conversion aussi. Focus Racer vous permet de mettre en ligne le jour m\u00EAme.
            </p>
          </div>

          {/* Timeline visuelle */}
          <div className={`max-w-4xl mx-auto mb-16 transition-all duration-700 ${reveal("golden-time") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-red-300 via-amber-400 to-emerald-400 rounded-full -translate-y-1/2" />
              <div className="relative flex justify-between">
                {[
                  { time: "J+0", label: "Fin de course", pct: "70%", color: "bg-emerald-500 text-white" },
                  { time: "J+1", label: "24h apr\u00E8s", pct: "20%", color: "bg-amber-400 text-white" },
                  { time: "J+3", label: "3 jours apr\u00E8s", pct: "8%", color: "bg-orange-400 text-white" },
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
              R\u00E9partition des ventes selon le d\u00E9lai de mise en ligne apr\u00E8s la course
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
              Marketing pr\u00E9dictif & engagement client
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Un photographe utilisant notre syst\u00E8me d&apos;alertes et d&apos;identification IA voit ses ventes augmenter en moyenne de{" "}
              <strong className="text-gray-900">40% par rapport \u00E0 une mise en ligne classique \u00E0 J+3</strong>.
              Activez les leviers de conversion int\u00E9gr\u00E9s.
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
              Estimez vos gains par \u00E9v\u00E9nement avec Focus Racer. Comparez avec une plateforme classique qui pr\u00E9l\u00E8ve 30% de commission.
            </p>
          </div>

          <div className={`max-w-5xl mx-auto transition-all duration-700 ${reveal("simulateur") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Sliders */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Photos par \u00E9v\u00E9nement</label>
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
                    <span>100</span><span>10\u00A0000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white/80 text-sm font-medium">Prix moyen par photo</label>
                    <span className="text-emerald-400 font-bold">{simPrice}\u20AC</span>
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
                    <span>1\u20AC</span><span>20\u20AC</span>
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
                    <span>Co\u00FBt IA ({simCostPerPhoto}\u20AC/photo)</span>
                    <span className="text-white font-medium">{simCostIA.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}\u20AC</span>
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
                    {simRevenuNet.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}&euro;
                  </div>
                  <p className="text-white/60 text-sm">revenu net par \u00E9v\u00E9nement</p>
                  <div className="mt-4 px-4 py-3 bg-white/5 rounded-xl">
                    <p className="text-emerald-300 text-sm font-medium">
                      ROI : {simROI.toLocaleString("fr-FR")}x votre investissement IA
                    </p>
                  </div>
                </div>

                {/* Traditional result */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <h3 className="text-white/70 font-semibold">Plateforme classique</h3>
                    <span className="ml-auto px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold">30% commission</span>
                  </div>
                  <div className="text-4xl font-bold text-white/50 mb-2">
                    {simTraditionalNet.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}&euro;
                  </div>
                  <p className="text-white/40 text-sm">revenu net par \u00E9v\u00E9nement</p>
                </div>

                {/* Gain */}
                {simGain > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/20 p-6 text-center">
                    <p className="text-white/80 text-sm mb-1">Vous gagnez</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      +{simGain.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}&euro;
                    </p>
                    <p className="text-white/60 text-sm mt-1">de plus par \u00E9v\u00E9nement avec Focus Racer</p>
                  </div>
                )}
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
              Infrastructure & s\u00E9curit\u00E9
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une infrastructure &laquo;&nbsp;indestructible&nbsp;&raquo; & visibilit\u00E9 web
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Serveur d\u00E9di\u00E9 haute performance, SEO localis\u00E9 pour chaque \u00E9v\u00E9nement, s\u00E9curit\u00E9 de niveau professionnel.
              Que vous ayez 100 ou 50&nbsp;000 visiteurs simultan\u00E9s, la vitesse reste constante.
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
              Pilotez votre activit\u00E9 comme un pro
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Tableau de bord complet, branding personnalis\u00E9, paiement direct et export de donn\u00E9es.
              Tout ce dont vous avez besoin pour g\u00E9rer votre activit\u00E9 photo de mani\u00E8re professionnelle.
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
              Pourquoi les photographes passent \u00E0 Focus Racer : une comparaison fonctionnalit\u00E9 par fonctionnalit\u00E9.
            </p>
          </div>

          <div className={`max-w-4xl mx-auto transition-all duration-700 ${reveal("comparatif") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Fonctionnalit\u00E9</th>
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
                <p className="text-gray-700 leading-relaxed mb-6 italic">&laquo;&nbsp;{t.quote}&nbsp;&raquo;</p>
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
              1 cr\u00E9dit = 1 photo trait\u00E9e par l&apos;IA. Pas d&apos;abonnement obligatoire, pas de commission sur vos ventes. Vous ne payez que ce que vous consommez.
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
                <p className="text-gray-500 text-sm mb-6">{pack.credits} cr\u00E9dits</p>
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

      {/* ═══════════ FAQ SEO ═══════════ */}
      <section data-reveal id="faq-photographes" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("faq-photographes") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fr\u00E9quentes des photographes
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
            Pr\u00EAt \u00E0 r\u00E9volutionner votre activit\u00E9 photo ?
          </h2>
          <p className="text-white/80 text-lg mb-4 max-w-2xl mx-auto">
            Nous ne vous offrons pas juste une galerie : nous vous offrons un levier pour multiplier vos revenus actuels.
            En combinant l&apos;identification IA la plus rapide du march\u00E9 avec une strat\u00E9gie de vente ax\u00E9e sur la psychologie de l&apos;acheteur.
          </p>
          <p className="text-emerald-400 font-semibold text-lg mb-10 max-w-2xl mx-auto">
            Un photographe utilisant Focus Racer voit ses ventes augmenter en moyenne de 40% par rapport \u00E0 une mise en ligne classique \u00E0 J+3.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                Cr\u00E9er mon compte gratuit
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
