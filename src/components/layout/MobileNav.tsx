"use client";

import Link from "next/link";
import Image from "next/image";
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
      {/* Top Header Bar — dark teal */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#042F2E] h-14 flex items-center px-4 gap-3 shadow-lg md:hidden">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-focus-racer-white.png"
            alt="Focus Racer"
            width={120}
            height={67}
            className="h-8 w-auto"
          />
        </Link>
        <span className="text-emerald-300/60 text-[11px] ml-1">{roleLabel}</span>
        <div className="ml-auto flex items-center gap-2">
          {sportifId && (
            <button
              onClick={copySportifId}
              className="text-[10px] font-mono text-emerald-300/60 bg-white/10 px-2 py-1 rounded-md active:bg-white/20 transition-colors"
            >
              {copied ? "Copié !" : sportifId}
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar — white */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 md:hidden safe-area-bottom">
        <div className="flex items-stretch h-16">
          {mainItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors active:bg-slate-50",
                  isActive ? "text-emerald-600" : "text-slate-400"
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
                    <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </span>
                <span className="text-[10px] font-medium leading-tight">
                  {item.shortLabel || item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-b-full" />
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
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:bg-slate-50",
              moreOpen ? "text-emerald-600" : "text-slate-400"
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
                <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
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
            className="fixed inset-0 z-[45] bg-black/30 md:hidden animate-in fade-in duration-200"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet — white */}
          <div className="fixed bottom-16 left-0 right-0 z-[46] md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 max-h-[70vh] overflow-y-auto">
              {/* Sheet handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
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
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:bg-slate-50",
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                      onClick={() => setMoreOpen(false)}
                    >
                      <span className={cn(isActive ? "text-emerald-600" : "text-slate-400")}>
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
              <div className="mx-4 border-t border-slate-100" />

              {/* User info + Logout */}
              <div className="p-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                    <p className="text-xs text-slate-500">{roleLabel}</p>
                  </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
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
