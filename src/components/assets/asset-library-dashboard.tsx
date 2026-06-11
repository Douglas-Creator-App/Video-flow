"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, Download, Heart, ImageIcon, Library, Search, Sparkles, Upload, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { assetCollections, assetLibraryItems, assetSources, assetUsageItems, channels, projects } from "@/lib/mock-data";
import { autoMatchVisual, searchAssets } from "@/lib/assets";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import type { AssetLibraryItem, AssetProvider, AssetSourceType, AssetType, ExternalAssetSearchResult } from "@/lib/types";

export function AssetLibraryDashboard({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [query, setQuery] = useState("Jesus caminhando");
  const [type, setType] = useState<AssetType | "all">("all");
  const [source, setSource] = useState<AssetSourceType | "all">("all");
  const [favoriteOnly, setFavoriteOnly] = useState(favoritesOnly);
  const [provider, setProvider] = useState<AssetProvider | "library">("library");
  const [externalResults, setExternalResults] = useState<ExternalAssetSearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [providerMode, setProviderMode] = useState("local");

  const assets = useMemo(() => searchAssets({ query, type, source, favorite: favoriteOnly }), [favoriteOnly, query, source, type]);
  const autoMatches = useMemo(() => autoMatchVisual(query), [query]);

  async function externalSearch() {
    const response = await fetch(`/api/assets/search?q=${encodeURIComponent(query)}&provider=${provider}&type=${type === "video" ? "video" : "image"}&orientation=vertical&workspace_id=${encodeURIComponent(workspaceId)}`);
    const data = await response.json();
    setExternalResults(data.results ?? []);
    setProviderMode(data.providerMode ?? data.provider_mode ?? "unknown");
    setMessage(data.warning ?? `${data.results?.length ?? 0} resultados encontrados.`);
  }

  async function importAsset(result: ExternalAssetSearchResult) {
    const response = await fetch("/api/assets/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId, result })
    });
    const data = await response.json();
    setMessage(data.warning ?? `Asset ${data.status}.`);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Library} label="Total" value={String(assetLibraryItems.length)} />
        <Metric icon={ImageIcon} label="Imagens" value={String(assetLibraryItems.filter((item) => item.type === "image").length)} />
        <Metric icon={Video} label="Videos" value={String(assetLibraryItems.filter((item) => item.type === "video").length)} />
        <Metric icon={Heart} label="Favoritos" value={String(assetLibraryItems.filter((item) => item.favorite).length)} />
      </section>

      <Card className="border-primary/15">
        <CardContent className="grid gap-3 p-4 md:grid-cols-7">
          <div className="md:col-span-2"><Field label="Smart search"><Input value={query} onChange={(event) => setQuery(event.target.value)} /></Field></div>
          <Field label="Tipo"><SelectField value={type} onChange={(event) => setType(event.target.value as AssetType | "all")}><option value="all">Todos</option>{["image", "video", "audio", "music", "thumbnail"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
          <Field label="Origem"><SelectField value={source} onChange={(event) => setSource(event.target.value as AssetSourceType | "all")}><option value="all">Todas</option>{["upload", "pexels", "pixabay", "unsplash", "ai_image", "ai_video", "generated"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
          <Field label="Provider"><SelectField value={provider} onChange={(event) => setProvider(event.target.value as AssetProvider | "library")}><option value="library">Biblioteca</option>{["pexels", "pixabay", "unsplash"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
          <div className="flex items-end"><Button variant={favoriteOnly ? "default" : "outline"} onClick={() => setFavoriteOnly(!favoriteOnly)} className="w-full">Favoritos</Button></div>
          <div className="flex items-end"><Button onClick={externalSearch} className="w-full gap-2"><Search className="h-4 w-4" />Buscar</Button></div>
        </CardContent>
      </Card>

      {message ? <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground"><Badge className="mr-2">{providerMode}</Badge>{message}</div> : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(provider === "library" ? assets : externalResults).map((item) => "qualityScore" in item
            ? <AssetCard key={item.id} asset={item} />
            : <ExternalAssetCard key={item.id} asset={item} onImport={() => importAsset(item)} />)}
        </div>
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Auto Match Visual</CardTitle><CardDescription>Busca assets relevantes para a cena.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {autoMatches.map((match) => <div key={match.asset.id} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm"><div className="flex items-center justify-between gap-2"><span>{match.asset.title}</span><Badge>{match.relevance}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{match.asset.tags.join(", ")}</p></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Colecoes</CardTitle><CardDescription>Bibliotecas tematicas para canais.</CardDescription></CardHeader>
            <CardContent className="space-y-2">{assetCollections.map((collection) => <div key={collection.id} className="rounded-md border border-white/5 bg-secondary/40 p-3"><p className="font-medium">{collection.name}</p><p className="text-sm text-muted-foreground">{collection.description}</p></div>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Fontes</CardTitle></CardHeader>
            <CardContent className="space-y-2">{assetSources.map((sourceItem) => <div key={sourceItem.id} className="flex items-center justify-between rounded-md border border-white/5 bg-secondary/40 p-3 text-sm"><span>{sourceItem.name}</span><Badge>{sourceItem.status}</Badge></div>)}</CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

export function UploadCenter() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [message, setMessage] = useState("");
  async function simulateUpload() {
    const response = await fetch("/api/assets/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId, title: "Upload manual demo", type: "image", mime_type: "image/jpeg", file_url: "/media/mock-thumbnail-1.jpg", tags: ["upload", "demo"] })
    });
    const data = await response.json();
    setMessage(data.warning ?? data.status);
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="border-primary/25 bg-primary/5">
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4 text-primary" />Upload Center</CardTitle><CardDescription>JPG, PNG, WEBP, MP4, MOV, MP3 e WAV. Storage real fica preparado para Supabase Storage.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Arquivo"><Input type="file" accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.mp3,.wav" /></Field>
          <Field label="Titulo"><Input defaultValue="Meu asset" /></Field>
          <Field label="Tags"><Input defaultValue="upload, canal, b-roll" /></Field>
          <Button onClick={simulateUpload} className="w-full gap-2"><Upload className="h-4 w-4" />Validar upload demo</Button>
          {message ? <p className="rounded-md border border-primary/20 bg-background/50 p-3 text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Regras de upload</CardTitle><CardDescription>Arquitetura preparada para thumbnails automaticas, hash e duplicidade.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {["Tipos permitidos", "Hash para duplicidade", "Thumbnail automatica", "Audit log", "Storage privado", "Permissao upload_asset"].map((item) => <div key={item} className="flex items-center gap-2 rounded-md border border-white/5 bg-secondary/40 p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" />{item}</div>)}
        </CardContent>
      </Card>
    </div>
  );
}

export function AssetAnalytics() {
  const totalSize = assetLibraryItems.reduce((sum, asset) => sum + (asset.fileSize ?? 0), 0);
  const byType = (type: AssetType) => assetLibraryItems.filter((asset) => asset.type === type).length;
  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-5">
        <Metric icon={BarChart3} label="Assets" value={String(assetLibraryItems.length)} />
        <Metric icon={Download} label="Espaco" value={`${(totalSize / 1024 / 1024).toFixed(1)} MB`} />
        <Metric icon={Video} label="Videos" value={String(byType("video"))} />
        <Metric icon={ImageIcon} label="Imagens" value={String(byType("image") + byType("thumbnail"))} />
        <Metric icon={Sparkles} label="Assets IA" value={String(assetLibraryItems.filter((asset) => asset.source.includes("ai")).length)} />
      </section>
      <Card><CardHeader><CardTitle>Uso dos assets</CardTitle><CardDescription>Controle de uso por video, cena e biblioteca.</CardDescription></CardHeader><CardContent className="space-y-2">{assetUsageItems.map((usage) => <div key={usage.id} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm">{assetLibraryItems.find((asset) => asset.id === usage.assetId)?.title} usado em {usage.videoProjectId} - {usage.usedAt}</div>)}</CardContent></Card>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetLibraryItem }) {
  return <Card className="overflow-hidden border-primary/10 bg-card/80"><div className="grid aspect-video place-items-center bg-black/70">{asset.thumbnailUrl ? <img src={asset.thumbnailUrl} alt={asset.title} className="h-full w-full object-cover" /> : <Library className="h-8 w-8 text-primary" />}</div><CardHeader><div className="flex items-start justify-between gap-2"><Badge>{asset.type}</Badge>{asset.favorite ? <Heart className="h-4 w-4 fill-primary text-primary" /> : null}</div><CardTitle className="mt-2">{asset.title}</CardTitle><CardDescription>{asset.source} - usado em {asset.usageCount} videos</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-1">{asset.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div><div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-2 text-sm"><span>Quality</span><strong>{asset.qualityScore}/100</strong></div></CardContent></Card>;
}

function ExternalAssetCard({ asset, onImport }: { asset: ExternalAssetSearchResult; onImport: () => void }) {
  return <Card className="overflow-hidden border-primary/10 bg-card/80"><div className="grid aspect-video place-items-center bg-black/70"><img src={asset.thumbnailUrl} alt={asset.title} className="h-full w-full object-cover" /></div><CardHeader><Badge className="w-fit">{asset.provider}</Badge><CardTitle className="mt-2">{asset.title}</CardTitle><CardDescription>{asset.type} - {asset.width}x{asset.height}</CardDescription></CardHeader><CardContent><Button onClick={onImport} className="w-full">Importar para biblioteca</Button></CardContent></Card>;
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
