import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 gradient-bg-subtle">
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4 text-center">
            Mentions légales &amp; Conditions générales
          </h1>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Conditions générales d&apos;utilisation, de vente et d&apos;achat de la plateforme Focus Racer.
            Merci de lire attentivement ces conditions avant d&apos;utiliser le Service. L&apos;inscription
            ou l&apos;achat de crédits vaut acceptation des présentes Conditions Générales.
          </p>

          <div className="space-y-8">
            {/* Éditeur */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Éditeur du site</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p className="text-navy/80">
                  <strong>Focus Racer</strong><br />
                  SAS au capital de 10 000 euros<br />
                  Siège social : [Adresse]<br />
                  RCS : [Numéro RCS]<br />
                  SIRET : [Numéro SIRET]<br />
                  TVA intracommunautaire : [Numéro TVA]
                </p>
                <p className="text-navy/80">
                  <strong>Directeur de la publication :</strong> [Nom du directeur]<br />
                  <strong>Contact :</strong> contact@focusracer.com
                </p>
              </CardContent>
            </Card>

            {/* Hébergement */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Hébergement</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p className="text-navy/80">
                  Le site Focus Racer est hébergé par :<br />
                  <strong>OVHcloud</strong><br />
                  2 Rue Kellermann<br />
                  59100 Roubaix, France<br />
                  SAS au capital de 10 174 560 euros
                </p>
                <p className="text-navy/80">
                  Les fichiers médias (photos) sont stockés sur <strong>Amazon Web Services (AWS) S3</strong>,
                  région Europe (Irlande, eu-west-1).
                </p>
              </CardContent>
            </Card>

            {/* CGU — 19 articles */}
            <Card className="glass-card rounded-2xl" id="cgu">
              <CardHeader>
                <CardTitle className="text-navy text-xl">
                  Conditions générales d&apos;utilisation, de vente et d&apos;achat
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-6">

                {/* Article 1 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 1 — Définitions</h4>
                  <p className="text-navy/80">
                    Aux fins des présentes, les termes ci-après commençant par une majuscule ont la signification suivante :
                  </p>
                  <ul className="text-navy/80 list-disc pl-6 space-y-2">
                    <li>
                      <strong>« Professionnel(s) »</strong> : désigne toute personne physique ou morale (photographe,
                      agence, club, fédération, organisateur d&apos;événement) ayant créé un compte professionnel
                      sur la Plateforme pour y importer, gérer, trier et vendre des photographies d&apos;événements sportifs.
                    </li>
                    <li>
                      <strong>« Conditions Générales »</strong> : désigne les présentes conditions générales d&apos;utilisation,
                      de vente et d&apos;achat.
                    </li>
                    <li>
                      <strong>« Contenu Professionnel »</strong> : désigne l&apos;ensemble des images, photographies et
                      documents importés ou créés sur le compte Focus Racer du Professionnel.
                    </li>
                    <li>
                      <strong>« Données Personnelles »</strong> : désigne toute information se rapportant à une personne
                      physique identifiée ou identifiable, conformément à l&apos;article 4 du Règlement (UE) 2016/679 (RGPD)
                      et à la loi n° 78-17 du 6 janvier 1978 modifiée.
                    </li>
                    <li>
                      <strong>« Plateforme »</strong> : désigne la plateforme en ligne Focus Racer, accessible à l&apos;adresse
                      focusracer.swipego.app, offrant des outils techniques permettant aux Professionnels d&apos;importer,
                      trier automatiquement, diffuser et vendre leurs photos d&apos;événements sportifs.
                    </li>
                    <li>
                      <strong>« Société »</strong> : désigne la société Focus Racer, propriétaire de l&apos;ensemble
                      des droits sur la Plateforme et qui l&apos;exploite.
                    </li>
                    <li>
                      <strong>« Service »</strong> : désigne les moyens techniques mis en œuvre par la Plateforme permettant
                      aux Professionnels de stocker, identifier par intelligence artificielle (OCR, reconnaissance faciale),
                      trier, vendre et distribuer leurs images sous forme numérique.
                    </li>
                    <li>
                      <strong>« Utilisateur(s) »</strong> : désigne les visiteurs et acheteurs sur la Plateforme
                      (coureurs, participants d&apos;événements sportifs) susceptibles de rechercher, consulter et
                      acquérir des photographies publiées par les Professionnels.
                    </li>
                    <li>
                      <strong>« Collaborateur(s) »</strong> : désigne les personnes tierces auxquelles le Professionnel
                      a donné accès à son compte via des identifiants séparés, afin d&apos;effectuer des opérations en son nom.
                    </li>
                  </ul>
                </div>

                {/* Article 2 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 2 — Objet</h4>
                  <p className="text-navy/80">
                    La Plateforme a pour vocation de fournir aux Professionnels les moyens techniques nécessaires
                    pour stocker, identifier automatiquement (via reconnaissance de dossards et de visages par IA),
                    trier, gérer, publier, promouvoir et vendre leurs photographies d&apos;événements sportifs
                    sous forme numérique. Le Service est proposé en mode SaaS (Software as a Service).
                  </p>
                  <p className="text-navy/80">
                    Les Utilisateurs accèdent aux galeries des Professionnels via la Plateforme pour rechercher
                    et, le cas échéant, acheter des photos. Les relations commerciales entre le Professionnel
                    et ses Utilisateurs (vente, licence de contenu) s&apos;effectuent directement entre eux.
                    La Société n&apos;est pas partie prenante dans ces transactions et ne saurait voir sa responsabilité
                    engagée à ce titre, son rôle se limitant à la fourniture d&apos;une solution technique
                    et à la facilitation du paiement via Stripe Connect.
                  </p>
                  <p className="text-navy/80">
                    Le Professionnel reste éditeur de ses galeries et événements créés sur la Plateforme,
                    et demeure seul responsable de leur conformité à la législation applicable.
                  </p>
                </div>

                {/* Article 3 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 3 — Inscription du Professionnel</h4>
                  <p className="text-navy/80">
                    Pour utiliser la Plateforme, vous devez créer un compte Professionnel. À ce titre, vous devez :
                    remplir le formulaire d&apos;inscription, être une personne physique majeure et capable ou une personne
                    morale dûment représentée, et accepter les présentes Conditions Générales. Vous certifiez que les
                    informations communiquées lors de votre inscription sont exactes et à jour.
                  </p>
                  <p className="text-navy/80">
                    Si un tiers accède à votre compte via vos identifiants personnels, toute action réalisée sera
                    réputée effectuée en votre nom et pour votre compte. De même, toute opération effectuée par un
                    Collaborateur sera considérée comme émanant de vous. Il vous incombe de préserver la
                    confidentialité de vos identifiants et de limiter l&apos;accès aux seules personnes de confiance.
                    Vous assumerez l&apos;entière responsabilité des actions réalisées via votre compte.
                  </p>
                </div>

                {/* Article 4 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 4 — Obligations des Professionnels</h4>
                  <p className="text-navy/80">En tant que Professionnel, vous vous engagez à :</p>
                  <ul className="text-navy/80 list-disc pl-6 space-y-2">
                    <li>
                      Maintenir vos informations personnelles et professionnelles exactes et à jour.
                    </li>
                    <li>
                      Accorder à la Plateforme la permission de stocker, copier, traiter et publier votre Contenu
                      Professionnel aux seules fins de la fourniture du Service (affichage, watermarking,
                      génération de vignettes, traitement IA).
                    </li>
                    <li>
                      Déclarer et garantir que vous détenez l&apos;intégralité des droits sur le contenu importé,
                      incluant les droits de propriété intellectuelle, les autorisations de droit à l&apos;image,
                      et que ce contenu n&apos;enfreint aucun droit de tiers ni aucune loi applicable.
                    </li>
                    <li>
                      Déclarer et garantir avoir obtenu tous les consentements nécessaires relatifs à l&apos;affichage
                      et à la publication d&apos;informations personnelles ou de l&apos;image de toute personne figurant
                      dans votre Contenu Professionnel.
                    </li>
                    <li>
                      Reconnaître que le rôle de la Société se limite à fournir une solution technique, et que toute
                      vente ou relation avec vos Utilisateurs relève de votre seule responsabilité.
                    </li>
                    <li>
                      Assumer l&apos;entière responsabilité de la gestion des identifiants d&apos;accès, y compris
                      ceux de vos Collaborateurs.
                    </li>
                  </ul>
                  <p className="text-navy/80">
                    En cas de violation des présentes Conditions, la Société se réserve le droit de suspendre ou
                    supprimer votre compte et votre contenu, sans préavis ni remboursement.
                  </p>
                </div>

                {/* Article 5 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 5 — Garanties sur le Contenu</h4>
                  <p className="text-navy/80">
                    Vous vous engagez à faire preuve de respect envers la Société, les autres Professionnels et les
                    Utilisateurs. Il est strictement interdit d&apos;utiliser la Plateforme pour :
                  </p>
                  <ul className="text-navy/80 list-disc pl-6 space-y-1">
                    <li>Importer du contenu portant atteinte à des droits de propriété intellectuelle.</li>
                    <li>Porter atteinte aux personnes mineures sous quelque forme que ce soit.</li>
                    <li>Enfreindre une loi ou participer à une activité illégale.</li>
                    <li>Diffuser du contenu illicite, menaçant, diffamatoire, obscène ou incitant à la haine.</li>
                    <li>Publier du contenu que vous n&apos;avez pas le droit de distribuer.</li>
                    <li>Usurper l&apos;identité d&apos;une personne physique ou morale.</li>
                    <li>Introduire des virus, logiciels malveillants ou code nuisible.</li>
                  </ul>
                  <p className="text-navy/80">
                    Vous reconnaissez être seul responsable de la forme, du contenu et de l&apos;exactitude de votre
                    Contenu Professionnel. La Société ne vérifie pas systématiquement le contenu importé, mais
                    se réserve le droit de le vérifier, le refuser ou le supprimer à sa seule discrétion.
                  </p>
                  <p className="text-navy/80">
                    Vous acceptez d&apos;indemniser et de tenir la Société indemne de toute réclamation,
                    dommage ou frais (y compris les honoraires d&apos;avocat) liés au contenu que vous soumettez,
                    à l&apos;utilisation de votre compte ou à la violation des présentes Conditions.
                  </p>
                </div>

                {/* Article 6 */}
                <div id="confidentialite">
                  <h4 className="text-navy font-semibold">Article 6 — Données Personnelles</h4>
                  <p className="text-navy/80">
                    La Société et les Professionnels s&apos;engagent à respecter la réglementation applicable
                    en matière de protection des données, et en particulier le Règlement (UE) 2016/679 (RGPD).
                  </p>

                  <p className="text-navy/80 font-medium mt-4">Données du Professionnel :</p>
                  <p className="text-navy/80">
                    La Société collecte et traite les données suivantes : nom, prénom, adresse email, informations
                    de connexion (date, adresse IP), commandes, abonnements, factures, transactions financières,
                    correspondances, mot de passe (stocké chiffré et salé), préférences de paiement.
                    Ces données sont nécessaires à la gestion du compte, des abonnements et de la relation commerciale.
                  </p>
                  <p className="text-navy/80">
                    Ces données sont hébergées sur des serveurs situés en France (OVH, Roubaix) et en Europe
                    (AWS eu-west-1, Irlande). Elles ne sont pas partagées avec des tiers, sauf partenaires
                    techniques nécessaires au fonctionnement du Service (Stripe pour les paiements, AWS pour le stockage
                    et le traitement IA).
                  </p>
                  <p className="text-navy/80">
                    Les données sont conservées pendant toute la durée de la relation contractuelle et, pour les
                    données que la Société est légalement tenue de conserver, pendant 10 ans après la fin de
                    la dernière souscription. Les contenus importés (images) sont conservés 2 mois après la
                    clôture du compte, sauf demande de suppression anticipée.
                  </p>

                  <p className="text-navy/80 font-medium mt-4">Données des Utilisateurs (coureurs/acheteurs) :</p>
                  <p className="text-navy/80">
                    Le Professionnel est seul responsable du traitement des Données Personnelles de ses Utilisateurs.
                    La Société agit en qualité de sous-traitant et s&apos;engage à traiter ces données uniquement
                    pour les finalités liées au Service : gestion des commandes, identification par reconnaissance
                    faciale (avec consentement), et relation Professionnel-Utilisateur.
                  </p>
                  <p className="text-navy/80">
                    Les données traitées incluent : images, nom, prénom, email, adresse, mot de passe chiffré,
                    données de connexion, commandes, numéros de dossard, photographies des utilisateurs (selfies
                    pour la recherche faciale), paniers et sélections.
                  </p>
                  <p className="text-navy/80">
                    La Société s&apos;engage à garantir la confidentialité de ces données, à ne les traiter
                    que conformément aux instructions du Professionnel, et à notifier toute violation de
                    données dans un délai de 24 heures.
                  </p>

                  <p className="text-navy/80 font-medium mt-4">Droits des personnes concernées :</p>
                  <p className="text-navy/80">
                    Conformément au RGPD, toute personne dispose d&apos;un droit d&apos;accès, de rectification,
                    d&apos;effacement, d&apos;opposition, de limitation du traitement et de portabilité de ses données.
                    Ces droits peuvent être exercés via le formulaire RGPD accessible depuis votre compte,
                    ou par email à <strong>dpo@focusracer.com</strong>.
                  </p>

                  <p className="text-navy/80 font-medium mt-4">Mesures de sécurité :</p>
                  <ul className="text-navy/80 list-disc pl-6 space-y-1">
                    <li>Chiffrement SSL/TLS de toutes les connexions</li>
                    <li>Mots de passe stockés chiffrés et salés (bcrypt)</li>
                    <li>Accès administratif limité au strict nécessaire</li>
                    <li>Sauvegardes chiffrées sur stockage cloud sécurisé</li>
                    <li>Mises à jour de sécurité appliquées régulièrement</li>
                    <li>Sécurité physique des serveurs assurée par OVH et AWS</li>
                  </ul>
                </div>

                {/* Article 7 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 7 — Propriété intellectuelle</h4>
                  <p className="text-navy/80 font-medium">Votre propriété intellectuelle :</p>
                  <p className="text-navy/80">
                    Vous demeurez titulaire de l&apos;intégralité de vos droits de propriété intellectuelle
                    sur votre Contenu Professionnel. Vous accordez à la Société une licence limitée, non exclusive
                    et non transférable, aux seules fins de fournir le Service : affichage, génération de vignettes,
                    application de filigranes, traitement par intelligence artificielle (OCR, reconnaissance faciale),
                    copie de sauvegarde et toute autre opération technique nécessaire.
                  </p>
                  <p className="text-navy/80">
                    En cas d&apos;atteinte à vos droits de propriété intellectuelle constatée sur la Plateforme
                    ou un site tiers, vous seul avez qualité pour engager les actions en réparation.
                    Vous pouvez signaler toute atteinte à <strong>dmca@focusracer.com</strong>.
                  </p>

                  <p className="text-navy/80 font-medium mt-4">Propriété intellectuelle de Focus Racer :</p>
                  <p className="text-navy/80">
                    La Plateforme, son logiciel, son code source et objet, ses interfaces, sa charte graphique,
                    ses algorithmes (notamment les systèmes de reconnaissance IA), ses bases de données, sa documentation
                    et tout autre élément protégeable sont la propriété exclusive de la Société.
                    La Société vous concède un droit d&apos;utilisation personnel, non transférable et non exclusif
                    de la Plateforme, dans le cadre de son usage normal.
                  </p>
                  <p className="text-navy/80">
                    Il est interdit de modifier, reproduire, distribuer, désassembler ou effectuer de l&apos;ingénierie
                    inverse sur tout ou partie de la Plateforme sans autorisation écrite préalable de la Société.
                  </p>
                </div>

                {/* Article 8 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 8 — Crédits et politique de remboursement</h4>
                  <p className="text-navy/80">
                    Chaque Professionnel nouvellement inscrit bénéficie de crédits de découverte offerts,
                    permettant de tester le Service de détection automatique (OCR et reconnaissance faciale).
                    La quantité de crédits offerts est indiquée lors de l&apos;inscription.
                  </p>
                  <p className="text-navy/80">
                    Après épuisement des crédits de découverte, le Professionnel peut acquérir des crédits
                    supplémentaires sous forme de packs ou d&apos;abonnements mensuels, aux tarifs indiqués
                    sur la page de tarification. Le paiement s&apos;effectue via Stripe Checkout.
                    Chaque photo importée consomme 1 crédit pour le traitement IA (OCR + reconnaissance faciale
                    + watermarking + analyse qualité).
                  </p>
                  <p className="text-navy/80">
                    Les crédits acquis sont valables pour une durée d&apos;un an à compter de la date d&apos;achat.
                    Il est considéré que le Professionnel a eu la pleine possibilité d&apos;évaluer le Service
                    grâce aux crédits offerts. En conséquence, <strong>les achats de crédits ultérieurs ne sont
                    pas remboursables</strong>.
                  </p>
                </div>

                {/* Article 9 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 9 — Conditions de vente aux Utilisateurs</h4>
                  <p className="text-navy/80 font-medium">Prix :</p>
                  <p className="text-navy/80">
                    Les prix des photographies sont fixés librement par chaque Professionnel via la création
                    de packs tarifaires (photo à l&apos;unité, pack, lot complet). Les prix sont indiqués en
                    euros TTC. Des frais de service de 1,00 € par commande sont ajoutés au montant total
                    et perçus par la Société.
                  </p>
                  <p className="text-navy/80 font-medium mt-3">Paiement :</p>
                  <p className="text-navy/80">
                    Le paiement s&apos;effectue en ligne via Stripe (carte bancaire, Apple Pay, Google Pay, Link, SEPA).
                    Lorsque le Professionnel a connecté son compte Stripe (Stripe Connect Express), les fonds
                    lui sont versés directement, déduction faite des frais Stripe et des frais de service plateforme.
                  </p>
                  <p className="text-navy/80 font-medium mt-3">Livraison :</p>
                  <p className="text-navy/80">
                    Les photos sont disponibles au téléchargement immédiatement après validation du paiement,
                    en haute résolution et sans filigrane, via un lien de téléchargement sécurisé (URL signée,
                    valable 24 heures).
                  </p>
                  <p className="text-navy/80 font-medium mt-3">Droit de rétractation :</p>
                  <p className="text-navy/80">
                    Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation
                    ne s&apos;applique pas aux contenus numériques fournis sur un support immatériel dont
                    l&apos;exécution a commencé avec l&apos;accord exprès du consommateur et son renoncement
                    explicite au droit de rétractation.
                  </p>
                  <p className="text-navy/80 font-medium mt-3">Licence d&apos;utilisation :</p>
                  <p className="text-navy/80">
                    L&apos;achat d&apos;une photo confère à l&apos;Utilisateur une licence d&apos;utilisation
                    personnelle et non exclusive (impression, partage sur réseaux sociaux avec mention du
                    photographe, usage privé). Sont interdits : la revente, la redistribution, l&apos;utilisation
                    commerciale et la suppression des métadonnées ou du crédit photographe.
                  </p>
                </div>

                {/* Article 10 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 10 — Fonctionnement du Service</h4>
                  <p className="text-navy/80">
                    La Société met en œuvre tous les moyens raisonnables pour assurer la disponibilité et le bon
                    fonctionnement de la Plateforme. Toutefois, des opérations de maintenance, des mises à jour
                    ou des incidents techniques peuvent occasionner des interruptions temporaires du Service.
                    Vous acceptez de ne pas tenir la Société pour responsable des conséquences de telles interruptions.
                  </p>
                </div>

                {/* Article 11 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 11 — Exclusion de garanties</h4>
                  <p className="text-navy/80 uppercase text-xs leading-relaxed">
                    Vous reconnaissez et acceptez que, dans les limites autorisées par la loi : votre utilisation
                    du Service est à vos propres risques. Le Service est fourni « en l&apos;état » et sous réserve
                    de la disponibilité d&apos;une connexion Internet. La Société ne garantit pas que le Service
                    répondra à vos besoins spécifiques, sera ininterrompu, sécurisé ou exempt d&apos;erreurs,
                    que le contenu importé sera disponible de manière permanente, ni que la qualité des résultats
                    de détection automatique (OCR, reconnaissance faciale) atteindra un niveau de précision donné.
                  </p>
                  <p className="text-navy/80">
                    Des pertes de contenu ou de données sont susceptibles de survenir. Il incombe au Professionnel
                    de conserver une copie de sauvegarde de tout contenu importé et de ses données.
                  </p>
                </div>

                {/* Article 12 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 12 — Limitation de responsabilité</h4>
                  <p className="text-navy/80">
                    Dans les limites autorisées par la loi, la Société ne pourra être tenue responsable
                    d&apos;aucun dommage direct ou indirect résultant de : l&apos;utilisation ou l&apos;impossibilité
                    d&apos;utiliser la Plateforme ; l&apos;accès non autorisé à du contenu ; le téléchargement
                    ou l&apos;utilisation de contenu sans licence ; la perte, la divulgation ou l&apos;utilisation
                    frauduleuse des identifiants d&apos;accès.
                  </p>
                  <p className="text-navy/80">
                    En tout état de cause, la responsabilité de la Société au titre des présentes ne saurait
                    entraîner le versement d&apos;une indemnité supérieure à quatre (4) fois le montant total
                    HT des sommes versées par le Professionnel au cours des 12 derniers mois.
                  </p>
                </div>

                {/* Article 13 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 13 — Modification des Conditions</h4>
                  <p className="text-navy/80">
                    La Société se réserve le droit de modifier les présentes Conditions Générales à tout moment.
                    Toute modification sera notifiée par email aux Professionnels et prendra effet dès sa mise en
                    ligne. Si un Professionnel est en désaccord, il dispose d&apos;un délai de quatorze (14) jours
                    à compter de la notification pour demander la résiliation de son compte, sans remboursement
                    des sommes déjà versées.
                  </p>
                </div>

                {/* Article 14 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 14 — Violation des Conditions</h4>
                  <p className="text-navy/80">
                    En cas de violation des présentes Conditions par un Professionnel, la Société pourra,
                    à sa seule discrétion : adresser un rappel des Conditions ; suspendre temporairement
                    l&apos;accès au compte ; ou clôturer définitivement le compte. La Société n&apos;est pas
                    tenue d&apos;informer préalablement le Professionnel ni de se justifier.
                  </p>
                </div>

                {/* Article 15 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 15 — Indépendance des parties</h4>
                  <p className="text-navy/80">
                    Les présentes Conditions n&apos;ont ni pour objet ni pour effet d&apos;instaurer un lien
                    hiérarchique, un mandat ou une relation d&apos;exclusivité entre le Professionnel et la Société.
                    Chacune des parties conserve sa qualité d&apos;indépendant et assume les risques de son activité.
                  </p>
                </div>

                {/* Article 16 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 16 — Force majeure</h4>
                  <p className="text-navy/80">
                    La responsabilité de la Société ne saurait être engagée en cas de force majeure. Sont
                    expressément considérés comme cas de force majeure : les grèves, les blocages ou perturbations
                    des moyens de communication ou de télécommunication, l&apos;indisponibilité des opérateurs
                    ou fournisseurs tiers (hébergement, stockage cloud, services IA), les catastrophes naturelles
                    et les décisions gouvernementales.
                  </p>
                </div>

                {/* Article 17 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 17 — Confidentialité</h4>
                  <p className="text-navy/80">
                    Vous vous engagez à respecter, pendant toute la durée de votre utilisation du Service et après
                    sa cessation, la stricte confidentialité des informations non publiques dont vous auriez eu
                    connaissance. Cette obligation de confidentialité demeure en vigueur aussi longtemps que les
                    informations concernées conservent un intérêt stratégique, commercial ou financier.
                  </p>
                </div>

                {/* Article 18 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 18 — Indépendance des clauses et non-renonciation</h4>
                  <p className="text-navy/80">
                    Si l&apos;une des clauses des présentes Conditions venait à être déclarée nulle par un changement
                    de législation ou une décision de justice, les autres dispositions conserveraient leur pleine validité.
                    Le fait pour la Société de ne pas se prévaloir d&apos;un manquement à l&apos;une des obligations
                    des présentes ne saurait être interprété comme une renonciation à ladite obligation.
                  </p>
                </div>

                {/* Article 19 */}
                <div>
                  <h4 className="text-navy font-semibold">Article 19 — Droit applicable et litiges</h4>
                  <p className="text-navy/80">
                    Les présentes Conditions Générales sont régies par le droit français. Tout litige relatif
                    à la formation, la conclusion, l&apos;exécution, l&apos;interprétation ou la validité des
                    présentes relèvera de la compétence exclusive des tribunaux de Paris (75).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="glass-card rounded-2xl" id="cookies">
              <CardHeader>
                <CardTitle className="text-navy">Politique de cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <p className="text-navy/80">
                  La Plateforme utilise des cookies strictement nécessaires au fonctionnement du Service :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li><strong>Cookie de session</strong> : maintient votre connexion active (NextAuth.js). Durée : session.</li>
                  <li><strong>Cookie de préférences</strong> : mémorise vos choix d&apos;interface. Durée : 1 an.</li>
                  <li><strong>Favoris</strong> : stockés localement dans votre navigateur (localStorage), non transmis au serveur.</li>
                </ul>
                <p className="text-navy/80">
                  La Plateforme <strong>n&apos;utilise pas</strong> de cookies publicitaires, de tracking tiers,
                  ni d&apos;outils d&apos;analyse comportementale (Google Analytics, Facebook Pixel, etc.).
                  Aucune donnée de navigation n&apos;est partagée avec des tiers à des fins publicitaires.
                </p>
                <p className="text-navy/80">
                  Vous pouvez à tout moment supprimer les cookies depuis les paramètres de votre navigateur.
                  La suppression du cookie de session entraînera votre déconnexion.
                </p>
              </CardContent>
            </Card>

            {/* Protection des photos */}
            <Card className="glass-card rounded-2xl" id="protection-photos">
              <CardHeader>
                <CardTitle className="text-navy">Protection des photos et droits d&apos;auteur</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <h4 className="text-navy font-semibold">1. Droits d&apos;auteur</h4>
                <p className="text-navy/80">
                  Toutes les photographies publiées sur Focus Racer sont protégées par le droit d&apos;auteur
                  (articles L111-1 et suivants du Code de la propriété intellectuelle). Elles appartiennent
                  exclusivement aux photographes qui les ont publiées.
                </p>
                <p className="text-navy/80">
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou
                  partie des photographies, quel que soit le moyen ou le procédé utilisé, est interdite,
                  sauf autorisation écrite préalable du photographe titulaire des droits.
                </p>

                <h4 className="text-navy font-semibold">2. Mesures de protection techniques</h4>
                <p className="text-navy/80">
                  Les photographies affichées sur la Plateforme sont protégées par des mesures techniques
                  conformément à l&apos;article L331-5 du Code de la propriété intellectuelle :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li>Filigrane (watermark) visible sur toutes les photos en consultation</li>
                  <li>Résolution réduite (les originaux en haute définition ne sont accessibles qu&apos;après achat)</li>
                  <li>Protection contre le téléchargement non autorisé</li>
                  <li>Protection contre l&apos;intégration sur des sites tiers (hotlink)</li>
                  <li>Limitation de débit pour prévenir le téléchargement automatisé</li>
                </ul>
                <p className="text-navy/80">
                  Le contournement de ces mesures de protection est interdit et passible de sanctions
                  pénales (article L335-3-1 du Code de la propriété intellectuelle : 3 750 euros d&apos;amende).
                </p>

                <h4 className="text-navy font-semibold">3. Sanctions</h4>
                <p className="text-navy/80">
                  Toute utilisation non autorisée constitue une contrefaçon sanctionnée par les
                  articles L335-2 et suivants du Code de la propriété intellectuelle (jusqu&apos;à 300 000
                  euros d&apos;amende et 3 ans d&apos;emprisonnement).
                </p>
              </CardContent>
            </Card>

            {/* DMCA */}
            <Card className="glass-card rounded-2xl" id="dmca">
              <CardHeader>
                <CardTitle className="text-navy">Procédure de signalement (DMCA / retrait)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <p className="text-navy/80">
                  Si vous constatez qu&apos;une photographie vous appartenant est utilisée sans autorisation,
                  ou si vous souhaitez signaler une violation de droits d&apos;auteur, veuillez nous contacter.
                </p>

                <h4 className="text-navy font-semibold">Pour les photographes</h4>
                <p className="text-navy/80">
                  Envoyez les éléments suivants à <strong>dmca@focusracer.com</strong> :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li>Votre identité et vos coordonnées</li>
                  <li>L&apos;URL de votre photo originale sur Focus Racer</li>
                  <li>L&apos;URL du site contrevenant</li>
                  <li>Une capture d&apos;écran de la violation</li>
                  <li>Une déclaration sur l&apos;honneur que vous êtes titulaire des droits</li>
                </ul>
                <p className="text-navy/80">
                  Nous adresserons une mise en demeure au site contrevenant sous 48 heures ouvrées.
                </p>

                <h4 className="text-navy font-semibold">Pour les tiers</h4>
                <p className="text-navy/80">
                  Si vous estimez qu&apos;un contenu publié sur Focus Racer porte atteinte à vos droits,
                  envoyez une notification à <strong>dmca@focusracer.com</strong> comprenant l&apos;identification
                  précise du contenu litigieux, la justification de vos droits et vos coordonnées.
                  Conformément à l&apos;article 6-I-5 de la LCEN, nous procéderons au retrait dans les meilleurs délais.
                </p>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="glass-card rounded-2xl" id="faq">
              <CardHeader>
                <CardTitle className="text-navy">Questions fréquentes (FAQ)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-5">
                <div>
                  <h4 className="text-navy font-semibold">Comment retrouver mes photos ?</h4>
                  <p className="text-navy/80">
                    Rendez-vous sur la page de l&apos;événement et entrez votre numéro de dossard, votre nom
                    ou prenez/importez un selfie. Notre IA identifie automatiquement vos photos en quelques secondes.
                  </p>
                </div>
                <div>
                  <h4 className="text-navy font-semibold">Comment acheter mes photos ?</h4>
                  <p className="text-navy/80">
                    Sélectionnez les photos souhaitées, choisissez un pack tarifaire proposé par le photographe,
                    puis procédez au paiement en ligne. Vos photos HD sans filigrane sont disponibles immédiatement.
                  </p>
                </div>
                <div>
                  <h4 className="text-navy font-semibold">Comment devenir photographe sur Focus Racer ?</h4>
                  <p className="text-navy/80">
                    Créez un compte professionnel, connectez votre compte Stripe pour recevoir vos paiements,
                    puis créez votre premier événement et importez vos photos. Le tri par dossard est automatique.
                  </p>
                </div>
                <div>
                  <h4 className="text-navy font-semibold">Comment fonctionne la reconnaissance automatique ?</h4>
                  <p className="text-navy/80">
                    Notre technologie utilise AWS Rekognition pour détecter les numéros de dossard (OCR) et les
                    visages sur chaque photo. Chaque image est automatiquement associée aux coureurs correspondants.
                  </p>
                </div>
                <div>
                  <h4 className="text-navy font-semibold">Combien coûte le service pour les photographes ?</h4>
                  <p className="text-navy/80">
                    1 crédit par photo importée (pour le traitement IA). Des packs de crédits sont disponibles
                    sur la page Tarifs. Les frais Stripe standard s&apos;appliquent sur chaque vente. La Plateforme
                    perçoit 1,00 € de frais de service par commande.
                  </p>
                </div>
                <div>
                  <h4 className="text-navy font-semibold">Comment exercer mes droits RGPD ?</h4>
                  <p className="text-navy/80">
                    Rendez-vous sur la page RGPD accessible depuis votre compte ou contactez-nous à
                    dpo@focusracer.com. Nous traitons toute demande dans un délai de 30 jours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
