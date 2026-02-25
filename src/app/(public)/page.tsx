"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import "./homepage.css";

export default function HomePage() {
  const [activeAudienceTab, setActiveAudienceTab] = useState<"runners" | "photographers" | "organizers">("runners");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const slotWords = ["marathon", "trail", "triathlon", "cyclisme", "natation", "ski", "running", "duathlon", "canicross", "obstacle", "swimrun", "motocross", "aviron", "rallye", "ironman", "équitation", "kayak", "escalade", "rugby", "football", "handball", "voile", "CrossFit", "paddle", "biathlon", "enduro", "karting", "surf", "boxe", "judo", "athlétisme"];

  // Simple rotating words — 1 word every 0.5s
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % slotWords.length);
    }, 500);
    return () => clearInterval(interval);
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

  // Animated pipeline step for hero widget
  const [pipelineStep, setPipelineStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // FAQ toggle
  const handleFaqToggle = useCallback((index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  }, []);

  const faqItems = [
    {
      question: "Comment retrouver mes photos de course ?",
      answer:
        "Rendez-vous sur Focus Racer, sélectionnez votre événement et entrez votre numéro de dossard. Vous pouvez aussi utiliser un selfie pour retrouver vos photos grâce à la reconnaissance faciale. Le processus prend moins d'une seconde.",
    },
    {
      question: "Quels types d’événements sont couverts ?",
      answer:
        "Focus Racer couvre les marathons, trails, triathlons, courses à pied, courses cyclistes, et tout événement sportif avec dossard ou identification visuelle. Notre technologie s’adapte à toutes les disciplines.",
    },
    {
      question: "Comment fonctionne la reconnaissance de dossard ?",
      answer:
        "Notre intelligence artificielle analyse automatiquement chaque photo uploadée pour détecter et lire les numéros de dossard grâce à un moteur OCR avancé. Le processus est entièrement automatique : 30 millisecondes par photo, soit 10 000 photos traitées en 5 minutes. Fonctionne même avec des images floues ou en mouvement.",
    },
    {
      question: "Je suis photographe, comment vendre mes photos ?",
      answer:
        "Créez un compte photographe gratuitement, uploadez vos photos et notre IA les trie automatiquement par dossard et visage. Les sportifs retrouvent et achètent leurs photos directement sur la plateforme. Vous recevez vos revenus via paiement sécurisé Stripe.",
    },
    {
      question: "Peut-on retrouver ses photos sans numéro de dossard ?",
      answer:
        "Absolument ! Grâce à la reconnaissance faciale, prenez simplement un selfie et notre IA retrouvera toutes les photos où vous apparaissez, même sans dossard visible. C’est idéal pour les arrivées, départs et photos de groupe.",
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
              description: "Recherche de photos gratuite pour les sportifs",
            },
            featureList: [
              "Reconnaissance de dossard par IA",
              "Reconnaissance faciale",
              "Galeries personnalisées",
              "Paiement sécurisé",
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
                  text: "Rendez-vous sur Focus Racer, sélectionnez votre événement et entrez votre numéro de dossard. Vous pouvez aussi utiliser un selfie pour retrouver vos photos grâce à la reconnaissance faciale.",
                },
              },
              {
                "@type": "Question",
                name: "Quels types d’événements sont couverts ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Focus Racer couvre les marathons, trails, triathlons, courses à pied, courses cyclistes, et tout événement sportif avec dossard ou identification visuelle.",
                },
              },
              {
                "@type": "Question",
                name: "Comment fonctionne la reconnaissance de dossard ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Notre intelligence artificielle analyse automatiquement chaque photo uploadée pour détecter et lire les numéros de dossard. Le processus est entièrement automatique : 30 millisecondes par photo, soit 10 000 photos traitées en 5 minutes.",
                },
              },
              {
                "@type": "Question",
                name: "Suis-je photographe, comment vendre mes photos ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Créez un compte photographe, uploadez vos photos et notre IA les trie automatiquement. Les sportifs retrouvent et achètent leurs photos directement. Vous recevez vos revenus via un paiement sécurisé Stripe.",
                },
              },
              {
                "@type": "Question",
                name: "Peut-on retrouver ses photos sans numéro de dossard ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui ! Grâce à la reconnaissance faciale, prenez simplement un selfie et notre IA retrouvera toutes les photos où vous apparaissez, même sans dossard visible.",
                },
              },
            ],
          }),
        }}
      />

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        <div className="hero-grain"></div>
        <div className="hero-grid-pattern"></div>
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot">⚡</span>
              Propulsé par l'Intelligence Artificielle
            </div>
            <h1>
              Retrouvez vos photos de
              <span className="line-accent">
                <span className="rotating-word-single">{slotWords[currentWordIndex]}</span>
              </span>
              en un clic.
            </h1>
            <p className="hero-description">
              Notre IA détecte automatiquement votre dossard et votre visage pour retrouver toutes vos photos
              d'événement instantanément. Gratuit pour les sportifs.
            </p>
            <div className="hero-ctas">
              <Link href="/explore">
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
                <div className="float-label">Dossard détecté</div>
                <div className="float-value">#1247 — 0.03s</div>
              </div>
            </div>
            <div className="hero-float-card card-2">
              <div className="float-icon purple">🎯</div>
              <div>
                <div className="float-label">Reconnaissance faciale</div>
                <div className="float-value">Confiance 98.7%</div>
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
                    <span className="pipeline-stat-value">95%</span>
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

      {/* ═══════════ SOCIAL PROOF BAR ═══════════ */}
      <div className="social-proof-bar">
        <div className="social-proof-inner">
          <span className="social-proof-label">Événements couverts</span>
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
                <span className="logo-dot"></span>L'Échappée Belle
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>SaintéLyon
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
                <span className="logo-dot"></span>L'Échappée Belle
              </span>
              <span className="logo-item">
                <span className="logo-dot"></span>SaintéLyon
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
            <div className="stat-label">Photos traitées</div>
          </div>
          <div className="stat-card reveal stagger-2">
            <div className="stat-number" data-target="200" data-suffix="+">
              0
            </div>
            <div className="stat-label">Événements couverts</div>
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
            <div className="stat-label">Taux de détection IA</div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="section how-section" id="how">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            Comment ça marche
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Trois étapes, zéro effort</h2>
          <p className="section-subtitle">
            De l'upload à la livraison, notre intelligence artificielle s'occupe de tout.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card reveal stagger-1">
            <div className="step-number">1</div>
            <div className="step-icon">📤</div>
            <h3>Upload des photos</h3>
            <p>
              Le photographe téléverse ses photos sur la plateforme. Upload en masse ou en temps réel
              pendant l'événement grâce au mode Live.
            </p>
          </div>
          <div className="step-card reveal stagger-2">
            <div className="step-number">2</div>
            <div className="step-icon">🤖</div>
            <h3>Analyse IA automatique</h3>
            <p>
              Notre intelligence artificielle détecte les numéros de dossard et les visages en 30 millisecondes
              par photo. 10 000 photos triées en 5 minutes.
            </p>
          </div>
          <div className="step-card reveal stagger-3">
            <div className="step-number">3</div>
            <div className="step-icon">🎉</div>
            <h3>Retrouvez vos photos</h3>
            <p>
              Recherchez par dossard, selfie ou nom. Achetez vos photos préférées en un clic avec
              paiement sécurisé Stripe.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="section" id="features">
        <div className="section-header reveal">
          <div className="section-tag">
            <span className="section-tag-line"></span>
            Fonctionnalités
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Tout ce dont vous avez besoin</h2>
          <p className="section-subtitle">
            Une plateforme complète pour les sportifs, photographes et organisateurs d'événements
            sportifs.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal stagger-1">
            <div className="feature-icon-wrap fi-blue">🏷️</div>
            <h3>Recherche par dossard</h3>
            <p>
              Entrez simplement votre numéro de dossard et retrouvez toutes vos photos en un instant. La
              détection IA est précise à 98%.
            </p>
          </div>
          <div className="feature-card reveal stagger-2">
            <div className="feature-icon-wrap fi-purple">🤳</div>
            <h3>Reconnaissance faciale</h3>
            <p>
              Prenez un selfie et notre IA retrouve toutes les photos où vous apparaissez, même sans dossard
              visible. Idéal pour les photos de groupe.
            </p>
          </div>
          <div className="feature-card reveal stagger-3">
            <div className="feature-icon-wrap fi-green">⚡</div>
            <h3>Mode Live</h3>
            <p>
              Upload en temps réel pendant la course avec détection instantanée. Les sportifs
              retrouvent leurs photos avant même la ligne d'arrivée.
            </p>
          </div>
          <div className="feature-card reveal stagger-4">
            <div className="feature-icon-wrap fi-amber">🎨</div>
            <h3>Galeries personnalisées</h3>
            <p>
              Chaque événement dispose de sa galerie avec le branding de l'organisateur. Un espace
              dédié pour chaque course.
            </p>
          </div>
          <div className="feature-card reveal stagger-5">
            <div className="feature-icon-wrap fi-rose">💳</div>
            <h3>Paiement sécurisé</h3>
            <p>
              Achetez vos photos en toute sécurité via Stripe. Paiement instantané,
              téléchargement immédiat en haute résolution.
            </p>
          </div>
          <div className="feature-card reveal stagger-6">
            <div className="feature-icon-wrap fi-teal">🤝</div>
            <h3>Marketplace</h3>
            <p>
              Connectez photographes et organisateurs. Trouvez le photographe idéal pour votre événement
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
            Que vous soyez sportif, photographe ou organisateur, Focus Racer s'adapte à vos besoins.
          </p>
        </div>

        <div className="audience-tabs-nav reveal">
          <button
            className={`audience-tab-btn${activeAudienceTab === "runners" ? " active" : ""}`}
            onClick={() => setActiveAudienceTab("runners")}
          >
            🏃 Sportifs
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
              <h3>Retrouvez vos souvenirs instantanément</h3>
              <p>
                Fini les heures passées à chercher vos photos parmi des milliers de clichés. Focus
                Racer vous les livre instantanément, triées et identifiées.
              </p>
              <ul className="audience-benefits">
                <li>
                  <span className="benefit-check">✓</span>Recherche par dossard, nom ou selfie
                </li>
                <li>
                  <span className="benefit-check">✓</span>Résultats en moins d'une seconde
                </li>
                <li>
                  <span className="benefit-check">✓</span>Photos haute résolution téléchargeables
                </li>
                <li>
                  <span className="benefit-check">✓</span>Notification quand vos photos sont prêtes
                </li>
              </ul>
              <Link href="/explore">
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
                n'avez plus qu'à encaisser.
              </p>
              <ul className="audience-benefits">
                <li>
                  <span className="benefit-check">✓</span>Tri automatique par dossard et visage
                </li>
                <li>
                  <span className="benefit-check">✓</span>Upload en masse ou en temps réel
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
              <h3>Offrez une expérience photo mémorable</h3>
              <p>
                Boostez la satisfaction de vos participants avec un service photo intégré à votre
                événement. Trouvez des photographes via notre marketplace.
              </p>
              <ul className="audience-benefits">
                <li>
                  <span className="benefit-check">✓</span>Galerie aux couleurs de votre événement
                </li>
                <li>
                  <span className="benefit-check">✓</span>Marketplace de photographes qualifiés
                </li>
                <li>
                  <span className="benefit-check">✓</span>Diffusion SMS, email et QR code
                </li>
                <li>
                  <span className="benefit-check">✓</span>Conformité RGPD et droit à l'image
                </li>
              </ul>
              <Link href="/register">
                <button className="btn-audience">Créer un compte Pro →</button>
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
            <h2 className="section-title">IA & analyse d'image de pointe</h2>
            <p>
              Notre moteur d'intelligence artificielle combine plusieurs algorithmes de détection pour identifier
              chaque sportif avec une précision remarquable, quelle que soit la discipline.
            </p>

            <div className="tech-features">
              <div className="tech-feature-item">
                <div className="tech-feature-icon">🔢</div>
                <div>
                  <h4>Lecture OCR de dossard</h4>
                  <p>
                    Détection et lecture automatique des numéros, même sur des photos floues ou en
                    mouvement
                  </p>
                </div>
              </div>
              <div className="tech-feature-item">
                <div className="tech-feature-icon">👤</div>
                <div>
                  <h4>Reconnaissance faciale</h4>
                  <p>Regroupement intelligent des photos par visage avec un simple selfie de référence</p>
                </div>
              </div>
              <div className="tech-feature-item">
                <div className="tech-feature-icon">⏱️</div>
                <div>
                  <h4>Traitement temps réel</h4>
                  <p>
                    Analyse instantanée pendant l'événement grâce à notre
                    infrastructure cloud haute performance
                  </p>
                </div>
              </div>
              <div className="tech-feature-item">
                <div className="tech-feature-icon">🔒</div>
                <div>
                  <h4>RGPD & droit à l'image</h4>
                  <p>
                    Conformité totale avec la réglementation européenne sur les données
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
            Témoignages
            <span className="section-tag-line"></span>
          </div>
          <h2 className="section-title">Ils nous font confiance</h2>
          <p className="section-subtitle">
            Sportifs, photographes et organisateurs partagent leur expérience avec Focus Racer.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card reveal stagger-1">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              “J'ai retrouvé toutes mes photos du marathon en moins de 30 secondes.
              L'interface est intuitive et le résultat bluffant. Je recommande à tous les sportifs
              !”
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
              “Le tri automatique par dossard me fait gagner des heures de travail après chaque course. Plus
              besoin de trier manuellement des milliers de photos.”
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
              “La marketplace nous a permis de trouver facilement des photographes qualifiés pour notre trail.
              La galerie personnalisée est un vrai plus pour notre image.”
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">CD</div>
              <div>
                <div className="testimonial-name">Claire D.</div>
                <div className="testimonial-role">Organisatrice d'événements</div>
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
          <h2 className="section-title">Questions fréquentes</h2>
          <p className="section-subtitle">Tout ce que vous devez savoir sur Focus Racer.</p>
        </div>

        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`faq-item${openFaqIndex === index ? " open" : ""}`}
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
          <h2>Prêt à retrouver vos photos ?</h2>
          <p>
            Rejoignez des milliers de sportifs et photographes qui utilisent Focus Racer pour retrouver, partager et vendre
            leurs photos d'événements sportifs.
          </p>
          <div className="cta-btns">
            <Link href="/explore">
              <button className="btn-hero-primary">🔍 Rechercher mes photos</button>
            </Link>
            <Link href="/register">
              <button className="btn-hero-secondary">📸 Créer un compte</button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
