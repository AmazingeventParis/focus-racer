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
      Vous venez de franchir la ligne d&apos;arriv&eacute;e, l&apos;adr&eacute;naline retombe, et une question vous br&ucirc;le les l&egrave;vres : <strong>&laquo; O&ugrave; sont mes photos ? &raquo;</strong> Chaque ann&eacute;e, des millions de photos sont prises lors d&apos;&eacute;v&eacute;nements sportifs. Pourtant, les retrouver reste souvent un parcours du combattant. Ce guide complet vous pr&eacute;sente les trois m&eacute;thodes disponibles sur Focus Racer pour retrouver vos clich&eacute;s en quelques secondes.
    </p>

    <h2 id="methode-dossard" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      1. La recherche par num&eacute;ro de dossard
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      C&apos;est la m&eacute;thode la plus directe et la plus utilis&eacute;e. Notre intelligence artificielle analyse chaque photo t&eacute;l&eacute;charg&eacute;e par le photographe et <strong>d&eacute;tecte automatiquement les num&eacute;ros de dossard</strong> gr&acirc;ce &agrave; la reconnaissance optique de caract&egrave;res (OCR). Le taux de pr&eacute;cision atteint 85 &agrave; 95 % selon les conditions de prise de vue.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Comment proc&eacute;der :</strong>
    </p>
    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Rendez-vous sur la page de l&apos;&eacute;v&eacute;nement depuis la section <Link href="/explore" className="text-emerald hover:underline">Explorer</Link>.</li>
      <li>Saisissez votre num&eacute;ro de dossard dans la barre de recherche.</li>
      <li>Les r&eacute;sultats s&apos;affichent instantan&eacute;ment : toutes les photos o&ugrave; votre dossard a &eacute;t&eacute; d&eacute;tect&eacute;.</li>
      <li>Parcourez, s&eacute;lectionnez vos pr&eacute;f&eacute;r&eacute;es, et achetez en un clic.</li>
    </ol>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Astuce :</strong> pour maximiser la d&eacute;tection, assurez-vous que votre dossard est bien visible au d&eacute;part. &Eacute;vitez de le plier, de le couvrir avec une ceinture porte-bidon ou de le porter dans le dos si le photographe est plac&eacute; de face.
    </p>

    <h2 id="methode-selfie" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      2. La recherche par selfie (reconnaissance faciale)
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Votre dossard &eacute;tait cach&eacute; par un bras, repli&eacute; par le vent, ou recouvert de boue ? Pas de panique. Focus Racer int&egrave;gre un syst&egrave;me de <strong>reconnaissance faciale avanc&eacute;e</strong> qui compare votre visage avec ceux d&eacute;tect&eacute;s sur les milliers de photos de l&apos;&eacute;v&eacute;nement.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Comment &ccedil;a marche :</strong>
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Cliquez sur &laquo; Recherche par selfie &raquo; sur la page de l&apos;&eacute;v&eacute;nement.</li>
      <li>Prenez un selfie ou importez une photo r&eacute;cente de votre visage.</li>
      <li>L&apos;IA compare votre visage avec les photos index&eacute;es en moins de 2 secondes.</li>
      <li>Vous obtenez les r&eacute;sultats class&eacute;s par degr&eacute; de confiance.</li>
    </ul>
    <p className="text-gray-600 leading-relaxed mb-4">
      La pr&eacute;cision de la reconnaissance faciale atteint <strong>95 %</strong>. Pour de meilleurs r&eacute;sultats, utilisez une photo de face, bien &eacute;clair&eacute;e, sans lunettes de soleil. Les donn&eacute;es biom&eacute;triques sont trait&eacute;es conform&eacute;ment au RGPD et ne sont jamais partag&eacute;es avec des tiers.
    </p>

    <h2 id="methode-nom" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      3. La recherche par nom
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Si le photographe ou l&apos;organisateur a import&eacute; la <strong>start-list</strong> (liste des participants), vous pouvez simplement taper votre nom dans la barre de recherche. Le syst&egrave;me croise automatiquement votre nom avec votre num&eacute;ro de dossard, puis affiche toutes les photos correspondantes.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Cette m&eacute;thode est particuli&egrave;rement pratique lorsque vous ne vous souvenez plus de votre num&eacute;ro de dossard &mdash; ce qui arrive plus souvent qu&apos;on ne le croit apr&egrave;s une course &eacute;prouvante !
    </p>

    <h2 id="ia-vs-manuel" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Pourquoi l&apos;IA surpasse la recherche manuelle
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avant l&apos;intelligence artificielle, retrouver ses photos impliquait de faire d&eacute;filer des centaines, parfois des milliers de clich&eacute;s. Un &eacute;v&eacute;nement de 500 participants avec 3 photographes g&eacute;n&egrave;re facilement <strong>5 000 &agrave; 10 000 photos</strong>. Faire d&eacute;filer manuellement ces images prend 30 minutes &agrave; 1 heure.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avec Focus Racer, le tri est <strong>100 % automatis&eacute;</strong>. L&apos;IA traite 1 000 photos en environ 2 minutes. Chaque photo est analys&eacute;e, index&eacute;e et li&eacute;e au bon sportif. La recherche prend ensuite <strong>moins de 3 secondes</strong>.
    </p>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-medium text-navy mb-1">Le saviez-vous ?</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sur Focus Racer, 95 % des photos sont automatiquement li&eacute;es au bon sportif gr&acirc;ce &agrave; la combinaison OCR + reconnaissance faciale. Les 5 % restants correspondent g&eacute;n&eacute;ralement &agrave; des photos de dos, de paysage ou de groupe sans dossard visible.
          </p>
        </div>
      </div>
    </div>

    <h2 id="astuces" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Nos astuces pour &ecirc;tre s&ucirc;r de retrouver vos photos
    </h2>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Portez votre dossard bien visible</strong> sur la poitrine, sans le plier ni le couvrir. Si possible, &eacute;pinglez-le &agrave; plat avec 4 &eacute;pingles.</li>
      <li><strong>Regardez les photographes</strong> quand vous les croisez. Un bref regard face cam&eacute;ra facilite la d&eacute;tection faciale.</li>
      <li><strong>V&eacute;rifiez la start-list</strong> : si votre nom y figure, vous pourrez chercher par nom en plus du dossard.</li>
      <li><strong>Utilisez plusieurs m&eacute;thodes</strong> : combinez dossard + selfie pour un r&eacute;sultat exhaustif.</li>
      <li><strong>Consultez rapidement</strong> : les photos sont g&eacute;n&eacute;ralement disponibles dans les heures suivant l&apos;&eacute;v&eacute;nement.</li>
    </ul>

    <h2 id="conclusion" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En r&eacute;sum&eacute;
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      Fini le temps o&ugrave; retrouver ses photos de course ressemblait &agrave; chercher une aiguille dans une botte de foin. Avec Focus Racer, trois m&eacute;thodes compl&eacute;mentaires &mdash; dossard, selfie et nom &mdash; vous garantissent de retrouver chacun de vos clich&eacute;s. L&apos;IA fait le travail en coulisses pour que vous puissiez vous concentrer sur l&apos;essentiel : revivre l&apos;&eacute;motion de votre course.
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
      Dans le monde de la photographie sportive, il existe une fen&ecirc;tre d&apos;opportunit&eacute; que les professionnels appellent le <strong>&laquo; Golden Time &raquo;</strong> : les 24 premi&egrave;res heures suivant un &eacute;v&eacute;nement. C&apos;est dans ce laps de temps que se concentrent la grande majorit&eacute; des achats. Comprendre ce ph&eacute;nom&egrave;ne et l&apos;exploiter, c&apos;est la diff&eacute;rence entre un &eacute;v&eacute;nement rentable et un &eacute;v&eacute;nement d&eacute;cevant.
    </p>

    <h2 id="psychologie" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La psychologie de l&apos;achat post-course
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Quand un sportif franchit la ligne d&apos;arriv&eacute;e, il est dans un &eacute;tat &eacute;motionnel intense. Fiert&eacute;, soulagement, euphorie &mdash; c&apos;est &agrave; ce moment pr&eacute;cis que l&apos;envie de <strong>capturer et partager ce souvenir</strong> est &agrave; son maximum. Le sportif consulte ses r&eacute;sultats, en parle &agrave; ses proches, publie sur les r&eacute;seaux sociaux.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Ce pic &eacute;motionnel se dissipe rapidement. Apr&egrave;s 48 heures, le sportif est d&eacute;j&agrave; tourn&eacute; vers son prochain objectif. Apr&egrave;s une semaine, l&apos;urgence d&apos;achat a quasiment disparu. Les donn&eacute;es du secteur sont sans appel :
    </p>
    <div className="grid sm:grid-cols-3 gap-4 my-6">
      {[
        { stat: "70 %", label: "des ventes dans les 24 h" },
        { stat: "20 %", label: "entre 24 h et 72 h" },
        { stat: "10 %", label: "apr&egrave;s 72 h" },
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
      La cl&eacute;, c&apos;est la <strong>vitesse de mise en ligne</strong>. Chaque heure entre la fin de la course et la disponibilit&eacute; des photos co&ucirc;te des ventes. Voici les facteurs d&eacute;terminants :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Uploadez pendant la course</strong> : avec le mode Live de Focus Racer, vous pouvez envoyer vos photos en temps r&eacute;el depuis le terrain. Les sportifs voient leurs photos avant m&ecirc;me d&apos;avoir quitt&eacute; le site.</li>
      <li><strong>Laissez l&apos;IA trier</strong> : le tri manuel prend des heures. Notre pipeline automatique indexe 1 000 photos en 2 minutes. Aucun temps perdu entre l&apos;upload et la mise en vente.</li>
      <li><strong>Envoyez des notifications</strong> : Focus Racer peut envoyer un e-mail aux sportifs d&egrave;s que leurs photos sont disponibles, les ramenant directement vers la galerie.</li>
      <li><strong>Activez le partage social</strong> : quand un sportif partage sa photo watermark&eacute;e sur Instagram ou Facebook, il g&eacute;n&egrave;re des visites suppl&eacute;mentaires &mdash; et donc des ventes potentielles.</li>
    </ul>

    <h2 id="traditionnel-vs-ia" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Workflow traditionnel vs. workflow automatis&eacute;
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Comparons les deux approches sur un &eacute;v&eacute;nement type de 800 participants et 6 000 photos :
    </p>
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-semibold text-navy border-b border-gray-200">&Eacute;tape</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Traditionnel</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Focus Racer</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          <tr><td className="p-3 border-b border-gray-100">Transfert des photos</td><td className="p-3 text-center border-b border-gray-100">2-4 h (carte SD &rarr; PC)</td><td className="p-3 text-center border-b border-gray-100">Temps r&eacute;el (mode Live)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Tri / indexation</td><td className="p-3 text-center border-b border-gray-100">4-8 h (manuel)</td><td className="p-3 text-center border-b border-gray-100">12 min (IA, 6 000 photos)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Retouche</td><td className="p-3 text-center border-b border-gray-100">2-4 h (Lightroom)</td><td className="p-3 text-center border-b border-gray-100">Automatique (inclus)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Watermark + mise en ligne</td><td className="p-3 text-center border-b border-gray-100">1-2 h</td><td className="p-3 text-center border-b border-gray-100">Automatique (inclus)</td></tr>
          <tr className="font-semibold"><td className="p-3 border-b border-gray-200">Total</td><td className="p-3 text-center border-b border-gray-200 text-red-500">9-18 h</td><td className="p-3 text-center border-b border-gray-200 text-emerald">&lt; 30 min</td></tr>
        </tbody>
      </table>
    </div>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avec un workflow traditionnel, les photos sont souvent disponibles <strong>le lendemain voire 2 jours apr&egrave;s</strong>. Le Golden Time est d&eacute;j&agrave; largement entam&eacute;. Avec Focus Racer, les photos sont en ligne pendant que les sportifs sont encore sur le site de la course.
    </p>

    <h2 id="maximiser-ventes" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Strat&eacute;gies pour maximiser vos ventes
    </h2>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Proposez des packs d&eacute;gressifs</strong> : un sportif qui ach&egrave;te 1 photo peut en acheter 5 si le pack est attractif. Cr&eacute;ez des packs &agrave; 3, 5 et &laquo; toutes mes photos &raquo;.</li>
      <li><strong>Annoncez la disponibilit&eacute;</strong> : coordonnez-vous avec l&apos;organisateur pour annoncer au micro que les photos sont d&eacute;j&agrave; en ligne pendant la remise des prix.</li>
      <li><strong>Utilisez un QR code</strong> : affichez un QR code g&eacute;ant sur le village d&apos;arriv&eacute;e qui renvoie vers la galerie de l&apos;&eacute;v&eacute;nement.</li>
      <li><strong>Partagez sur les r&eacute;seaux</strong> : publiez 5-10 photos &laquo; teaser &raquo; sur les r&eacute;seaux sociaux de l&apos;&eacute;v&eacute;nement avec le lien vers la galerie compl&egrave;te.</li>
    </ul>

    <h2 id="stripe-connect" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Recevez vos paiements directement
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Gr&acirc;ce &agrave; Stripe Connect, les paiements des sportifs arrivent directement sur votre compte bancaire, sans interm&eacute;diaire. Focus Racer ne prend <strong>aucune commission sur vos ventes</strong> &mdash; seuls les frais Stripe standard s&apos;appliquent (~1,4 % + 0,25 &euro;). Un frais de service fixe de 1 &euro; par commande est ajout&eacute; au prix pay&eacute; par le sportif pour couvrir les co&ucirc;ts de la plateforme.
    </p>

    <h2 id="conclusion-gt" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En r&eacute;sum&eacute;
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      Le Golden Time n&apos;est pas un mythe marketing &mdash; c&apos;est une r&eacute;alit&eacute; chiffr&eacute;e. 70 % de votre chiffre d&apos;affaires se joue dans les 24 premi&egrave;res heures. La vitesse de publication n&apos;est plus un luxe, c&apos;est une n&eacute;cessit&eacute; &eacute;conomique. Focus Racer vous donne les outils pour &ecirc;tre en ligne en moins de 30 minutes apr&egrave;s la course &mdash; et capter chaque vente.
    </p>
    <CTA href="/solutions/photographes">D&eacute;couvrir les outils photographe</CTA>
  </>
);

/* ═══════════════════════════════════════════════════════════════
   ARTICLE 3 — IA tri automatique
   ═══════════════════════════════════════════════════════════════ */

const article3Content = (
  <>
    <p className="text-lg text-gray-600 leading-relaxed mb-6">
      En 2026, l&apos;intelligence artificielle n&apos;est plus un gadget futuriste &mdash; c&apos;est le moteur qui propulse la photo sportive dans une nouvelle &egrave;re. Chez Focus Racer, notre pipeline IA traite, trie et indexe <strong>1 000 photos en 2 minutes</strong>, l&agrave; o&ugrave; un tri manuel prendrait une journ&eacute;e enti&egrave;re. D&eacute;cortiquons les technologies qui rendent cela possible.
    </p>

    <h2 id="ocr-dossards" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      L&apos;OCR : lire les dossards automatiquement
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La premi&egrave;re brique de notre pipeline est la <strong>reconnaissance optique de caract&egrave;res</strong> (OCR, pour <em>Optical Character Recognition</em>). Concr&egrave;tement, l&apos;IA analyse chaque image &agrave; la recherche de texte &mdash; en particulier les num&eacute;ros imprim&eacute;s sur les dossards des sportifs.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Notre syst&egrave;me utilise <strong>AWS Rekognition DetectText</strong>, un service cloud de vision par ordinateur qui identifie les zones de texte dans une image, extrait les caract&egrave;res et les retourne avec un indice de confiance. Nous filtrons ensuite les r&eacute;sultats pour ne garder que les cha&icirc;nes num&eacute;riques (les dossards) avec un seuil de confiance sup&eacute;rieur &agrave; 70 %.
    </p>
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 my-6 font-mono text-sm text-gray-700">
      <p className="text-gray-400 mb-2">// Exemple simplifi&eacute; du pipeline OCR</p>
      <p>Photo &rarr; Version web (1600px, JPEG) &rarr; AWS DetectText</p>
      <p>&rarr; Filtre num&eacute;rique (confidence &gt; 70 %) &rarr; BibNumber li&eacute;</p>
    </div>
    <p className="text-gray-600 leading-relaxed mb-4">
      La pr&eacute;cision oscille entre <strong>85 % et 95 %</strong> selon la taille du dossard, l&apos;angle, l&apos;&eacute;clairage et la lisibilit&eacute;. Un dossard de face, bien &eacute;clair&eacute;, de taille raisonnable, sera d&eacute;tect&eacute; dans 98 % des cas. Un dossard de profil, partiellement masqu&eacute; par un bras ou couvert de boue, aura un taux plus faible &mdash; mais c&apos;est l&agrave; que la reconnaissance faciale prend le relais.
    </p>

    <h2 id="reconnaissance-faciale" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La reconnaissance faciale : le filet de s&eacute;curit&eacute;
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Pour les photos o&ugrave; le dossard n&apos;est pas visible (dos, plan large, dossard cach&eacute;), notre syst&egrave;me fait appel &agrave; la <strong>reconnaissance faciale</strong>. Le pipeline fonctionne en deux temps :
    </p>
    <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Indexation</strong> : chaque visage d&eacute;tect&eacute; sur une photo est extrait, encod&eacute; en vecteur biom&eacute;trique et stock&eacute; dans une collection AWS Rekognition d&eacute;di&eacute;e &agrave; l&apos;&eacute;v&eacute;nement.</li>
      <li><strong>Correspondance</strong> : pour une photo &laquo; orpheline &raquo; (sans dossard), le syst&egrave;me recherche si un visage d&eacute;j&agrave; associ&eacute; &agrave; un dossard correspond. Si oui, la photo est automatiquement li&eacute;e au bon sportif (seuil de confiance : 85 %).</li>
    </ol>
    <p className="text-gray-600 leading-relaxed mb-4">
      Cette approche en <strong>double filet</strong> (OCR + visage) permet d&apos;atteindre un taux de liaison automatique sup&eacute;rieur &agrave; 95 %. Le sportif n&apos;a plus qu&apos;&agrave; taper son dossard et toutes ses photos apparaissent, y compris celles prises de dos ou en plein effort.
    </p>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="font-medium text-navy mb-1">Respect du RGPD</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Les donn&eacute;es biom&eacute;triques (vecteurs faciaux) sont stock&eacute;es exclusivement dans une collection AWS isol&eacute;e par &eacute;v&eacute;nement. Elles ne sont jamais partag&eacute;es, revendues ou utilis&eacute;es &agrave; d&apos;autres fins. Chaque sportif peut demander la suppression de ses donn&eacute;es via notre formulaire RGPD.
          </p>
        </div>
      </div>
    </div>

    <h2 id="filtrage-qualite" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Le filtrage qualit&eacute; : ne garder que le meilleur
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Avant m&ecirc;me de lancer les analyses co&ucirc;teuses (OCR, reconnaissance faciale), notre pipeline ex&eacute;cute deux pr&eacute;-filtres qui &eacute;conomisent des cr&eacute;dits IA et am&eacute;liorent la qualit&eacute; globale de la galerie :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Filtre de nettet&eacute; (Laplacian)</strong> : chaque photo est r&eacute;duite &agrave; 256 px et analys&eacute;e via la variance du Laplacien. Si le score est inf&eacute;rieur au seuil (30/100), la photo est consid&eacute;r&eacute;e floue et &eacute;cart&eacute;e. Ce filtre est activ&eacute; par d&eacute;faut mais d&eacute;sactivable par le photographe.</li>
      <li><strong>D&eacute;doublonnage (pHash)</strong> : une empreinte perceptuelle (pHash) de 8x8 pixels en niveaux de gris est calcul&eacute;e pour chaque photo. Si la distance de Hamming entre deux empreintes est inf&eacute;rieure &agrave; 5, les photos sont consid&eacute;r&eacute;es identiques et le doublon est supprim&eacute;.</li>
    </ul>
    <p className="text-gray-600 leading-relaxed mb-4">
      Ces filtres s&apos;ex&eacute;cutent <strong>avant</strong> les appels AWS, ce qui pr&eacute;serve les cr&eacute;dits du photographe. Sur un &eacute;v&eacute;nement type, on observe entre 5 % et 15 % de photos &eacute;cart&eacute;es par ces filtres.
    </p>

    <h2 id="pipeline-complet" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Le pipeline complet : du fichier brut &agrave; la galerie
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Voici le cheminement complet d&apos;une photo dans le syst&egrave;me Focus Racer :
    </p>
    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Le photographe uploade ses photos (compression c&ocirc;t&eacute; client, envoi par lots de 25).</li>
      <li>Le serveur g&eacute;n&egrave;re une version web optimis&eacute;e (1600 px, WebP, ~200-400 Ko).</li>
      <li>Pr&eacute;-filtrage : d&eacute;doublonnage pHash + filtre nettet&eacute; Laplacian.</li>
      <li><strong>En parall&egrave;le</strong> : analyse qualit&eacute; + g&eacute;n&eacute;ration watermark + OCR dossard + indexation faciale.</li>
      <li>Mise &agrave; jour base de donn&eacute;es (dossards d&eacute;tect&eacute;s, visages index&eacute;s, score qualit&eacute;).</li>
      <li>Optionnel : Smart Crop (recadrage portrait par visage) + retouche automatique.</li>
      <li>Tentative de liaison par reconnaissance faciale pour les photos orphelines.</li>
      <li>Auto-clustering : regroupement par dossard apr&egrave;s le dernier traitement (debounce 30 s).</li>
    </ol>

    <h2 id="manuel-vs-ia" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Tri manuel vs. tri IA : les chiffres
    </h2>
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-semibold text-navy border-b border-gray-200">Crit&egrave;re</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Tri manuel</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">IA Focus Racer</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          <tr><td className="p-3 border-b border-gray-100">1 000 photos</td><td className="p-3 text-center border-b border-gray-100">4-6 h</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">~2 min</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Pr&eacute;cision dossard</td><td className="p-3 text-center border-b border-gray-100">99 % (humain)</td><td className="p-3 text-center border-b border-gray-100">85-95 %</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Photos orphelines r&eacute;cup&eacute;r&eacute;es</td><td className="p-3 text-center border-b border-gray-100">0 % (ignor&eacute;es)</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">~15 % (via visage)</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Filtre flou + doublons</td><td className="p-3 text-center border-b border-gray-100">Non (trop long)</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">Automatique</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Co&ucirc;t humain</td><td className="p-3 text-center border-b border-gray-100">&Eacute;lev&eacute;</td><td className="p-3 text-center border-b border-gray-100 text-emerald font-semibold">0,019 &euro;/photo</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="tendances" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Les tendances IA pour 2026 et au-del&agrave;
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La photo sportive automatis&eacute;e n&apos;en est qu&apos;&agrave; ses d&eacute;buts. Voici les &eacute;volutions que nous anticipons :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>D&eacute;tection d&apos;&eacute;motions</strong> : identifier automatiquement les expressions de joie, d&apos;effort ou de victoire pour mettre en avant les photos les plus &eacute;mouvantes.</li>
      <li><strong>Synchronisation chrono</strong> : croiser les donn&eacute;es GPS/chrono avec les m&eacute;tadonn&eacute;es EXIF des photos pour ajouter temps, allure et classement directement sur l&apos;image.</li>
      <li><strong>G&eacute;n&eacute;ration de teasers vid&eacute;o</strong> : assembler automatiquement les meilleures photos d&apos;un sportif en un diaporama vid&eacute;o partag&eacute; sur les r&eacute;seaux sociaux.</li>
      <li><strong>Am&eacute;lioration continue</strong> : les mod&egrave;les de vision par ordinateur s&apos;am&eacute;liorent constamment. Chaque ann&eacute;e, la pr&eacute;cision augmente et les co&ucirc;ts diminuent.</li>
    </ul>

    <h2 id="conclusion-ia" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En r&eacute;sum&eacute;
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      L&apos;IA a transform&eacute; la photographie sportive d&apos;un m&eacute;tier &agrave; forte intensit&eacute; manuelle en un processus fluide et automatis&eacute;. OCR, reconnaissance faciale, filtrage qualit&eacute; et d&eacute;doublonnage travaillent de concert pour que chaque photo trouve son propri&eacute;taire en quelques secondes. Focus Racer place cette technologie entre les mains de tous les photographes, sans comp&eacute;tence technique requise.
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
      La couverture photo d&apos;un &eacute;v&eacute;nement sportif ne s&apos;improvise pas. Nombre de photographes, positionnement sur le parcours, workflow de livraison, mon&eacute;tisation : chaque d&eacute;cision a un impact direct sur la satisfaction des participants et la rentabilit&eacute; de l&apos;op&eacute;ration. Ce guide vous accompagne pas &agrave; pas.
    </p>

    <h2 id="planification" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Planification : combien de photographes ?
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La r&egrave;gle de base : <strong>1 photographe pour 200 &agrave; 300 participants</strong>. Mais plusieurs facteurs modifient cette estimation :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Type de parcours</strong> : une boucle unique permet &agrave; un photographe de couvrir plusieurs points (d&eacute;part, passage cl&eacute;, arriv&eacute;e). Un parcours lin&eacute;aire de 42 km n&eacute;cessite davantage de photographes r&eacute;partis.</li>
      <li><strong>Densit&eacute; de passage</strong> : un 10 km avec d&eacute;part group&eacute; concentre les sportifs ; un trail en montagne les &eacute;tire sur des kilom&egrave;tres.</li>
      <li><strong>Objectif de couverture</strong> : voulez-vous 3-5 photos par sportif (standard) ou 10+ (premium) ?</li>
      <li><strong>Points strat&eacute;giques</strong> : d&eacute;part, ravitaillement, difficult&eacute;s (c&ocirc;te, passage technique), arriv&eacute;e, podium.</li>
    </ul>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📋</span>
        <div>
          <p className="font-medium text-navy mb-1">Exemple : semi-marathon de 2 000 sportifs</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Pr&eacute;voir 6 &agrave; 8 photographes : 1 au d&eacute;part, 2 sur le parcours (km 7 et km 14), 1 &agrave; un point de vue panoramique, 2 &agrave; l&apos;arriv&eacute;e (ligne + apr&egrave;s ligne), 1-2 sur le village (podium, ambiance). R&eacute;sultat estim&eacute; : ~12 000 photos, soit ~6 par sportif.
          </p>
        </div>
      </div>
    </div>

    <h2 id="positionnement" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Positionnement sur le parcours
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Le choix des emplacements est crucial pour obtenir des photos qui <strong>se vendent</strong>. Les sportifs ach&egrave;tent des photos o&ugrave; ils sont identifiables, en action, et dans un cadre esthétique. Voici les principes :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Dossards visibles</strong> : privil&eacute;giez les angles de face ou de trois quarts. Les photos de dos, m&ecirc;me belles, se vendent rarement car le sportif ne s&apos;y reconna&icirc;t pas au premier coup d&apos;&oelig;il.</li>
      <li><strong>Fond d&eacute;gag&eacute;</strong> : &eacute;vitez les arri&egrave;re-plans encombr&eacute;s (parkings, poubelles). Cherchez les points de vue avec de la nature, des b&acirc;timents embl&eacute;matiques, ou la foule en arri&egrave;re-plan.</li>
      <li><strong>Lumi&egrave;re</strong> : le soleil dans le dos du photographe (face au sportif) donne les meilleurs r&eacute;sultats. &Eacute;vitez le contre-jour sauf pour des effets artistiques d&eacute;lib&eacute;r&eacute;s.</li>
      <li><strong>Espacement</strong> : r&eacute;partissez les photographes pour couvrir diff&eacute;rents moments de la course (d&eacute;but, milieu, fin) et varier les cadrages.</li>
    </ul>

    <h2 id="equipement" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Conseils &eacute;quipement
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Le mat&eacute;riel id&eacute;al d&eacute;pend du type d&apos;&eacute;v&eacute;nement, mais voici les fondamentaux :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Boitier rapide</strong> : un autofocus performant et une cadence &eacute;lev&eacute;e (10+ images/seconde) sont essentiels pour la photo d&apos;action.</li>
      <li><strong>Objectif polyvalent</strong> : un 70-200 mm f/2.8 couvre la majorit&eacute; des situations. Compl&eacute;tez avec un 24-70 mm pour les plans larges et l&apos;ambiance.</li>
      <li><strong>Cartes m&eacute;moire rapides</strong> : pr&eacute;voyez 128 Go minimum par demi-journ&eacute;e. Investissez dans des cartes UHS-II pour ne pas &ecirc;tre limit&eacute; par l&apos;&eacute;criture.</li>
      <li><strong>Batterie</strong> : 2 batteries par boitier minimum. Le froid r&eacute;duit l&apos;autonomie de 30 &agrave; 50 %.</li>
      <li><strong>Protection m&eacute;t&eacute;o</strong> : housse de pluie pour le boitier, sac &eacute;tanche pour les cartes. Un &eacute;v&eacute;nement ne s&apos;annule pas pour un peu de pluie.</li>
    </ul>

    <h2 id="workflow-livraison" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Workflow de livraison avec Focus Racer
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Une fois les photos prises, la rapidit&eacute; de livraison est d&eacute;terminante (voir notre article sur le <Link href="/blog/golden-time-vente-photo-sportive" className="text-emerald hover:underline">Golden Time</Link>). Avec Focus Racer, le workflow est simplifi&eacute; :
    </p>
    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li><strong>Pendant la course</strong> : utilisez le mode Live pour envoyer vos photos en temps r&eacute;el depuis votre smartphone (via Wi-Fi ou 4G).</li>
      <li><strong>Apr&egrave;s la course</strong> : uploadez le reste des photos en masse (drag & drop, jusqu&apos;&agrave; 25 photos par lot).</li>
      <li><strong>L&apos;IA travaille</strong> : tri, indexation, watermark et retouche automatiques en 2 minutes pour 1 000 photos.</li>
      <li><strong>Annoncez</strong> : les sportifs re&ccedil;oivent une notification e-mail avec le lien vers leurs photos.</li>
      <li><strong>Vendez</strong> : les sportifs trouvent, ach&egrave;tent et t&eacute;l&eacute;chargent directement.</li>
    </ol>

    <h2 id="monetisation" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Strat&eacute;gie de mon&eacute;tisation
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Plusieurs mod&egrave;les coexistent. Le plus performant d&eacute;pend de la taille de l&apos;&eacute;v&eacute;nement et du profil des participants :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Vente individuelle</strong> : chaque sportif ach&egrave;te ses photos (3-8 &euro;/photo). Mod&egrave;le le plus courant, rentable d&egrave;s 200 participants.</li>
      <li><strong>Packs d&eacute;gressifs</strong> : 1 photo &agrave; 5 &euro;, 3 photos &agrave; 12 &euro;, toutes les photos &agrave; 25 &euro;. Augmente le panier moyen de 40 &agrave; 60 %.</li>
      <li><strong>Mod&egrave;le sponsor</strong> : un sponsor finance la couverture photo. Les photos sont gratuites pour les sportifs avec le logo du sponsor en watermark. Mod&egrave;le gagnant-gagnant pour les gros &eacute;v&eacute;nements.</li>
      <li><strong>Inclusion inscription</strong> : le co&ucirc;t de la photo est inclus dans le prix d&apos;inscription (+3-5 &euro;). Garantit 100 % de couverture financ&eacute;e.</li>
    </ul>

    <h2 id="focus-racer-solution" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Focus Racer : la solution cl&eacute; en main
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      En tant qu&apos;organisateur, Focus Racer vous offre une plateforme compl&egrave;te pour g&eacute;rer la couverture photo de votre &eacute;v&eacute;nement sans aucune comp&eacute;tence technique :
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Marketplace pour trouver des photographes accr&eacute;dit&eacute;s</li>
      <li>Import start-list automatique (CSV, Njuko, KMS)</li>
      <li>Galerie publique personnalis&eacute;e avec votre branding</li>
      <li>Statistiques de vente en temps r&eacute;el</li>
      <li>0 % de commission sur les ventes &mdash; seul 1 &euro; de frais de service par commande</li>
    </ul>
    <CTA href="/solutions/organisateurs">D&eacute;couvrir l&apos;espace organisateur</CTA>
  </>
);

/* ═══════════════════════════════════════════════════════════════
   ARTICLE 5 — Photographe sportif : maximiser ses revenus
   ═══════════════════════════════════════════════════════════════ */

const article5Content = (
  <>
    <p className="text-lg text-gray-600 leading-relaxed mb-6">
      Le march&eacute; de la photographie sportive conna&icirc;t une transformation profonde. Les plateformes traditionnelles pr&eacute;l&egrave;vent des commissions &eacute;lev&eacute;es, tandis que de nouvelles solutions comme Focus Racer r&eacute;inventent le mod&egrave;le &eacute;conomique au b&eacute;n&eacute;fice des photographes. Voici comment maximiser vos revenus en 2026.
    </p>

    <h2 id="etat-marche" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      &Eacute;tat du march&eacute; en 2026
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La course &agrave; pied explose en France : plus de <strong>10 millions de pratiquants r&eacute;guliers</strong>, 8 000 &eacute;v&eacute;nements organis&eacute;s chaque ann&eacute;e, des trails aux marathons en passant par les courses &agrave; obstacles. Et ce n&apos;est qu&apos;un segment : triathlon, cyclisme, natation, ski, sports &eacute;questres &mdash; la demande de photo sportive est immense.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Pourtant, la majorit&eacute; des &eacute;v&eacute;nements restent peu ou pas couverts. La raison ? Le ratio effort/rentabilit&eacute; est d&eacute;favorable avec les outils traditionnels. Photographier un &eacute;v&eacute;nement de 500 sportifs signifie prendre 3 000 &agrave; 5 000 photos, puis passer 6 &agrave; 10 heures &agrave; les trier et les mettre en ligne. Avec des taux de conversion de 5 &agrave; 10 % et des commissions de 15 &agrave; 40 %, le jeu n&apos;en vaut souvent pas la chandelle.
    </p>

    <h2 id="commissions" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La guerre des commissions : comparatif 2026
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Le mod&egrave;le de commission est le premier facteur qui d&eacute;termine votre rentabilit&eacute;. Voici un comparatif r&eacute;aliste :
    </p>
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-semibold text-navy border-b border-gray-200">Plateforme</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Commission</th>
            <th className="text-center p-3 font-semibold text-navy border-b border-gray-200">Sur 100 &euro; de ventes</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          <tr><td className="p-3 border-b border-gray-100">Plateformes historiques</td><td className="p-3 text-center border-b border-gray-100">30-40 %</td><td className="p-3 text-center border-b border-gray-100">Vous recevez 60-70 &euro;</td></tr>
          <tr><td className="p-3 border-b border-gray-100">Plateformes interm&eacute;diaires</td><td className="p-3 text-center border-b border-gray-100">15-25 %</td><td className="p-3 text-center border-b border-gray-100">Vous recevez 75-85 &euro;</td></tr>
          <tr className="bg-emerald-50 font-semibold"><td className="p-3 border-b border-gray-200">Focus Racer</td><td className="p-3 text-center border-b border-gray-200 text-emerald">0 %</td><td className="p-3 text-center border-b border-gray-200 text-emerald">Vous recevez ~97 &euro;*</td></tr>
        </tbody>
      </table>
    </div>
    <p className="text-xs text-gray-400 mb-6">
      *Apr&egrave;s frais Stripe (~1,4 % + 0,25 &euro; par transaction). Le sportif paie 1 &euro; de frais de service en plus du prix des photos, encaiss&eacute; par la plateforme.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Sur une saison de 20 &eacute;v&eacute;nements g&eacute;n&eacute;rant chacun 500 &euro; de ventes (soit 10 000 &euro; bruts), la diff&eacute;rence est saisissante :
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 pl-4">
      <li>Avec 30 % de commission : <strong>7 000 &euro; nets</strong></li>
      <li>Avec Focus Racer (0 %) : <strong>~9 700 &euro; nets</strong></li>
      <li>Diff&eacute;rence : <strong>+2 700 &euro;/an</strong> dans votre poche</li>
    </ul>

    <h2 id="golden-time-strategie" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      La strat&eacute;gie du Golden Time
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Comme nous l&apos;expliquons dans notre article d&eacute;di&eacute; au <Link href="/blog/golden-time-vente-photo-sportive" className="text-emerald hover:underline">Golden Time</Link>, 70 % des ventes se concentrent dans les 24 premi&egrave;res heures. Le mode Live de Focus Racer vous permet de publier vos photos en temps r&eacute;el, pendant que les sportifs sont encore sur le site.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Sc&eacute;nario concret :</strong> vous photographiez un trail de 600 participants. &Agrave; midi, les premiers sportifs franchissent l&apos;arriv&eacute;e. &Agrave; 12 h 30, vos photos du d&eacute;part et du parcours sont d&eacute;j&agrave; en ligne et achetables. Les sportifs, smartphone en main, trouvent leurs photos, les ach&egrave;tent et les partagent sur les r&eacute;seaux sociaux &mdash; g&eacute;n&eacute;rant du trafic suppl&eacute;mentaire vers votre galerie.
    </p>

    <h2 id="upselling-packs" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      L&apos;art de l&apos;upselling : les packs
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      La vente &agrave; l&apos;unit&eacute; est un pi&egrave;ge. Un sportif qui ach&egrave;te 1 photo &agrave; 5 &euro; repr&eacute;sente un panier de 5 &euro;. Mais ce m&ecirc;me sportif, face &agrave; un <strong>pack attractif</strong>, ach&egrave;tera souvent 5 photos pour 15 &euro; ou toutes ses photos pour 25 &euro;.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      <strong>Les strat&eacute;gies qui fonctionnent :</strong>
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Le pack &laquo; Toutes mes photos &raquo;</strong> : prix fixe (20-30 &euro;) pour l&apos;ensemble des photos d&apos;un sportif. G&eacute;n&egrave;re le meilleur chiffre d&apos;affaires par client.</li>
      <li><strong>L&apos;ancrage psychologique</strong> : affichez d&apos;abord le prix unitaire (5 &euro;), puis le pack (3 pour 12 &euro;). Le pack para&icirc;t imm&eacute;diatement attractif par comparaison.</li>
      <li><strong>Le pack &laquo; Finisher &raquo;</strong> : un pack premium incluant les photos HD + un montage num&eacute;rique avec le temps officiel du sportif, le classement et le logo de l&apos;&eacute;v&eacute;nement.</li>
    </ul>

    <h2 id="partage-social" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Le partage social : votre meilleur vendeur
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Chaque photo watermark&eacute;e partag&eacute;e sur les r&eacute;seaux sociaux est une <strong>publicit&eacute; gratuite</strong>. Quand un sportif publie sa photo de course sur Instagram avec le lien vers la galerie, ses amis sportifs voient le post et vont chercher leurs propres photos. C&apos;est un effet viral puissant :
    </p>
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📊</span>
        <div>
          <p className="font-medium text-navy mb-1">L&apos;effet r&eacute;seau en chiffres</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            En moyenne, un sportif qui partage sa photo sur les r&eacute;seaux sociaux g&eacute;n&egrave;re <strong>2,3 visites suppl&eacute;mentaires</strong> sur la galerie. Sur un &eacute;v&eacute;nement de 500 participants, si 20 % partagent, cela repr&eacute;sente 230 visites organiques suppl&eacute;mentaires &mdash; soit potentiellement 15 &agrave; 30 ventes de plus.
          </p>
        </div>
      </div>
    </div>
    <p className="text-gray-600 leading-relaxed mb-4">
      Focus Racer facilite ce partage avec des <strong>boutons de partage int&eacute;gr&eacute;s</strong> (Instagram, Facebook, Twitter, lien direct) et des images optimis&eacute;es pour chaque r&eacute;seau (format, ratio, watermark discret mais visible).
    </p>

    <h2 id="avantage-focus-racer" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      L&apos;avantage Focus Racer
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Au-del&agrave; du 0 % de commission, Focus Racer vous donne des outils que les plateformes traditionnelles ne proposent pas :
    </p>
    <ul className="list-disc list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Tri IA automatique</strong> : ne perdez plus 6 heures &agrave; trier manuellement. L&apos;IA traite 1 000 photos en 2 minutes.</li>
      <li><strong>Mode Live</strong> : publiez en temps r&eacute;el, pendant la course. Captez le Golden Time d&egrave;s la ligne d&apos;arriv&eacute;e.</li>
      <li><strong>Stripe Connect direct</strong> : les paiements arrivent directement sur votre compte bancaire, sans d&eacute;lai ni interm&eacute;diaire.</li>
      <li><strong>Cr&eacute;dits IA abordables</strong> : &agrave; partir de 0,019 &euro;/photo (pack 1 000 cr&eacute;dits &agrave; 19 &euro;). D&eacute;gressif jusqu&apos;&agrave; 0,015 &euro;/photo pour les gros volumes.</li>
      <li><strong>Dashboard analytique</strong> : suivez vos ventes, votre taux de conversion et vos revenus en temps r&eacute;el.</li>
      <li><strong>Watermark personnalis&eacute;</strong> : votre logo, votre identit&eacute; visuelle sur chaque photo en galerie.</li>
    </ul>

    <h2 id="plan-action" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      Votre plan d&apos;action en 5 &eacute;tapes
    </h2>
    <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6 pl-4">
      <li><strong>Cr&eacute;ez votre compte</strong> Focus Racer et connectez Stripe (3 minutes).</li>
      <li><strong>Achetez des cr&eacute;dits IA</strong> : commencez avec le pack 1 000 cr&eacute;dits (19 &euro;) pour tester.</li>
      <li><strong>Photographiez</strong> votre prochain &eacute;v&eacute;nement avec le mode Live activ&eacute;.</li>
      <li><strong>Observez</strong> le pipeline IA trier, watermarker et publier vos photos en quelques minutes.</li>
      <li><strong>Analysez</strong> vos ventes dans le dashboard et optimisez vos packs pour l&apos;&eacute;v&eacute;nement suivant.</li>
    </ol>

    <h2 id="conclusion-revenus" className="text-2xl font-bold text-navy mt-10 mb-4 scroll-mt-24">
      En r&eacute;sum&eacute;
    </h2>
    <p className="text-gray-600 leading-relaxed mb-6">
      2026 est l&apos;ann&eacute;e o&ugrave; les photographes sportifs reprennent le contr&ocirc;le de leurs revenus. En combinant 0 % de commission, un pipeline IA ultra-rapide et des outils de vente modernes, Focus Racer vous permet de vous concentrer sur ce que vous faites de mieux &mdash; photographier &mdash; tout en maximisant votre chiffre d&apos;affaires. Chaque euro de vente vous revient (moins les frais bancaires). C&apos;est aussi simple que cela.
    </p>
    <CTA href="/register">Cr&eacute;er mon compte photographe</CTA>
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
    metaDescription: "Dossard, selfie ou nom : découvrez les 3 méthodes pour retrouver vos photos de course en quelques secondes grâce à l'intelligence artificielle Focus Racer.",
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
    metaDescription: "OCR de dossards, reconnaissance faciale, filtrage qualité : découvrez le pipeline d'intelligence artificielle de Focus Racer qui trie 1 000 photos en 2 minutes.",
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
              Cet article n&apos;existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;.
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
                Publi&eacute; le {article.date}
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
                          Copi&eacute; !
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
                      Cr&eacute;ation de compte gratuite. 0 % de commission.
                    </p>
                    <Link
                      href="/register"
                      className="block w-full text-center px-3 py-2 bg-emerald hover:bg-emerald-dark text-white text-xs font-medium rounded-lg transition-all duration-200"
                    >
                      Cr&eacute;er un compte
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
                        <span>&middot;</span>
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
              Pr&ecirc;t &agrave; passer &agrave; l&apos;action ?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Rejoignez Focus Racer et d&eacute;couvrez la photo sportive automatis&eacute;e par l&apos;IA.
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
                Cr&eacute;er un compte
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
