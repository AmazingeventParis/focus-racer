import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sportifFeatures = [
  "Recherche par dossard illimitée",
  "Recherche par selfie (IA)",
  "Recherche par nom",
  "Téléchargement HD sans filigrane",
  "Accès à vie aux photos achetées",
  "Espace personnel dédié",
  "Messagerie avec les photographes",
];

const proFeatures = [
  "Upload illimité de photos",
  "Détection automatique des dossards (IA)",
  "Reconnaissance faciale des sportifs",
  "Galerie personnalisée par événement",
  "Mode Live pour upload en direct",
  "Statistiques et analytics détaillés",
  "Paiement direct via Stripe Connect",
  "Branding et watermark personnalisés",
  "Support prioritaire",
];

const creditPacks = [
  {
    name: "Pack 1 000",
    credits: "1 000",
    price: "19",
    pricePerCredit: "0,019",
    popular: false,
  },
  {
    name: "Pack 5 000",
    credits: "5 000",
    price: "85",
    pricePerCredit: "0,017",
    popular: true,
  },
  {
    name: "Pack 15 000",
    credits: "15 000",
    price: "225",
    pricePerCredit: "0,015",
    popular: false,
  },
];

const subscriptions = [
  {
    name: "Abo 20k / mois",
    credits: "20 000",
    price: "199",
    pricePerCredit: "0,010",
  },
  {
    name: "Abo 50k / mois",
    credits: "50 000",
    price: "399",
    pricePerCredit: "0,008",
  },
];

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative container mx-auto px-4 py-16 md:py-20 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
              Tarifs simples et transparents
            </h1>
            <p className="text-white/70 max-w-lg mx-auto animate-fade-in animation-delay-100">
              Deux types de comptes, un seul objectif : connecter sportifs et photographes.
            </p>
          </div>
        </section>

        {/* ════════ SECTION SPORTIF ════════ */}
        <section className="py-16 md:py-20 gradient-bg-subtle">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <Badge className="bg-emerald/10 text-emerald border-emerald/20 mb-4 text-sm px-4 py-1">
                Compte Sportif
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
                100% gratuit pour les sportifs
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Retrouvez vos photos d&apos;événements et achetez uniquement celles que vous souhaitez.
                Le prix est fixé par le photographe.
              </p>
            </div>

            <Card className="glass-card rounded-2xl max-w-2xl mx-auto overflow-hidden border-emerald/20">
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-5xl font-bold text-navy">0€</span>
                  <span className="text-muted-foreground text-sm text-left leading-tight">
                    Inscription<br />gratuite
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Paiement uniquement à l&apos;achat de photos — prix fixé par le photographe
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {sportifFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <CheckIcon />
                      <span className="text-navy/80">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/explore">
                    <Button className="w-full sm:w-auto bg-emerald hover:bg-emerald-dark text-white shadow-emerald transition-all duration-200 px-8">
                      Trouver mes photos
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="w-full sm:w-auto border-emerald/30 text-emerald hover:bg-emerald-50 px-8">
                      Créer un compte
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ════════ SECTION PRO ════════ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-10">
              <Badge className="bg-navy/10 text-navy border-navy/20 mb-4 text-sm px-4 py-1">
                Compte Pro
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
                Photographes, organisateurs, agences
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Créez votre compte gratuitement. Achetez des crédits pour traiter vos photos avec notre IA.
                <br />
                <strong className="text-navy">1 crédit = 1 photo traitée</strong> (détection dossard + reconnaissance faciale + watermark).
              </p>
            </div>

            {/* Pro features */}
            <Card className="glass-card rounded-2xl max-w-3xl mx-auto overflow-hidden mb-12 border-navy/10">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-navy text-center mb-4">Inclus dans tous les comptes Pro</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {proFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <CheckIcon />
                      <span className="text-navy/80">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Packs crédits */}
            <h3 className="text-xl font-bold text-navy text-center mb-6">
              Packs de crédits <span className="text-muted-foreground font-normal text-base">— achat ponctuel</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-14">
              {creditPacks.map((pack) => (
                <Card
                  key={pack.name}
                  className={`glass-card rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-glass-lg ${
                    pack.popular ? "ring-2 ring-emerald shadow-emerald-lg" : ""
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-xl bg-emerald text-white px-3 py-1 text-xs">
                        Meilleur rapport
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-lg text-navy">{pack.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pack.credits} crédits</p>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div>
                      <p className="text-4xl font-bold text-navy">{pack.price}€</p>
                      <p className="text-xs text-muted-foreground mt-1">{pack.pricePerCredit}€ / crédit</p>
                    </div>
                    <Link href="/register">
                      <Button
                        className={`w-full ${
                          pack.popular
                            ? "bg-emerald hover:bg-emerald-dark text-white shadow-emerald"
                            : "bg-white border border-emerald/30 text-emerald hover:bg-emerald-50"
                        } transition-all duration-200`}
                      >
                        Acheter
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Abonnements */}
            <h3 className="text-xl font-bold text-navy text-center mb-6">
              Abonnements <span className="text-muted-foreground font-normal text-base">— crédits mensuels renouvelés</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {subscriptions.map((sub) => (
                <Card
                  key={sub.name}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glass-lg border-navy/10"
                >
                  <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-lg text-navy">{sub.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{sub.credits} crédits / mois</p>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div>
                      <p className="text-4xl font-bold text-navy">{sub.price}€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
                      <p className="text-xs text-muted-foreground mt-1">{sub.pricePerCredit}€ / crédit</p>
                    </div>
                    <Link href="/register">
                      <Button className="w-full bg-navy hover:bg-navy-light text-white transition-all duration-200">
                        S&apos;abonner
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Note */}
            <p className="text-center text-xs text-muted-foreground mt-8 max-w-lg mx-auto">
              Les crédits des packs sont valables à vie. Les crédits d&apos;abonnement sont renouvelés chaque mois (non cumulables).
              Tous les prix sont HT.
            </p>
          </div>
        </section>

        {/* FAQ preview */}
        <section className="py-16 md:py-20 gradient-bg-subtle">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
              Des questions ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Consultez notre FAQ ou contactez-nous directement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/faq">
                <Button variant="outline" className="border-emerald/30 text-emerald hover:bg-emerald-50 px-8">
                  Consulter la FAQ
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-emerald hover:bg-emerald-dark text-white shadow-emerald transition-all duration-200 px-8">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
