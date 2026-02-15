"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Hash,
  Target,
  Clock,
  CreditCard,
  BarChart3,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface Analytics {
  event: {
    id: string;
    name: string;
    createdAt: string;
  };
  summary: {
    totalPhotos: number;
    photosWithBibs: number;
    orphanPhotos: number;
    uniqueBibs: number;
    avgPhotosPerBib: number;
    successRate: number;
    avgProcessingTime: number;
    totalProcessingTime: number;
    creditsDeducted: number;
    creditsRefunded: number;
    netCreditsUsed: number;
  };
  quality: {
    avgQuality: number;
    blurryCount: number;
    blurryPercent: number;
    autoEditedCount: number;
    autoEditedPercent: number;
  };
  ocr: {
    tesseract: { total: number; success: number; successRate: number };
    aws: { total: number; success: number; successRate: number };
  };
  revenue: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    soldPhotos: number;
    conversionRate: number;
  };
  timeline: {
    uploadsByDay: Array<{ day: string; count: number }>;
    firstUpload: string | null;
    lastUpload: string | null;
  };
  topBibs: Array<{ bib: string; count: number }>;
  orphanPhotos: {
    total: number;
    photos: Array<{
      id: string;
      filename: string;
      thumbnailPath: string | null;
      webPath: string | null;
      path: string;
      createdAt: string;
      ocrProvider: string | null;
      qualityScore: number | null;
      isBlurry: boolean | null;
    }>;
  };
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

  const { summary, quality, ocr, revenue, topBibs, orphanPhotos } = analytics;

  return (
    <div className="space-y-8">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Photos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPhotos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.photosWithBibs} triées ({summary.orphanPhotos} orphelines)
            </p>
          </CardContent>
        </Card>

        {/* Unique Bibs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dossards Uniques</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.uniqueBibs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.avgPhotosPerBib.toFixed(1)} photos/dossard en moyenne
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d&apos;Identification</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.photosWithBibs} photos avec dossard
            </p>
          </CardContent>
        </Card>

        {/* Credits Used */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédits Utilisés</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.netCreditsUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.creditsDeducted} déduits, {summary.creditsRefunded} remboursés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Processing Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Durée de Traitement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgProcessingTime}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Temps moyen par photo
            </p>
            <p className="text-xs text-muted-foreground">
              Total: {Math.floor(summary.totalProcessingTime / 60)}min {summary.totalProcessingTime % 60}s
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Chiffre d&apos;Affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue.totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground mt-1">
              {revenue.totalOrders} commandes ({revenue.soldPhotos} photos vendues)
            </p>
            <p className="text-xs text-muted-foreground">
              Panier moyen: {revenue.avgOrderValue.toFixed(2)}€
            </p>
          </CardContent>
        </Card>

        {/* Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Qualité Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quality.avgQuality.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {quality.blurryPercent}% floues ({quality.blurryCount})
            </p>
            <p className="text-xs text-muted-foreground">
              {quality.autoEditedPercent}% auto-éditées ({quality.autoEditedCount})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OCR Provider Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance OCR par Provider</CardTitle>
          <CardDescription>Comparaison Tesseract vs AWS Rekognition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tesseract */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="secondary">Tesseract (Gratuit)</Badge>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Photos traitées:</span>
                  <span className="font-medium">{ocr.tesseract.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Réussites:</span>
                  <span className="font-medium">{ocr.tesseract.success}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taux de réussite:</span>
                  <span className={`font-bold ${ocr.tesseract.successRate < 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {ocr.tesseract.successRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* AWS Rekognition */}
            <div className="border rounded-lg p-4 bg-emerald-50 border-emerald-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge className="bg-emerald-600">AWS Rekognition (Premium)</Badge>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Photos traitées:</span>
                  <span className="font-medium">{ocr.aws.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Réussites:</span>
                  <span className="font-medium">{ocr.aws.success}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taux de réussite:</span>
                  <span className="font-bold text-emerald-600">{ocr.aws.successRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Dossards */}
      {topBibs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 20 Dossards</CardTitle>
            <CardDescription>Les coureurs avec le plus de photos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {topBibs.map((item) => (
                <div
                  key={item.bib}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl font-bold text-center text-blue-600">
                    {item.bib}
                  </div>
                  <div className="text-sm text-center text-muted-foreground mt-1">
                    {item.count} photo{item.count > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orphan Photos */}
      {orphanPhotos.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Photos Orphelines ({orphanPhotos.total})
            </CardTitle>
            <CardDescription>
              Photos sans dossard détecté - identification manuelle requise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {orphanPhotos.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="aspect-square relative bg-slate-100">
                    <Image
                      src={photo.thumbnailPath || photo.webPath || photo.path}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {photo.filename}
                    </p>
                    {photo.qualityScore !== null && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Q: {photo.qualityScore.toFixed(0)}
                      </Badge>
                    )}
                    {photo.isBlurry && (
                      <Badge variant="destructive" className="mt-1 text-xs ml-1">
                        Floue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {orphanPhotos.total > orphanPhotos.photos.length && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                ... et {orphanPhotos.total - orphanPhotos.photos.length} autres photos
                orphelines
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
