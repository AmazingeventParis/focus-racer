"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useFontScale, type FontScale } from "@/hooks/useFontScale";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/i18n";

const fontScaleOptions: { value: FontScale; labelKey: string }[] = [
  { value: "small", labelKey: "settings.fontSmall" },
  { value: "normal", labelKey: "settings.fontNormal" },
  { value: "large", labelKey: "settings.fontLarge" },
  { value: "xl", labelKey: "settings.fontXl" },
];

export default function PreferencesCard() {
  const { theme, setTheme } = useTheme();
  const { canInstall, promptInstall } = usePWAInstall();
  const { scale, setScale } = useFontScale();
  const { locale, setLocale, t } = useLocale();

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">{t("settings.preferences")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
            <span className="text-sm font-medium">{t("settings.darkMode")}</span>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              theme === "dark" ? "bg-emerald" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Font size */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
            <span className="text-sm font-medium">{t("settings.fontSize")}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {fontScaleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setScale(opt.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  scale === opt.value
                    ? "bg-emerald text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
            <span className="text-sm font-medium">{t("settings.language")}</span>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
            {(["fr", "en"] as Locale[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`px-4 py-1.5 text-xs font-bold transition-colors ${
                  locale === lang
                    ? "bg-emerald text-white"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* PWA Install */}
        {canInstall && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <div>
                <p className="text-sm font-medium">{t("settings.pwa")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.pwaDesc")}</p>
              </div>
            </div>
            <Button onClick={promptInstall} size="sm" className="bg-emerald hover:bg-emerald-dark text-white">
              {t("settings.pwa")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
