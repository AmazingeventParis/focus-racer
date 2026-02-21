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
  {
    label: "Détection automatique des dossards (IA)",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
  {
    label: "Reconnaissance faciale des sportifs",
    icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.501 20.118a7.5 7.5 0 0114.998 0" /></>,
  },
  {
    label: "Galerie personnalisée par événement",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />,
  },
  {
    label: "Mode Live pour upload en direct",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />,
  },
  {
    label: "Statistiques et analytics détaillés",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  },
  {
    label: "Paiement direct via Stripe Connect",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
  },
  {
    label: "Branding et watermark personnalisés",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />,
  },
  {
    label: "Support prioritaire",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />,
  },
];

const creditPacks = [
  {
    name: "Pack 1k",
    credits: "1 000",
    price: "19",
    pricePerCredit: "0,019",
    popular: false,
  },
  {
    name: "Pack 5k",
    credits: "5 000",
    price: "85",
    pricePerCredit: "0,017",
    popular: false,
  },
  {
    name: "Pack 15k",
    credits: "15 000",
    price: "225",
    pricePerCredit: "0,015",
    popular: true,
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
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2">
                <svg className="w-5 h-5 text-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-emerald">0% de commission sur vos ventes — vous gardez 100% de vos revenus</span>
              </div>
            </div>

            {/* Pro features */}
            <Card className="glass-card rounded-2xl max-w-3xl mx-auto overflow-hidden mb-12 border-navy/10">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-navy text-center mb-4">Inclus dans tous les comptes Pro</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {proFeatures.map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5 text-sm">
                      <svg className="w-5 h-5 text-navy/60 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        {f.icon}
                      </svg>
                      <span className="text-navy/80">{f.label}</span>
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
                        Best-seller
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
