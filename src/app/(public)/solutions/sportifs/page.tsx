"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id: "recherche", label: "Recherche" },
  { id: "ia", label: "IA" },
  { id: "galerie", label: "Galerie" },
  { id: "communaute", label: "Communauté" },
  { id: "securite", label: "Sécurité" },
  { id: "gratuit", label: "Tarifs" },
  { id: "temoignages", label: "Avis" },
  { id: "faq", label: "FAQ" },
];

const searchSteps = [
  { icon: "\u{1F522}", label: "Par dossard", desc: "Tapez votre numéro de dossard", time: "0.3s" },
  { icon: "\u{1F933}", label: "Par selfie", desc: "L'IA compare votre visage", time: "1.2s" },
  { icon: "\u{1F464}", label: "Par nom", desc: "Depuis la start-list officielle", time: "0.5s" },
];

const searchCards = [
  {
    icon: "\u{1F522}",
    title: "Recherche par dossard",
    desc: "Tapez votre numéro de dossard et retrouvez instantanément toutes vos photos. Notre IA lit les dossards sur chaque cliché grâce à la reconnaissance optique de caractères (OCR), même si le dossard est partiellement caché, boueux ou froissé. La méthode la plus rapide : résultat en 0,3 seconde.",
    stat: "0.3s",
    statLabel: "temps de recherche",
    color: "from-emerald-400 to-emerald-600",
    detail: "L'OCR analyse les pixels de chaque photo pour détecter et lire les chiffres imprimés sur votre dossard. Précision de 95% même en conditions difficiles.",
  },
  {
    icon: "\u{1F933}",
    title: "Recherche par selfie",
    desc: "Prenez un selfie avec votre smartphone et notre intelligence artificielle retrouve toutes les photos où vous apparaissez. Idéal quand votre dossard n'est pas visible : dos tourné, natation, arrivée de dos, ou simplement pour trouver des photos bonus.",
    stat: "47",
    statLabel: "photos trouvées en moyenne",
    color: "from-blue-400 to-blue-600",
    detail: "La reconnaissance faciale compare votre selfie avec chaque visage détecté sur les photos de l'événement. Fonctionne même avec casque, lunettes ou grimace d'effort.",
  },
  {
    icon: "\u{1F464}",
    title: "Recherche par nom",
    desc: "Tapez votre nom et l'IA croise la start-list officielle avec les dossards détectés pour retrouver toutes vos photos. Si votre nom est dans la liste des inscrits et que votre dossard apparaît sur les photos, la liaison est automatique.",
    stat: "100%",
    statLabel: "automatisé",
    color: "from-purple-400 to-purple-600",
    detail: "Les organisateurs importent la start-list (CSV, Njuko, KMS). L'IA croise votre nom avec votre numéro de dossard et retrouve chaque photo vous concernant.",
  },
];

const iaFeatures = [
  {
    icon: "\u{1F50D}",
    title: "OCR haute précision",
    desc: "L'IA lit les dossards avec 95% de précision, même boueux, froissés, en mouvement ou partiellement masqués par un bras ou une ceinture porte-dossard. Vous retrouvez vos photos sans effort.",
    stat: "95%",
    statLabel: "précision OCR",
  },
  {
    icon: "\u{1F9D1}",
    title: "Reconnaissance faciale",
    desc: "Quand votre dossard n'est pas visible (dos tourné, natation, cyclisme), la reconnaissance de visage prend le relais. L'IA vous retrouve sur des photos que vous n'auriez jamais trouvées manuellement.",
    stat: "85%+",
    statLabel: "taux de liaison",
  },
  {
    icon: "\u{2728}",
    title: "Filtre qualité automatique",
    desc: "Les photos floues, surexposées ou ratées sont automatiquement écartées. Vous ne voyez que les meilleurs clichés, ceux qui méritent d'être achetés et partagés avec fierté.",
    stat: "2x",
    statLabel: "moins de déchets",
  },
  {
    icon: "\u{2702}\uFE0F",
    title: "Smart Crop individuel",
    desc: "L'IA recadre automatiquement un portrait centré sur votre visage, extrait de la photo de groupe. Idéal pour votre photo de profil ou pour partager sur les réseaux sociaux.",
    stat: "800px",
    statLabel: "portrait HD",
  },
  {
    icon: "\u{1F3A8}",
    title: "Retouche automatique",
    desc: "Luminosité, contraste et netteté sont optimisés automatiquement par l'IA. Vos photos sont sublimées sans intervention humaine, prêtes à être partagées dès l'achat.",
    stat: "Auto",
    statLabel: "retouche IA",
  },
  {
    icon: "\u{26A1}",
    title: "Traitement ultra-rapide",
    desc: "1 000 photos analysées en environ 2 minutes. Grâce à notre serveur dédié haute performance (16 cœurs, 64 Go RAM), vos photos sont disponibles très rapidement après la course.",
    stat: "~2 min",
    statLabel: "pour 1 000 photos",
  },
];

