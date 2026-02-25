"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   ARTICLE DATA — FULL CONTENT
   ═══════════════════════════════════════════════════════════════ */

interface TocItem {
  id: string;
  label: string;
}

interface FullArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  icon: string;
  metaDescription: string;
  toc: TocItem[];
  content: React.ReactNode;
}

/* ── Helpers ── */
function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald hover:bg-emerald-dark text-white rounded-xl font-medium shadow-emerald transition-all duration-200 text-sm my-4"
    >
      {children}
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE 1 — Comment retrouver ses photos de course
   ═══════════════════════════════════════════════════════════════ */

const article1Content = (
  <>
    <p className="text-lg text-gray-600 leading-relaxed mb-6">
      Vous venez de franchir la ligne d'arrivée, l'adrénaline retombe, et une question vous brûle les lèvres : <strong>« Où sont mes photos ? »</strong> Chaque année, des millions de photos sont prises lors d'événements sportifs. Pourtant, les retrouver reste souvent un parcours du combattant. Ce guide complet vous présente les trois méthodes disponibles sur Focus Racer pour retrouver vos clichés en une fraction de seconde.
    </p>

    <h2 id="methode-dossard" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      1. La recherche par numéro de dossard
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      C'est la méthode la plus directe et la plus utilisée. Notre intelligence artificielle analyse chaque photo téléchargée par le photographe et <strong>détecte automatiquement les numéros de dossard</strong> grâce à la reconnaissance optique de caractères (OCR). Le taux de précision atteint 85 à 95 % selon les conditions de prise de vue.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Comment procéder :</strong>
    </p>
    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Rendez-vous sur la page de l'événement depuis la section <Link href="/explore" className="text-emerald hover:underline">Explorer</Link>.</li>
      <li>Saisissez votre numéro de dossard dans la barre de recherche.</li>
      <li>Les résultats s'affichent instantanément : toutes les photos où votre dossard a été détecté.</li>
      <li>Parcourez, sélectionnez vos préférées, et achetez en un clic.</li>
    </ol>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Astuce :</strong> pour maximiser la détection, assurez-vous que votre dossard est bien visible au départ. Évitez de le plier, de le couvrir avec une ceinture porte-bidon ou de le porter dans le dos si le photographe est placé de face.
    </p>

    <h2 id="methode-selfie" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      2. La recherche par selfie (reconnaissance faciale)
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Votre dossard était caché par un bras, replié par le vent, ou recouvert de boue ? Pas de panique. Focus Racer intègre un système de <strong>reconnaissance faciale avancée</strong> qui compare votre visage avec ceux détectés sur les milliers de photos de l'événement.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Comment ça marche :</strong>
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Cliquez sur « Recherche par selfie » sur la page de l'événement.</li>
      <li>Prenez un selfie ou importez une photo récente de votre visage.</li>
      <li>L'IA compare votre visage avec les photos indexées en moins d'une seconde.</li>
      <li>Vous obtenez les résultats classés par degré de confiance.</li>
    </ul>
    <p className="text-gray-600 leading-relaxed mb-4">
      La précision de la reconnaissance faciale atteint <strong>95 %</strong>. Pour de meilleurs résultats, utilisez une photo de face, bien éclairée, sans lunettes de soleil. Les données biométriques sont traitées conformément au RGPD et ne sont jamais partagées avec des tiers.
    </p>

    <h2 id="methode-nom" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      3. La recherche par nom
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Si le photographe ou l'organisateur a importé la <strong>start-list</strong> (liste des participants), vous pouvez simplement taper votre nom dans la barre de recherche. Le système croise automatiquement votre nom avec votre numéro de dossard, puis affiche toutes les photos correspondantes.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Cette méthode est particulièrement pratique lorsque vous ne vous souvenez plus de votre numéro de dossard — ce qui arrive plus souvent qu'on ne le croit après une course éprouvante !
    </p>

    <h2 id="ia-vs-manuel" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Pourquoi l'IA surpasse la recherche manuelle
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avant l'intelligence artificielle, retrouver ses photos impliquait de faire défiler des centaines, parfois des milliers de clichés. Un événement de 500 participants avec 3 photographes génère facilement <strong>5 000 à 10 000 photos</strong>. Faire défiler manuellement ces images prend 30 minutes à 1 heure.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avec Focus Racer, le tri est <strong>100 % automatisé</strong>. L'IA traite 10 000 photos en environ 5 minutes (30ms par photo). Chaque photo est analysée, indexée et liée au bon sportif. La recherche prend ensuite <strong>moins d'une seconde</strong>.
    </p>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-medium text-navy mb-1">Le saviez-vous ?</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sur Focus Racer, 95 % des photos sont automatiquement liées au bon sportif grâce à la combinaison OCR + reconnaissance faciale. Les 5 % restants correspondent généralement à des photos de dos, de paysage ou de groupe sans dossard visible.
          </p>
        </div>
      </div>
    </div>

    <h2 id="astuces" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Nos astuces pour être sûr de retrouver vos photos
    </h2>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Portez votre dossard bien visible</strong> sur la poitrine, sans le plier ni le couvrir. Si possible, épinglez-le à plat avec 4 épingles.</li>
      <li><strong>Regardez les photographes</strong> quand vous les croisez. Un bref regard face caméra facilite la détection faciale.</li>
      <li><strong>Vérifiez la start-list</strong> : si votre nom y figure, vous pourrez chercher par nom en plus du dossard.</li>
      <li><strong>Utilisez plusieurs méthodes</strong> : combinez dossard + selfie pour un résultat exhaustif.</li>
      <li><strong>Consultez rapidement</strong> : les photos sont généralement disponibles dans les heures suivant l'événement.</li>
    </ul>

    <h2 id="conclusion" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En résumé
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      Fini le temps où retrouver ses photos de course ressemblait à chercher une aiguille dans une botte de foin. Avec Focus Racer, trois méthodes complémentaires — dossard, selfie et nom — vous garantissent de retrouver chacun de vos clichés. L'IA fait le travail en coulisses pour que vous puissiez vous concentrer sur l'essentiel : revivre l'émotion de votre course.
    </p>
    <CTA href="/explore">Retrouver mes photos maintenant</CTA>
  </>
);

