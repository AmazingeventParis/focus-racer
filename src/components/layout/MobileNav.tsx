"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface MobileNavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
  badge?: number;
  badgeDot?: boolean;
}

interface MobileNavProps {
  mainItems: MobileNavItem[];
  moreItems: MobileNavItem[];
  roleLabel: string;
  sportifId?: string | null;
}

export default function MobileNav({ mainItems, moreItems, roleLabel, sportifId }: MobileNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const userName = session?.user?.name || "Utilisateur";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close more menu on navigation
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Prevent body scroll when more menu is open
  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const copySportifId = () => {
    if (sportifId) {
      navigator.clipboard.writeText(sportifId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-navy h-14 flex items-center px-4 gap-3 shadow-lg md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-emerald flex items-center justify-center">
            <span className="text-white font-bold text-xs">FR</span>
          </div>
          <span className="text-base font-bold text-white">
            Focus <span className="text-emerald">Racer</span>
          </span>
        </Link>
        <span className="text-navy-200 text-[11px] ml-1">{roleLabel}</span>
        <div className="ml-auto flex items-center gap-2">
          {sportifId && (
            <button
              onClick={copySportifId}
              className="text-[10px] font-mono text-navy-200 bg-white/10 px-2 py-1 rounded-md active:bg-white/20 transition-colors"
            >
              {copied ? "Copié !" : sportifId}
            </button>
          )}
          <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center text-white font-bold text-xs">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-white/10 md:hidden safe-area-bottom">
        <div className="flex items-stretch h-16">
          {mainItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors active:bg-white/5",
                  isActive ? "text-emerald" : "text-navy-200"
                )}
              >
                <span className="relative">
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                  {item.badgeDot && (
                    <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-navy" />
                  )}
                </span>
                <span className="text-[10px] font-medium leading-tight">
                  {item.shortLabel || item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald rounded-b-full" />
                )}
              </Link>
            );
          })}

          {/* More Button */}
          {(() => {
            const hasMoreBadge = moreItems.some((item) => (item.badge && item.badge > 0) || item.badgeDot);
            return (
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:bg-white/5",
              moreOpen ? "text-emerald" : "text-navy-200"
            )}
          >
            <span className="relative">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {moreOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
              {hasMoreBadge && !moreOpen && (
                <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-navy" />
              )}
            </span>
            <span className="text-[10px] font-medium leading-tight">Plus</span>
          </button>
            );
          })()}
        </div>
      </nav>

      {/* More Sheet Overlay */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[45] bg-black/50 md:hidden animate-in fade-in duration-200"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-16 left-0 right-0 z-[46] md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-navy rounded-t-2xl shadow-2xl border-t border-white/10 max-h-[70vh] overflow-y-auto">
              {/* Sheet handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* More nav items */}
              <div className="px-4 pb-2">
                {moreItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:bg-white/10",
                        isActive
                          ? "bg-white/10 text-emerald"
                          : "text-navy-100"
                      )}
                      onClick={() => setMoreOpen(false)}
                    >
                      <span className={cn(isActive ? "text-emerald" : "text-navy-200")}>
                        {item.icon}
                      </span>
                      {item.label}
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                      {item.badgeDot && (
                        <span className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-white/10" />

              {/* Dark mode toggle */}
              <div className="px-4 py-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-navy-100 active:bg-white/10 transition-colors"
                >
                  {theme === "dark" ? (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  )}
                  {theme === "dark" ? "Mode clair" : "Mode sombre"}
                </button>
              </div>

              {/* User info + Logout */}
              <div className="p-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
                  <div className="w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center text-white font-bold text-xs">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                    <p className="text-xs text-navy-200">{roleLabel}</p>
                  </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-white/5 active:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
