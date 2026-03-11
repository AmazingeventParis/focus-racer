"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   DATA — Partenaires Focus Racer
   ═══════════════════════════════════════════════════════════════ */

const heroStats = [
  { value: 45, suffix: "+", label: "Partenaires actifs" },
  { value: 150, suffix: "+", label: "Événements couverts" },
  { value: 30, suffix: "+", label: "Sports représentés" },
  { value: 5, suffix: "", label: "Pays" },
];

const partnerTypes = [
  {
    id: "chronometreurs",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Chronométreurs",
    subtitle: "Intégration technique bidirectionnelle",
    description:
      "Synchronisez vos données de chronométrage avec Focus Racer pour une expérience sportif sans couture. Start-lists, résultats et photos liés automatiquement.",
    features: [
      "API bidirectionnelle temps réel",
      "Synchronisation start-lists automatique",
      "Revenus partagés sur chaque vente",
      "Co-branding sur les galeries",
    ],
    color: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/20",
  },
  {
    id: "federations",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-2.27.978m0 0a6.004 6.004 0 01-2.27-.978" />
      </svg>
    ),
    title: "Fédérations sportives",
    subtitle: "Couverture photo officielle",
    description:
      "Offrez une couverture photo professionnelle à tous les événements fédéraux. Galeries officielles, data analytics et valorisation de vos licenciés.",
    features: [
      "Galeries fédérales avec branding officiel",
      "Analytics et data sur la participation",
      "Couverture multi-événements centralisée",
      "Accès prioritaire aux nouvelles fonctionnalités",
    ],
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/20",
  },
  {
    id: "agences",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    title: "Agences photo",
    subtitle: "Outils professionnels multi-photographes",
    description:
      "Gérez vos équipes de photographes, centralisez vos événements et maximisez vos revenus grâce à la marketplace et aux outils IA de Focus Racer.",
    features: [
      "Gestion multi-photographes centralisée",
      "Accès marketplace prioritaire",
      "Outils de facturation intégrés",
      "Dashboard analytics par équipe",
    ],
    color: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-500/10",
    textColor: "text-violet-400",
    borderColor: "border-violet-500/20",
  },
  {
    id: "clubs",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Clubs & associations",
    subtitle: "Tarifs préférentiels pour vos membres",
    description:
      "Proposez à vos adhérents un accès privilégié aux photos de leurs compétitions. Pages club personnalisées, galeries privées et tarifs négociés.",
    features: [
      "Tarifs préférentiels pour les membres",
      "Pages club avec branding personnalisé",
      "Galeries privées par équipe",
      "Export annuel des photos du club",
    ],
    color: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
  },
  {
    id: "collectivites",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    title: "Collectivités & mairies",
    subtitle: "Solution clé en main pour le territoire",
    description:
      "Valorisez les événements sportifs de votre territoire avec une solution conforme RGPD, clé en main, et un reporting municipal détaillé.",
    features: [
      "Solution clé en main prête à déployer",
      "Conformité RGPD native et auditée",
      "Reporting et statistiques municipales",
      "Support dédié collectivités",
    ],
    color: "from-rose-500 to-pink-500",
    bgLight: "bg-rose-500/10",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/20",
  },
];

const connectors = [
  {
    name: "Njuko",
    desc: "Inscription et chronométrage",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    name: "KMS",
    desc: "Chronométrage & résultats",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "CSV / Excel",
    desc: "Import start-lists universel",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M12 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m1.125-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M12 15.75h-1.125" />
      </svg>
    ),
  },
  {
    name: "API REST",
    desc: "Intégration sur mesure",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    name: "Webhooks",
    desc: "Notifications événementielles",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
];

const benefits = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "Revenus partagés",
    description:
      "Bénéficiez d'un programme de revenus partagés sur chaque vente générée via votre intégration. Un modèle gagnant-gagnant.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Visibilité accrue",
    description:
      "Votre marque mise en avant sur notre plateforme, dans les galeries d'événements et les communications partenaires.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "Technologie IA",
    description:
      "Accédez à notre intelligence artificielle de pointe : OCR, reconnaissance faciale, tri automatique, retouche, smart crop.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: "Support dédié",
    description:
      "Un interlocuteur technique dédié pour l'intégration, la formation et le support continu. Accompagnement personnalisé.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Co-branding",
    description:
      "Votre logo sur les galeries, les watermarks et les communications. Renforcez votre marque auprès de milliers de sportifs.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Données & analytics",
    description:
      "Accédez à des données détaillées : couverture photo, engagement des sportifs, performances par événement et tendances du marché.",
  },
];

