"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const pipelineSteps = [
  {
    id: 1,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: "Upload en masse",
    desc: "Drag &amp; drop ou import dossier. Compression client-side parallèle, envoi par chunks de 25 photos.",
    metric: "25 photos/chunk",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
    ),
    title: "Pré-filtrage intelligent",
    desc: "Dédoublonnage par empreinte visuelle (pHash, distance de Hamming &le;5) et filtre des photos floues (variance de Laplacian).",
    metric: "Économie 15-20%",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 3,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "OCR dossards",
    desc: "Notre IA analyse chaque photo pour détecter et lire les numéros de dossard avec une précision de 99%.",
    metric: "99% précision",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: 4,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Reconnaissance faciale",
    desc: "Indexation des visages et matching cross-photo. Les photos orphelines sont automatiquement liées au bon sportif.",
    metric: "99% confiance",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: 5,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "Retouche automatique",
    desc: "Luminosité, contraste, saturation et netteté ajustés automatiquement via Sharp pour un rendu professionnel.",
    metric: "5 paramètres",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: 6,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48 0l.136.046m-9.924 2.961l.046.136a4.323 4.323 0 01-.096 3.358l-.046.092m0 0l-2.077 1.199" />
      </svg>
    ),
    title: "Smart Crop",
    desc: "Recadrage individuel par visage détecté (bounding box + padding généreux), export HD 800px en WebP.",
    metric: "800px HD",
    color: "from-cyan-500 to-teal-500",
  },
  {
    id: 7,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Watermark &amp; protection",
    desc: "Filigrane dynamique personnalisable, anti-hotlink, blocage clic droit, headers de sécurité et URLs signées.",
    metric: "6 couches",
    color: "from-red-500 to-red-600",
  },
  {
    id: 8,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 9.75c0 .746-.092 1.472-.262 2.168M3 9.75a8.959 8.959 0 00.262 2.168" />
      </svg>
    ),
    title: "Publication galerie",
    desc: "Galerie publique instantanée avec SEO automatique, pagination infinie et recherche par dossard, nom ou selfie.",
    metric: "Instantanée",
    color: "from-indigo-500 to-indigo-600",
  },
];

const ocrScenarios = [
  {
    label: "Dossard propre",
    desc: "Numéro bien visible, face caméra",
    difficulty: "Facile",
    confidence: 99,
    handled: true,
  },
  {
    label: "Dossard boueux",
    desc: "Boue, pluie, éclaboussures",
    difficulty: "Difficile",
    confidence: 88,
    handled: true,
  },
  {
    label: "Dossard plié",
    desc: "Froissé par le vent ou le mouvement",
    difficulty: "Difficile",
    confidence: 85,
    handled: true,
  },
  {
    label: "Partiellement caché",
    desc: "Bras, sac ou autre sportif devant",
    difficulty: "Très difficile",
    confidence: 78,
    handled: true,
  },
];

const serverSpecs = [
  { label: "Processeur", value: "AMD EPYC 4344P", detail: "16 cœurs / 32 threads" },
  { label: "Mémoire", value: "64 Go RAM", detail: "DDR5 haute fréquence" },
  { label: "Stockage", value: "2× NVMe 960 Go", detail: "Lecture séquentielle 7 Go/s" },
  { label: "Workers IA", value: "16 parallèles", detail: "Pipeline multi-threadé" },
  { label: "Cache Sharp", value: "2 Go dédiés", detail: "Traitement image accéléré" },
  { label: "Compression", value: "Brotli / zstd", detail: "15-20% plus léger que gzip" },
];

const rgpdItems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
    title: "Consentement explicite",
    desc: "Chaque traitement de données est soumis au consentement préalable de l'utilisateur.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: "Droit à l'effacement",
    desc: "Suppression complète des données sur demande, avec cascade sur toutes les relations.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    title: "Portabilité des données",
    desc: "Export de toutes vos données personnelles au format standard à tout moment.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    title: "Minimisation des données",
    desc: "Seules les données strictement nécessaires sont collectées et conservées.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Chiffrement bout en bout",
    desc: "Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256).",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Journal d'audit",
    desc: "Traçabilité complète de chaque action sur les données personnelles (GdprAuditLog).",
  },
];

