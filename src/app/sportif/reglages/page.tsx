"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  sportifId: string;
  faceImagePath: string | null;
}

interface GdprRequest {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

interface VerifyResult {
  verified: boolean;
  message: string;
  photos: { id: string; name: string; thumbnail: string | null }[];
}

export default function SportifReglagesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  // Profile
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // GDPR
  const [gdprEventId, setGdprEventId] = useState("");
  const [gdprSelfie, setGdprSelfie] = useState<File | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [submittingGdpr, setSubmittingGdpr] = useState(false);
  const [gdprRequests, setGdprRequests] = useState<GdprRequest[]>([]);

  // Face
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [uploadingFace, setUploadingFace] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/sportif/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditName(data.name || "");
        setEditPhone(data.phone || "");
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchProfile().finally(() => setIsLoading(false));
  }, [fetchProfile]);

  // Profile save
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() || null }),
      });
      if (res.ok) {
        toast({ title: "Profil mis à jour" });
        fetchProfile();
      } else {
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Face upload
  const uploadFace = async () => {
    if (!faceFile) return;
    setUploadingFace(true);
    try {
      const formData = new FormData();
      formData.append("face", faceFile);
      const res = await fetch("/api/account/face", { method: "POST", body: formData });
      if (res.ok) {
        toast({ title: "Photo de visage mise à jour" });
        setFaceFile(null);
        fetchProfile();
      } else {
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setUploadingFace(false);
    }
  };

  // GDPR verify
  const verifyFace = async () => {
    if (!gdprSelfie || !gdprEventId) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const formData = new FormData();
      formData.append("selfie", gdprSelfie);
      formData.append("eventId", gdprEventId);
      const res = await fetch("/api/sportif/gdpr/verify-face", { method: "POST", body: formData });
      if (res.ok) {
        setVerifyResult(await res.json());
      } else {
        toast({ title: "Erreur", description: "Vérification impossible", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  // GDPR submit deletion
  const submitGdprRequest = async () => {
    if (!verifyResult?.verified || !gdprEventId) return;
    setSubmittingGdpr(true);
    try {
      const res = await fetch("/api/gdpr/self-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DELETION",
          email: session?.user?.email,
          name: session?.user?.name,
          eventId: gdprEventId,
          reason: "Demande de suppression via vérification faciale",
        }),
      });
      if (res.ok) {
        toast({ title: "Demande de suppression envoyée" });
        setVerifyResult(null);
        setGdprEventId("");
        setGdprSelfie(null);
        fetch("/api/gdpr/self-service").then((r) => r.json()).then(setGdprRequests).catch(() => {});
      } else {
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setSubmittingGdpr(false);
    }
  };

  const copySportifId = () => {
    if (profile?.sportifId) {
      navigator.clipboard.writeText(profile.sportifId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Réglages</h1>
        <p className="text-muted-foreground mt-1">Gérez votre profil et vos données</p>
      </div>

      {/* Profile */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sportif ID */}
          {profile?.sportifId && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl mb-4">
              <span className="text-sm text-gray-600">ID Sportif :</span>
              <button
                onClick={copySportifId}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-emerald-700 font-mono text-base font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                {profile.sportifId}
                {copied ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-muted-foreground">Partagez-le pour recevoir des invitations Horde</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Nom complet</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-gray-50 border-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Email</Label>
              <Input value={profile?.email || ""} disabled className="bg-gray-100 border-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Téléphone</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="06 12 34 56 78" className="bg-gray-50 border-gray-200 rounded-lg" />
            </div>
          </div>
          <Button onClick={saveProfile} disabled={savingProfile} size="sm" className="bg-emerald hover:bg-emerald-dark text-white">
            {savingProfile ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </CardContent>
      </Card>

      {/* Face photo */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Photo de visage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Votre photo de visage permet la recherche automatique par reconnaissance faciale.
          </p>
          <div className="flex items-center gap-4">
            {profile?.faceImagePath && (
              <div className="w-20 h-20 rounded-xl overflow-hidden relative bg-gray-100">
                <Image src={profile.faceImagePath} alt="Visage" fill className="object-cover" sizes="80px" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFaceFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              {faceFile && (
                <Button onClick={uploadFace} disabled={uploadingFace} size="sm" className="mt-2 bg-emerald hover:bg-emerald-dark text-white">
                  {uploadingFace ? "Upload..." : "Mettre à jour"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RGPD */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">RGPD — Droit à la suppression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pour exercer votre droit à la suppression, nous devons vérifier votre identité via reconnaissance faciale.
          </p>

          {/* Step 1: Event + Selfie */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">ID de l&apos;événement</Label>
              <Input value={gdprEventId} onChange={(e) => setGdprEventId(e.target.value)} placeholder="ID événement" className="bg-gray-50 border-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Selfie de vérification</Label>
              <input type="file" accept="image/*" onChange={(e) => setGdprSelfie(e.target.files?.[0] || null)} className="text-sm" />
            </div>
          </div>

          <Button
            onClick={verifyFace}
            disabled={verifying || !gdprEventId || !gdprSelfie}
            size="sm"
            variant="outline"
          >
            {verifying ? "Vérification en cours..." : "Vérifier mon identité"}
          </Button>

          {/* Step 2: Results */}
          {verifyResult && (
            <div className={`p-4 rounded-xl ${verifyResult.verified ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
              <p className={`text-sm font-medium ${verifyResult.verified ? "text-emerald-700" : "text-red-700"}`}>
                {verifyResult.message}
              </p>
              {verifyResult.photos.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {verifyResult.photos.slice(0, 6).map((p) => (
                    <div key={p.id} className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100 relative">
                      {p.thumbnail ? (
                        <Image src={p.thumbnail} alt={p.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Photo</div>
                      )}
                    </div>
                  ))}
                  {verifyResult.photos.length > 6 && (
                    <div className="w-16 h-16 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      +{verifyResult.photos.length - 6}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirm deletion */}
              {verifyResult.verified && (
                <Button
                  onClick={submitGdprRequest}
                  disabled={submittingGdpr}
                  size="sm"
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white"
                >
                  {submittingGdpr ? "Envoi..." : "Confirmer la demande de suppression"}
                </Button>
              )}
            </div>
          )}

          {/* History */}
          {gdprRequests.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Historique des demandes</h3>
              <div className="space-y-2">
                {gdprRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <span>{req.type === "DELETION" ? "Suppression" : req.type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{req.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