const testimonials = [
  {
    quote:
      "L'intégration avec Focus Racer a transformé notre offre. Nos clients reçoivent leurs photos liées à leurs résultats en temps réel. Le taux de satisfaction a bondi de 40%.",
    author: "Marc Delpierre",
    role: "Directeur technique",
    company: "ChronoPro Timing",
    type: "Chronométreur",
  },
  {
    quote:
      "Nous avons déployé Focus Racer sur l'ensemble de nos événements fédéraux. La couverture photo automatisée et les galeries officielles sont un vrai plus pour nos licenciés.",
    author: "Isabelle Moreau",
    role: "Directrice communication",
    company: "Fédération Française de Trail",
    type: "Fédération",
  },
  {
    quote:
      "En tant que collectivité, nous cherchions une solution respectueuse du RGPD pour nos événements sportifs municipaux. Focus Racer coche toutes les cases, avec un reporting exemplaire.",
    author: "Jean-Philippe Renard",
    role: "Adjoint aux sports",
    company: "Ville de Chamonix",
    type: "Collectivité",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Prise de contact",
    description:
      "Remplissez le formulaire de contact ou envoyez-nous un email. Notre équipe partenariats vous recontacte sous 48h.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Évaluation mutuelle",
    description:
      "Nous analysons ensemble vos besoins, vos volumes et définissons le périmètre de l'intégration technique et commerciale.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Intégration technique",
    description:
      "Notre équipe vous accompagne pour l'intégration API, la configuration des connecteurs et les tests de bout en bout.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58 3.18a.75.75 0 01-1.09-.79l1.06-6.18L.92 6.65a.75.75 0 01.42-1.28l6.21-.9L10.33.52a.75.75 0 011.34 0l2.78 5.65 6.21.9a.75.75 0 01.42 1.28l-4.49 4.38 1.06 6.18a.75.75 0 01-1.09.79l-5.56-2.92z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "Lancement & suivi",
    description:
      "Déploiement en production, communication conjointe et suivi des performances avec votre interlocuteur dédié.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
];

const faqItems = [
  {
    q: "Quelles sont les conditions pour devenir partenaire Focus Racer ?",
    a: "Le programme est ouvert à toute organisation intervenant dans l'écosystème du sport : chronométreurs, fédérations, agences photo, clubs, associations, collectivités et médias sportifs. Nous évaluons chaque candidature sur la complémentarité avec notre plateforme et la valeur ajoutée pour les sportifs.",
  },
  {
    q: "Le programme partenaire est-il payant ?",
    a: "L'adhésion au programme est gratuite. Selon le type de partenariat, un modèle de revenus partagés ou de tarifs préférentiels est mis en place. Aucun frais d'entrée, aucun engagement minimum. Les conditions sont définies ensemble lors de la phase d'évaluation.",
  },
  {
    q: "Quel est le délai d'intégration technique ?",
    a: "Pour une intégration standard (connecteur CSV ou API REST), comptez 1 à 2 semaines. Pour une intégration bidirectionnelle complète avec synchronisation temps réel, le délai est de 3 à 6 semaines selon la complexité. Notre équipe technique vous accompagne à chaque étape.",
  },
  {
    q: "Bénéficierons-nous d'un support technique dédié ?",
    a: "Oui. Chaque partenaire dispose d'un interlocuteur technique dédié, d'un accès à notre documentation API privée, et d'un canal de support prioritaire. Nous proposons également des sessions de formation et d'accompagnement personnalisées.",
  },
];

const codeSnippet = `// Exemple d'appel API Focus Racer
const response = await fetch(
  "https://api.focusracer.com/v1/events",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer <PARTNER_TOKEN>",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Trail du Mont-Blanc 2026",
      date: "2026-07-15",
      sport: "trail",
      startList: startListData
    })
  }
);

const event = await response.json();
// { id: "evt_abc123", status: "created" }`;

/* ═══════════════════════════════════════════════════════════════
   FAQ ACCORDION COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function FaqAccordionItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors pr-4">
          {item.q}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function PartenairesPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeConnector, setActiveConnector] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const connectorInterval = useRef<NodeJS.Timeout | null>(null);

  // Scroll reveal observer
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
              el.textContent = current + suffix;
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

  // Connector auto-cycle
  useEffect(() => {
    connectorInterval.current = setInterval(() => {
      setActiveConnector((prev) => (prev + 1) % connectors.length);
    }, 3000);
    return () => {
      if (connectorInterval.current) clearInterval(connectorInterval.current);
    };
  }, []);

  const reveal = useCallback(
    (id: string) => visibleSections.has(id),
    [visibleSections]
  );

  return (
    <main className="bg-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-400 rounded-full blur-[150px]" />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />

        <div className="container mx-auto px-4 pt-28 pb-20 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white animate-fade-in">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Programme partenaire
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Devenez partenaire{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Focus Racer
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Rejoignez l'écosystème de la photo sportive intelligente.
              Chronométreurs, fédérations, agences, clubs, collectivités, médias :
              construisons ensemble le futur de la couverture photo événementielle.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/contact">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                  Devenir partenaire
                </button>
              </Link>
              <a href="#programme">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                  Découvrir le programme
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {heroStats.map((stat, i) => (
                <div key={i}>
                  <div
                    className="text-2xl md:text-3xl font-bold"
                    data-count={stat.value}
                    data-suffix={stat.suffix}
                  >
                    0
                  </div>
                  <div className="text-sm text-white/80 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PROGRAMME PARTENAIRE ═══════════ */}
      <section id="programme" data-reveal className="py-20 md:py-28 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("programme") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Programme partenaire
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Un programme pour chaque acteur
            </h2>
            <p className="text-gray-600 text-lg">
              Que vous soyez chronométreur, fédération ou collectivité, nous avons
              conçu un programme adapté à vos besoins et à votre écosystème.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {partnerTypes.map((partner, i) => {
              const isExpanded = expandedCard === partner.id;
              return (
                <div
                  key={partner.id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden ${
                    isExpanded
                      ? `shadow-xl ${partner.borderColor} ring-1 ring-offset-0`
                      : "border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200"
                  } ${
                    reveal("programme")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  } ${i >= 3 ? "lg:col-span-1 md:col-span-1" : ""}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                  onClick={() =>
                    setExpandedCard(isExpanded ? null : partner.id)
                  }
                  onMouseEnter={() => setExpandedCard(partner.id)}
                  onMouseLeave={() => setExpandedCard(null)}
                >
                  {/* Gradient top bar */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${partner.color}`}
                  />

                  <div className="p-6">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-14 h-14 rounded-xl ${partner.bgLight} flex items-center justify-center ${partner.textColor} flex-shrink-0`}
                      >
                        {partner.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {partner.title}
                        </h3>
                        <p className={`text-sm ${partner.textColor} font-medium`}>
                          {partner.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {partner.description}
                    </p>

                    {/* Features — expanded */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="space-y-2.5 pt-2 border-t border-gray-100">
                        {partner.features.map((feat, fi) => (
                          <li
                            key={fi}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <svg
                              className={`w-4 h-4 ${partner.textColor} flex-shrink-0 mt-0.5`}
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
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expand hint */}
                    <div
                      className={`flex items-center gap-1 text-xs mt-3 transition-all duration-300 ${
                        isExpanded
                          ? `${partner.textColor} opacity-0`
                          : "text-gray-400 opacity-100"
                      }`}
                    >
                      <span>Voir les avantages</span>
                      <svg
                        className="w-3 h-3"
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ INTÉGRATIONS TECHNIQUES ═══════════ */}
      <section id="integration" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("integration")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Technique
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Intégrations techniques
            </h2>
            <p className="text-gray-600 text-lg">
              Connectez vos systèmes à Focus Racer en quelques jours grâce à nos
              connecteurs prêts à l'emploi et notre API REST documentée.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
            {/* Connector widget */}
            <div
              className={`transition-all duration-700 ${
                reveal("integration")
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">
                  Connecteurs disponibles
                </h3>

                <div className="space-y-3">
                  {connectors.map((conn, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveConnector(i);
                        if (connectorInterval.current)
                          clearInterval(connectorInterval.current);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                        activeConnector === i
                          ? "bg-emerald-50 border-emerald-200 shadow-sm"
                          : "bg-white border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                          activeConnector === i
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {conn.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold text-sm transition-colors duration-300 ${
                            activeConnector === i
                              ? "text-emerald-700"
                              : "text-gray-900"
                          }`}
                        >
                          {conn.name}
                        </div>
                        <div className="text-xs text-gray-500">{conn.desc}</div>
                      </div>
                      {activeConnector === i && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-5 text-center">
                  Documentation API disponible sur demande
                </p>
              </div>
            </div>

            {/* Code snippet */}
            <div
              className={`transition-all duration-700 delay-200 ${
                reveal("integration")
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="bg-[#1e1e2e] rounded-2xl shadow-xl overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#181825] border-b border-[#313244]">
                  <div className="w-3 h-3 rounded-full bg-[#f38ba8]" />
                  <div className="w-3 h-3 rounded-full bg-[#f9e2af]" />
                  <div className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
                  <span className="ml-2 text-xs text-[#6c7086] font-mono">
                    api-example.ts
                  </span>
                </div>

                {/* Code content */}
                <pre className="p-5 text-sm font-mono leading-relaxed overflow-x-auto">
                  <code className="text-[#cdd6f4]">
                    {codeSnippet.split("\n").map((line, li) => {
                      let colored = line;
                      // Simple syntax highlighting
                      if (line.trimStart().startsWith("//")) {
                        return (
                          <div key={li} className="text-[#6c7086]">
                            {line}
                          </div>
                        );
                      }
                      return (
                        <div key={li}>
                          {colored
                            .replace(
                              /(const|await|method|headers|body)/g,
                              '<kw>$1</kw>'
                            )
                            .split(/<kw>|<\/kw>/)
                            .map((part, pi) =>
                              pi % 2 === 1 ? (
                                <span key={pi} className="text-[#cba6f7]">
                                  {part}
                                </span>
                              ) : (
                                <span key={pi}>
                                  {part.split(/(".*?")/g).map((s, si) =>
                                    si % 2 === 1 ? (
                                      <span key={si} className="text-[#a6e3a1]">
                                        {s}
                                      </span>
                                    ) : (
                                      <span key={si}>{s}</span>
                                    )
                                  )}
                                </span>
                              )
                            )}
                        </div>
                      );
                    })}
                  </code>
                </pre>
              </div>

              <div className="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <svg
                  className="w-5 h-5 text-emerald-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
                <p className="text-sm text-emerald-700">
                  <strong>API REST sécurisée</strong> avec authentification par token,
                  rate limiting et documentation OpenAPI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ AVANTAGES ═══════════ */}
      <section id="avantages" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("avantages")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Avantages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi devenir partenaire ?
            </h2>
            <p className="text-gray-600 text-lg">
              Un programme conçu pour créer de la valeur à chaque niveau de la chaîne.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all duration-500 ${
                  reveal("avantages")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TÉMOIGNAGES ═══════════ */}
      <section id="temoignages" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("temoignages")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Témoignages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative transition-all duration-500 hover:shadow-lg ${
                  reveal("temoignages")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Quote mark */}
                <svg
                  className="w-10 h-10 text-emerald-100 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                </svg>

                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                  « {t.quote} »
                </p>

                <div className="border-t border-gray-100 pt-4">
                  <div className="font-semibold text-gray-900 text-sm">
                    {t.author}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {t.role}, {t.company}
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                      {t.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PROCESSUS ═══════════ */}
      <section id="process" data-reveal className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
              reveal("process")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              Comment ça marche
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment rejoindre le programme
            </h2>
            <p className="text-gray-600 text-lg">
              Un processus simple en 4 étapes pour devenir partenaire Focus Racer.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Timeline line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-0.5 bg-emerald-200" />

            <div className="grid md:grid-cols-4 gap-8">
              {processSteps.map((step, i) => (
                <div
                  key={i}
                  className={`relative text-center transition-all duration-500 ${
                    reveal("process")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Step circle */}
                  <div className="relative mx-auto mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mx-auto">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-600 shadow-sm">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ PARTENAIRES ═══════════ */}
      <section id="faq-partenaires" data-reveal className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              reveal("faq-partenaires")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 px-6 transition-all duration-700 delay-100 ${
              reveal("faq-partenaires")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {faqItems.map((item) => (
              <FaqAccordionItem key={item.q} item={item} />
            ))}
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
            Rejoignez l'écosystème Focus Racer
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Ensemble, construisons le futur de la photo sportive événementielle.
            Chronométreurs, fédérations, clubs, collectivités : votre place est ici.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg">
                Devenir partenaire
              </button>
            </Link>
            <Link href="/about">
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg">
                En savoir plus sur Focus Racer
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