const purchaseTimeline = [
  { step: "Recherche", desc: "Dossard, selfie ou nom", icon: "\u{1F50D}", color: "bg-emerald-500" },
  { step: "Favoris", desc: "Sélectionnez vos préférées", icon: "\u{2764}\uFE0F", color: "bg-pink-500" },
  { step: "Panier", desc: "Pack ou photo à l'unité", icon: "\u{1F6D2}", color: "bg-blue-500" },
  { step: "Paiement", desc: "Apple Pay, CB, SEPA", icon: "\u{1F4B3}", color: "bg-amber-500" },
  { step: "HD en 30s", desc: "Téléchargement sans filigrane", icon: "\u{2B07}\uFE0F", color: "bg-emerald-600" },
];

const galerieFeatures = [
  {
    icon: "\u{1F4F1}",
    title: "Galerie 100% mobile",
    desc: "Consultez vos photos directement sur votre smartphone, en bord de course ou après l'arrivée. Interface fluide, chargement instantané même en 4G.",
  },
  {
    icon: "\u{1F4B3}",
    title: "Apple Pay / Google Pay",
    desc: "Payez en un clic avec Apple Pay, Google Pay, carte bancaire ou virement SEPA. Zéro friction, paiement sécurisé par Stripe.",
  },
  {
    icon: "\u{1F5BC}\uFE0F",
    title: "Lightbox plein écran",
    desc: "Visualisez chaque photo en plein écran avec un viewer haute qualité. Zoomez, naviguez entre les clichés, ajoutez en favoris.",
  },
  {
    icon: "\u{2B07}\uFE0F",
    title: "HD sans filigrane",
    desc: "Après achat, téléchargez vos photos en haute définition originale, sans aucun filigrane. Qualité professionnelle garantie.",
  },
  {
    icon: "\u{2764}\uFE0F",
    title: "Système de favoris",
    desc: "Marquez vos photos préférées d'un cœur pour les retrouver facilement. Composez votre sélection avant d'acheter, à votre rythme.",
  },
  {
    icon: "\u{1F4E6}",
    title: "Packs avantageux",
    desc: "Photo à l'unité ou packs groupés : le photographe propose différentes formules. Plus vous achetez, plus le prix unitaire baisse.",
  },
];

const communauteFeatures = [
  {
    icon: "\u{1F43A}",
    title: "Créez votre Horde",
    desc: "Invitez vos coéquipiers, amis de course ou membres de votre club dans votre Horde. Un espace privé pour votre communauté sportive.",
  },
  {
    icon: "\u{1F4AC}",
    title: "Chat intégré",
    desc: "Discutez en temps réel avec votre Horde : conversations de groupe, messages directs 1-to-1. Partagez vos impressions, vos temps, vos anecdotes de course.",
  },
  {
    icon: "\u{1F3C5}",
    title: "10 badges à débloquer",
    desc: "Première course, 10 événements, parrain de Horde, collectionneur de photos... Débloquez des badges et affichez-les fièrement sur votre profil public.",
  },
  {
    icon: "\u{1F4F2}",
    title: "Partage social",
    desc: "Partagez vos photos sur Instagram, Facebook et Strava en un clic. Le filigrane dynamique disparaît après achat. Montrez vos exploits au monde.",
  },
];

const securiteFeatures = [
  {
    icon: "\u{1F512}",
    title: "RGPD compliant",
    desc: "Vos données personnelles sont protégées conformément au Règlement Général sur la Protection des Données. Vous pouvez demander la suppression de vos données et photos à tout moment via un formulaire dédié.",
  },
  {
    icon: "\u{1F4B3}",
    title: "Paiement sécurisé Stripe",
    desc: "Tous les paiements sont traités par Stripe, leader mondial du paiement en ligne. Vos coordonnées bancaires ne transitent jamais par nos serveurs. Chiffrement SSL de bout en bout.",
  },
  {
    icon: "\u{1F5D1}\uFE0F",
    title: "Suppression sur demande",
    desc: "Vous ne souhaitez plus apparaître sur les photos ? Un simple formulaire de demande RGPD et vos photos sont supprimées en cascade : clichés, visages, données personnelles.",
  },
  {
    icon: "\u{1F441}\uFE0F",
    title: "Pas de compte requis pour chercher",
    desc: "La recherche de photos est accessible sans créer de compte. Tapez votre dossard ou votre nom et retrouvez vos photos immédiatement. Le compte n'est nécessaire que pour les fonctionnalités avancées.",
  },
  {
    icon: "\u{1F6E1}\uFE0F",
    title: "Protection anti-vol des photos",
    desc: "Filigrane dynamique, protection hotlink, blocage clic droit, anti-screenshot. Les photos HD originales ne sont jamais exposées publiquement. Seules les versions protégées sont visibles avant achat.",
  },
];