/* ═══════════════════════════════════════════════════════════════
   ARTICLE 2 — Le Golden Time
   ═══════════════════════════════════════════════════════════════ */

const article2Content = (
  <>
    <p className="text-lg text-gray-600 leading-relaxed mb-6">
      Dans le monde de la photographie sportive, il existe une fenêtre d'opportunité que les professionnels appellent le <strong>« Golden Time »</strong> : les 24 premières heures suivant un événement. C'est dans ce laps de temps que se concentrent la grande majorité des achats. Comprendre ce phénomène et l'exploiter, c'est la différence entre un événement rentable et un événement décevant.
    </p>

    <h2 id="psychologie" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La psychologie de l'achat post-course
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Quand un sportif franchit la ligne d'arrivée, il est dans un état émotionnel intense. Fierté, soulagement, euphorie — c'est à ce moment précis que l'envie de <strong>capturer et partager ce souvenir</strong> est à son maximum. Le sportif consulte ses résultats, en parle à ses proches, publie sur les réseaux sociaux.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Ce pic émotionnel se dissipe rapidement. Après 48 heures, le sportif est déjà tourné vers son prochain objectif. Après une semaine, l'urgence d'achat a quasiment disparu. Les données du secteur sont sans appel :
    </p>
    <div className="grid sm:grid-cols-3 gap-4 my-6">
      {[
        { stat: "70 %", label: "des ventes dans les 24 h" },
        { stat: "20 %", label: "entre 24 h et 72 h" },
        { stat: "10 %", label: "après 72 h" },
      ].map((s, i) => (
        <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald" dangerouslySetInnerHTML={{ __html: s.stat }} />
          <div className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: s.label }} />
        </div>
      ))}
    </div>

    <h2 id="capitaliser" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Comment capitaliser sur le Golden Time
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La clé, c'est la <strong>vitesse de mise en ligne</strong>. Chaque heure entre la fin de la course et la disponibilité des photos coûte des ventes. Voici les facteurs déterminants :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Uploadez pendant la course</strong> : avec le mode Live de Focus Racer, vous pouvez envoyer vos photos en temps réel depuis le terrain. Les sportifs voient leurs photos avant même d'avoir quitté le site.</li>
      <li><strong>Laissez l'IA trier</strong> : le tri manuel prend des heures. Notre pipeline automatique indexe 10 000 photos en 5 minutes. Aucun temps perdu entre l'upload et la mise en vente.</li>
      <li><strong>Envoyez des notifications</strong> : Focus Racer peut envoyer un e-mail aux sportifs dès que leurs photos sont disponibles, les ramenant directement vers la galerie.</li>
      <li><strong>Activez le partage social</strong> : quand un sportif partage sa photo watermarkée sur Instagram ou Facebook, il génère des visites supplémentaires — et donc des ventes potentielles.</li>
    </ul>

    <h2 id="traditionnel-vs-ia" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Workflow traditionnel vs. workflow automatisé
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Comparons les deux approches sur un événement type de 800 participants et 6 000 photos :
    </p>
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-semibold text-navy border-b border-gray-200">Étape</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Traditionnel</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Focus Racer</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          <tr><td className="p-3 border-b border-gray-100">Transfert des photos</td><td className="p-3 text-center border-b border-gray-100">2-4 h (carte SD → PC)</td><td className="p-3 text-center border-b border-gray-100">Temps réel (mode Live)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Tri / indexation</td><td className="p-3 text-center border-b border-gray-100">4-8 h (manuel)</td><td className="p-3 text-center border-b border-gray-100">12 min (IA, 6 000 photos)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Retouche</td><td className="p-3 text-center border-b border-gray-100">2-4 h (Lightroom)</td><td className="p-3 text-center border-b border-gray-100">Automatique (inclus)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Watermark + mise en ligne</td><td className="p-3 text-center border-b border-gray-100">1-2 h</td><td className="p-3 text-center border-b border-gray-100">Automatique (inclus)</td></tr>
          <tr className="font-semibold"><td className="p-3 border-b border-gray-200">Total</td><td className="p-3 text-center border-b border-gray-200 text-red-500">9-18 h</td><td className="p-3 text-center border-b border-gray-200 text-emerald">{"< 30 min"}</td></tr>
        </tbody>
      </table>
    </div>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avec un workflow traditionnel, les photos sont souvent disponibles <strong>le lendemain voire 2 jours après</strong>. Le Golden Time est déjà largement entamé. Avec Focus Racer, les photos sont en ligne pendant que les sportifs sont encore sur le site de la course.
    </p>

    <h2 id="maximiser-ventes" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Stratégies pour maximiser vos ventes
    </h2>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Proposez des packs dégressifs</strong> : un sportif qui achète 1 photo peut en acheter 5 si le pack est attractif. Créez des packs à 3, 5 et « toutes mes photos ».</li>
      <li><strong>Annoncez la disponibilité</strong> : coordonnez-vous avec l'organisateur pour annoncer au micro que les photos sont déjà en ligne pendant la remise des prix.</li>
      <li><strong>Utilisez un QR code</strong> : affichez un QR code géant sur le village d'arrivée qui renvoie vers la galerie de l'événement.</li>
      <li><strong>Partagez sur les réseaux</strong> : publiez 5-10 photos « teaser » sur les réseaux sociaux de l'événement avec le lien vers la galerie complète.</li>
    </ul>

    <h2 id="stripe-connect" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Recevez vos paiements directement
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Grâce à Stripe Connect, les paiements des sportifs arrivent directement sur votre compte bancaire, sans intermédiaire. Focus Racer ne prend <strong>aucune commission sur vos ventes</strong> — seuls les frais Stripe standard s'appliquent (~1,4 % + 0,25 €). Un frais de service fixe de 1 € par commande est ajouté au prix payé par le sportif pour couvrir les coûts de la plateforme.
    </p>

    <h2 id="conclusion-gt" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En résumé
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      Le Golden Time n'est pas un mythe marketing — c'est une réalité chiffrée. 70 % de votre chiffre d'affaires se joue dans les 24 premières heures. La vitesse de publication n'est plus un luxe, c'est une nécessité économique. Focus Racer vous donne les outils pour être en ligne en moins de 30 minutes après la course — et capter chaque vente.
    </p>
    <CTA href="/solutions/photographes">Découvrir les outils photographe</CTA>
  </>
);

