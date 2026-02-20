"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const faqSections: FaqSection[] = [
  {
    id: "sportifs",
    title: "Sportifs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    items: [
      {
        q: "Comment retrouver mes photos de course ?",
        a: "Rendez-vous sur la page de l'événement et entrez votre numéro de dossard dans la barre de recherche. Notre IA détecte automatiquement les dossards sur les photos. Vous pouvez aussi rechercher par nom si la start-list est disponible.",
      },
      {
        q: "La recherche par selfie, comment ça marche ?",
        a: "Prenez un selfie ou importez une photo de votre visage. Notre technologie de reconnaissance faciale compare votre visage avec ceux détectés sur les photos de course et vous propose les correspondances. La précision est d'environ 95%.",
      },
      {
        q: "Mon dossard n'a pas été détecté, que faire ?",
        a: "Il arrive que l'IA ne détecte pas certains dossards (cachés, pliés, boue…). Essayez la recherche par nom si la start-list est disponible, ou par selfie. Vous pouvez aussi contacter le photographe de l'événement.",
      },
    ],
  },
  {
    id: "photographes",
    title: "Photographes",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    items: [
      {
        q: "Comment devenir photographe sur Focus Racer ?",
        a: "Créez un compte gratuit en choisissant le profil « Photographe ». Vous pourrez ensuite créer des événements, uploader vos photos et définir vos tarifs. L'inscription est ouverte à tous les photographes professionnels et amateurs.",
      },
      {
        q: "Comment fonctionne le système de crédits ?",
        a: "Chaque photo uploadée consomme 1 crédit. Les crédits couvrent le traitement IA (détection de dossard, reconnaissance faciale, watermark). Vous pouvez acheter des packs de crédits : 1 000 crédits (19 €), 5 000 crédits (85 €) ou 15 000 crédits (225 €).",
      },
      {
        q: "Comment recevoir mes paiements ?",
        a: "Connectez votre compte Stripe via l'espace photographe (onglet Commandes > Stripe Connect). L'onboarding prend environ 3 minutes. Les paiements des sportifs sont versés directement sur votre compte Stripe, moins les frais Stripe (~1,4 % + 0,25 €).",
      },
    ],
  },
  {
    id: "organisateurs",
    title: "Organisateurs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    items: [
      {
        q: "Comment publier un événement sur la marketplace ?",
        a: "Depuis votre espace organisateur, créez une annonce sur la marketplace en précisant la date, le lieu, le type de sport et votre budget. Les photographes pourront candidater et vous choisissez celui qui correspond le mieux.",
      },
      {
        q: "Puis-je avoir plusieurs photographes sur un événement ?",
        a: "Oui, chaque photographe crée son propre événement sur la plateforme et gère ses photos indépendamment. À terme, nous prévoyons un système d'accréditations pour que l'organisateur puisse assigner plusieurs photographes à un même événement.",
      },
      {
        q: "Comment importer ma start-list ?",
        a: "Vous pouvez importer votre start-list au format CSV, ou via les connecteurs API (Njuko, KMS). Cela permet aux sportifs de retrouver leurs photos par nom en plus du numéro de dossard.",
      },
    ],
  },
  {
    id: "paiements",
    title: "Paiements",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons les cartes bancaires (Visa, Mastercard, Amex), Apple Pay, Google Pay, Link (paiement en un clic) et les virements SEPA. Tous les paiements sont sécurisés par Stripe.",
      },
      {
        q: "À quoi correspondent les frais de service de 1 € ?",
        a: "Des frais de service de 1 € sont ajoutés à chaque commande pour couvrir les coûts de fonctionnement de la plateforme (hébergement, IA, support). Ce montant est fixe quelle que soit la taille de la commande.",
      },
      {
        q: "Puis-je obtenir un remboursement ?",
        a: "Les photos numériques étant des biens dématérialisés, les remboursements sont traités au cas par cas. Contactez-nous via le formulaire de contact en précisant votre numéro de commande et le motif de votre demande.",
      },
    ],
  },
  {
    id: "technique",
    title: "Technique & IA",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    items: [
      {
        q: "Comment fonctionne la détection de dossards ?",
        a: "Notre technologie d'intelligence artificielle analyse chaque photo pour détecter automatiquement les numéros de dossard grâce à la reconnaissance optique de caractères (OCR). La précision est de 85 à 95 % selon la lisibilité du dossard (taille, angle, conditions d'éclairage).",
      },
      {
        q: "La reconnaissance faciale est-elle fiable ?",
        a: "Oui, notre système utilise une technologie avancée de reconnaissance faciale avec un seuil de confiance de 95 %. Cela permet de retrouver vos photos même lorsque le dossard n'est pas visible. Les données biométriques sont traitées conformément au RGPD.",
      },
      {
        q: "Pourquoi certaines photos sont-elles filtrées ?",
        a: "Avant traitement, notre système peut filtrer les photos floues (analyse de la netteté) et les doublons (comparaison par empreinte visuelle). Ces options sont activées par défaut mais peuvent être désactivées par le photographe lors de l'import.",
      },
    ],
  },
  {
    id: "rgpd",
    title: "RGPD & Données personnelles",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    items: [
      {
        q: "Quels sont mes droits sur mes données personnelles ?",
        a: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition sur vos données personnelles. Vous pouvez exercer ces droits depuis votre compte ou via la page RGPD.",
      },
      {
        q: "Comment demander la suppression de mes photos ?",
        a: "Rendez-vous sur la page RGPD (/gdpr) et remplissez le formulaire de demande de suppression en précisant votre email, votre numéro de dossard et l'événement concerné. Votre demande sera traitée sous 30 jours maximum.",
      },
      {
        q: "Qui est le DPO de Focus Racer ?",
        a: "Le Délégué à la Protection des Données (DPO) est joignable à l'adresse dpo@focusracer.com. Pour toute question relative à la protection de vos données personnelles, n'hésitez pas à le contacter.",
      },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className="text-sm font-medium text-navy group-hover:text-emerald transition-colors pr-4">
          {item.q}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-96 pb-4" : "max-h-0"}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative container mx-auto px-4 py-16 md:py-20 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
              Questions fréquentes
            </h1>
            <p className="text-white/70 max-w-lg mx-auto animate-fade-in animation-delay-100">
              Retrouvez les réponses aux questions les plus posées sur Focus Racer.
            </p>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 md:py-24 gradient-bg-subtle">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-8">
              {faqSections.map((section) => (
                <div key={section.id} id={section.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald flex-shrink-0">
                      {section.icon}
                    </div>
                    <h2 className="text-xl font-bold text-navy">{section.title}</h2>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
                    {section.items.map((item) => (
                      <AccordionItem key={item.q} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA contact */}
            <div className="mt-16 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-navy mb-2">
                  Vous n&apos;avez pas trouvé votre réponse ?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Notre équipe est disponible pour répondre à toutes vos questions.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald hover:bg-emerald-dark text-white rounded-xl font-medium shadow-emerald transition-all duration-200"
                >
                  Contactez-nous
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
