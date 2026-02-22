import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Focus Racer - Photos de courses sportives",
    template: "%s | Focus Racer",
  },
  description: "Retrouvez et achetez vos photos de courses sportives. Tri automatique par dossard, galerie watermarkee, recherche instantanee.",
  keywords: ["photos de course", "marathon", "trail", "dossard", "photos sportives", "triathlon"],
  openGraph: {
    type: "website",
    siteName: "Focus Racer",
    title: "Focus Racer - Photos de courses sportives",
    description: "Retrouvez vos photos de course en quelques secondes grace a la reconnaissance automatique des numeros de dossard.",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: "index, follow",
  manifest: "/manifest.json",
  themeColor: "#10B981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Focus Racer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased gradient-bg-subtle min-h-screen`}
      >
        <SessionProvider>
          <ThemeProvider>
            <LocaleProvider>
              {children}
              <Toaster />
            </LocaleProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