/* ═══════════════════════════════════════════════════════════════
   ARTICLE 3 — IA tri automatique
   ═══════════════════════════════════════════════════════════════ */

const article3Content = (
  <>
    <p className="text-lg text-gray-600 leading-relaxed mb-6">
      En 2026, l'intelligence artificielle n'est plus un gadget futuriste — c'est le moteur qui propulse la photo sportive dans une nouvelle ère. Chez Focus Racer, notre pipeline IA traite, trie et indexe <strong>10 000 photos en 5 minutes</strong> (30ms par image), là où un tri manuel prendrait une journée entière. Décortiquons les technologies qui rendent cela possible.
    </p>

    <h2 id="ocr-dossards" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      L'OCR : lire les dossards automatiquement
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La première brique de notre pipeline est la <strong>reconnaissance optique de caractères</strong> (OCR, pour <em>Optical Character Recognition</em>). Concrètement, l'IA analyse chaque image à la recherche de texte — en particulier les numéros imprimés sur les dossards des sportifs.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Notre système utilise un <strong>moteur de vision par ordinateur</strong> de pointe qui identifie les zones de texte dans une image, extrait les caractères et les retourne avec un indice de confiance. Nous filtrons ensuite les résultats pour ne garder que les chaînes numériques (les dossards) avec un seuil de confiance supérieur à 70 %.
    </p>
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 my-6 font-mono text-sm text-gray-700">
      <p className="text-gray-400 mb-2">// Exemple simplifié du pipeline OCR</p>
      <p>Photo → Version web (1600px, JPEG) → Moteur OCR IA</p>
      <p>{"→ Filtre numérique (confidence > 70 %) → BibNumber lié"}</p>
    </div>
    <p className="text-gray-600 leading-relaxed mb-4">
      La précision oscille entre <strong>85 % et 95 %</strong> selon la taille du dossard, l'angle, l'éclairage et la lisibilité. Un dossard de face, bien éclairé, de taille raisonnable, sera détecté dans 98 % des cas. Un dossard de profil, partiellement masqué par un bras ou couvert de boue, aura un taux plus faible — mais c'est là que la reconnaissance faciale prend le relais.
    </p>

    <h2 id="reconnaissance-faciale" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La reconnaissance faciale : le filet de sécurité
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Pour les photos où le dossard n'est pas visible (dos, plan large, dossard caché), notre système fait appel à la <strong>reconnaissance faciale</strong>. Le pipeline fonctionne en deux temps :
    </p>
    <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Indexation</strong> : chaque visage détecté sur une photo est extrait, encodé en vecteur biométrique et stocké dans une collection sécurisée dédiée à l'événement.</li>
      <li><strong>Correspondance</strong> : pour une photo « orpheline » (sans dossard), le système recherche si un visage déjà associé à un dossard correspond. Si oui, la photo est automatiquement liée au bon sportif (seuil de confiance : 85 %).</li>
    </ol>
    <p className="text-gray-600 leading-relaxed mb-4">
      Cette approche en <strong>double filet</strong> (OCR + visage) permet d'atteindre un taux de liaison automatique supérieur à 95 %. Le sportif n'a plus qu'à taper son dossard et toutes ses photos apparaissent, y compris celles prises de dos ou en plein effort.
    </p>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="font-medium text-navy mb-1">Respect du RGPD</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Les données biométriques (vecteurs faciaux) sont stockées exclusivement dans une collection AWS isolée par événement. Elles ne sont jamais partagées, revendues ou utilisées à d'autres fins. Chaque sportif peut demander la suppression de ses données via notre formulaire RGPD.
          </p>
        </div>
      </div>
    </div>

    <h2 id="filtrage-qualite" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Le filtrage qualité : ne garder que le meilleur
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avant même de lancer les analyses coûteuses (OCR, reconnaissance faciale), notre pipeline exécute deux pré-filtres qui économisent des crédits IA et améliorent la qualité globale de la galerie :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Filtre de netteté (Laplacian)</strong> : chaque photo est réduite à 256 px et analysée via la variance du Laplacien. Si le score est inférieur au seuil (30/100), la photo est considérée floue et écartée. Ce filtre est activé par défaut mais désactivable par le photographe.</li>
      <li><strong>Dédoublonnage (pHash)</strong> : une empreinte perceptuelle (pHash) de 8x8 pixels en niveaux de gris est calculée pour chaque photo. Si la distance de Hamming entre deux empreintes est inférieure à 5, les photos sont considérées identiques et le doublon est supprimé.</li>
    </ul>
    <p className="text-gray-600 leading-relaxed mb-4">
      Ces filtres s'exécutent <strong>avant</strong> les appels AWS, ce qui préserve les crédits du photographe. Sur un événement type, on observe entre 5 % et 15 % de photos écartées par ces filtres.
    </p>

    <h2 id="pipeline-complet" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Le pipeline complet : du fichier brut à la galerie
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Voici le cheminement complet d'une photo dans le système Focus Racer :
    </p>
    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Le photographe uploade ses photos (compression côté client, envoi par lots de 25).</li>
      <li>Le serveur génère une version web optimisée (1600 px, WebP, ~200-400 Ko).</li>
      <li>Pré-filtrage : dédoublonnage pHash + filtre netteté Laplacian.</li>
      <li><strong>En parallèle</strong> : analyse qualité + génération watermark + OCR dossard + indexation faciale.</li>
      <li>Mise à jour base de données (dossards détectés, visages indexés, score qualité).</li>
      <li>Optionnel : Smart Crop (recadrage portrait par visage) + retouche automatique.</li>
      <li>Tentative de liaison par reconnaissance faciale pour les photos orphelines.</li>
      <li>Auto-clustering : regroupement par dossard après le dernier traitement (debounce 30 s).</li>
    </ol>

    <h2 id="manuel-vs-ia" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Tri manuel vs. tri IA : les chiffres
    </h2>
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-semibold text-navy border-b border-gray-200">Critère</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Tri manuel</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">IA Focus Racer</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          <tr><td className="p-3 border-b border-gray-100">10 000 photos</td><td className="p-3 text-center border-b border-gray-100">1-2 jours</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">~5 min</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Précision dossard</td><td className="p-3 text-center border-b border-gray-100">99 % (humain)</td><td className="p-3 text-center border-b border-gray-100">85-95 %</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Photos orphelines récupérées</td><td className="p-3 text-center border-b border-gray-100">0 % (ignorées)</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">~15 % (via visage)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Filtre flou + doublons</td><td className="p-3 text-center border-b border-gray-100">Non (trop long)</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">Automatique</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Coût humain</td><td className="p-3 text-center border-b border-gray-100">Élevé</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">0,019 €/photo</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="tendances" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Les tendances IA pour 2026 et au-delà
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La photo sportive automatisée n'en est qu'à ses débuts. Voici les évolutions que nous anticipons :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Détection d'émotions</strong> : identifier automatiquement les expressions de joie, d'effort ou de victoire pour mettre en avant les photos les plus émouvantes.</li>
      <li><strong>Synchronisation chrono</strong> : croiser les données GPS/chrono avec les métadonnées EXIF des photos pour ajouter temps, allure et classement directement sur l'image.</li>
      <li><strong>Génération de teasers vidéo</strong> : assembler automatiquement les meilleures photos d'un sportif en un diaporama vidéo partagé sur les réseaux sociaux.</li>
      <li><strong>Amélioration continue</strong> : les modèles de vision par ordinateur s'améliorent constamment. Chaque année, la précision augmente et les coûts diminuent.</li>
    </ul>

    <h2 id="conclusion-ia" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En résumé
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      L'IA a transformé la photographie sportive d'un métier à forte intensité manuelle en un processus fluide et automatisé. OCR, reconnaissance faciale, filtrage qualité et dédoublonnage travaillent de concert pour que chaque photo trouve son propriétaire en 30 millisecondes. Focus Racer place cette technologie entre les mains de tous les photographes, sans compétence technique requise.
    </p>
    <CTA href="/solutions/photographes">Tester le pipeline IA</CTA>
  </>
);

