"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const keyFacts = [
  { label: "Fondée en", value: "2024" },
  { label: "Lancement", value: "2026" },
  { label: "Siège", value: "France" },
  { label: "Secteur", value: "Photo sportive & IA" },
  { label: "Modèle", value: "SaaS B2B2C" },
  { label: "Utilisateurs", value: "Sportifs, photographes, organisateurs" },
  { label: "Technologies", value: "IA (OCR, reconnaissance faciale), Stripe Connect" },
  { label: "Particularité", value: "0% commission sur les ventes" },
];

const keyFactsText = [
  "Fondée en : 2024",
  "Lancement : 2026",
  "Siège : France",
  "Secteur : Photo sportive & IA",
  "Modèle : SaaS B2B2C",
  "Utilisateurs : Sportifs, photographes, organisateurs",
  "Technologies : IA (OCR, reconnaissance faciale), Stripe Connect",
  "Particularité : 0% commission sur les ventes",
].join("\n");

const stats = [
  { value: 500000, suffix: "+", label: "Photos traitées" },
  { value: 150, suffix: "+", label: "Événements couverts" },
  { value: 30, suffix: "+", label: "Sports" },
  { value: 95, suffix: "%", label: "Précision IA" },
  { value: 2, suffix: "min", label: "Tri de 1 000 photos" },
  { value: 0, suffix: "%", label: "Commission" },
];

interface PressRelease {
  date: string;
  title: string;
  excerpt: string;
  body: string;
}

const pressReleases: PressRelease[] = [
  {
    date: "Février 2026",
    title: "Focus Racer lance sa plateforme de vente photo propulsée par l’IA",
    excerpt:
      "La start-up française dévoile une solution inédite qui automatise le tri et la vente de photos de courses sportives grâce à l’intelligence artificielle.",
    body: "Focus Racer, start-up française spécialisée dans la photo sportive, annonce le lancement officiel de sa plateforme SaaS. En combinant reconnaissance optique de caractères (OCR) et reconnaissance faciale, Focus Racer permet aux photographes de trier automatiquement des milliers de photos en quelques minutes. Les sportifs retrouvent leurs clichés en un clic via leur numéro de dossard, leur nom ou un simple selfie. La plateforme intègre Stripe Connect pour des paiements directs entre sportifs et photographes, sans intermédiaire.",
  },
  {
    date: "Mars 2026",
    title: "0% de commission : Focus Racer bouleverse le marché de la photo sportive",
    excerpt:
      "Alors que les plateformes concurrentes prélèvent 20 à 50 % sur chaque vente, Focus Racer adopte un modèle radicalement différent : zéro commission.",
    body: "Focus Racer annonce un positionnement unique sur le marché de la photo sportive : 0 % de commission sur les ventes de photos. Le modèle économique repose sur un système de crédits que les photographes achètent pour financer le traitement IA (détection de dossards, reconnaissance faciale, watermark automatique). Les sportifs paient uniquement les photos qu’ils choisissent, avec des frais de service fixes de 1 € par commande. Les photographes conservent ainsi l’intégralité de leurs revenus de vente.",
  },
  {
    date: "Juin 2026",
    title: "Focus Racer franchit le cap des 150 événements couverts",
    excerpt:
      "En quatre mois, la plateforme a séduit photographes et organisateurs à travers plus de 30 disciplines sportives en France.",
    body: "Focus Racer célèbre une étape importante : plus de 150 événements sportifs ont été couverts via la plateforme depuis son lancement en février 2026. De la course à pied au trail, du cyclisme à la natation en eau libre, plus de 30 disciplines sont désormais représentées. La technologie d’IA atteint 95 % de précision dans la détection des dossards et permet de trier 1 000 photos en moins de 2 minutes. L’entreprise ambitionne de couvrir 500 événements d’ici fin 2026.",
  },
];

const brandColors = [
  { name: "Emerald", hex: "#14B8A6" },
  { name: "Navy", hex: "#042F2E" },
  { name: "Teal", hex: "#115E59" },
  { name: "White", hex: "#FFFFFF" },
];

