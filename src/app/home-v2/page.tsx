"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { UploadCloud, ScanSearch, Image as ImageIcon, Badge, ScanFace, Zap, Palette, CreditCard, Users, Sparkles, ArrowRight } from "lucide-react";
import "./homev2.css";

const solutionsMenu = [
  {
    title: "Sportifs",
    desc: "Retrouvez vos photos en un clic",
    href: "/solutions/sportifs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "Photographes",
    desc: "Automatisez le tri et la vente",
    href: "/solutions/photographes",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
  },
  {
    title: "Organisateurs",
    desc: "Couverture photo clé en main",
    href: "/solutions/organisateurs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
      </svg>
    ),
  },
];

const footerLinks = {
  solutions: {
    title: "Solutions",
    links: [
      { href: "/solutions/sportifs", label: "Pour les sportifs" },
      { href: "/solutions/photographes", label: "Pour les photographes" },
      { href: "/solutions/organisateurs", label: "Pour les organisateurs" },
      { href: "/pricing", label: "Tarifs" },
      { href: "/explore", label: "Trouver mes photos" },
    ],
  },
  decouvrir: {
    title: "Découvrir",
    links: [
      { href: "/about", label: "À propos" },
      { href: "/blog", label: "Blog" },
      { href: "/technologie", label: "Technologie" },
      { href: "/partenaires", label: "Partenaires" },
    ],
  },
  legal: {
    title: "Légal",
    links: [
      { href: "/legal", label: "Mentions légales" },
      { href: "/legal/cgu", label: "CGU" },
      { href: "/legal/confidentialite", label: "Politique de confidentialité" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/gdpr", label: "RGPD" },
    ],
  },
};

const SocialIcons = () => (
  <>
    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </a>
    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
    </a>
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    </a>
  </>
);

export default function HomeV2() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [activeAudience, setActiveAudience] = useState<"sportifs" | "photographes" | "organisateurs">("sportifs");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const slotWords = ["marathon", "trail", "triathlon", "cyclisme", "natation", "ski", "running", "duathlon", "canicross", "obstacle", "swimrun", "motocross", "aviron", "rallye", "ironman", "équitation", "kayak", "escalade", "rugby", "football", "handball", "voile", "CrossFit", "paddle", "biathlon", "enduro", "karting", "surf", "boxe", "judo", "athlétisme"];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % slotWords.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection for header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".hv2 .reveal, .hv2 .reveal-left, .hv2 .reveal-right");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>(".hv2 .stat-number[data-target]");
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.target || "0");
            const suffix = el.dataset.suffix || "";
            const duration = 2000;
            const start = performance.now();
            function formatNum(n: number): string {
              if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
              if (n >= 1000) return (n / 1000).toFixed(0) + "K";
              return n.toString();
            }
            function animate(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(target * eased);
              el.textContent = formatNum(current) + suffix;
              if (progress < 1) requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
    return () => counterObserver.disconnect();
  }, []);

  const [pipelineStep, setPipelineStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleFaqToggle = useCallback((index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  }, []);

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isPro = ["PHOTOGRAPHER", "ORGANIZER", "AGENCY", "CLUB", "FEDERATION"].includes(role || "");
  const dashboardHref = isAdmin
    ? "/focus-mgr-7k9x/dashboard"
    : isPro
    ? "/photographer/dashboard"
    : "/sportif/dashboard";

  const faqItems = [
    {
      question: "Comment retrouver mes photos de course ?",
      answer: "Rendez-vous sur Focus Racer, sélectionnez votre événement et entrez votre numéro de dossard. Vous pouvez aussi utiliser un selfie pour retrouver vos photos grâce à la reconnaissance faciale. Le processus prend moins d'une seconde.",
    },
    {
      question: "Quels types d'événements sont couverts ?",
      answer: "Focus Racer couvre les marathons, trails, triathlons, courses à pied, courses cyclistes, et tout événement sportif avec dossard ou identification visuelle. Notre technologie s'adapte à toutes les disciplines.",
    },
    {
      question: "Comment fonctionne la reconnaissance de dossard ?",
      answer: "Notre intelligence artificielle analyse automatiquement chaque photo uploadée pour détecter et lire les numéros de dossard grâce à un moteur OCR avancé. Le processus est entièrement automatique : 30 millisecondes par photo, soit 10 000 photos traitées en 5 minutes. Fonctionne même avec des images floues ou en mouvement.",
    },
    {
      question: "Je suis photographe, comment vendre mes photos ?",
      answer: "Créez un compte photographe gratuitement, uploadez vos photos et notre IA les trie automatiquement par dossard et visage. Les sportifs retrouvent et achètent leurs photos directement sur la plateforme. Vous recevez vos revenus via paiement sécurisé Stripe.",
    },
    {
      question: "Peut-on retrouver ses photos sans numéro de dossard ?",
      answer: "Absolument ! Grâce à la reconnaissance faciale, prenez simplement un selfie et notre IA retrouvera toutes les photos où vous apparaissez, même sans dossard visible. C'est idéal pour les arrivées, départs et photos de groupe.",
    },
  ];

  const events = [
    "Marathon de Paris", "Trail des Templiers", "Ironman Nice", "Semi de Bordeaux",
    "UTMB", "Triathlon de Mimizan", "Trail du Mont-Blanc", "Marathon Vert Rennes",
    "L'Échappée Belle", "SaintéLyon",
  ];

  return (
    <div className="hv2">
      {/* ═══════════ DARK HEADER ═══════════ */}
      <header className={`hv2-header${scrolled ? " scrolled" : ""}`}>
        <div className="hv2-header-inner">
          <Link href="/">
            <Image
              src="/logo-focus-racer-white.png"
              alt="Focus Racer"
              width={160}
              height={90}
              className="hv2-header-logo"
              priority
            />
          </Link>

          <nav className="hv2-header-nav">
            <Link href="/explore" className="hv2-header-link">Trouver mes photos</Link>
            <Link href="/pricing" className="hv2-header-link">Tarifs</Link>

            <div ref={dropdownRef} className="hv2-solutions-wrap">
              <button
                onMouseEnter={() => setSolutionsOpen(true)}
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                className={`hv2-solutions-btn${solutionsOpen ? " open" : ""}`}
              >
                Solutions
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {solutionsOpen && (
                <div className="hv2-solutions-dropdown" onMouseLeave={() => setSolutionsOpen(false)}>
                  <div>
                    {solutionsMenu.map((item) => (
                      <Link key={item.href} href={item.href} className="hv2-solutions-item">
                        <span className="hv2-solutions-item-icon">{item.icon}</span>
                        <div>
                          <div className="hv2-solutions-item-title">{item.title}</div>
                          <div className="hv2-solutions-item-desc">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="hv2-solutions-cta">
                    <div className="hv2-solutions-cta-title">Essai gratuit</div>
                    <div className="hv2-solutions-cta-desc">Créez votre compte et uploadez vos premières photos.</div>
                    <Link href="/register">
                      <button className="hv2-solutions-cta-btn">Commencer</button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="hv2-header-actions">
            {session ? (
              <>
                {isAdmin && (
                  <Link href="/photographer/dashboard" className="hv2-btn-ghost">Espace Pro</Link>
                )}
                <Link href={dashboardHref} className="hv2-btn-accent">
                  {isAdmin ? "Admin" : "Mon espace"}
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="hv2-btn-ghost">Créer un compte</Link>
                <Link href="/login" className="hv2-btn-accent">Mon espace</Link>
              </>
            )}
          </div>

          <button
            className={`hv2-mobile-toggle${mobileOpen ? " open" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`hv2-mobile-menu${mobileOpen ? " open" : ""}`}>
          <Link href="/explore" className="hv2-mobile-link" onClick={() => setMobileOpen(false)}>Trouver mes photos</Link>
          <Link href="/pricing" className="hv2-mobile-link" onClick={() => setMobileOpen(false)}>Tarifs</Link>
          <button
            className="hv2-mobile-link"
            onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            Solutions
            <svg style={{ width: 14, height: 14, transition: "transform 0.2s", transform: mobileSolutionsOpen ? "rotate(180deg)" : "none" }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {mobileSolutionsOpen && (
            <div className="hv2-mobile-solutions">
              {solutionsMenu.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  <span className="hv2-solutions-item-icon">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </div>
          )}
          <hr className="hv2-mobile-divider" />
          <div className="hv2-mobile-actions">
            {session ? (
              <Link href={dashboardHref} className="hv2-btn-accent" onClick={() => setMobileOpen(false)}>
                {isAdmin ? "Admin" : "Mon espace"}
              </Link>
            ) : (
              <>
                <Link href="/register" className="hv2-btn-ghost" onClick={() => setMobileOpen(false)}>Créer un compte</Link>
                <Link href="/login" className="hv2-btn-accent" onClick={() => setMobileOpen(false)}>Mon espace</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        <div className="hero-bg-image"></div>
        <div className="hero-grid"></div>
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot">⚡</span>
              Propulsé par l&apos;Intelligence Artificielle
            </div>
            <h1>
              Retrouvez vos photos de
              <span className="line-accent">
                <span className="rotating-word">{slotWords[currentWordIndex]}</span>
              </span>
              en un clic.
            </h1>
            <p className="hero-description">
              Notre IA détecte automatiquement votre dossard et votre visage pour retrouver toutes vos photos
              d&apos;événement instantanément. Gratuit pour les sportifs.
            </p>
            <div className="hero-ctas">
              <Link href="/explore">
                <button className="btn-primary">Trouver mes photos</button>
              </Link>
              <Link href="/register">
                <button className="btn-secondary">Espace photographe</button>
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-float-cards">
              <div className="hero-float-card card-1">
                <div className="float-icon green">✅</div>
                <div>
                  <div className="float-label">Dossard détecté</div>
                  <div className="float-value">#1247 — 0.03s</div>
                </div>
              </div>
              <div className="hero-float-card card-2">
                <div className="float-icon purple">🎯</div>
                <div>
                  <div className="float-label">Reconnaissance faciale</div>
                  <div className="float-value">Confiance 99.7%</div>
                </div>
              </div>
            </div>

            <div className="hero-mockup">
              <div className="hero-pipeline">
                <div className="pipeline-header">
                  <span className="pipeline-dot"></span>
                  <span className="pipeline-title">Traitement IA en direct</span>
                </div>
                <div className="pipeline-steps">
                  {[
                    { icon: "📸", label: "Upload", detail: "2 847 photos reçues" },
                    { icon: "🔍", label: "Détection OCR", detail: "Dossards identifiés" },
                    { icon: "🧠", label: "Reconnaissance", detail: "Visages indexés" },
                    { icon: "✨", label: "Livraison", detail: "Triées et prêtes" },
                  ].map((step, i) => (
                    <div key={i} className={`pipeline-step${pipelineStep === i ? " active" : ""}${pipelineStep > i ? " done" : ""}`}>
                      <div className="pipeline-step-icon">{pipelineStep > i ? "✅" : step.icon}</div>
                      <div className="pipeline-step-info">
                        <div className="pipeline-step-label">{step.label}</div>
                        <div className="pipeline-step-detail">{step.detail}</div>
                      </div>
                      {pipelineStep === i && <div className="pipeline-pulse"></div>}
                    </div>
                  ))}
                </div>
                <div className="pipeline-bar">
                  <div className="pipeline-bar-fill" style={{ width: `${((pipelineStep + 1) / 4) * 100}%` }}></div>
                </div>
                <div className="pipeline-stats">
                  <div className="pipeline-stat">
                    <span className="pipeline-stat-value">0.03s</span>
                    <span className="pipeline-stat-label">par photo</span>
                  </div>
                  <div className="pipeline-stat">
                    <span className="pipeline-stat-value">99%</span>
                    <span className="pipeline-stat-label">précision</span>
                  </div>
                  <div className="pipeline-stat">
                    <span className="pipeline-stat-value">24/7</span>
                    <span className="pipeline-stat-label">disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF ═══════════ */}
      <div className="social-proof-bar">
        <div className="social-proof-inner">
          <span className="social-proof-label">Événements couverts</span>
          <div className="logos-track-wrapper">
            <div className="logos-track">
              {[...events, ...events].map((name, i) => (
                <span key={i} className="logo-item">
                  <span className="logo-dot"></span>{name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card reveal stagger-1">
            <div className="stat-number" data-target="500000" data-suffix="+">0</div>
            <div className="stat-label">Photos traitées</div>
          </div>
          <div className="stat-card reveal stagger-2">
            <div className="stat-number" data-target="200" data-suffix="+">0</div>
            <div className="stat-label">Événements couverts</div>
          </div>
          <div className="stat-card reveal stagger-3">
            <div className="stat-number" data-target="50" data-suffix="+">0</div>
            <div className="stat-label">Photographes actifs</div>
          </div>
          <div className="stat-card reveal stagger-4">
            <div className="stat-number" data-target="99" data-suffix="%">0</div>
            <div className="stat-label">Taux de détection IA</div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="section how-section">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            Comment ça marche
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Trois étapes, zéro effort</h2>
          <p className="section-subtitle">
            De l&apos;upload à la livraison, notre intelligence artificielle s&apos;occupe de tout.
          </p>
        </div>
        <div className="steps-grid">
          {[
            {
              number: '01',
              icon: <UploadCloud size={32} strokeWidth={1.8} />,
              title: 'Upload des photos',
              description: "Le photographe téléverse ses photos sur la plateforme. Upload en masse ou en temps réel pendant l'événement grâce au mode Live.",
              badge: 'Batch ou Live',
              iconClass: 'fi-cyan',
            },
            {
              number: '02',
              icon: <ScanSearch size={32} strokeWidth={1.8} />,
              title: 'Analyse IA automatique',
              description: "Notre intelligence artificielle détecte les numéros de dossard et les visages en 30 millisecondes par photo. 10 000 photos triées en 5 minutes.",
              badge: '30 ms / photo',
              iconClass: 'fi-purple',
            },
            {
              number: '03',
              icon: <ImageIcon size={32} strokeWidth={1.8} />,
              title: 'Retrouvez vos photos',
              description: "Recherchez par dossard, selfie ou nom. Achetez vos photos préférées en un clic avec paiement sécurisé Stripe.",
              badge: 'Recherche + achat instantané',
              iconClass: 'fi-green',
            },
          ].map((step, i) => (
            <div key={step.number} className={`step-card reveal stagger-${i + 1}`}>
              <div className="step-number">{step.number}</div>
              <div className={`step-icon-wrap ${step.iconClass}`}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="step-badge">{step.badge}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="section">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Fonctionnalités
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Tout ce dont vous avez besoin</h2>
          <p className="section-subtitle">
            Une plateforme complète pour les sportifs, photographes et organisateurs d&apos;événements sportifs.
          </p>
        </div>
        <div className="features-grid">
          {[
            {
              icon: <Badge size={26} strokeWidth={1.8} />,
              title: 'Recherche par dossard',
              description: "Entrez simplement votre numéro de dossard et retrouvez toutes vos photos en un instant. Détection IA précise à 99%.",
              iconClass: 'fi-cyan',
              tag: 'Rapide',
            },
            {
              icon: <ScanFace size={26} strokeWidth={1.8} />,
              title: 'Reconnaissance faciale',
              description: "Prenez un selfie et notre IA retrouve toutes les photos où vous apparaissez, même sans dossard visible.",
              iconClass: 'fi-purple',
              tag: 'Précise',
            },
            {
              icon: <Zap size={26} strokeWidth={1.8} />,
              title: 'Mode Live',
              description: "Upload en temps réel pendant la course avec détection instantanée pour retrouver ses photos avant même l'arrivée.",
              iconClass: 'fi-amber',
              tag: 'Temps réel',
            },
            {
              icon: <Palette size={26} strokeWidth={1.8} />,
              title: 'Galeries personnalisées',
              description: "Chaque événement dispose de sa galerie avec le branding de l'organisateur. Un espace dédié pour chaque course.",
              iconClass: 'fi-rose',
              tag: 'Branding',
            },
            {
              icon: <CreditCard size={26} strokeWidth={1.8} />,
              title: 'Paiement sécurisé',
              description: "Achetez vos photos en toute sécurité via Stripe. Paiement instantané et téléchargement immédiat en haute résolution.",
              iconClass: 'fi-green',
              tag: 'Stripe',
            },
            {
              icon: <Users size={26} strokeWidth={1.8} />,
              title: 'Marketplace',
              description: "Connectez photographes et organisateurs. Trouvez le bon partenaire pour votre événement ou proposez vos services.",
              iconClass: 'fi-teal',
              tag: 'Collaboration',
            },
          ].map((feature, i) => (
            <div key={feature.title} className={`feature-card reveal stagger-${i + 1}`}>
              <div className="feature-card-header">
                <div className={`feature-icon-wrap ${feature.iconClass}`}>{feature.icon}</div>
                <span className="feature-tag">{feature.tag}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-link">
                <span>Découvrir</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ AUDIENCE ═══════════ */}
      <section className="section audience-section">
        <div className="audience-hero reveal">
          <span className="audience-eyebrow"><span className="aud-dot"></span> Pour qui ?</span>
          <h2>Une plateforme, trois publics</h2>
          <p>
            Que vous soyez sportif, photographe ou organisateur, Focus Racer s&apos;adapte à vos besoins
            avec une expérience dédiée, lisible et pensée pour convertir.
          </p>
        </div>

        <div className="aud-mobile-select-wrap">
          <select
            className="aud-mobile-select"
            value={activeAudience}
            onChange={(e) => setActiveAudience(e.target.value as typeof activeAudience)}
            aria-label="Choisir un profil"
          >
            <option value="sportifs">Sportifs</option>
            <option value="photographes">Photographes</option>
            <option value="organisateurs">Organisateurs</option>
          </select>
        </div>

        <div className="aud-layout">
          <aside className="aud-cards-panel" aria-label="Choix du profil">
            {([
              { key: "sportifs" as const, icon: "🏃", tag: "Instantané", title: "Sportifs", desc: "Retrouvez immédiatement vos photos par dossard, nom ou selfie, sans fouiller parmi des milliers d\u2019images." },
              { key: "photographes" as const, icon: "📷", tag: "Monétisation", title: "Photographes", desc: "Automatisez le tri, l\u2019identification et la vente pour vous concentrer sur la prise de vue et vos revenus." },
              { key: "organisateurs" as const, icon: "🏁", tag: "Expérience", title: "Organisateurs", desc: "Proposez un service photo premium à votre événement avec galerie de marque, diffusion et conformité." },
            ]).map((card) => (
              <button
                key={card.key}
                className={`aud-card ${card.key}${activeAudience === card.key ? " active" : ""}`}
                data-key={card.key}
                type="button"
                onClick={() => setActiveAudience(card.key)}
              >
                <div className="aud-card-top">
                  <div className="aud-icon-badge">{card.icon}</div>
                  <span className="aud-mini-tag">{card.tag}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </button>
            ))}
          </aside>

          {(() => {
            const audienceData = {
              sportifs: {
                theme: "aud-sport-theme",
                pill: "🏃 Espace sportifs",
                title: "Retrouvez vos souvenirs instantanément",
                description: "Fini les heures passées à chercher vos photos parmi des milliers de clichés. Focus Racer vous les livre instantanément, triées et identifiées.",
                checks: ["Recherche par dossard, nom ou selfie", "Résultats en moins d\u2019une seconde", "Photos haute résolution téléchargeables", "Expérience ultra simple sur mobile"],
                cta: "Voir mes photos \u2192",
                ctaHref: "/explore",
                subnote: "Accès ultra-rapide, même pendant l\u2019événement.",
              },
              photographes: {
                theme: "aud-photo-theme",
                pill: "📷 Espace photographes",
                title: "Vendez vos photos automatiquement",
                description: "Concentrez-vous sur votre art. Notre IA trie, indexe et identifie chaque participant sur vos photos. Vous n\u2019avez plus qu\u2019à encaisser.",
                checks: ["Tri automatique par dossard et visage", "Upload en masse ou en temps réel", "Paiement direct sur votre compte Stripe", "Dashboard de suivi des ventes"],
                cta: "Espace photographe \u2192",
                ctaHref: "/login",
                subnote: "Workflow pensé pour la vitesse et la monétisation.",
              },
              organisateurs: {
                theme: "aud-orga-theme",
                pill: "🏁 Espace organisateurs",
                title: "Offrez une expérience photo mémorable",
                description: "Boostez la satisfaction de vos participants avec un service photo intégré à votre événement. Trouvez des photographes via notre marketplace.",
                checks: ["Galerie aux couleurs de votre événement", "Marketplace de photographes qualifiés", "Diffusion SMS, email et QR code", "Conformité RGPD et droit à l\u2019image"],
                cta: "Créer un compte Pro \u2192",
                ctaHref: "/register",
                subnote: "Un service photo premium prêt à déployer.",
              },
            };
            const content = audienceData[activeAudience];
            return (
              <section className={`aud-content-panel ${content.theme}`}>
                <div className="aud-content-glow"></div>
                <div className="aud-content-copy">
                  <div className="aud-content-head">
                    <span className="aud-content-pill">{content.pill}</span>
                  </div>
                  <h3 className="aud-content-title">{content.title}</h3>
                  <p className="aud-content-description">{content.description}</p>
                  <ul className="aud-checks">
                    {content.checks.map((item, i) => (
                      <li key={i}><span className="aud-checkmark">✓</span><span>{item}</span></li>
                    ))}
                  </ul>
                  <div className="aud-cta-row">
                    <Link href={content.ctaHref} className="aud-cta">{content.cta}</Link>
                    <span className="aud-subnote">{content.subnote}</span>
                  </div>
                </div>
              </section>
            );
          })()}
        </div>
      </section>

      {/* ═══════════ TECH / AI ═══════════ */}
      <section className="section tech-section">
        <div className="tech-hero reveal">
          <span className="tech-eyebrow"><span className="tech-dot"></span> Technologie</span>
          <h2>IA &amp; analyse d&apos;image de pointe</h2>
          <p>
            Notre moteur d&apos;intelligence artificielle combine plusieurs algorithmes de détection
            pour identifier chaque sportif avec une précision remarquable, quelle que soit la discipline.
          </p>
        </div>

        <div className="tech-layout">
          {/* Left: Visual panel */}
          <div className="tech-visual-panel">
            <div className="tech-visual-grid">
              <div className="tech-topbar">
                <span className="tech-surface-pill">Vision engine · OCR + Face match + Live</span>
                <span className="tech-surface-pill tech-status-live">● Analyse en direct</span>
              </div>

              <div className="tech-mock-stage">
                <Image
                  src="/tech-runner.png"
                  alt="Trailer ultra trail avec dossard #312"
                  fill
                  className="tech-runner-img"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="tech-chip tech-chip-ocr">
                  <span className="tech-signal tech-tone-cyan"></span>
                  <div><span>OCR détecté</span><small>#312 — Ultra Trail</small></div>
                </div>
                <div className="tech-chip tech-chip-face">
                  <span className="tech-signal tech-tone-violet"></span>
                  <div><span>Face match</span><small>Confiance 99.2%</small></div>
                </div>
                <div className="tech-chip tech-chip-live">
                  <span className="tech-signal tech-tone-indigo"></span>
                  <div><span>Temps réel</span><small>0.03s par photo</small></div>
                </div>
                <div className="tech-chip tech-chip-gdpr">
                  <span className="tech-signal tech-tone-emerald"></span>
                  <div><span>RGPD conforme</span><small>Données encadrées</small></div>
                </div>
              </div>

              <div className="tech-analytics">
                {[
                  { label: "Détection", value: "Multi-modèle", desc: "OCR, visage et contexte combinés dans un même moteur d\u2019analyse." },
                  { label: "Traitement", value: "Live", desc: "Résultats quasi instantanés pendant l\u2019événement." },
                  { label: "Protection", value: "RGPD", desc: "Cadre conforme pour les données personnelles et le droit à l\u2019image." },
                ].map((s, i) => (
                  <div key={i} className="tech-stat-card">
                    <div className="tech-stat-label">{s.label}</div>
                    <div className="tech-stat-value">{s.value}</div>
                    <div className="tech-stat-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Features panel */}
          <div className="tech-features-panel">
            <div className="tech-features-shell">
              <div className="tech-lead-card">
                <h3>Un moteur pensé pour la précision, la vitesse et la confiance</h3>
                <p>
                  Chaque brique technologique joue un rôle précis dans l&apos;expérience : identifier plus vite,
                  mieux regrouper, diffuser en direct et protéger les données personnelles.
                </p>
              </div>

              <div className="tech-mini-highlights">
                <span><i className="tech-highlight-dot"></i> Détection robuste</span>
                <span><i className="tech-highlight-dot"></i> Infrastructure cloud</span>
                <span><i className="tech-highlight-dot"></i> Expérience instantanée</span>
              </div>

              <div className="tech-features-grid">
                {[
                  { cls: "ocr", icon: "🔢", title: "Lecture OCR de dossard", desc: "Détection et lecture automatique des numéros, même sur des photos floues, éloignées ou en mouvement.", tag: "Numéros reconnus automatiquement" },
                  { cls: "face", icon: "👤", title: "Reconnaissance faciale", desc: "Regroupement intelligent des photos par visage à partir d\u2019un simple selfie de référence.", tag: "Correspondance photo par photo" },
                  { cls: "live", icon: "⏱️", title: "Traitement temps réel", desc: "Analyse instantanée pendant l\u2019événement grâce à notre infrastructure cloud haute performance.", tag: "Pipeline optimisé pour le live" },
                  { cls: "gdpr", icon: "🔒", title: "RGPD & droit à l\u2019image", desc: "Conformité totale avec la réglementation européenne sur les données personnelles et l\u2019usage des images.", tag: "Cadre légal intégré au produit" },
                ].map((f) => (
                  <div key={f.cls} className={`tech-fcard tech-fcard-${f.cls}`}>
                    <div className="tech-fcard-icon">{f.icon}</div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                    <span className="tech-fcard-tag">{f.tag}</span>
                  </div>
                ))}
              </div>

              <div className="tech-footer-note">
                Focus Racer s&apos;appuie sur un algorithme développé en interne, optimisé pour les images de sport, capable de traiter
                10 000+ photos en quelques minutes avec une précision de 99%.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="section">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            Témoignages
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Ils nous font confiance</h2>
          <p className="section-subtitle">Sportifs, photographes et organisateurs partagent leur expérience avec Focus Racer.</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card reveal stagger-1">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">&quot;J&apos;ai retrouvé toutes mes photos du marathon en moins de 30 secondes. L&apos;interface est intuitive et le résultat bluffant. Je recommande à tous les sportifs !&quot;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">SM</div>
              <div><div className="testimonial-name">Sophie M.</div><div className="testimonial-role">Marathonienne — Paris</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal stagger-2">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">&quot;Le tri automatique par dossard me fait gagner des heures de travail après chaque course. Plus besoin de trier manuellement des milliers de photos.&quot;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">TL</div>
              <div><div className="testimonial-name">Thomas L.</div><div className="testimonial-role">Photographe sportif</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal stagger-3">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">&quot;La marketplace nous a permis de trouver facilement des photographes qualifiés pour notre trail. La galerie personnalisée est un vrai plus pour notre image.&quot;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">CD</div>
              <div><div className="testimonial-name">Claire D.</div><div className="testimonial-role">Organisatrice d&apos;événements</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="section faq-section">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>FAQ<span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Questions fréquentes</h2>
          <p className="section-subtitle">Tout ce que vous devez savoir sur Focus Racer.</p>
        </div>
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div key={index} className={`faq-item${openFaqIndex === index ? " open" : ""}`}>
              <button className="faq-question" onClick={() => handleFaqToggle(index)}>
                {item.question}
                <span className="faq-chevron">▼</span>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="cta-section">
        <div className="cta-content reveal">
          <h2>Prêt à retrouver vos photos ?</h2>
          <p>Rejoignez des milliers de sportifs et photographes qui utilisent Focus Racer pour retrouver, partager et vendre leurs photos d&apos;événements sportifs.</p>
          <div className="cta-btns">
            <Link href="/explore"><button className="btn-primary">Rechercher mes photos</button></Link>
            <Link href="/register"><button className="btn-secondary">Créer un compte</button></Link>
          </div>
        </div>
      </section>

      {/* ═══════════ DARK FOOTER ═══════════ */}
      <footer className="hv2-footer">
        <div className="hv2-footer-inner">
          <div className="hv2-footer-grid">
            <div className="hv2-footer-brand">
              <Image
                src="/logo-focus-racer-white.png"
                alt="Focus Racer"
                width={160}
                height={90}
                style={{ height: 40, width: "auto" }}
              />
              <p className="hv2-footer-brand-desc">
                La plateforme de référence pour retrouver et acheter vos photos de courses sportives.
              </p>
              <div className="hv2-footer-socials">
                <SocialIcons />
              </div>
            </div>

            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <div className="hv2-footer-col-title">{section.title}</div>
                <ul className="hv2-footer-links">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="hv2-footer-bottom">
            <p className="hv2-footer-copy">
              © {new Date().getFullYear()} Focus Racer. Tous droits réservés.
            </p>
            <div className="hv2-footer-bottom-socials">
              <SocialIcons />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
