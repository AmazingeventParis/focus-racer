"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsVisual } from "@/components/analytics-visual";

interface Analytics {
  summary: {
    totalPhotos: number;
    photosWithBibs: number;
    orphanPhotos: number;
    totalAssociations: number;
    uniqueBibs: number;
    avgPhotosPerBib: number;
    avgProcessingTime: number;
    totalProcessingTime: number;
  };
  revenue: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    soldPhotos: number;
    serviceFee: number;
    stripeFee: number;
    photographerPayout: number;
    platformFee: number;
    conversionRate: number;
  };
  topBibs: Array<{ bib: string; count: number }>;
}

function formatEuro(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20ac";
}

export function EventAnalytics({ eventId }: { eventId: string }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/analytics`);
        if (res.ok) {
          setAnalytics(await res.json());
        } else {
          console.error("Failed to fetch analytics");
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Chargement des analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  const { summary, revenue } = analytics;

  return (
    <div className="space-y-8">
      {/* Visual Analytics Summary */}
      <AnalyticsVisual
        eventId={eventId}
        totalPhotos={summary.totalPhotos}
        photosWithBibs={summary.photosWithBibs}
        orphanPhotos={summary.orphanPhotos}
        totalAssociations={summary.totalAssociations}
        uniqueBibs={summary.uniqueBibs}
        avgPhotosPerBib={summary.avgPhotosPerBib}
        avgProcessingTime={summary.avgProcessingTime}
        totalProcessingTime={summary.totalProcessingTime}
      />

      {/* Financial Metrics */}
      <Card className="bg-white shadow-sm border-slate-200/60 overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            Performances financières
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {revenue.totalOrders === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Aucune vente pour le moment</p>
              <p className="text-sm text-slate-400 mt-1">Les statistiques financières apparaîtront ici après la première vente</p>
            </div>
          ) : (
            <>
              {/* Main financial KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* Chiffre d'affaires */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">CA brut</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 mb-1">{formatEuro(revenue.totalRevenue)}</p>
                  <p className="text-xs text-slate-500">encaissé total</p>
                </div>

                {/* Ventes */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ventes</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-1">{revenue.totalOrders}</p>
                  <p className="text-xs text-slate-500">{revenue.soldPhotos} photo{revenue.soldPhotos > 1 ? "s" : ""} vendues</p>
                </div>

                {/* Panier moyen */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-purple-50 group-hover:bg-purple-100 transition-colors">
                      <svg className="h-3.5 w-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Panier moyen</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mb-1">{formatEuro(revenue.avgOrderValue)}</p>
                  <p className="text-xs text-slate-500">par commande</p>
                </div>

                {/* Taux de conversion */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-amber-50 group-hover:bg-amber-100 transition-colors">
                      <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Conversion</span>
                  </div>
                  <p className="text-3xl font-bold text-amber-600 mb-1">{revenue.conversionRate}%</p>
                  <p className="text-xs text-slate-500">photos vendues / total</p>
                </div>
              </div>

              {/* Financial breakdown */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Détail financier</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-600">Revenus photographe (net)</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{formatEuro(revenue.photographerPayout)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-sm text-slate-600">Frais de service plateforme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{formatEuro(revenue.serviceFee)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-sm text-slate-600">Frais Stripe</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{formatEuro(revenue.stripeFee)}</span>
                  </div>
                  {revenue.platformFee > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-sm text-slate-600">Commission plateforme</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700">{formatEuro(revenue.platformFee)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-t border-slate-200 mt-1">
                    <span className="text-sm font-semibold text-slate-800">Total encaissé (CA brut)</span>
                    <span className="text-sm font-bold text-slate-900">{formatEuro(revenue.totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue bar visualization */}
              {revenue.totalRevenue > 0 && (
                <div className="mt-6">
                  <div className="flex h-3 bg-slate-100 rounded-full overflow-hidden">
                    {revenue.photographerPayout > 0 && (
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                        style={{ width: `${(revenue.photographerPayout / revenue.totalRevenue) * 100}%` }}
                        title={`Photographe: ${formatEuro(revenue.photographerPayout)}`}
                      />
                    )}
                    {revenue.serviceFee > 0 && (
                      <div
                        className="bg-gradient-to-r from-blue-300 to-blue-400 transition-all duration-700"
                        style={{ width: `${(revenue.serviceFee / revenue.totalRevenue) * 100}%` }}
                        title={`Service: ${formatEuro(revenue.serviceFee)}`}
                      />
                    )}
                    {revenue.stripeFee > 0 && (
                      <div
                        className="bg-gradient-to-r from-orange-300 to-orange-400 transition-all duration-700"
                        style={{ width: `${(revenue.stripeFee / revenue.totalRevenue) * 100}%` }}
                        title={`Stripe: ${formatEuro(revenue.stripeFee)}`}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Photographe ({((revenue.photographerPayout / revenue.totalRevenue) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-slate-600">Service ({((revenue.serviceFee / revenue.totalRevenue) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-slate-600">Stripe ({((revenue.stripeFee / revenue.totalRevenue) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
