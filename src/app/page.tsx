"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import "./homepage.css";

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<"dossard" | "selfie" | "nom">("dossard");
  const [activeAudienceTab, setActiveAudienceTab] = useState<"runners" | "photographers" | "organizers">("runners");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll reveal with IntersectionObserver
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>(".stat-number[data-target]");
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

  // Typing animation in search input
  useEffect(() => {
    const dossardNumber = "1247";
    let charIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let active = true;

    function typeNumber() {
      if (!active) return;
      if (charIndex <= dossardNumber.length) {
        setSearchInputValue(dossardNumber.slice(0, charIndex));
        charIndex++;
        timeoutId = setTimeout(typeNumber, 200 + Math.random() * 150);
      } else {
        timeoutId = setTimeout(() => {
          if (!active) return;
          setSearchInputValue("");
          charIndex = 0;
          timeoutId = setTimeout(typeNumber, 2000);
        }, 3000);
      }
    }

    timeoutId = setTimeout(typeNumber, 2000);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Search tab switching
  const handleSearchTabSwitch = useCallback((type: "dossard" | "selfie" | "nom") => {
    setActiveSearchTab(type);
  }, []);

  const searchIcons: Record<string, string> = { dossard: "\uD83D\uDD22", selfie: "\uD83E\uDD33", nom: "\uD83D\uDC64" };
  const searchPlaceholders: Record<string, string> = {
    dossard: "Entrez votre num\u00e9ro de dossard...",
    selfie: "Uploadez un selfie pour la recherche...",
    nom: "Entrez votre nom ou pr\u00e9nom...",
  };

  // FAQ toggle
  const handleFaqToggle = useCallback((index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  }, []);

  const faqItems = [
    {
      question: "Comment retrouver mes photos de course ?",
      answer:
        "Rendez-vous sur Focus Racer, s\u00e9lectionnez votre \u00e9v\u00e9nement et entrez votre num\u00e9ro de dossard. Vous pouvez aussi utiliser un selfie pour retrouver vos photos gr\u00e2ce \u00e0 la reconnaissance faciale. Le processus prend moins de 3 secondes.",
    },
    {
      question: "Quels types d\u2019\u00e9v\u00e9nements sont couverts ?",
      answer:
        "Focus Racer couvre les marathons, trails, triathlons, courses \u00e0 pied, courses cyclistes, et tout \u00e9v\u00e9nement sportif avec dossard ou identification visuelle. Notre technologie s\u2019adapte \u00e0 toutes les disciplines.",
    },
    {
      question: "Comment fonctionne la reconnaissance de dossard ?",
      answer:
        "Notre intelligence artificielle analyse automatiquement chaque photo upload\u00e9e pour d\u00e9tecter et lire les num\u00e9ros de dossard gr\u00e2ce \u00e0 un moteur OCR avanc\u00e9. Le processus est enti\u00e8rement automatique et prend quelques secondes par photo, m\u00eame avec des images floues ou en mouvement.",
    },
    {
      question: "Je suis photographe, comment vendre mes photos ?",
      answer:
        "Cr\u00e9ez un compte photographe gratuitement, uploadez vos photos et notre IA les trie automatiquement par dossard et visage. Les coureurs retrouvent et ach\u00e8tent leurs photos directement sur la plateforme. Vous recevez vos revenus via paiement s\u00e9curis\u00e9 Stripe.",
    },
    {
      question: "Peut-on retrouver ses photos sans num\u00e9ro de dossard ?",
      answer:
        "Absolument ! Gr\u00e2ce \u00e0 la reconnaissance faciale, prenez simplement un selfie et notre IA retrouvera toutes les photos o\u00f9 vous apparaissez, m\u00eame sans dossard visible. C\u2019est id\u00e9al pour les arriv\u00e9es, d\u00e9parts et photos de groupe.",
    },
  ];

  return (
    <div className="homepage-wrapper">
      {/* Schema.org structured data */}
      <Script
        id="schema-webapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Focus Racer",
            url: "https://focusracer.swipego.app/",
            description:
              "Plateforme de photos de courses sportives avec reconnaissance automatique de dossard et reconnaissance faciale.",
            applicationCategory: "PhotographyApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
              description: "Recherche de photos gratuite pour les coureurs",
            },
            featureList: [
              "Reconnaissance de dossard par IA",
              "Reconnaissance faciale",
              "Galeries personnalis\u00e9es",
              "Paiement s\u00e9curis\u00e9",
              "Mode Live",
              "Marketplace photographes",
            ],
          }),
        }}
      />
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Comment retrouver mes photos de course ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Rendez-vous sur Focus Racer, s\u00e9lectionnez votre \u00e9v\u00e9nement et entrez votre num\u00e9ro de dossard. Vous pouvez aussi utiliser un selfie pour retrouver vos photos gr\u00e2ce \u00e0 la reconnaissance faciale.",
                },
              },
              {
                "@type": "Question",
                name: "Quels types d\u2019\u00e9v\u00e9nements sont couverts ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Focus Racer couvre les marathons, trails, triathlons, courses \u00e0 pied, courses cyclistes, et tout \u00e9v\u00e9nement sportif avec dossard ou identification visuelle.",
                },
              },
              {
                "@type": "Question",
                name: "Comment fonctionne la reconnaissance de dossard ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Notre intelligence artificielle analyse automatiquement chaque photo upload\u00e9e pour d\u00e9tecter et lire les num\u00e9ros de dossard. Le processus est enti\u00e8rement automatique et prend quelques secondes par photo.",
                },
              },
              {
                "@type": "Question",
                name: "Suis-je photographe, comment vendre mes photos ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Cr\u00e9ez un compte photographe, uploadez vos photos et notre IA les trie automatiquement. Les coureurs retrouvent et ach\u00e8tent leurs photos directement. Vous recevez vos revenus via un paiement s\u00e9curis\u00e9 Stripe.",
                },
              },
              {
                "@type": "Question",
                name: "Peut-on retrouver ses photos sans num\u00e9ro de dossard ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui ! Gr\u00e2ce \u00e0 la reconnaissance faciale, prenez simplement un selfie et notre IA retrouvera toutes les photos o\u00f9 vous apparaissez, m\u00eame sans dossard visible.",
                },
              },
            ],
          }),
        }}
      />

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className={`navbar${isScrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-icon">📷</span>
            Focus Racer
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/runner">Courses</Link>
            </li>
            <li>
              <Link href="/marketplace">Marketplace</Link>
            </li>
            <li>
              <Link href="/pricing">Tarifs</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
          </ul>
          <div className="nav-actions">
            <Link href="/login">
              <button className="btn-ghost">Connexion</button>
            </Link>
            <Link href="/register">
              <button className="btn-primary">Inscription</button>
            </Link>
          </div>
          <button className="mobile-toggle" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        <div className="hero-grain"></div>
        <div className="hero-grid-pattern"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot">⚡</span>
              Propuls&eacute; par l&apos;Intelligence Artificielle
            </div>
            <h1>
              Retrouvez vos photos de
              <span className="line-accent">
                <span className="rotating-words-wrapper">
                  <span className="rotating-words">
                    <span>marathon</span>
                    <span>trail</span>
                    <span>triathlon</span>
                    <span>course</span>
                    <span>cyclisme</span>
                    <span>marathon</span>
                  </span>
                </span>
              </span>
              en un clic.
            </h1>
            <p className="hero-description">
              Notre IA d&eacute;tecte automatiquement votre dossard et votre visage pour retrouver toutes vos photos
              d&apos;&eacute;v&eacute;nement en quelques secondes. Gratuit pour les coureurs.
            </p>
            <div className="hero-ctas">
              <Link href="/runner">
                <button className="btn-hero-primary">🔍 Trouver mes photos</button>
              </Link>
              <Link href="/register">
                <button className="btn-hero-secondary">📸 Espace photographe</button>
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            {/* Floating cards */}
            <div className="hero-float-card card-1">
              <div className="float-icon green">✅</div>
              <div>
                <div className="float-label">Dossard d&eacute;tect&eacute;</div>
                <div className="float-value">#1247 — 0.3s</div>
              </div>
            </div>
            <div className="hero-float-card card-2">
              <div className="float-icon purple">🎯</div>
              <div>
                <div className="float-label">Photos trouv&eacute;es</div>
                <div className="float-value">24 r&eacute;sultats</div>
              </div>
            </div>

            <div className="hero-mockup">
              <div className="hero-search-demo">
                <div className="search-demo-title">🏃 Trouvez vos photos</div>
                <div className="search-tabs">
                  <button
                    className={`search-tab${activeSearchTab === "dossard" ? " active" : ""}`}
                    onClick={() => handleSearchTabSwitch("dossard")}
                  >
                    🏷️ Dossard
                  </button>
                  <button
                    className={`search-tab${activeSearchTab === "selfie" ? " active" : ""}`}
                    onClick={() => handleSearchTabSwitch("selfie")}
                  >
                    🤳 Selfie
                  </button>
                  <button
                    className={`search-tab${activeSearchTab === "nom" ? " active" : ""}`}
                    onClick={() => handleSearchTabSwitch("nom")}
                  >
                    👤 Nom
                  </button>
                </div>
                <div className="search-input-group">
                  <span className="search-input-icon">{searchIcons[activeSearchTab]}</span>
                  <input
                    type="text"
                    className="search-input"
                    ref={searchInputRef}
                    placeholder={searchPlaceholders[activeSearchTab]}
                    value={searchInputValue}
                    readOnly
                  />
                </div>
                <Link href="/runner">
                  <button className="search-btn">Rechercher mes photos →</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF BAR ═══════════ */}
      <div className="social-proof-bar">
        <div className="social-proof-inner">
          <span className="social-proof-label">&Eacute;v&eacute;nements couverts</span>
          <div className="logos-track-wrapper">
            <div className="logos-track">
              <span className="logo-item">
                <span className="logo-dot"></span>Marathon de Paris
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Trail des Templiers
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Ironman Nice
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Semi de Bordeaux
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>UTMB
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Triathlon de Mimizan
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Trail du Mont-Blanc
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Marathon Vert Rennes
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>L&apos;&Eacute;chapp&eacute;e Belle
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Saint&eacute;Lyon
              </span>
              {/* Duplicated for infinite scroll */}
              <span className="logo-item">
                <span className="logo-dot"></span>Marathon de Paris
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Trail des Templiers
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Ironman Nice
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Semi de Bordeaux
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>UTMB
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Triathlon de Mimizan
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Trail du Mont-Blanc
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Marathon Vert Rennes
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>L&apos;&Eacute;chapp&eacute;e Belle
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>Saint&eacute;Lyon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card reveal stagger-1">
            <div className="stat-number" data-target="500000" data-suffix="+">
              0
            </div>
            <div className="stat-label">Photos trait&eacute;es</div>
          </div>
          <div className="stat-card reveal stagger-2">
            <div className="stat-number" data-target="200" data-suffix="+">
              0
            </div>
            <div className="stat-label">&Eacute;v&eacute;nements couverts</div>
          </div>
          <div className="stat-card reveal stagger-3">
            <div className="stat-number" data-target="50" data-suffix="+">
              0
            </div>
            <div className="stat-label">Photographes actifs</div>
          </div>
          <div className="stat-card reveal stagger-4">
            <div className="stat-number" data-target="98" data-suffix="%">
              0
            </div>
            <div className="stat-label">Taux de d&eacute;tection IA</div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="section how-section" id="how">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            Comment &ccedil;a marche
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Trois &eacute;tapes, z&eacute;ro effort</h2>
          <p className="section-subtitle">
            De l&apos;upload &agrave; la livraison, notre intelligence artificielle s&apos;occupe de tout.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card reveal stagger-1">
            <div className="step-number">1</div>
            <div className="step-icon">📤</div>
            <h3>Upload des photos</h3>
            <p>
              Le photographe t&eacute;l&eacute;verse ses photos sur la plateforme. Upload en masse ou en temps r&eacute;el
              pendant l&apos;&eacute;v&eacute;nement gr&acirc;ce au mode Live.
            </p>
          </div>
          <div className="step-card reveal stagger-2">
            <div className="step-number">2</div>
            <div className="step-icon">🤖</div>
            <h3>Analyse IA automatique</h3>
            <p>
              Notre intelligence artificielle d&eacute;tecte les num&eacute;ros de dossard et les visages en quelques
              secondes. Tri et indexation instantan&eacute;s.
            </p>
          </div>
          <div className="step-card reveal stagger-3">
            <div className="step-number">3</div>
            <div className="step-icon">🎉</div>
            <h3>Retrouvez vos photos</h3>
            <p>
              Recherchez par dossard, selfie ou nom. Achetez vos photos pr&eacute;f&eacute;r&eacute;es en un clic avec
              paiement s&eacute;curis&eacute; Stripe.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="section" id="features">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            Fonctionnalit&eacute;s
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Tout ce dont vous avez besoin</h2>
          <p className="section-subtitle">
            Une plateforme compl&egrave;te pour les coureurs, photographes et organisateurs d&apos;&eacute;v&eacute;nements
            sportifs.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal stagger-1">
            <div className="feature-icon-wrap fi-blue">🏷️</div>
            <h3>Recherche par dossard</h3>
            <p>
              Entrez simplement votre num&eacute;ro de dossard et retrouvez toutes vos photos en un instant. La
              d&eacute;tection IA est pr&eacute;cise &agrave; 98%.
            </p>
          </div>
          <div className="feature-card reveal stagger-2">
            <div className="feature-icon-wrap fi-purple">🤳</div>
            <h3>Reconnaissance faciale</h3>
            <p>
              Prenez un selfie et notre IA retrouve toutes les photos o&ugrave; vous apparaissez, m&ecirc;me sans dossard
              visible. Id&eacute;al pour les photos de groupe.
            </p>
          </div>
          <div className="feature-card reveal stagger-3">
            <div className="feature-icon-wrap fi-green">⚡</div>
            <h3>Mode Live</h3>
            <p>
              Upload en temps r&eacute;el pendant la course avec d&eacute;tection instantan&eacute;e. Les coureurs
              retrouvent leurs photos avant m&ecirc;me la ligne d&apos;arriv&eacute;e.
            </p>
          </div>
          <div className="feature-card reveal stagger-4">
            <div className="feature-icon-wrap fi-amber">🎨</div>
            <h3>Galeries personnalis&eacute;es</h3>
            <p>
              Chaque &eacute;v&eacute;nement dispose de sa galerie avec le branding de l&apos;organisateur. Un espace
              d&eacute;di&eacute; pour chaque course.
            </p>
          </div>
          <div className="feature-card reveal stagger-5">
            <div className="feature-icon-wrap fi-rose">💳</div>
            <h3>Paiement s&eacute;curis&eacute;</h3>
            <p>
              Achetez vos photos en toute s&eacute;curit&eacute; via Stripe. Paiement instantan&eacute;,
              t&eacute;l&eacute;chargement imm&eacute;diat en haute r&eacute;solution.
            </p>
          </div>
          <div className="feature-card reveal stagger-6">
            <div className="feature-icon-wrap fi-teal">🤝</div>
            <h3>Marketplace</h3>
            <p>
              Connectez photographes et organisateurs. Trouvez le photographe id&eacute;al pour votre &eacute;v&eacute;nement
              ou proposez vos services.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ AUDIENCE ═══════════ */}
      <section className="section audience-section" id="audience">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            Pour qui ?
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Une plateforme, trois publics</h2>
          <p className="section-subtitle">
            Que vous soyez coureur, photographe ou organisateur, Focus Racer s&apos;adapte &agrave; vos besoins.
          </p>
        </div>

        <div className="audience-tabs-nav reveal">
          <button
            className={`audience-tab-btn${activeAudienceTab === "runners" ? " active" : ""}`}
            onClick={() => setActiveAudienceTab("runners")}
          >
            🏃 Coureurs
          </button>
          <button
            className={`audience-tab-btn${activeAudienceTab === "photographers" ? " active" : ""}`}
            onClick={() => setActiveAudienceTab("photographers")}
          >
            📸 Photographes
          </button>
          <button
            className={`audience-tab-btn${activeAudienceTab === "organizers" ? " active" : ""}`}
            onClick={() => setActiveAudienceTab("organizers")}
          >
            🏢 Organisateurs
          </button>
        </div>

        <div className="audience-panels">
          {/* Runners panel */}
          <div className={`audience-panel${activeAudienceTab === "runners" ? " active" : ""}`} id="panel-runners">
            <div className="audience-visual">
              <div className="audience-img-placeholder">🏃‍♂️</div>
            </div>
            <div className="audience-info">
              <h3>Retrouvez vos souvenirs en quelques secondes</h3>
              <p>
                Fini les heures pass&eacute;es &agrave; chercher vos photos parmi des milliers de clich&eacute;s. Focus
                Racer vous les livre instantan&eacute;ment, tri&eacute;es et identifi&eacute;es.
              </p>
              <ul className="audience-benefits">
                <li>
                  <span className="benefit-check">✓</span>Recherche par dossard, nom ou selfie
                </li>
                <li>
                  <span className="benefit-check">✓</span>R&eacute;sultats en moins de 3 secondes
                </li>
                <li>
                  <span className="benefit-check">✓</span>Photos haute r&eacute;solution t&eacute;l&eacute;chargeables
                </li>
                <li>
                  <span className="benefit-check">✓</span>Notification quand vos photos sont pr&ecirc;tes
                </li>
              </ul>
              <Link href="/runner">
                <button className="btn-audience">Trouver mes photos →</button>
              </Link>
            </div>
          </div>

          {/* Photographers panel */}
          <div
            className={`audience-panel${activeAudienceTab === "photographers" ? " active" : ""}`}
            id="panel-photographers"
          >
            <div className="audience-visual">
              <div className="audience-img-placeholder">📷</div>
            </div>
            <div className="audience-info">
              <h3>Vendez vos photos automatiquement</h3>
              <p>
                Concentrez-vous sur votre art. Notre IA trie, indexe et identifie chaque participant sur vos photos. Vous
                n&apos;avez plus qu&apos;&agrave; encaisser.
              </p>
              <ul className="audience-benefits">
                <li>
                  <span className="benefit-check">✓</span>Tri automatique par dossard et visage
                </li>
                <li>
                  <span className="benefit-check">✓</span>Upload en masse ou en temps r&eacute;el
                </li>
                <li>
                  <span className="benefit-check">✓</span>Paiement direct sur votre compte Stripe
                </li>
                <li>
                  <span className="benefit-check">✓</span>Dashboard de suivi des ventes
                </li>
              </ul>
              <Link href="/login">
                <button className="btn-audience">Espace photographe →</button>
              </Link>
            </div>
          </div>

          {/* Organizers panel */}
          <div
            className={`audience-panel${activeAudienceTab === "organizers" ? " active" : ""}`}
            id="panel-organizers"
          >
            <div className="audience-visual">
              <div className="audience-img-placeholder">🏟️</div>
            </div>
            <div className="audience-info">
              <h3>Offrez une exp&eacute;rience photo m&eacute;morable</h3>
              <p>
                Boostez la satisfaction de vos participants avec un service photo int&eacute;gr&eacute; &agrave; votre
                &eacute;v&eacute;nement. Trouvez des photographes via notre marketplace.
              </p>
              <ul className="audience-benefits">
                <li>
                  <span className="benefit-check">✓</span>Galerie aux couleurs de votre &eacute;v&eacute;nement
                </li>
                <li>
                  <span className="benefit-check">✓</span>Marketplace de photographes qualifi&eacute;s
                </li>
                <li>
                  <span className="benefit-check">✓</span>Diffusion SMS, email et QR code
                </li>
                <li>
                  <span className="benefit-check">✓</span>Conformit&eacute; RGPD et droit &agrave; l&apos;image
                </li>
              </ul>
              <Link href="/register">
                <button className="btn-audience">Cr&eacute;er un compte Pro →</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TECH / AI ═══════════ */}
      <section className="section tech-section" id="tech">
        <div className="tech-content">
          <div className="tech-info reveal-left">
            <div className="section-tag">
              <span className="section-tag-line"></span>
              Technologie
            </div>
            <h2 className="section-title">IA &amp; analyse d&apos;image de pointe</h2>
            <p>
              Notre moteur d&apos;intelligence artificielle combine plusieurs algorithmes de d&eacute;tection pour identifier
              chaque sportif avec une pr&eacute;cision remarquable, quelle que soit la discipline.
            </p>

            <div className="tech-features">
              <div className="tech-feature-item">
                <div className="tech-feature-icon">🔢</div>
                <div>
                  <h4>Lecture OCR de dossard</h4>
                  <p>
                    D&eacute;tection et lecture automatique des num&eacute;ros, m&ecirc;me sur des photos floues ou en
                    mouvement
                  </p>
                </div>
              </div>
              <div className="tech-feature-item">
                <div className="tech-feature-icon">👤</div>
                <div>
                  <h4>Reconnaissance faciale</h4>
                  <p>Regroupement intelligent des photos par visage avec un simple selfie de r&eacute;f&eacute;rence</p>
                </div>
              </div>
              <div className="tech-feature-item">
                <div className="tech-feature-icon">⏱️</div>
                <div>
                  <h4>Traitement temps r&eacute;el</h4>
                  <p>
                    Analyse instantan&eacute;e pendant l&apos;&eacute;v&eacute;nement gr&acirc;ce &agrave; notre
                    infrastructure cloud haute performance
                  </p>
                </div>
              </div>
              <div className="tech-feature-item">
                <div className="tech-feature-icon">🔒</div>
                <div>
                  <h4>RGPD &amp; droit &agrave; l&apos;image</h4>
                  <p>
                    Conformit&eacute; totale avec la r&eacute;glementation europ&eacute;enne sur les donn&eacute;es
                    personnelles
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="tech-visual reveal-right">
            <div className="tech-demo-card">
              <div className="tech-demo-header">
                <span className="tech-demo-dot red"></span>
                <span className="tech-demo-dot yellow"></span>
                <span className="tech-demo-dot green"></span>
              </div>
              <div className="tech-demo-grid">
                <div
                  className="tech-demo-photo"
                  style={{ background: "linear-gradient(135deg, #047857, #10B981)" }}
                >
                  <div className="tech-demo-tag">
                    <span className="tag-indicator"></span> #1247
                  </div>
                </div>
                <div
                  className="tech-demo-photo"
                  style={{ background: "linear-gradient(135deg, #065f46, #10b981)" }}
                >
                  <div className="tech-demo-tag">
                    <span className="tag-indicator"></span> #892
                  </div>
                </div>
                <div
                  className="tech-demo-photo"
                  style={{ background: "linear-gradient(135deg, #92400e, #f59e0b)" }}
                >
                  <div className="tech-demo-tag">
                    <span className="tag-indicator"></span> #3041
                  </div>
                </div>
                <div
                  className="tech-demo-photo"
                  style={{ background: "linear-gradient(135deg, #7c2d12, #ef4444)" }}
                >
                  <div className="tech-demo-tag">
                    <span className="tag-indicator"></span> Visage
                  </div>
                </div>
                <div
                  className="tech-demo-photo"
                  style={{ background: "linear-gradient(135deg, #581c87, #a855f7)" }}
                >
                  <div className="tech-demo-tag">
                    <span className="tag-indicator"></span> #567
                  </div>
                </div>
                <div
                  className="tech-demo-photo"
                  style={{ background: "linear-gradient(135deg, #155e75, #06b6d4)" }}
                >
                  <div className="tech-demo-tag">
                    <span className="tag-indicator"></span> #2103
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="section" id="testimonials">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            T&eacute;moignages
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Ils nous font confiance</h2>
          <p className="section-subtitle">
            Coureurs, photographes et organisateurs partagent leur exp&eacute;rience avec Focus Racer.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card reveal stagger-1">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              &ldquo;J&apos;ai retrouv&eacute; toutes mes photos du marathon en moins de 30 secondes.
              L&apos;interface est intuitive et le r&eacute;sultat bluffant. Je recommande &agrave; tous les coureurs
              !&rdquo;
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">SM</div>
              <div>
                <div className="testimonial-name">Sophie M.</div>
                <div className="testimonial-role">Marathonienne — Paris</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card reveal stagger-2">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              &ldquo;Le tri automatique par dossard me fait gagner des heures de travail apr&egrave;s chaque course. Plus
              besoin de trier manuellement des milliers de photos.&rdquo;
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">TL</div>
              <div>
                <div className="testimonial-name">Thomas L.</div>
                <div className="testimonial-role">Photographe sportif</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card reveal stagger-3">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              &ldquo;La marketplace nous a permis de trouver facilement des photographes qualifi&eacute;s pour notre trail.
              La galerie personnalis&eacute;e est un vrai plus pour notre image.&rdquo;
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">CD</div>
              <div>
                <div className="testimonial-name">Claire D.</div>
                <div className="testimonial-role">Organisatrice d&apos;&eacute;v&eacute;nements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="section faq-section" id="faq">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            FAQ
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Questions fr&eacute;quentes</h2>
          <p className="section-subtitle">Tout ce que vous devez savoir sur Focus Racer.</p>
        </div>

        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`faq-item reveal stagger-${index + 1}${openFaqIndex === index ? " open" : ""}`}
            >
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
          <h2>Pr&ecirc;t &agrave; retrouver vos photos ?</h2>
          <p>
            Rejoignez des milliers de coureurs et photographes qui utilisent Focus Racer pour retrouver, partager et vendre
            leurs photos d&apos;&eacute;v&eacute;nements sportifs.
          </p>
          <div className="cta-btns">
            <Link href="/runner">
              <button className="btn-hero-primary">🔍 Rechercher mes photos</button>
            </Link>
            <Link href="/register">
              <button className="btn-hero-secondary">📸 Cr&eacute;er un compte</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="homepage-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>
              <span
                className="nav-logo-icon"
                style={{ width: "28px", height: "28px", borderRadius: "8px", fontSize: "0.9rem" }}
              >
                📷
              </span>{" "}
              Focus Racer
            </h3>
            <p>
              La plateforme de r&eacute;f&eacute;rence pour retrouver et acheter vos photos de courses sportives
              gr&acirc;ce &agrave; l&apos;intelligence artificielle.
            </p>
          </div>
          <div className="footer-col">
            <h4>Produit</h4>
            <ul>
              <li>
                <Link href="/runner">Trouver mes photos</Link>
              </li>
              <li>
                <Link href="/runner">&Eacute;v&eacute;nements</Link>
              </li>
              <li>
                <Link href="/pricing">Tarifs</Link>
              </li>
              <li>
                <Link href="/marketplace">Marketplace</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>D&eacute;couvrir</h4>
            <ul>
              <li>
                <Link href="/register">Devenir photographe</Link>
              </li>
              <li>
                <Link href="/register">Cr&eacute;er un compte</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>L&eacute;gal</h4>
            <ul>
              <li>
                <Link href="/legal">Mentions l&eacute;gales</Link>
              </li>
              <li>
                <Link href="/legal/cgu">CGU</Link>
              </li>
              <li>
                <Link href="/legal/confidentialite">Confidentialit&eacute;</Link>
              </li>
              <li>
                <Link href="/gdpr">RGPD</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Focus Racer. Tous droits r&eacute;serv&eacute;s.</span>
          <div className="footer-legal-links">
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/confidentialite">Politique de confidentialit&eacute;</Link>
            <Link href="/legal/cgu">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