const photoProtection = [
  { label: "Watermark dynamique", desc: "Filigrane personnalisable sur chaque photo publique" },
  { label: "Anti-hotlink", desc: "Blocage des accès sans Referer valide (Caddy + API)" },
  { label: "Blocage clic droit", desc: "Désactivation du menu contextuel sur les galeries" },
  { label: "Anti-screenshot CSS", desc: "user-select:none, -webkit-touch-callout:none" },
  { label: "Headers de sécurité", desc: "X-Frame-Options, CSP, noindex sur les médias" },
  { label: "URLs signées", desc: "Téléchargements HD via liens temporaires (24h)" },
];

const euFlag = (
  <svg className="w-12 h-12" viewBox="0 0 810 540" xmlns="http://www.w3.org/2000/svg">
    <rect width="810" height="540" fill="#003399" />
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const cx = 405 + 140 * Math.cos(angle);
      const cy = 270 + 140 * Math.sin(angle);
      return (
        <polygon
          key={i}
          points={[0, 1, 2, 3, 4]
            .map((j) => {
              const a = (j * 144 - 90) * (Math.PI / 180);
              return `${cx + 20 * Math.cos(a)},${cy + 20 * Math.sin(a)}`;
            })
            .join(" ")}
          fill="#FFCC00"
        />
      );
    })}
  </svg>
);

const frFlag = (
  <svg className="w-12 h-12" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="600" fill="#002395" />
    <rect x="300" width="300" height="600" fill="#FFFFFF" />
    <rect x="600" width="300" height="600" fill="#ED2939" />
  </svg>
);

const certifications: { label: string; desc: string; icon: React.ReactNode }[] = [
  { label: "RGPD", desc: "Union européenne", icon: euFlag },
  { label: "DMCA Ready", desc: "Protection droits d'auteur", icon: "🛡️" },
  { label: "PCI DSS", desc: "Via Stripe (niveau 1)", icon: "💳" },
  { label: "SSL/TLS", desc: "Certificat Let's Encrypt", icon: "🔐" },
  { label: "Made in France", desc: "Hébergé en France (OVH)", icon: frFlag },
];

