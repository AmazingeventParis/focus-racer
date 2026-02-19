"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchKeys();
  }, [session]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewRawKey(data.rawKey);
        setNewKeyName("");
        fetchKeys();
        toast({ title: "Cle API creee", description: "Copiez-la maintenant, elle ne sera plus affichee." });
      } else {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de creer la cle", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (revokingId === id) {
      // Confirmed
      try {
        const res = await fetch(`/api/v1/keys/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast({ title: "Cle revoquee" });
          fetchKeys();
        }
      } catch {
        toast({ title: "Erreur", variant: "destructive" });
      }
      setRevokingId(null);
    } else {
      setRevokingId(id);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Cles API</h1>
          <p className="text-muted-foreground mt-1">
            Integrez Focus Racer dans vos outils via l&apos;API REST
          </p>
        </div>
        <Button
          onClick={() => { setShowCreateForm(true); setNewRawKey(null); }}
          className="bg-emerald hover:bg-emerald-dark"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvelle cle
        </Button>
      </div>

      {/* New key created — show raw key */}
      {newRawKey && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 text-lg">Votre nouvelle cle API</CardTitle>
            <CardDescription className="text-amber-700">
              Copiez cette cle maintenant. Elle ne sera plus jamais affichee.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-amber-200 rounded-lg px-4 py-3 text-sm font-mono break-all select-all">
                {newRawKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(newRawKey)}
                className="shrink-0"
              >
                {copied ? "Copie !" : "Copier"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-amber-700"
              onClick={() => setNewRawKey(null)}
            >
              J&apos;ai copie la cle, fermer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {showCreateForm && !newRawKey && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Creer une cle API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Nom de la cle (ex: Mon integration)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1"
              />
              <Button onClick={handleCreate} disabled={isCreating || !newKeyName.trim()}>
                {isCreating ? "Creation..." : "Creer"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Maximum 5 cles actives. Chaque appel API consomme 1 credit.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : keys.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            <p className="text-muted-foreground mb-4">Aucune cle API</p>
            <Button onClick={() => setShowCreateForm(true)} variant="outline">
              Creer votre premiere cle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className="glass-card">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy">{key.name}</span>
                        <Badge
                          variant={key.isActive ? "default" : "secondary"}
                          className={key.isActive ? "bg-emerald/10 text-emerald hover:bg-emerald/10" : ""}
                        >
                          {key.isActive ? "Active" : "Revoquee"}
                        </Badge>
                      </div>
                      <code className="text-xs text-muted-foreground font-mono">{key.keyPrefix}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Creee le {new Date(key.createdAt).toLocaleDateString("fr-FR")}</p>
                      {key.lastUsedAt && (
                        <p>Dernier usage : {new Date(key.lastUsedAt).toLocaleDateString("fr-FR")}</p>
                      )}
                    </div>
                    {key.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={revokingId === key.id ? "text-red-600 hover:text-red-700" : "text-muted-foreground"}
                        onClick={() => handleRevoke(key.id)}
                      >
                        {revokingId === key.id ? "Confirmer" : "Revoquer"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* API Documentation quick start */}
      <Card className="glass-card mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Guide rapide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-navy mb-2">Analyser une image</h4>
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://focusracer.swipego.app"}/api/v1/analyze \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -F "image=@photo.jpg"`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-navy mb-2">Consulter votre consommation</h4>
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
{`curl ${typeof window !== "undefined" ? window.location.origin : "https://focusracer.swipego.app"}/api/v1/usage \\
  -H "Authorization: Bearer VOTRE_CLE_API"`}
            </pre>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Rate limit :</strong> 60 requetes/minute par cle</p>
            <p><strong>Cout :</strong> 1 credit par analyse</p>
            <p><strong>Taille max :</strong> 10 Mo par image</p>
            <p><strong>Formats :</strong> JPEG, PNG, WebP</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