const boilerplate =
  "Focus Racer est une plateforme SaaS française qui automatise le tri et la vente de photos de courses sportives grâce à l’intelligence artificielle. En combinant OCR, reconnaissance faciale et Stripe Connect, elle permet aux photographes de vendre leurs photos sans commission et aux sportifs de retrouver leurs clichés en quelques secondes. Fondée en 2024 et lancée en 2026, Focus Racer couvre plus de 30 disciplines sportives en France.";

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export default function PressePage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [expandedRelease, setExpandedRelease] = useState<number | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedFacts, setCopiedFacts] = useState(false);
  const [copiedBoilerplate, setCopiedBoilerplate] = useState(false);

  /* ---- Scroll reveal ---- */
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

  /* ---- Counter animation ---- */
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.count || "0");
            const suffix = el.dataset.suffix || "";
            const prefix = el.dataset.prefix || "";
            const duration = 2000;
            const start = performance.now();
            function animate(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(target * eased);
              if (target === 0) {
                el.textContent = prefix + "0" + suffix;
              } else if (current >= 1000000) {
                el.textContent =
                  prefix +
                  (current / 1000000).toFixed(1).replace(".0", "") +
                  "M" +
                  suffix;
              } else if (current >= 1000) {
                el.textContent = prefix + Math.floor(current / 1000) + "K" + suffix;
              } else {
                el.textContent = prefix + current + suffix;
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

  const reveal = useCallback(
    (id: string) => visibleSections.has(id),
    [visibleSections]
  );

  /* ---- Clipboard helpers ---- */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyColor = async (hex: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  const handleCopyFacts = async () => {
    const ok = await copyToClipboard(keyFactsText);
    if (ok) {
      setCopiedFacts(true);
      setTimeout(() => setCopiedFacts(false), 2000);
    }
  };

  const handleCopyBoilerplate = async () => {
    const ok = await copyToClipboard(boilerplate);
    if (ok) {
      setCopiedBoilerplate(true);
      setTimeout(() => setCopiedBoilerplate(false), 2000);
    }
  };

  return (
    <main className="bg-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z"
                />
              </svg>
              Relations presse
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Espace{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Presse
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Focus Racer dans les m&eacute;dias &mdash; Ressources pour journalistes,
              blogueurs et cr&eacute;ateurs de contenu.
            </p>
            <p className="text-white/60 text-sm">
              Contact presse&nbsp;:{" "}
              <a
                href="mailto:presse@focusracer.com"
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
              >
                presse@focusracer.com
              </a>
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() =>
                  document
                    .getElementById("ressources")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg"
              >
                T&eacute;l&eacute;charger le kit m&eacute;dia
              </button>
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                  Contacter l&apos;&eacute;quipe presse
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ EN BREF ═══════════ */}
      <section id="apropos" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div
            className={`max-w-4xl mx-auto transition-all duration-700 ${
              reveal("apropos")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
                &Agrave; propos
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Focus Racer en bref
              </h2>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {keyFacts.map((fact, i) => (
                  <div
                    key={i}
                    className="px-6 py-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-emerald-500 font-bold text-sm mt-0.5 whitespace-nowrap min-w-[120px]">
                      {fact.label}
                    </span>
                    <span className="text-gray-700 text-sm">{fact.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
                <button
                  onClick={handleCopyFacts}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  {copiedFacts ? "Copié !" : "Copier les faits clés"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CHIFFRES ═══════════ */}
      <section
        id="chiffres"
        data-reveal
        className="py-20 md:py-28 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-teal-400 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              reveal("chiffres")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium mb-4">
              En chiffres
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Chiffres cl&eacute;s
            </h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">
              Les m&eacute;triques qui comptent pour les journalistes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`text-center transition-all duration-700 ${
                  reveal("chiffres")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  data-count={stat.value}
                  data-suffix={stat.suffix}
                  data-prefix=""
                >
                  0
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMMUNIQUES ═══════════ */}
      <section id="communiques" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("communiques")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Actualit&eacute;s
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Communiqu&eacute;s de presse
            </h2>
            <p className="text-gray-600 text-lg">
              Retrouvez nos derni&egrave;res annonces officielles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pressReleases.map((pr, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-500 overflow-hidden ${
                  reveal("communiques")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="p-8">
                  <div className="text-sm text-emerald-600 font-medium mb-3">
                    {pr.date}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                    {pr.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {pr.excerpt}
                  </p>

                  {expandedRelease === i && (
                    <div className="border-t border-gray-100 pt-4 mt-4 animate-fade-in">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {pr.body}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      setExpandedRelease(expandedRelease === i ? null : i)
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors mt-2"
                  >
                    {expandedRelease === i
                      ? "Fermer"
                      : "Lire le communiqué"}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedRelease === i ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ RESSOURCES / KIT MEDIA ═══════════ */}
      <section
        id="ressources"
        data-reveal
        className="py-20 md:py-28 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("ressources")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Ressources
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kit m&eacute;dia &amp; ressources
            </h2>
            <p className="text-gray-600 text-lg">
              Tout le n&eacute;cessaire pour parler de Focus Racer dans vos articles.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Logo */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-700 ${
                reveal("ressources")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Logo Focus Racer</h3>
                  <p className="text-gray-500 text-sm">
                    Disponible en SVG et PNG, variantes sombre et claire.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-[#042F2E] to-[#115E59] rounded-xl p-8 flex items-center justify-center min-h-[120px]">
                  <span className="text-2xl font-bold text-white tracking-tight">
                    FOCUS RACER
                  </span>
                </div>
                <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[120px]">
                  <span className="text-2xl font-bold text-[#042F2E] tracking-tight">
                    FOCUS RACER
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <div>
                    <strong>R&egrave;gles d&apos;utilisation&nbsp;:</strong> taille minimale 40px de hauteur,
                    espace libre d&apos;au moins 16px autour du logo, ne pas d&eacute;former, ne pas modifier
                    les couleurs. Pour t&eacute;l&eacute;charger les fichiers HD, contactez{" "}
                    <a
                      href="mailto:presse@focusracer.com"
                      className="text-amber-700 underline"
                    >
                      presse@focusracer.com
                    </a>
                    .
                  </div>
                </div>
              </div>
            </div>

            {/* Couleurs */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-700 delay-100 ${
                reveal("ressources")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125V7.5M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M6.75 21l3.001-3.002M10.5 7.5H18c.621 0 1.125.504 1.125 1.125v3.865"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Couleurs de marque
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Cliquez sur une couleur pour copier son code hexad&eacute;cimal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {brandColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => handleCopyColor(color.hex)}
                    className="group relative flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className="w-16 h-16 rounded-xl shadow-sm border border-gray-200 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {color.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {copiedColor === color.hex ? "Copié !" : color.hex}
                      </div>
                    </div>
                    {copiedColor === color.hex && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Screenshots */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-700 delay-200 ${
                reveal("ressources")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Captures d&apos;&eacute;cran
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Screenshots du produit (dashboard, galerie, vue mobile) disponibles sur demande.
                    Contactez{" "}
                    <a
                      href="mailto:presse@focusracer.com"
                      className="text-emerald-600 hover:text-emerald-700 underline"
                    >
                      presse@focusracer.com
                    </a>{" "}
                    pour recevoir le dossier complet.
                  </p>
                </div>
              </div>
            </div>

            {/* Boilerplate */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-700 delay-300 ${
                reveal("ressources")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      Description standard
                    </h3>
                    <button
                      onClick={handleCopyBoilerplate}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all duration-200"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                        />
                      </svg>
                      {copiedBoilerplate ? "Copié !" : "Copier"}
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic border-l-4 border-emerald-200 pl-4">
                    &laquo;&nbsp;{boilerplate}&nbsp;&raquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COUVERTURE ═══════════ */}
      <section id="couverture" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("couverture")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Revue de presse
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils parlent de nous
            </h2>
            <p className="text-gray-600 text-lg">
              Vous souhaitez &eacute;crire sur Focus Racer&nbsp;? Contactez-nous pour
              des informations exclusives.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 p-8 text-center transition-all duration-500 hover:shadow-lg ${
                  reveal("couverture")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-emerald-50 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-400 group-hover:text-emerald-600 transition-colors">
                  Votre m&eacute;dia ici
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Proposer un article ou un partenariat
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT PRESSE ═══════════ */}
      <section
        id="contact-presse"
        data-reveal
        className="py-20 md:py-28 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("contact-presse")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Contact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Contact presse
            </h2>
          </div>

          <div
            className={`max-w-3xl mx-auto transition-all duration-700 ${
              reveal("contact-presse")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Left */}
                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email presse</p>
                      <a
                        href="mailto:presse@focusracer.com"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors text-sm"
                      >
                        presse@focusracer.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Temps de r&eacute;ponse
                      </p>
                      <p className="text-gray-500 text-sm">
                        Moins de 24h en jours ouvr&eacute;s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-6.364-6.364L4.5 8.25"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        R&eacute;seaux sociaux
                      </p>
                      <p className="text-gray-500 text-sm">
                        LinkedIn &middot; X (Twitter)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="p-8">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Nous pouvons fournir
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Interviews du fondateur",
                      "Données exclusives et statistiques",
                      "Démonstrations en direct de la plateforme",
                      "Visuels HD et captures d’écran",
                      "Accès presse à la plateforme",
                      "Dossier de presse complet (PDF)",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-emerald-500 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        <span className="text-gray-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
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
            Une question&nbsp;?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            L&apos;&eacute;quipe presse vous r&eacute;pond sous 24h. N&apos;h&eacute;sitez
            pas &agrave; nous contacter pour toute demande d&apos;information, interview
            ou partenariat m&eacute;dia.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:presse@focusracer.com">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                presse@focusracer.com
              </button>
            </a>
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                Formulaire de contact
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