/* ═══════════════════════════════════════════════════════════════
   ARTICLE 4 — Organiser la couverture photo
   ═══════════════════════════════════════════════════════════════ */

const article4Content = (
  <>
    <p className="text-lg text-gray-600 leading-relaxed mb-6">
      La couverture photo d'un événement sportif ne s'improvise pas. Nombre de photographes, positionnement sur le parcours, workflow de livraison, monétisation : chaque décision a un impact direct sur la satisfaction des participants et la rentabilité de l'opération. Ce guide vous accompagne pas à pas.
    </p>

    <h2 id="planification" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Planification : combien de photographes ?
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La règle de base : <strong>1 photographe pour 200 à 300 participants</strong>. Mais plusieurs facteurs modifient cette estimation :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Type de parcours</strong> : une boucle unique permet à un photographe de couvrir plusieurs points (départ, passage clé, arrivée). Un parcours linéaire de 42 km nécessite davantage de photographes répartis.</li>
      <li><strong>Densité de passage</strong> : un 10 km avec départ groupé concentre les sportifs ; un trail en montagne les étire sur des kilomètres.</li>
      <li><strong>Objectif de couverture</strong> : voulez-vous 3-5 photos par sportif (standard) ou 10+ (premium) ?</li>
      <li><strong>Points stratégiques</strong> : départ, ravitaillement, difficultés (côte, passage technique), arrivée, podium.</li>
    </ul>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📋</span>
        <div>
          <p className="font-medium text-navy mb-1">Exemple : semi-marathon de 2 000 sportifs</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Prévoir 6 à 8 photographes : 1 au départ, 2 sur le parcours (km 7 et km 14), 1 à un point de vue panoramique, 2 à l'arrivée (ligne + après ligne), 1-2 sur le village (podium, ambiance). Résultat estimé : ~12 000 photos, soit ~6 par sportif.
          </p>
        </div>
      </div>
    </div>

    <h2 id="positionnement" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Positionnement sur le parcours
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Le choix des emplacements est crucial pour obtenir des photos qui <strong>se vendent</strong>. Les sportifs achètent des photos où ils sont identifiables, en action, et dans un cadre esthétique. Voici les principes :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Dossards visibles</strong> : privilégiez les angles de face ou de trois quarts. Les photos de dos, même belles, se vendent rarement car le sportif ne s'y reconnaît pas au premier coup d'&oelig;il.</li>
      <li><strong>Fond dégagé</strong> : évitez les arrière-plans encombrés (parkings, poubelles). Cherchez les points de vue avec de la nature, des bâtiments emblématiques, ou la foule en arrière-plan.</li>
      <li><strong>Lumière</strong> : le soleil dans le dos du photographe (face au sportif) donne les meilleurs résultats. Évitez le contre-jour sauf pour des effets artistiques délibérés.</li>
      <li><strong>Espacement</strong> : répartissez les photographes pour couvrir différents moments de la course (début, milieu, fin) et varier les cadrages.</li>
    </ul>

    <h2 id="equipement" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Conseils équipement
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Le matériel idéal dépend du type d'événement, mais voici les fondamentaux :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Boitier rapide</strong> : un autofocus performant et une cadence élevée (10+ images/seconde) sont essentiels pour la photo d'action.</li>
      <li><strong>Objectif polyvalent</strong> : un 70-200 mm f/2.8 couvre la majorité des situations. Complétez avec un 24-70 mm pour les plans larges et l'ambiance.</li>
      <li><strong>Cartes mémoire rapides</strong> : prévoyez 128 Go minimum par demi-journée. Investissez dans des cartes UHS-II pour ne pas être limité par l'écriture.</li>
      <li><strong>Batterie</strong> : 2 batteries par boitier minimum. Le froid réduit l'autonomie de 30 à 50 %.</li>
      <li><strong>Protection météo</strong> : housse de pluie pour le boitier, sac étanche pour les cartes. Un événement ne s'annule pas pour un peu de pluie.</li>
    </ul>

    <h2 id="workflow-livraison" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Workflow de livraison avec Focus Racer
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Une fois les photos prises, la rapidité de livraison est déterminante (voir notre article sur le <Link href="/blog/golden-time-vente-photo-sportive" className="text-emerald hover:underline">Golden Time</Link>). Avec Focus Racer, le workflow est simplifié :
    </p>
    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li><strong>Pendant la course</strong> : utilisez le mode Live pour envoyer vos photos en temps réel depuis votre smartphone (via Wi-Fi ou 4G).</li>
      <li><strong>Après la course</strong> : uploadez le reste des photos en masse (drag & drop, jusqu'à 25 photos par lot).</li>
      <li><strong>L'IA travaille</strong> : tri, indexation, watermark et retouche automatiques en 5 minutes pour 10 000 photos.</li>
      <li><strong>Annoncez</strong> : les sportifs reçoivent une notification e-mail avec le lien vers leurs photos.</li>
      <li><strong>Vendez</strong> : les sportifs trouvent, achètent et téléchargent directement.</li>
    </ol>

    <h2 id="monetisation" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Stratégie de monétisation
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Plusieurs modèles coexistent. Le plus performant dépend de la taille de l'événement et du profil des participants :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Vente individuelle</strong> : chaque sportif achète ses photos (3-8 €/photo). Modèle le plus courant, rentable dès 200 participants.</li>
      <li><strong>Packs dégressifs</strong> : 1 photo à 5 €, 3 photos à 12 €, toutes les photos à 25 €. Augmente le panier moyen de 40 à 60 %.</li>
      <li><strong>Modèle sponsor</strong> : un sponsor finance la couverture photo. Les photos sont gratuites pour les sportifs avec le logo du sponsor en watermark. Modèle gagnant-gagnant pour les gros événements.</li>
      <li><strong>Inclusion inscription</strong> : le coût de la photo est inclus dans le prix d'inscription (+3-5 €). Garantit 100 % de couverture financée.</li>
    </ul>

    <h2 id="focus-racer-solution" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Focus Racer : la solution clé en main
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      En tant qu'organisateur, Focus Racer vous offre une plateforme complète pour gérer la couverture photo de votre événement sans aucune compétence technique :
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Marketplace pour trouver des photographes accrédités</li>
      <li>Import start-list automatique (CSV, Njuko, KMS)</li>
      <li>Galerie publique personnalisée avec votre branding</li>
      <li>Statistiques de vente en temps réel</li>
      <li>0 % de commission sur les ventes — seul 1 € de frais de service par commande</li>
    </ul>
    <CTA href="/solutions/organisateurs">Découvrir l'espace organisateur</CTA>
  </>
);

/* ═══════════════════════════════════════════════════════════════
   ARTICLE 5 — Photographe sportif : maximiser ses revenus
   ═══════════════════════════════════════════════════════════════ */

const article5Content = (
  <>
    <p className="text-lg text-gray-600 leading-relaxed mb-6">
      Le marché de la photographie sportive connaît une transformation profonde. Les plateformes traditionnelles prélèvent des commissions élevées, tandis que de nouvelles solutions comme Focus Racer réinventent le modèle économique au bénéfice des photographes. Voici comment maximiser vos revenus en 2026.
    </p>

    <h2 id="etat-marche" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      État du marché en 2026
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La course à pied explose en France : plus de <strong>10 millions de pratiquants réguliers</strong>, 8 000 événements organisés chaque année, des trails aux marathons en passant par les courses à obstacles. Et ce n'est qu'un segment : triathlon, cyclisme, natation, ski, sports équestres — la demande de photo sportive est immense.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Pourtant, la majorité des événements restent peu ou pas couverts. La raison ? Le ratio effort/rentabilité est défavorable avec les outils traditionnels. Photographier un événement de 500 sportifs signifie prendre 3 000 à 5 000 photos, puis passer 6 à 10 heures à les trier et les mettre en ligne. Avec des taux de conversion de 5 à 10 % et des commissions de 15 à 40 %, le jeu n'en vaut souvent pas la chandelle.
    </p>

    <h2 id="commissions" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La guerre des commissions : comparatif 2026
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Le modèle de commission est le premier facteur qui détermine votre rentabilité. Voici un comparatif réaliste :
    </p>
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-semibold text-navy border-b border-gray-200">Plateforme</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Commission</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Sur 100 € de ventes</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          <tr><td className="p-3 border-b border-gray-100">Plateformes historiques</td><td className="p-3 text-center border-b border-gray-100">30-40 %</td><td className="p-3 text-center border-b border-gray-100">Vous recevez 60-70 €</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Plateformes intermédiaires</td><td className="p-3 text-center border-b border-gray-100">15-25 %</td><td className="p-3 text-center border-b border-gray-100">Vous recevez 75-85 €</td></tr>
          <tr className="bg-emerald-50 font-semibold"><td className="p-3 border-b border-gray-200">Focus Racer</td><td className="p-3 text-center border-b border-gray-200 text-emerald">0 %</td><td className="p-3 text-center border-b border-gray-200 text-emerald">Vous recevez ~97 €*</td></tr>
        </tbody>
      </table>
    </div>
    <p className="text-xs text-gray-400 mb-6">
      *Après frais Stripe (~1,4 % + 0,25 € par transaction). Le sportif paie 1 € de frais de service en plus du prix des photos, encaissé par la plateforme.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Sur une saison de 20 événements générant chacun 500 € de ventes (soit 10 000 € bruts), la différence est saisissante :
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Avec 30 % de commission : <strong>7 000 € nets</strong></li>
      <li>Avec Focus Racer (0 %) : <strong>~9 700 € nets</strong></li>
      <li>Différence : <strong>+2 700 €/an</strong> dans votre poche</li>
    </ul>

    <h2 id="golden-time-strategie" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La stratégie du Golden Time
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Comme nous l'expliquons dans notre article dédié au <Link href="/blog/golden-time-vente-photo-sportive" className="text-emerald hover:underline">Golden Time</Link>, 70 % des ventes se concentrent dans les 24 premières heures. Le mode Live de Focus Racer vous permet de publier vos photos en temps réel, pendant que les sportifs sont encore sur le site.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Scénario concret :</strong> vous photographiez un trail de 600 participants. À midi, les premiers sportifs franchissent l'arrivée. À 12 h 30, vos photos du départ et du parcours sont déjà en ligne et achetables. Les sportifs, smartphone en main, trouvent leurs photos, les achètent et les partagent sur les réseaux sociaux — générant du trafic supplémentaire vers votre galerie.
    </p>

    <h2 id="upselling-packs" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      L'art de l'upselling : les packs
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La vente à l'unité est un piège. Un sportif qui achète 1 photo à 5 € représente un panier de 5 €. Mais ce même sportif, face à un <strong>pack attractif</strong>, achètera souvent 5 photos pour 15 € ou toutes ses photos pour 25 €.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Les stratégies qui fonctionnent :</strong>
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Le pack « Toutes mes photos »</strong> : prix fixe (20-30 €) pour l'ensemble des photos d'un sportif. Génère le meilleur chiffre d'affaires par client.</li>
      <li><strong>L'ancrage psychologique</strong> : affichez d'abord le prix unitaire (5 €), puis le pack (3 pour 12 €). Le pack paraît immédiatement attractif par comparaison.</li>
      <li><strong>Le pack « Finisher »</strong> : un pack premium incluant les photos HD + un montage numérique avec le temps officiel du sportif, le classement et le logo de l'événement.</li>
    </ul>

    <h2 id="partage-social" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Le partage social : votre meilleur vendeur
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Chaque photo watermarkée partagée sur les réseaux sociaux est une <strong>publicité gratuite</strong>. Quand un sportif publie sa photo de course sur Instagram avec le lien vers la galerie, ses amis sportifs voient le post et vont chercher leurs propres photos. C'est un effet viral puissant :
    </p>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📊</span>
        <div>
          <p className="font-medium text-navy mb-1">L'effet réseau en chiffres</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            En moyenne, un sportif qui partage sa photo sur les réseaux sociaux génère <strong>2,3 visites supplémentaires</strong> sur la galerie. Sur un événement de 500 participants, si 20 % partagent, cela représente 230 visites organiques supplémentaires — soit potentiellement 15 à 30 ventes de plus.
          </p>
        </div>
      </div>
    </div>
    <p className="text-gray-600 leading-relaxed mb-4">
      Focus Racer facilite ce partage avec des <strong>boutons de partage intégrés</strong> (Instagram, Facebook, Twitter, lien direct) et des images optimisées pour chaque réseau (format, ratio, watermark discret mais visible).
    </p>

    <h2 id="avantage-focus-racer" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      L'avantage Focus Racer
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Au-delà du 0 % de commission, Focus Racer vous donne des outils que les plateformes traditionnelles ne proposent pas :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Tri IA automatique</strong> : ne perdez plus 6 heures à trier manuellement. L'IA traite 10 000 photos en 5 minutes.</li>
      <li><strong>Mode Live</strong> : publiez en temps réel, pendant la course. Captez le Golden Time dès la ligne d'arrivée.</li>
      <li><strong>Stripe Connect direct</strong> : les paiements arrivent directement sur votre compte bancaire, sans délai ni intermédiaire.</li>
      <li><strong>Crédits IA abordables</strong> : à partir de 0,019 €/photo (pack 1 000 crédits à 19 €). Dégressif jusqu'à 0,015 €/photo pour les gros volumes.</li>
      <li><strong>Dashboard analytique</strong> : suivez vos ventes, votre taux de conversion et vos revenus en temps réel.</li>
      <li><strong>Watermark personnalisé</strong> : votre logo, votre identité visuelle sur chaque photo en galerie.</li>
    </ul>

    <h2 id="plan-action" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Votre plan d'action en 5 étapes
    </h2>
    <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Créez votre compte</strong> Focus Racer et connectez Stripe (3 minutes).</li>
      <li><strong>Achetez des crédits IA</strong> : commencez avec le pack 1 000 crédits (19 €) pour tester.</li>
      <li><strong>Photographiez</strong> votre prochain événement avec le mode Live activé.</li>
      <li><strong>Observez</strong> le pipeline IA trier, watermarker et publier vos photos en quelques minutes.</li>
      <li><strong>Analysez</strong> vos ventes dans le dashboard et optimisez vos packs pour l'événement suivant.</li>
    </ol>

    <h2 id="conclusion-revenus" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En résumé
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      2026 est l'année où les photographes sportifs reprennent le contrôle de leurs revenus. En combinant 0 % de commission, un pipeline IA ultra-rapide et des outils de vente modernes, Focus Racer vous permet de vous concentrer sur ce que vous faites de mieux — photographier — tout en maximisant votre chiffre d'affaires. Chaque euro de vente vous revient (moins les frais bancaires). C'est aussi simple que cela.
    </p>
    <CTA href="/register">Créer mon compte photographe</CTA>
  </>
);

/* ═══════════════════════════════════════════════════════════════
   ARTICLES MAP
   ═══════════════════════════════════════════════════════════════ */

const ARTICLES: Record<string, FullArticle> = {
  "comment-retrouver-photos-course": {
    slug: "comment-retrouver-photos-course",
    title: "Comment retrouver ses photos de course : le guide complet",
    category: "Sportifs",
    readTime: "6 min",
    date: "18 février 2026",
    icon: "🏃",
    metaDescription: "Dossard, selfie ou nom : découvrez les 3 méthodes pour retrouver vos photos de course en une fraction de seconde grâce à l'intelligence artificielle Focus Racer.",
    toc: [
      { id: "methode-dossard", label: "Recherche par dossard" },
      { id: "methode-selfie", label: "Recherche par selfie" },
      { id: "methode-nom", label: "Recherche par nom" },
      { id: "ia-vs-manuel", label: "IA vs. recherche manuelle" },
      { id: "astuces", label: "Astuces pratiques" },
      { id: "conclusion", label: "En résumé" },
    ],
    content: article1Content,
  },
  "golden-time-vente-photo-sportive": {
    slug: "golden-time-vente-photo-sportive",
    title: "Le Golden Time : pourquoi les 24 premières heures décident de vos ventes",
    category: "Photographes",
    readTime: "7 min",
    date: "14 février 2026",
    icon: "📸",
    metaDescription: "70 % des ventes de photos sportives se font dans les 24 h. Découvrez le concept de Golden Time et comment maximiser vos revenus avec Focus Racer.",
    toc: [
      { id: "psychologie", label: "Psychologie post-course" },
      { id: "capitaliser", label: "Capitaliser sur le Golden Time" },
      { id: "traditionnel-vs-ia", label: "Traditionnel vs. automatisé" },
      { id: "maximiser-ventes", label: "Maximiser les ventes" },
      { id: "stripe-connect", label: "Paiements directs" },
      { id: "conclusion-gt", label: "En résumé" },
    ],
    content: article2Content,
  },
  "ia-tri-automatique-photo-sport": {
    slug: "ia-tri-automatique-photo-sport",
    title: "Comment l'IA révolutionne le tri des photos sportives en 2026",
    category: "IA & Tech",
    readTime: "8 min",
    date: "10 février 2026",
    icon: "🤖",
    metaDescription: "OCR de dossards, reconnaissance faciale, filtrage qualité : découvrez le pipeline d'intelligence artificielle de Focus Racer qui trie 10 000 photos en 5 minutes.",
    toc: [
      { id: "ocr-dossards", label: "OCR des dossards" },
      { id: "reconnaissance-faciale", label: "Reconnaissance faciale" },
      { id: "filtrage-qualite", label: "Filtrage qualité" },
      { id: "pipeline-complet", label: "Le pipeline complet" },
      { id: "manuel-vs-ia", label: "Manuel vs. IA" },
      { id: "tendances", label: "Tendances 2026+" },
      { id: "conclusion-ia", label: "En résumé" },
    ],
    content: article3Content,
  },
  "organiser-couverture-photo-evenement": {
    slug: "organiser-couverture-photo-evenement",
    title: "Guide : organiser la couverture photo de votre événement sportif",
    category: "Organisateurs",
    readTime: "9 min",
    date: "5 février 2026",
    icon: "🏆",
    metaDescription: "Combien de photographes, où les placer, comment livrer rapidement : le guide complet pour organiser la couverture photo de votre événement sportif.",
    toc: [
      { id: "planification", label: "Combien de photographes ?" },
      { id: "positionnement", label: "Positionnement parcours" },
      { id: "equipement", label: "Conseils équipement" },
      { id: "workflow-livraison", label: "Workflow de livraison" },
      { id: "monetisation", label: "Stratégie de monétisation" },
      { id: "focus-racer-solution", label: "Focus Racer solution" },
    ],
    content: article4Content,
  },
  "photographe-sport-revenus-2026": {
    slug: "photographe-sport-revenus-2026",
    title: "Photographe sportif : comment maximiser ses revenus en 2026",
    category: "Conseils",
    readTime: "7 min",
    date: "1er février 2026",
    icon: "💰",
    metaDescription: "0 % commission, Golden Time, packs dégressifs, partage social : le guide ultime pour maximiser ses revenus de photographe sportif en 2026.",
    toc: [
      { id: "etat-marche", label: "État du marché" },
      { id: "commissions", label: "Comparatif commissions" },
      { id: "golden-time-strategie", label: "Stratégie Golden Time" },
      { id: "upselling-packs", label: "Upselling par packs" },
      { id: "partage-social", label: "Partage social" },
      { id: "avantage-focus-racer", label: "L'avantage Focus Racer" },
      { id: "plan-action", label: "Plan d'action" },
      { id: "conclusion-revenus", label: "En résumé" },
    ],
    content: article5Content,
  },
};

/* Related articles helper */
function getRelatedArticles(currentSlug: string): FullArticle[] {
  const slugs = Object.keys(ARTICLES).filter((s) => s !== currentSlug);
  // Pick 3 articles, prioritize different categories
  const current = ARTICLES[currentSlug];
  const sameCategory = slugs.filter((s) => ARTICLES[s].category === current?.category);
  const otherCategory = slugs.filter((s) => ARTICLES[s].category !== current?.category);
  const picked = [...otherCategory, ...sameCategory].slice(0, 3);
  return picked.map((s) => ARTICLES[s]);
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function BlogArticlePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const article = ARTICLES[slug];

  const [copied, setCopied] = useState(false);
  const [activeTocId, setActiveTocId] = useState("");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  /* Scroll spy for table of contents */
  useEffect(() => {
    if (!article) return;
    const headings = article.toc.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-80px 0px -60% 0px" }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [article]);

  /* Scroll reveal */
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

  const handleCopyLink = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  /* 404 for unknown slugs */
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-6xl mb-6">📰</div>
            <h1 className="text-2xl font-bold text-navy mb-3">Article introuvable</h1>
            <p className="text-gray-500 mb-6">
              Cet article n'existe pas ou a été déplacé.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald hover:bg-emerald-dark text-white rounded-xl font-medium shadow-emerald transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Retour au blog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const related = getRelatedArticles(slug);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-16">
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative container mx-auto px-4 py-12 md:py-20">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8 animate-fade-in">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-white/90 truncate max-w-[200px] md:max-w-none">{article.title}</span>
            </nav>

            <div className="max-w-3xl animate-fade-in animation-delay-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/10">
                  {article.category}
                </span>
                <span className="text-white/60 text-sm flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {article.readTime} de lecture
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                {article.title}
              </h1>
              <p className="text-white/70 text-sm">
                Publié le {article.date}
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ ARTICLE CONTENT + TOC ═══════════ */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto flex gap-12">
              {/* Main content */}
              <article className="flex-1 max-w-3xl">
                <div className="prose prose-gray max-w-none">
                  {article.content}
                </div>

                {/* Share buttons */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <p className="text-sm font-semibold text-navy mb-4">Partager cet article</p>
                  <div className="flex items-center gap-3">
                    {/* Copy link */}
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all duration-200"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Copié !
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.28" />
                          </svg>
                          Copier le lien
                        </>
                      )}
                    </button>
                    {/* Twitter */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] text-gray-700 text-sm font-medium transition-all duration-200"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Twitter
                    </a>
                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-[#1877F2]/10 hover:text-[#1877F2] text-gray-700 text-sm font-medium transition-all duration-200"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </article>

              {/* Table of Contents sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Sommaire
                  </p>
                  <nav className="space-y-1">
                    {article.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block py-1.5 px-3 text-sm rounded-lg transition-all duration-200 ${
                          activeTocId === item.id
                            ? "bg-emerald-50 text-emerald font-medium border-l-2 border-emerald"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>

                  {/* Mini CTA in sidebar */}
                  <div className="mt-8 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <p className="text-sm font-semibold text-navy mb-2">
                      Essayez Focus Racer
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Création de compte gratuite. 0 % de commission.
                    </p>
                    <Link
                      href="/register"
                      className="block w-full text-center px-3 py-2 bg-emerald hover:bg-emerald-dark text-white text-xs font-medium rounded-lg transition-all duration-200"
                    >
                      Créer un compte
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ═══════════ RELATED ARTICLES ═══════════ */}
        <section id="related" data-reveal className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className={`text-2xl font-bold text-navy mb-8 transition-all duration-700 ${visibleSections.has("related") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                Articles similaires
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((rel, i) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-500 flex flex-col ${
                      visibleSections.has("related") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <div className="h-36 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-emerald-700 relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full blur-[40px]" />
                      </div>
                      <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                        {rel.icon}
                      </span>
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/10">
                          {rel.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span>{rel.date}</span>
                        <span>·</span>
                        <span>{rel.readTime}</span>
                      </div>
                      <h3 className="text-sm font-bold text-navy mb-2 group-hover:text-emerald transition-colors line-clamp-2">
                        {rel.title}
                      </h3>
                      <div className="mt-auto flex items-center gap-1 text-emerald font-semibold text-xs group-hover:gap-2 transition-all">
                        Lire
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ CTA BOTTOM ═══════════ */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#042F2E] via-[#115E59] to-[#042F2E] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px]" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Prêt à passer à l'action ?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Rejoignez Focus Racer et découvrez la photo sportive automatisée par l'IA.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/explore"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 text-lg"
              >
                Trouver mes photos
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm text-lg"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
