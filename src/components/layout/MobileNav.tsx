"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface MobileNavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
  badge?: number;
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
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:bg-white/5",
              moreOpen ? "text-emerald" : "text-navy-200"
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {moreOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
            <span className="text-[10px] font-medium leading-tight">Plus</span>
          </button>
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
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-white/10" />

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
