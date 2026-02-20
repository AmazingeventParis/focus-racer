import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 gradient-bg-subtle">
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4 text-center">
            Mentions légales
          </h1>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Informations légales relatives à la plateforme Focus Racer.
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

            {/* Liens vers les autres pages */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Documents juridiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/legal/cgu" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald/50 hover:bg-emerald-50/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-navy/5 group-hover:bg-emerald/10 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-navy/60 group-hover:text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy text-sm">Conditions Générales (CGU)</p>
                      <p className="text-xs text-muted-foreground">19 articles — utilisation, vente, achat</p>
                    </div>
                  </Link>
                  <Link href="/legal/confidentialite" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald/50 hover:bg-emerald-50/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-navy/5 group-hover:bg-emerald/10 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-navy/60 group-hover:text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy text-sm">Politique de confidentialité</p>
                      <p className="text-xs text-muted-foreground">RGPD, données personnelles, sécurité</p>
                    </div>
                  </Link>
                  <Link href="/legal/cookies" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald/50 hover:bg-emerald-50/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-navy/5 group-hover:bg-emerald/10 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-navy/60 group-hover:text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy text-sm">Politique de cookies</p>
                      <p className="text-xs text-muted-foreground">Cookies utilisés, pas de tracking</p>
                    </div>
                  </Link>
                  <Link href="/gdpr" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald/50 hover:bg-emerald-50/30 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-navy/5 group-hover:bg-emerald/10 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-navy/60 group-hover:text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy text-sm">Demande RGPD</p>
                      <p className="text-xs text-muted-foreground">Exercez vos droits sur vos données</p>
                    </div>
                  </Link>
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
