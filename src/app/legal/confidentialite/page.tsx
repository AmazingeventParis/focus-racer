import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 gradient-bg-subtle">
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4 text-center">
            Politique de confidentialité
          </h1>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Protection de vos données personnelles conformément au RGPD (Règlement (UE) 2016/679)
            et à la loi Informatique et Libertés.
          </p>

          <div className="space-y-8">

            {/* Responsable du traitement */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Responsable du traitement</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <p className="text-navy/80">
                  <strong>Focus Racer</strong> — SAS au capital de 10 000 euros<br />
                  Siège social : [Adresse]<br />
                  Contact DPO : <strong>dpo@focusracer.com</strong>
                </p>
              </CardContent>
            </Card>

            {/* Données des Professionnels */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Données des Professionnels</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <p className="text-navy/80">
                  La Société collecte et traite les données suivantes relatives aux Professionnels
                  (photographes, agences, clubs, fédérations, organisateurs) :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li>Nom, prénom, adresse email</li>
                  <li>Informations de connexion (date, adresse IP)</li>
                  <li>Commandes, abonnements, factures, transactions financières</li>
                  <li>Correspondances avec le support</li>
                  <li>Mot de passe (stocké chiffré et salé via bcrypt)</li>
                  <li>Préférences de paiement (Stripe Connect)</li>
                </ul>
                <p className="text-navy/80">
                  <strong>Finalités :</strong> gestion du compte, des abonnements, de la relation commerciale,
                  facturation, support technique, amélioration du Service.
                </p>
                <p className="text-navy/80">
                  <strong>Base légale :</strong> exécution du contrat (CGU), intérêt légitime (amélioration du Service),
                  obligation légale (conservation fiscale).
                </p>
              </CardContent>
            </Card>

            {/* Données des Utilisateurs */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Données des Utilisateurs (sportifs / acheteurs)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <p className="text-navy/80">
                  Le Professionnel est seul responsable du traitement des Données Personnelles de ses Utilisateurs.
                  La Société agit en qualité de sous-traitant et s&apos;engage à traiter ces données uniquement
                  pour les finalités liées au Service.
                </p>
                <p className="text-navy/80">Les données traitées incluent :</p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li>Images et photographies</li>
                  <li>Nom, prénom, adresse email, adresse postale</li>
                  <li>Mot de passe chiffré</li>
                  <li>Données de connexion (date, adresse IP)</li>
                  <li>Commandes et historique d&apos;achats</li>
                  <li>Numéros de dossard</li>
                  <li>Selfies (pour la recherche par reconnaissance faciale, avec consentement)</li>
                  <li>Panier et sélections</li>
                </ul>
                <p className="text-navy/80">
                  <strong>Finalités :</strong> gestion des commandes, identification par reconnaissance faciale
                  (avec consentement), relation Professionnel-Utilisateur, téléchargement des photos achetées.
                </p>
                <p className="text-navy/80">
                  La Société s&apos;engage à garantir la confidentialité de ces données, à ne les traiter
                  que conformément aux instructions du Professionnel, et à notifier toute violation de
                  données dans un délai de 24 heures.
                </p>
              </CardContent>
            </Card>

            {/* Hébergement et stockage */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Hébergement et stockage des données</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <p className="text-navy/80">
                  Les données sont hébergées sur des serveurs situés en <strong>France</strong> et en <strong>Europe</strong> :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li><strong>OVHcloud</strong> — Roubaix, France (serveur applicatif et base de données)</li>
                  <li><strong>Amazon Web Services (AWS) S3</strong> — eu-west-1, Irlande (stockage des fichiers médias)</li>
                  <li><strong>AWS Rekognition</strong> — eu-west-1, Irlande (traitement IA : OCR et reconnaissance faciale)</li>
                </ul>
                <p className="text-navy/80">
                  Aucune donnée n&apos;est transférée en dehors de l&apos;Espace Économique Européen (EEE).
                </p>
              </CardContent>
            </Card>

            {/* Partage avec des tiers */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Partage avec des tiers</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <p className="text-navy/80">
                  Les données ne sont partagées qu&apos;avec les partenaires techniques strictement nécessaires
                  au fonctionnement du Service :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li><strong>Stripe</strong> — traitement des paiements (Stripe Connect Express)</li>
                  <li><strong>AWS</strong> — stockage S3 et traitement IA (Rekognition)</li>
                  <li><strong>Resend</strong> — envoi d&apos;emails transactionnels</li>
                </ul>
                <p className="text-navy/80">
                  Aucune donnée n&apos;est vendue, louée ou partagée à des fins publicitaires ou marketing.
                </p>
              </CardContent>
            </Card>

            {/* Durée de conservation */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Durée de conservation</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <ul className="text-navy/80 list-disc pl-6 space-y-2">
                  <li>
                    <strong>Données de compte :</strong> conservées pendant toute la durée de la relation contractuelle.
                  </li>
                  <li>
                    <strong>Données légales :</strong> conservées 10 ans après la fin de la dernière souscription
                    (obligations fiscales et comptables).
                  </li>
                  <li>
                    <strong>Contenus importés (images) :</strong> conservés 2 mois après la clôture du compte,
                    sauf demande de suppression anticipée.
                  </li>
                  <li>
                    <strong>Selfies de recherche :</strong> supprimés immédiatement après la recherche faciale
                    (non conservés).
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Droits des personnes */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Vos droits</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <p className="text-navy/80">
                  Conformément au RGPD, toute personne dispose des droits suivants :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données personnelles</li>
                  <li><strong>Droit de rectification</strong> : corriger vos données inexactes ou incomplètes</li>
                  <li><strong>Droit d&apos;effacement</strong> : demander la suppression de vos données</li>
                  <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données</li>
                  <li><strong>Droit de limitation</strong> : limiter le traitement dans certains cas</li>
                  <li><strong>Droit de portabilité</strong> : recevoir vos données dans un format structuré</li>
                </ul>
                <p className="text-navy/80">
                  Ces droits peuvent être exercés via le{" "}
                  <Link href="/gdpr" className="text-emerald hover:underline font-medium">
                    formulaire RGPD
                  </Link>{" "}
                  accessible depuis votre compte, ou par email à <strong>dpo@focusracer.com</strong>.
                  Nous traitons toute demande dans un délai de 30 jours.
                </p>
                <p className="text-navy/80">
                  Vous disposez également du droit d&apos;introduire une réclamation auprès de la CNIL
                  (Commission Nationale de l&apos;Informatique et des Libertés) : <strong>www.cnil.fr</strong>.
                </p>
              </CardContent>
            </Card>

            {/* Mesures de sécurité */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Mesures de sécurité</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <p className="text-navy/80">
                  La Société met en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li>Chiffrement SSL/TLS de toutes les connexions</li>
                  <li>Mots de passe stockés chiffrés et salés (bcrypt)</li>
                  <li>Accès administratif limité au strict nécessaire</li>
                  <li>Sauvegardes chiffrées sur stockage cloud sécurisé</li>
                  <li>Mises à jour de sécurité appliquées régulièrement</li>
                  <li>Sécurité physique des serveurs assurée par OVH et AWS</li>
                  <li>Protection contre le hotlinking et le téléchargement non autorisé</li>
                  <li>URLs signées avec expiration pour les téléchargements de photos HD</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Retour */}
          <div className="mt-8 text-center">
            <Link href="/legal" className="text-emerald hover:underline text-sm font-medium">
              ← Retour aux mentions légales
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
