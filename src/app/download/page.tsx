"use client";

import Link from "next/link";
import { Smartphone, Download, Shield, Zap, Wifi } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy to-navy-light">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Focus Racer
          </Link>
          <Link
            href="/login"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Se connecter
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-2xl mb-6">
            <Smartphone className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Focus Racer sur Android
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Accedez a vos espaces photographe, organisateur et sportif
            directement depuis votre telephone.
          </p>
        </div>

        {/* Download card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 text-center">
          <a
            href="/api/download/apk"
            download="focus-racer.apk"
            className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-6 h-6" />
            Telecharger l&apos;APK
          </a>
          <p className="text-white/40 text-sm mt-4">
            Version 1.0 &middot; Android 5.1+ &middot; 1.3 Mo
          </p>
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left">
            <p className="text-amber-400 text-sm font-medium mb-2">
              Installation depuis un fichier APK
            </p>
            <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
              <li>Telechargez le fichier APK ci-dessus</li>
              <li>Ouvrez le fichier telecharge</li>
              <li>
                Si demande, autorisez l&apos;installation depuis cette source
              </li>
              <li>Appuyez sur &laquo; Installer &raquo;</li>
            </ol>
          </div>
        </div>

        {/* Features */}
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          Fonctionnalites
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Rapide et fluide",
              desc: "Interface optimisee pour mobile, navigation instantanee",
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: "Securise",
              desc: "Connexion HTTPS, authentification protegee",
            },
            {
              icon: <Wifi className="w-5 h-5" />,
              title: "Toujours a jour",
              desc: "Contenu charge depuis le serveur, pas de mise a jour requise",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="text-emerald-400 mb-3">{f.icon}</div>
              <h3 className="text-white font-medium mb-1">{f.title}</h3>
              <p className="text-white/50 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Spaces */}
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          Trois espaces disponibles
        </h2>
        <div className="space-y-3 mb-12">
          {[
            {
              emoji: "📸",
              title: "Espace Photographe",
              desc: "Upload, gestion des evenements, tri IA, ventes, statistiques",
            },
            {
              emoji: "🏁",
              title: "Espace Organisateur",
              desc: "Gestion des evenements, photographes accredites, start-lists",
            },
            {
              emoji: "🏃",
              title: "Espace Sportif",
              desc: "Recherche par dossard, achat de photos, favoris, horde",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <h3 className="text-white font-medium">{s.title}</h3>
                <p className="text-white/50 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm">
          &copy; {new Date().getFullYear()} Focus Racer. Tous droits reserves.
        </p>
      </main>
    </div>
  );
}