const faqTech = [
  {
    q: "Comment fonctionne la détection des dossards sur des photos en mouvement ?",
    a: "Notre pipeline IA analyse l'image entière pour détecter les zones de texte, même sur des sujets en mouvement. La version web optimisée (1600px, JPEG) est utilisée pour l'analyse, ce qui permet un traitement rapide tout en conservant suffisamment de détails pour une détection précise. Le seuil de confiance est configurable (70% par défaut).",
  },
  {
    q: "Les données biométriques (visages) sont-elles stockées en clair ?",
    a: "Non. Les visages ne sont jamais stockés sous forme d'images. Notre IA extrait un vecteur mathématique (embedding) de chaque visage, qui est stocké dans une collection sécurisée. Ce vecteur ne permet pas de reconstituer le visage original. Les données sont supprimées sur demande RGPD.",
  },
  {
    q: "Quelle est la capacité de traitement maximale du serveur ?",
    a: "Avec 16 workers IA parallèles sur un processeur AMD EPYC 4344P (32 threads), le serveur traite 10 000 photos en environ 5 minutes (30ms par photo). Chaque photo passe par 4 étapes parallélisées (qualité + watermark + OCR + reconnaissance faciale). Le heap Node.js est configuré à 16 Go avec garbage collection exposé.",
  },
  {
    q: "Comment sont protégées les photos HD originales ?",
    a: "Les photos HD ne sont jamais exposées publiquement. Seules les versions watermarkées (1200px max) sont visibles dans les galeries. Après achat, le sportif reçoit un lien de téléchargement temporaire (URL signée S3, valable 24h). Les galeries sont également protégées par anti-hotlink, blocage clic droit et headers de sécurité.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function TechnologiePage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const pipelineInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
            const target = parseFloat(el.dataset.count || "0");
            const suffix = el.dataset.suffix || "";
            const prefix = el.dataset.prefix || "";
            const isDecimal = el.dataset.decimal === "true";
            const duration = 2000;
            const start = performance.now();
            function animate(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              const current = target * eased;
              if (isDecimal) {
                el.textContent = prefix + current.toFixed(1) + suffix;
              } else {
                el.textContent = prefix + Math.floor(current) + suffix;
              }
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

  // Pipeline step cycling
  useEffect(() => {
    pipelineInterval.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 3000);
    return () => {
      if (pipelineInterval.current) clearInterval(pipelineInterval.current);
    };
  }, []);

  const reveal = useCallback(
    (id: string) => visibleSections.has(id),
    [visibleSections]
  );

  return (
    <main className="bg-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-[#042F2E]">
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-center bg-cover bg-no-repeat opacity-50 pointer-events-none" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#10B981] rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#059669] rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(110,231,249,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,249,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              IA de pointe &amp; sécurité maximale
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              La technologie derrière{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Focus Racer
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Une infrastructure de pointe au service de la simplicité. Découvrez comment notre pipeline IA traite
              10 000 photos en 5 minutes, avec une précision de 99% et une conformité RGPD native.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ HERO STATS ═══════════ */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-bold" data-count="95" data-suffix="%">0</div>
              <div className="text-sm text-white/80 mt-1">Précision OCR</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">0.03s</div>
              <div className="text-sm text-white/80 mt-1">Par photo</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold" data-count="16" data-suffix=" c&oelig;urs">0</div>
              <div className="text-sm text-white/80 mt-1">Serveur dédié</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">RGPD</div>
              <div className="text-sm text-white/80 mt-1">100% conforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION PIPELINE ═══════════ */}
      <section id="pipeline" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("pipeline") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Pipeline IA
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Le pipeline IA en détail
            </h2>
            <p className="text-gray-600 text-lg">
              De l'upload à la publication, chaque photo traverse 8 étapes automatisées
              en seulement 30 millisecondes. 10 000 photos traitées en 5 minutes.
            </p>
          </div>

          {/* Active step spotlight */}
          <div className={`max-w-3xl mx-auto mb-12 transition-all duration-700 ${reveal("pipeline") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className={`relative bg-gradient-to-br ${pipelineSteps[activeStep].color} rounded-2xl p-8 text-white shadow-xl transition-all duration-500`}>
              <div className="absolute top-4 right-4 text-white/30 text-6xl font-bold">
                {String(pipelineSteps[activeStep].id).padStart(2, "0")}
              </div>
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  {pipelineSteps[activeStep].icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Étape {pipelineSteps[activeStep].id} — {pipelineSteps[activeStep].title}</h3>
                  <p className="text-white/90 leading-relaxed mb-3">{pipelineSteps[activeStep].desc}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                    {pipelineSteps[activeStep].metric}
                  </div>
                </div>
              </div>
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                {pipelineSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveStep(i);
                      if (pipelineInterval.current) clearInterval(pipelineInterval.current);
                      pipelineInterval.current = setInterval(() => {
                        setActiveStep((prev) => (prev + 1) % pipelineSteps.length);
                      }, 3000);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === activeStep ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Étape ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* All steps grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {pipelineSteps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(i);
                  if (pipelineInterval.current) clearInterval(pipelineInterval.current);
                  pipelineInterval.current = setInterval(() => {
                    setActiveStep((prev) => (prev + 1) % pipelineSteps.length);
                  }, 3000);
                }}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                  i === activeStep
                    ? "border-emerald-500 bg-emerald-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                } ${reveal("pipeline") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    i === activeStep ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {step.id}
                  </span>
                  <span className={`text-sm font-semibold ${i === activeStep ? "text-emerald-700" : "text-gray-700"}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{step.metric}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION OCR ═══════════ */}
      <section id="ocr" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("ocr") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              OCR avancé
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              OCR : lire les dossards par IA
            </h2>
            <p className="text-gray-600 text-lg">
              La reconnaissance optique de caractères (OCR) est le c&oelig;ur de Focus Racer. Notre IA déchiffre
              les numéros de dossard dans toutes les conditions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
            {/* Left: explanation */}
            <div className={`space-y-6 transition-all duration-700 ${reveal("ocr") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Comment ça fonctionne</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Chaque photo est analysée par <strong className="text-gray-900">notre moteur de vision par ordinateur</strong>,
                    un service d'intelligence artificielle de pointe. L'algorithme détecte toutes les zones de texte de l'image,
                    puis filtre celles qui correspondent à des numéros de dossard.
                  </p>
                  <p>
                    La version web optimisée (1600px, JPEG qualité 80) est utilisée pour l'analyse, ce qui permet
                    de rester sous la limite de 4 Mo d'AWS tout en conservant suffisamment de détails.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Les défis relevés</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Mouvement", desc: "Flou de vitesse, sportif en pleine foulée" },
                    { label: "Boue &amp; pluie", desc: "Dossard éclabousé ou détrempé" },
                    { label: "Plis &amp; froissures", desc: "Tissu plissé par le vent" },
                    { label: "Occlusion", desc: "Bras, sac ou autre sportif" },
                    { label: "Angles", desc: "Vue latérale ou de trois-quarts" },
                    { label: "Éclairage", desc: "Contre-jour, ombres, nuit" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-100">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Fallback intelligent</p>
                    <p className="text-sm text-emerald-700">
                      Quand l'OCR ne détecte aucun dossard, la reconnaissance faciale prend le relais.
                      L'IA croise le visage détecté avec ceux déjà indexés pour retrouver le sportif (confiance 99%).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: interactive widget */}
            <div className={`transition-all duration-700 delay-200 ${reveal("ocr") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Testez mentalement</h3>
                <p className="text-sm text-gray-500 mb-6">4 scénarios de difficulté croissante — Focus Racer gère tout.</p>

                <div className="space-y-4">
                  {ocrScenarios.map((scenario, i) => (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-500 ${
                        reveal("ocr") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                      style={{
                        transitionDelay: `${300 + i * 150}ms`,
                        borderColor: scenario.handled ? "#10b981" : "#ef4444",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">{scenario.label}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                            scenario.difficulty === "Facile"
                              ? "bg-green-500/10 text-green-400"
                              : scenario.difficulty === "Difficile"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/100/10 text-red-400"
                          }`}>
                            {scenario.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-bold text-emerald-600">Géré</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{scenario.desc}</p>
                      {/* Confidence bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: reveal("ocr") ? `${scenario.confidence}%` : "0%" }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-12 text-right">{scenario.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    Seuil de confiance configurable — 70% par défaut
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION FACES ═══════════ */}
      <section id="faces" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("faces") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium mb-4">
              Reconnaissance faciale
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Reconnaissance faciale
            </h2>
            <p className="text-gray-600 text-lg">
              Quand le dossard est invisible, le visage parle. Notre IA identifie chaque sportif
              grâce à la reconnaissance faciale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Indexation des visages",
                desc: "Chaque visage détecté est converti en un vecteur mathématique unique (embedding) et stocké dans une collection sécurisée. Ce processus est automatisé lors du traitement de chaque photo.",
                color: "bg-violet-500/10 text-violet-400",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                ),
                title: "Matching cross-photo",
                desc: "L'IA compare chaque nouveau visage avec l'ensemble de la collection. Si un même sportif apparaît sur plusieurs photos, elles sont automatiquement regroupées, même avec des angles ou éclairages différents.",
                color: "bg-indigo-500/10 text-indigo-400",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                ),
                title: "Liaison automatique",
                desc: "Les photos orphelines (sans dossard détecté) sont automatiquement liées au bon sportif si un visage correspondant est trouvé dans la collection (confiance 99%). Source tracée : « face_recognition ».",
                color: "bg-purple-500/10 text-purple-400",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
                  reveal("faces") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-6`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div className={`max-w-3xl mx-auto mt-12 transition-all duration-700 delay-300 ${reveal("faces") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="bg-violet-500/5 rounded-2xl p-6 border border-violet-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Vie privée protégée</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Les visages ne sont <strong>jamais stockés sous forme d'images</strong>. Seuls des vecteurs
                    mathématiques (embeddings) sont conservés, rendant toute reconstitution du visage impossible.
                    Ces données sont supprimées intégralement sur demande RGPD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION INFRASTRUCTURE ═══════════ */}
      <section id="infrastructure" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("infrastructure") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Infrastructure
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Infrastructure serveur
            </h2>
            <p className="text-gray-600 text-lg">
              Un serveur dédié OVH hébergé en France, dimensionné pour traiter
              plus de 10 000 photos en quelques minutes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Server specs */}
            <div className={`transition-all duration-700 ${reveal("infrastructure") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="bg-gradient-to-br from-[#042F2E] to-[#115E59] rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Serveur dédié OVH</h3>
                    <p className="text-sm text-white/60">Hébergé en France (Roubaix)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {serverSpecs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                      <div>
                        <span className="text-sm text-white/60">{spec.label}</span>
                        <p className="font-semibold">{spec.value}</p>
                      </div>
                      <span className="text-xs text-white/40 text-right max-w-[140px]">{spec.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance metrics */}
            <div className={`space-y-6 transition-all duration-700 delay-200 ${reveal("infrastructure") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performances mesurées</h3>

              {/* Speed comparison */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Comparaison de vitesse</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Focus Racer (16 workers)</span>
                      <span className="text-sm font-bold text-emerald-600">~30 sec</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: "8%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Solution cloud standard</span>
                      <span className="text-sm font-bold text-amber-400">~15 min</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Tri manuel</span>
                      <span className="text-sm font-bold text-red-400">~4 heures</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">Base : 1 000 photos, tri + indexation + watermark</p>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200 text-center shadow-sm">
                  <div className="text-3xl font-bold text-gray-900" data-count="30" data-suffix="ms">0</div>
                  <p className="text-sm text-gray-500 mt-1">Traitement par photo</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 text-center shadow-sm">
                  <div className="text-3xl font-bold text-gray-900" data-count="10000" data-suffix=" photos">0</div>
                  <p className="text-sm text-gray-500 mt-1">En ~5 minutes</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 text-center shadow-sm">
                  <div className="text-3xl font-bold text-gray-900">&lt; 1s</div>
                  <p className="text-sm text-gray-500 mt-1">Chargement page</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 text-center shadow-sm">
                  <div className="text-3xl font-bold text-gray-900">99,9%</div>
                  <p className="text-sm text-gray-500 mt-1">Disponibilité</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION SECURITE ═══════════ */}
      <section id="securite" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-4">
              Sécurité
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sécurité &amp; protection des données
            </h2>
            <p className="text-gray-600 text-lg">
              La protection de vos données et de vos photos n'est pas une option. C'est le fondement de notre plateforme.
            </p>
          </div>

          {/* RGPD Grid */}
          <div className="max-w-6xl mx-auto mb-16">
            <h3 className={`text-xl font-bold text-gray-900 mb-6 transition-all duration-700 ${reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              Conformité RGPD
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rgpdItems.map((item, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 ${
                    reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo protection */}
          <div className="max-w-6xl mx-auto mb-16">
            <h3 className={`text-xl font-bold text-gray-900 mb-6 transition-all duration-700 delay-200 ${reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              Protection des photos (6 couches)
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photoProtection.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 bg-gray-50 rounded-xl p-5 border border-gray-100 transition-all duration-500 ${
                    reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${200 + i * 80}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.label}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data security */}
          <div className={`max-w-4xl mx-auto transition-all duration-700 delay-400 ${reveal("securite") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Sécurité des données</h3>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "S3 chiffré (AES-256)", desc: "Stockage au repos chiffré côté serveur" },
                  { label: "HTTPS partout", desc: "TLS 1.3 avec certificat Let's Encrypt auto-renouvelé" },
                  { label: "Rate limiting", desc: "Sliding window in-memory : 60 req/min événements, 30 req/min recherche" },
                  { label: "Validation Zod", desc: "Chaque entrée API est validée côté serveur avec Zod" },
                  { label: "Protection XSS", desc: "React escape natif + Content Security Policy" },
                  { label: "Protection CSRF", desc: "NextAuth.js avec tokens CSRF intégrés" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION CERTIFICATIONS ═══════════ */}
      <section id="certifications" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${reveal("certifications") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Conformité
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Conformité &amp; certifications
            </h2>
            <p className="text-gray-600 text-lg">
              Des standards de sécurité et de conformité reconnus internationalement.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {certifications.map((cert, i) => (
              <div
                key={cert.label}
                className={`flex flex-col items-center gap-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
                  reveal("certifications") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {typeof cert.icon === "string" ? (
                  <span className="text-4xl">{cert.icon}</span>
                ) : (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm">{cert.icon}</div>
                )}
                <h3 className="font-bold text-gray-900 text-sm">{cert.label}</h3>
                <p className="text-xs text-gray-500 text-center">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ TECHNIQUE ═══════════ */}
      <section id="faq-tech" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${reveal("faq-tech") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions techniques
            </h2>
            <p className="text-gray-600 text-lg">
              Les réponses aux questions les plus posées par nos utilisateurs techniques.
            </p>
          </div>

          <div className={`max-w-3xl mx-auto transition-all duration-700 ${reveal("faq-tech") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
              {faqTech.map((item, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center justify-between w-full py-5 text-left group"
                  >
                    <span className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors pr-4">
                      {item.q}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${openFaq === i ? "max-h-96 pb-5" : "max-h-0"}`}>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Prêt à essayer la puissance de l'IA ?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Créez votre compte gratuitement et découvrez comment Focus Racer peut transformer
            la gestion de vos photos sportives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                Créer un compte gratuit
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                Voir les tarifs
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
