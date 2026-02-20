"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { value: "OTHER", label: "Question generale" },
  { value: "BILLING", label: "Facturation" },
  { value: "TECHNICAL", label: "Probleme technique" },
  { value: "EVENT", label: "Evenement" },
  { value: "GDPR", label: "RGPD / Donnees personnelles" },
  { value: "ACCOUNT", label: "Mon compte" },
];

const faqTeaser = [
  { q: "Comment retrouver mes photos de course ?", href: "/faq#coureurs" },
  { q: "Quels moyens de paiement acceptez-vous ?", href: "/faq#paiements" },
  { q: "Comment devenir photographe sur la plateforme ?", href: "/faq#photographes" },
];

export default function ContactPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("OTHER");

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setSent(true);
      toast({
        title: "Message envoye",
        description: "Nous vous repondrons dans les plus brefs delais.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative container mx-auto px-4 py-16 md:py-20 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
              Contactez-nous
            </h1>
            <p className="text-white/70 max-w-lg mx-auto animate-fade-in animation-delay-100">
              Une question, une suggestion ou un partenariat ? Notre equipe est la pour vous.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 gradient-bg-subtle">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact info */}
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-navy mb-4">
                    Parlons de votre projet
                  </h2>
                  <p className="text-muted-foreground">
                    Que vous soyez photographe, organisateur d&apos;evenements ou simplement
                    curieux, nous serions ravis d&apos;echanger avec vous.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy">Email</p>
                      <a href="mailto:contact@focusracer.com" className="text-emerald hover:text-emerald-dark transition-colors">
                        contact@focusracer.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy">Temps de reponse</p>
                      <p className="text-muted-foreground">Sous 24-48h en jours ouvres</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy">Localisation</p>
                      <p className="text-muted-foreground">France</p>
                    </div>
                  </div>
                </div>

                {/* FAQ teaser */}
                <div className="pt-4">
                  <h3 className="text-lg font-semibold text-navy mb-3">Questions frequentes</h3>
                  <ul className="space-y-2">
                    {faqTeaser.map((item) => (
                      <li key={item.q}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald transition-colors group"
                        >
                          <svg className="w-4 h-4 text-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          <span className="group-hover:underline">{item.q}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-1 text-sm text-emerald hover:text-emerald-dark font-medium mt-3 transition-colors"
                  >
                    Voir toutes les FAQ
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Contact form */}
              <div className="animate-fade-in animation-delay-200">
                {sent ? (
                  <Card className="glass-card rounded-2xl">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-navy mb-2">Message envoye !</h3>
                      <p className="text-muted-foreground">
                        Merci pour votre message. Nous vous repondrons dans les plus brefs delais.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-navy">Envoyez-nous un message</CardTitle>
                      <CardDescription>
                        Remplissez le formulaire ci-dessous et nous vous repondrons rapidement.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="bg-white/50 border-white/30 focus:border-emerald focus:ring-emerald"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="bg-white/50 border-white/30 focus:border-emerald focus:ring-emerald"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Categorie</Label>
                          <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="flex h-9 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald"
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Sujet *</Label>
                          <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className="bg-white/50 border-white/30 focus:border-emerald focus:ring-emerald"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <textarea
                            id="message"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            className="flex w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-emerald hover:bg-emerald-dark text-white shadow-emerald transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? "Envoi en cours..." : "Envoyer le message"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
