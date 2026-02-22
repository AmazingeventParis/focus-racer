"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Trouver mes photos" },
  { href: "/explore", label: "Événements" },
  { href: "/pricing", label: "Tarifs" },
];

const solutionsMenu = [
  {
    title: "Sportifs",
    desc: "Retrouvez vos photos en un clic",
    href: "/solutions/sportifs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "Photographes",
    desc: "Automatisez le tri et la vente",
    href: "/solutions/photographes",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
  },
  {
    title: "Organisateurs",
    desc: "Couverture photo clé en main",
    href: "/solutions/organisateurs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
      </svg>
    ),
  },
];

const resourcesMenu = [
  { title: "FAQ", href: "/faq", icon: "?" },
  { title: "Contact", href: "/contact", icon: "@" },
  { title: "À propos", href: "/about", icon: "i" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSolutionsOpen(false);
    setMobileSolutionsOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";
  const dashboardHref = isAdmin
    ? "/focus-mgr-7k9x/dashboard"
    : "/photographer/dashboard";

  const isSolutionsActive = pathname.startsWith("/solutions") || pathname === "/about";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
            <span className="text-white font-bold text-sm">FR</span>
          </div>
          <span className="text-xl font-bold text-navy">
            Focus <span className="text-emerald">Racer</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === link.href
                  ? "text-emerald bg-emerald-50"
                  : "text-navy-600 hover:text-emerald hover:bg-emerald-50/50"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Solutions Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onMouseEnter={() => setSolutionsOpen(true)}
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1",
                isSolutionsActive
                  ? "text-emerald bg-emerald-50"
                  : "text-navy-600 hover:text-emerald hover:bg-emerald-50/50"
              )}
            >
              Solutions
              <svg className={cn("w-4 h-4 transition-transform duration-200", solutionsOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Mega Menu */}
            {solutionsOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fade-in"
                onMouseLeave={() => setSolutionsOpen(false)}
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Solutions */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Par audience</p>
                    <div className="space-y-1">
                      {solutionsMenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors group"
                        >
                          <span className="text-emerald mt-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* Resources */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Ressources</p>
                    <div className="space-y-1">
                      {resourcesMenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors"
                        >
                          <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-bold">
                            {item.icon}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                      <p className="text-sm font-medium text-gray-900 mb-1">Essai gratuit</p>
                      <p className="text-xs text-gray-600 mb-3">Créez votre compte et uploadez vos premières photos.</p>
                      <Link href="/register">
                        <button className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                          Commencer
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/photographer/dashboard">
                  <Button variant="ghost" className="text-navy hover:text-emerald hover:bg-emerald-50/50">
                    Espace Pro
                  </Button>
                </Link>
              )}
              <Link href={dashboardHref}>
                <Button className="bg-emerald hover:bg-emerald-dark text-white shadow-emerald transition-all duration-200">
                  {isAdmin ? "Admin" : "Mon espace"}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-navy hover:text-emerald hover:bg-emerald-50/50">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald hover:bg-emerald-dark text-white shadow-emerald transition-all duration-200">
                  Essai gratuit
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <span className={cn(
            "block w-6 h-0.5 bg-navy transition-all duration-200",
            mobileOpen && "rotate-45 translate-y-2"
          )} />
          <span className={cn(
            "block w-6 h-0.5 bg-navy transition-all duration-200",
            mobileOpen && "opacity-0"
          )} />
          <span className={cn(
            "block w-6 h-0.5 bg-navy transition-all duration-200",
            mobileOpen && "-rotate-45 -translate-y-2"
          )} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-emerald bg-emerald-50"
                    : "text-navy-600 hover:text-emerald hover:bg-emerald-50/50"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Solutions Accordion */}
            <button
              onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-navy-600 hover:text-emerald hover:bg-emerald-50/50 transition-all duration-200 flex items-center justify-between w-full"
            >
              Solutions
              <svg className={cn("w-4 h-4 transition-transform duration-200", mobileSolutionsOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {mobileSolutionsOpen && (
              <div className="pl-4 space-y-1 animate-fade-in">
                {solutionsMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-navy-600 hover:text-emerald hover:bg-emerald-50/50 transition-all"
                  >
                    <span className="text-emerald">{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
                {resourcesMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-navy-600 hover:text-emerald hover:bg-emerald-50/50 transition-all"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-2">
              {session ? (
                <div className="flex flex-col gap-2">
                  {isAdmin && (
                    <Link href="/photographer/dashboard">
                      <Button variant="outline" className="w-full border-emerald text-emerald hover:bg-emerald-50">
                        Espace Pro
                      </Button>
                    </Link>
                  )}
                  <Link href={dashboardHref}>
                    <Button className="w-full bg-emerald hover:bg-emerald-dark text-white">
                      {isAdmin ? "Admin" : "Mon espace"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-emerald text-emerald hover:bg-emerald-50">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-emerald hover:bg-emerald-dark text-white">
                      Essai gratuit
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