const sports = [
  "Marathon", "Semi-marathon", "10 km", "5 km", "Trail", "Ultra-trail",
  "Triathlon", "Cyclisme", "VTT", "Natation", "Running",
  "Duathlon", "Canicross", "Course d'obstacles", "Swimrun", "Cross-country",
  "Aviron", "Ironman", "Équitation", "Kayak", "CrossFit",
  "Marche nordique", "Color Run", "Course caritative",
];

const testimonials = [
  {
    quote: "J'ai retrouvé 47 photos de moi en prenant juste un selfie après l'arrivée. Dont 12 où mon dossard n'était même pas visible ! La reconnaissance faciale est bluffante. J'ai tout acheté en pack, le prix était honnête.",
    author: "Marie D.",
    role: "Marathon de Paris — 3h42",
  },
  {
    quote: "Sur le Trail du Mont-Blanc, 3 photographes différents m'ont pris en photo. En tapant mon dossard, j'ai retrouvé toutes les photos de tous les photographes sur une seule page. Plus besoin de chercher sur 5 sites différents.",
    author: "Thomas R.",
    role: "Trail du Mont-Blanc — 28h15",
  },
  {
    quote: "Ma Horde c'est notre club de triathlon. On partage nos photos après chaque course, on se chambrait sur les grimaces d'effort. C'est devenu notre réseau social sportif préféré. Et le chat intégré remplace notre groupe WhatsApp.",
    author: "Sophie L.",
    role: "Triathlon de Nice — Club Côte d'Azur Tri",
  },
];

const faqItems = [
  {
    q: "Comment retrouver mes photos de course gratuitement ?",
    a: "Rendez-vous sur la galerie de votre événement sur Focus Racer. Tapez votre numéro de dossard, votre nom, ou prenez un selfie. L'intelligence artificielle retrouve automatiquement toutes vos photos en quelques secondes. La recherche et la consultation sont 100% gratuites. Vous ne payez que si vous décidez d'acheter les photos en haute définition sans filigrane.",
  },
  {
    q: "Est-ce que Focus Racer fonctionne avec tous les sports ?",
    a: "Oui. Focus Racer est conçu pour tous les sports qui impliquent des dossards ou des participants identifiables : marathon, trail, triathlon, cyclisme, natation, course d'obstacles, VTT, canicross, duathlon, swimrun, aviron, et bien d'autres. La reconnaissance faciale permet même de retrouver vos photos dans les disciplines où le dossard n'est pas visible (natation, cyclisme dos).",
  },
  {
    q: "Comment fonctionne la recherche par selfie ?",
    a: "Prenez un selfie avec votre smartphone depuis la page de recherche de l'événement. Notre intelligence artificielle compare votre visage avec tous les visages détectés sur les photos de l'événement. En 1 à 2 secondes, toutes les photos où vous apparaissez sont affichées, même celles où votre dossard n'est pas visible. La reconnaissance fonctionne avec casque, lunettes de soleil ou grimace d'effort.",
  },
  {
    q: "Dois-je créer un compte pour chercher mes photos ?",
    a: "Non. La recherche par dossard et par nom est accessible sans aucun compte. Vous pouvez retrouver et consulter vos photos immédiatement. Un compte gratuit est nécessaire uniquement pour utiliser la recherche par selfie, les favoris, Ma Horde (communauté) et pour gérer vos achats. La création de compte prend moins de 30 secondes.",
  },
  {
    q: "Les photos sont-elles en haute définition ?",
    a: "Oui. Après achat, vous téléchargez les photos originales en haute définition, sans aucun filigrane ni compression. La qualité est celle du fichier original du photographe professionnel. Avant achat, les photos sont affichées avec un filigrane de protection pour protéger le travail du photographe. Les photos sont également retouchées automatiquement par l'IA (luminosité, contraste, netteté).",
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    a: "Absolument. Focus Racer est 100% conforme au RGPD (Règlement Général sur la Protection des Données). Vos données personnelles sont chiffrées, les paiements sont sécurisés par Stripe (leader mondial), et vous pouvez demander la suppression complète de vos données à tout moment via un formulaire dédié. Nous ne revendons jamais vos données à des tiers.",
  },
];

