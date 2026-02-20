import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 gradient-bg-subtle">
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4 text-center">
            Politique de cookies
          </h1>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Informations sur les cookies utilisés par la plateforme Focus Racer.
          </p>

          <div className="space-y-8">

            {/* Cookies utilisés */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Cookies utilisés</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <p className="text-navy/80">
                  La Plateforme utilise des cookies strictement nécessaires au fonctionnement du Service :
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 pr-4 text-navy font-semibold">Cookie</th>
                        <th className="text-left py-3 pr-4 text-navy font-semibold">Finalité</th>
                        <th className="text-left py-3 text-navy font-semibold">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy/80">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium">next-auth.session-token</td>
                        <td className="py-3 pr-4">Maintient votre connexion active (NextAuth.js)</td>
                        <td className="py-3">Session</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium">next-auth.csrf-token</td>
                        <td className="py-3 pr-4">Protection contre les attaques CSRF</td>
                        <td className="py-3">Session</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium">next-auth.callback-url</td>
                        <td className="py-3 pr-4">Redirection après connexion</td>
                        <td className="py-3">Session</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium">preferences</td>
                        <td className="py-3 pr-4">Mémorise vos choix d&apos;interface</td>
                        <td className="py-3">1 an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Stockage local */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Stockage local (localStorage)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <p className="text-navy/80">
                  En complément des cookies, la Plateforme utilise le stockage local de votre navigateur pour :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li>
                    <strong>Favoris</strong> : vos photos favorites sont stockées localement dans votre navigateur.
                    Ces données ne sont pas transmises au serveur et restent entièrement sous votre contrôle.
                  </li>
                </ul>
                <p className="text-navy/80">
                  Le stockage local peut être effacé depuis les paramètres de votre navigateur.
                </p>
              </CardContent>
            </Card>

            {/* Ce que nous n'utilisons PAS */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Ce que nous n&apos;utilisons pas</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <p className="text-navy/80">
                  La Plateforme <strong>n&apos;utilise pas</strong> :
                </p>
                <ul className="text-navy/80 list-disc pl-6 space-y-1">
                  <li>Cookies publicitaires ou de ciblage</li>
                  <li>Cookies de tracking tiers</li>
                  <li>Google Analytics, Facebook Pixel ou tout autre outil d&apos;analyse comportementale</li>
                  <li>Cookies de réseaux sociaux (boutons de partage intégrés)</li>
                </ul>
                <p className="text-navy/80">
                  Aucune donnée de navigation n&apos;est partagée avec des tiers à des fins publicitaires ou marketing.
                </p>
              </CardContent>
            </Card>

            {/* Gestion des cookies */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-navy">Gestion de vos cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-3">
                <p className="text-navy/80">
                  Vous pouvez à tout moment supprimer les cookies depuis les paramètres de votre navigateur.
                  La suppression du cookie de session entraînera votre déconnexion de la Plateforme.
                </p>
                <p className="text-navy/80">
                  Étant donné que la Plateforme utilise exclusivement des cookies strictement nécessaires
                  au fonctionnement du Service, aucun bandeau de consentement n&apos;est requis conformément
                  à l&apos;article 82 de la loi Informatique et Libertés et aux lignes directrices de la CNIL.
                </p>
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
