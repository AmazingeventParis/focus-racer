"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Trouver mes photos" },
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isPro = ["PHOTOGRAPHER", "ORGANIZER", "AGENCY", "CLUB", "FEDERATION"].includes(role || "");

  const dashboardHref = isAdmin
    ? "/focus-mgr-7k9x/dashboard"
    : isPro
    ? "/photographer/dashboard"
    : "/sportif/dashboard";

  const isSolutionsActive = pathname.startsWith("/solutions");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-focus-racer-white.png"
            alt="Focus Racer"
            width={160}
            height={90}
            className="h-12 w-auto"
            priority
          />
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
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
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
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
              )}
            >
              Solutions
              <svg className={cn("w-4 h-4 transition-transform duration-200", solutionsOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {solutionsOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200 p-4 animate-fade-in"
                onMouseLeave={() => setSolutionsOpen(false)}
              >
                <div className="space-y-1">
                  {solutionsMenu.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group"
                    >
                      <span className="text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                  <p className="text-sm font-medium text-slate-900 mb-1">Essai gratuit</p>
                  <p className="text-xs text-slate-500 mb-3">Créez votre compte et uploadez vos premières photos.</p>
                  <Link href="/register">
                    <button className="w-full py-2 px-4 bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90">
                      Commencer
                    </button>
                  </Link>
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
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                    Espace Pro
                  </button>
                </Link>
              )}
              <Link href={dashboardHref}>
                <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white shadow-emerald transition-all hover:opacity-90 hover:-translate-y-0.5">
                  {isAdmin ? "Admin" : "Mon espace"}
                </button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/register">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-transparent hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                  Créer un compte
                </button>
              </Link>
              <Link href="/login">
                <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white shadow-emerald transition-all hover:opacity-90 hover:-translate-y-0.5">
                  Mon espace
                </button>
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
            "block w-6 h-0.5 bg-slate-600 transition-all duration-200",
            mobileOpen && "rotate-45 translate-y-2"
          )} />
          <span className={cn(
            "block w-6 h-0.5 bg-slate-600 transition-all duration-200",
            mobileOpen && "opacity-0"
          )} />
          <span className={cn(
            "block w-6 h-0.5 bg-slate-600 transition-all duration-200",
            mobileOpen && "-rotate-45 -translate-y-2"
          )} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/97 backdrop-blur-xl border-b border-slate-200/60 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                )}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-between w-full"
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
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  >
                    <span className="text-emerald-500">{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 mt-2 pt-4 flex flex-col gap-2">
              {session ? (
                <Link href={dashboardHref}>
                  <button className="w-full py-2.5 px-4 bg-emerald-500 text-white text-sm font-semibold rounded-lg">
                    {isAdmin ? "Admin" : "Mon espace"}
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <button className="w-full py-2.5 px-4 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:border-emerald-300">
                      Créer un compte
                    </button>
                  </Link>
                  <Link href="/login">
                    <button className="w-full py-2.5 px-4 bg-emerald-500 text-white text-sm font-semibold rounded-lg">
                      Mon espace
                    </button>
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