const priceExamples = [
  { label: "1 photo", price: "3 à 8", icon: "\u{1F4F8}" },
  { label: "Pack 5 photos", price: "12 à 25", icon: "\u{1F4E6}" },
  { label: "Toutes mes photos", price: "20 à 45", icon: "\u{1F3C6}" },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SolutionsSportifsPage() {
  const [activeSearch, setActiveSearch] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeNav, setActiveNav] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Rotate search methods
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSearch((prev) => (prev + 1) % 3);
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                100% gratuit pour chercher
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Retrouvez vos photos de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  course
                </span>{" "}
                en un clic
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl text-white/90">
                  Dossard, selfie ou nom : résultat en 3 secondes
                </span>
              </h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                Notre intelligence artificielle retrouve automatiquement toutes vos photos
                parmi des milliers d&apos;images. Trois modes de recherche, précision de 95%,
                résultat quasi instantané.
                <strong className="text-white"> La recherche est 100% gratuite.</strong>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-400" data-count="3" data-suffix=" modes">0</div>
                  <div className="text-white/60 text-sm">de recherche</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">0.3s</div>
                  <div className="text-white/60 text-sm">par photo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400" data-count="95" data-suffix="%">0%</div>
                  <div className="text-white/60 text-sm">précision IA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">Gratuit</div>
                  <div className="text-white/60 text-sm">pour chercher</div>
                </div>
              </div>
            </div>

            {/* Search demo widget */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-medium">3 méthodes de recherche</p>
                <div className="space-y-3">
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
              <span className="text-2xl font-bold text-gray-900" data-count="500000" data-suffix="+">0</span>
              <p className="text-xs text-gray-500 mt-0.5">photos triées</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900" data-count="150" data-suffix="+">0</span>
              <p className="text-xs text-gray-500 mt-0.5">événements</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900" data-count="95" data-suffix="%">0%</span>
              <p className="text-xs text-gray-500 mt-0.5">précision IA</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">Gratuit</span>
              <p className="text-xs text-gray-500 mt-0.5">pour chercher</p>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-gray-900">24/7</span>
              <p className="text-xs text-gray-500 mt-0.5">disponibilité</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 3 FAÇONS DE RETROUVER VOS PHOTOS ═══════════ */}
      <section id="recherche" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("recherche") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Recherche intelligente
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3 façons de retrouver vos photos
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Que vous connaissiez votre numéro de dossard, votre nom d&apos;inscription ou simplement votre visage,
              Focus Racer vous retrouve parmi des milliers de photos en quelques secondes.
              <strong className="text-gray-900"> Choisissez votre méthode préférée.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {searchCards.map((card, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 ${
                  reveal("recherche") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{card.stat}</div>
                    <div className="text-xs text-gray-500">{card.statLabel}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-4">{card.desc}</p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-700">Comment ça marche :</span> {card.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ IA QUI VOUS TROUVE ═══════════ */}
      <section id="ia" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("ia") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              Intelligence artificielle
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              L&apos;IA qui vous trouve parmi des milliers
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Derrière chaque recherche, une intelligence artificielle de pointe analyse chaque photo :
              lecture des dossards, reconnaissance des visages, filtrage qualité, recadrage intelligent.
              <strong className="text-gray-900"> Vous ne voyez que les meilleures photos, celles qui comptent.</strong>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {iaFeatures.map((feat, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-1 ${
                  reveal("ia") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <span className="text-4xl">{feat.icon}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{feat.stat}</div>
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

      {/* ═══════════ EXPÉRIENCE D'ACHAT ═══════════ */}
      <section id="galerie" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("galerie") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Expérience d&apos;achat
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une expérience d&apos;achat sans friction
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              De la recherche au téléchargement HD, chaque étape est conçue pour être fluide et rapide.
              Galerie mobile-first, paiement en un clic, téléchargement instantané.
              <strong className="text-gray-900"> Vos photos HD en moins de 30 secondes après le paiement.</strong>
            </p>
          </div>

          {/* Timeline parcours d'achat */}
          <div className={`max-w-4xl mx-auto mb-16 transition-all duration-700 ${reveal("galerie") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-emerald-400 via-pink-400 via-blue-400 via-amber-400 to-emerald-600 rounded-full -translate-y-1/2" />
              <div className="relative flex justify-between">
                {purchaseTimeline.map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center text-lg shadow-lg z-10`}>
                      {item.icon}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-bold text-gray-900 text-sm">{item.step}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">
              Parcours type : de la recherche au téléchargement HD en moins de 2 minutes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {galerieFeatures.map((feat, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("galerie") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
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

      {/* ═══════════ MA HORDE : COMMUNAUTÉ ═══════════ */}
      <section id="communaute" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("communaute") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              Communauté sportive
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ma Horde : partagez avec vos coéquipiers
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Créez votre groupe de sportifs, chattez en temps réel, partagez vos photos de course.
              Ma Horde est votre réseau social sportif intégré, conçu pour les passionnés de course.
              <strong className="text-gray-900"> Débloquez des badges et affichez-les sur votre profil public.</strong>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {communauteFeatures.map((feat, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("communaute") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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

      {/* ═══════════ SÉCURITÉ & RGPD ═══════════ */}
      <section id="securite" data-reveal className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
              Sécurité & vie privée
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vos données sont protégées
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Conformité RGPD, paiement sécurisé Stripe, suppression sur demande, protection des photos.
              Nous prenons la sécurité de vos données personnelles très au sérieux.
              <strong className="text-gray-900"> Pas de compte requis pour rechercher vos photos.</strong>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {securiteFeatures.map((feat, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-500 ${
                  reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="text-4xl block mb-4">{feat.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMBIEN ÇA COÛTE ? ═══════════ */}
      <section id="gratuit" data-reveal className="py-20 md:py-28 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-12 transition-all duration-700 ${reveal("gratuit") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-300 text-sm font-medium mb-4 border border-white/20">
              Tarifs transparents
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Combien ça coûte ?
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              La recherche et la consultation des galeries sont <strong className="text-emerald-400">100% gratuites</strong>.
              Vous ne payez que si vous décidez d&apos;acheter les photos en haute définition.
              Les prix sont fixés par le photographe, pas par Focus Racer.
            </p>
          </div>

          <div className={`max-w-4xl mx-auto transition-all duration-700 ${reveal("gratuit") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Gratuit */}
              <div className="bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <h3 className="text-white font-semibold text-lg">Gratuit</h3>
                  <span className="ml-auto px-3 py-1 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold">0&euro;</span>
                </div>
                <ul className="space-y-4">
                  {[
                    "Recherche par dossard, nom ou selfie",
                    "Consultation des galeries d'événements",
                    "Mise en favoris des photos",
                    "Création de compte et profil",
                    "Rejoindre ou créer une Horde",
                    "Chat avec votre communauté",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/90 text-sm">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Calculateur de prix */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <h3 className="text-white font-semibold text-lg">Achat de photos</h3>
                  <span className="ml-auto px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-bold">prix photographe</span>
                </div>
                <p className="text-white/60 text-sm mb-6">
                  Exemples de prix constatés (variables selon le photographe) :
                </p>
                <div className="space-y-4">
                  {priceExamples.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ex.icon}</span>
                        <span className="text-white font-medium">{ex.label}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">{ex.price}&euro;</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-emerald-300 text-sm font-medium">Apple Pay, Google Pay, CB, SEPA acceptés</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SPORTS SUPPORTÉS ═══════════ */}
      <section data-reveal id="sports" className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-10 transition-all duration-700 ${reveal("sports") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tous les sports, une seule plateforme
            </h2>
            <p className="text-gray-600 text-lg">Focus Racer s&apos;adapte à toutes les disciplines sportives.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {sports.map((sport, i) => (
              <span
                key={i}
                className={`px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 cursor-default ${
                  reveal("sports") ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TÉMOIGNAGES ═══════════ */}
      <section data-reveal id="temoignages" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-700 ${reveal("temoignages") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Témoignages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils ont retrouvé leurs photos avec Focus Racer
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ SEO ═══════════ */}
      <section data-reveal id="faq" className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${reveal("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes des sportifs
            </h2>
            <p className="text-gray-600 text-lg">
              Tout ce que vous devez savoir pour retrouver et acheter vos photos de course.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className={`border border-gray-100 rounded-xl overflow-hidden bg-white transition-all duration-500 ${
                  reveal("faq") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
            Prêt à retrouver vos photos de course ?
          </h2>
          <p className="text-white/80 text-lg mb-4 max-w-2xl mx-auto">
            Recherche gratuite, résultat en quelques secondes. Dossard, selfie ou nom : notre IA vous retrouve
            parmi des milliers de photos. Rejoignez des milliers de sportifs qui utilisent déjà Focus Racer.
          </p>
          <p className="text-emerald-400 font-semibold text-lg mb-10 max-w-2xl mx-auto">
            100% gratuit pour chercher. Vous ne payez que si vous achetez.
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
  );
}
