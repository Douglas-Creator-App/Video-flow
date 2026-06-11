"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, CheckCircle2, Clipboard, Download, FileArchive, Gauge, PackageCheck, Search, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { channels, exportPackages, manualPublications, projects, thumbnailGenerations, videoMetadataItems, videoProjects } from "@/lib/mock-data";
import { buildExportPackageManifest, createExportPackage, generateVideoMetadata, platformLabel, platformPresets } from "@/lib/export-center";
import { getPreExportChecklist, getVideoQualityScore } from "@/lib/video-quality";
import { verifyExportPackage } from "@/lib/artifact-verification";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import { useExportPackages } from "@/lib/workspace/hooks";
import type { ExportPackage, ExportPlatform, ManualPublication, VideoMetadata } from "@/lib/types";

export function ExportCenterDashboard() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const exportQuery = useExportPackages(workspaceId);
  const realPackages = ((exportQuery.data?.packages ?? []) as Array<Record<string, unknown>>).map(mapExportPackage);
  const [platform, setPlatform] = useState<ExportPlatform>("youtube_shorts");
  const [channelId, setChannelId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [packages, setPackages] = useState<ExportPackage[]>(exportPackages);
  const [publications, setPublications] = useState<ManualPublication[]>(manualPublications);
  const [message, setMessage] = useState("");
  const [lastJobId, setLastJobId] = useState("");

  const readyVideos = useMemo(() => videoProjects.map((video) => {
    const pkg = packages.find((item) => item.videoProjectId === video.id && item.targetPlatform === platform);
    const metadata = videoMetadataItems.find((item) => item.videoProjectId === video.id && item.platform === platform) ?? generateVideoMetadata(video.id, platform);
    const channel = channels.find((item) => item.id === (pkg?.channelId ?? "channel_1")) ?? channels[0];
    return { video, pkg, metadata, channel };
  }).filter((item) => {
    const matchesQuery = item.video.title.toLowerCase().includes(query.toLowerCase());
    const matchesChannel = channelId === "all" || item.channel.id === channelId;
    const matchesProject = projectId === "all" || item.video.projectId === projectId;
    const matchesStatus = status === "all" || (item.pkg?.status ?? "draft") === status;
    return matchesQuery && matchesChannel && matchesProject && matchesStatus;
  }), [channelId, packages, platform, projectId, query, status]);

  async function preparePackage(videoProjectId: string) {
    if (!workspaceId) {
      setMessage("Selecione um workspace real antes de exportar.");
      return;
    }
    const response = await fetch("/api/export/package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId, channel_id: "channel_1", video_project_id: videoProjectId, target_platform: platform })
    });
    const data = await response.json();
    if (data.status === "failed") {
      setMessage(data.friendly_error ?? data.error ?? "Falha ao criar pacote.");
      return;
    }
    if (data.job_id) {
      setLastJobId(data.job_id);
      setMessage(`${data.warning ?? "Export enfileirado."} Job: ${data.job_id}`);
      return;
    }
    setPackages((items) => [data.package, ...items.filter((item) => item.id !== data.package.id)]);
    setMessage(data.warning ?? "Manifest preparado. O ZIP real ainda precisa ser verificado.");
  }

  async function bulkExport() {
    if (!workspaceId) {
      setMessage("Selecione um workspace real antes de exportar em lote.");
      return;
    }
    const response = await fetch("/api/export/package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId, video_project_ids: selectedIds, target_platform: platform })
    });
    const data = await response.json();
    if (data.job_id) setLastJobId(data.job_id);
    setMessage(data.job_id ? `${data.warning ?? "Export em lote enfileirado."} Job: ${data.job_id}` : data.status === "ready" ? `ZIP em lote pronto: ${data.packageUrl}` : (data.friendly_error ?? data.error ?? "Falha no export em lote."));
  }

  async function markPublished(pkg: ExportPackage) {
    const metadata = videoMetadataItems.find((item) => item.videoProjectId === pkg.videoProjectId && item.platform === pkg.targetPlatform) ?? generateVideoMetadata(pkg.videoProjectId, pkg.targetPlatform);
    const artifact = verifyExportPackage(pkg, buildExportPackageManifest(pkg, metadata));
    const response = await fetch("/api/export/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_published", workspace_id: workspaceId, video_project_id: pkg.videoProjectId, export_package_id: pkg.id, platform: pkg.targetPlatform, artifact_verified: artifact.exportReady })
    });
    const data = await response.json();
    if (data.status === "blocked") {
      setMessage(data.error ?? "Publicacao manual bloqueada ate o pacote ser verificado.");
      return;
    }
    setPublications((items) => [data.publication, ...items]);
    setPackages((items) => items.map((item) => item.id === pkg.id ? { ...item, status: "marked_as_published", updatedAt: new Date().toISOString() } : item));
  }

  function toggleSelection(videoId: string) {
    setSelectedIds((items) => items.includes(videoId) ? items.filter((id) => id !== videoId) : [...items, videoId]);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={PackageCheck} label="Pacotes reais" value={String(realPackages.length)} />
        <Metric icon={Download} label="Baixados" value={String(realPackages.filter((item) => item.status === "downloaded").length)} />
        <Metric icon={Send} label="Publicados manualmente" value={String(publications.length)} />
        <Metric icon={Gauge} label="SEO medio" value={`${Math.round(videoMetadataItems.reduce((sum, item) => sum + item.seoScore, 0) / videoMetadataItems.length)}%`} />
      </section>

      <Card className="border-primary/15 bg-card/80">
        <CardHeader>
          <CardTitle>Pacotes reais do workspace</CardTitle>
          <CardDescription>{realPackages.length ? "Dados vindos de export_packages no Supabase." : "Nenhum export_package real encontrado. A area de preparacao abaixo permanece demonstrativa ate existir render/export real."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {realPackages.length ? realPackages.map((pkg) => <RealExportPackageRow key={pkg.id} packageItem={pkg} workspaceId={workspaceId} />) : (
            <div className="rounded-md border border-dashed border-white/10 bg-secondary/20 p-4 text-sm text-muted-foreground">Sem pacotes reais para este workspace.</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/15">
        <CardContent className="grid gap-3 p-4 md:grid-cols-7">
          <div className="md:col-span-2"><Field label="Busca"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titulo do video" /></Field></div>
          <Field label="Plataforma"><SelectField value={platform} onChange={(event) => setPlatform(event.target.value as ExportPlatform)}>{platformPresets.map((item) => <option key={item.platform} value={item.platform}>{item.label}</option>)}</SelectField></Field>
          <Field label="Canal"><SelectField value={channelId} onChange={(event) => setChannelId(event.target.value)}><option value="all">Todos</option>{channels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></Field>
          <Field label="Projeto"><SelectField value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="all">Todos</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></Field>
          <Field label="Status"><SelectField value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option>{["draft", "preparing", "ready", "downloaded", "marked_as_published", "failed"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
          <div className="flex items-end"><Button onClick={bulkExport} disabled={!selectedIds.length} className="w-full gap-2"><FileArchive className="h-4 w-4" />Exportar lote</Button></div>
        </CardContent>
      </Card>

      {message ? <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">{message}</div> : null}
      {lastJobId ? <div className="rounded-md border border-white/10 bg-secondary/30 p-3 text-sm text-muted-foreground">Acompanhe em <Link className="text-primary underline" href="/app/queue">/app/queue</Link> ou consulte <code>/api/jobs/{lastJobId}</code>.</div> : null}

      <div className="grid gap-4">
        {readyVideos.map(({ video, pkg, metadata, channel }) => (
          <ExportRow
            key={`${video.id}-${platform}`}
            selected={selectedIds.includes(video.id)}
            onSelect={() => toggleSelection(video.id)}
            packageItem={pkg}
            metadata={metadata}
            channelName={channel.name}
            onPrepare={() => preparePackage(video.id)}
            onPublished={() => pkg ? markPublished(pkg) : undefined}
            workspaceId={workspaceId}
          />
        ))}
      </div>
    </div>
  );
}

export function ExportHistoryDashboard() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const exportQuery = useExportPackages(workspaceId);
  const realPackages = ((exportQuery.data?.packages ?? []) as Array<Record<string, unknown>>).map(mapExportPackage);
  const rows = [
    ...(realPackages.length ? realPackages : exportPackages).map((item) => ({ id: item.id, title: item.title, type: realPackages.length ? "pacote real" : "pacote demo", status: item.status, platform: platformLabel(item.targetPlatform), date: item.updatedAt, user: realPackages.length ? "Supabase" : "Demo" })),
    ...manualPublications.map((item) => ({ id: item.id, title: item.publishedUrl ?? "Publicacao manual", type: "publicacao", status: "published", platform: platformLabel(item.platform), date: item.publishedAt, user: "Daniel" }))
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Historico de exportacoes</CardTitle><CardDescription>Pacotes gerados, downloads e publicacoes manuais.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row) => <div key={row.id} className="grid gap-2 rounded-md border border-white/5 bg-secondary/40 p-3 text-sm md:grid-cols-[1fr_140px_140px_140px_120px]"><span className="font-medium">{row.title}</span><Badge>{row.type}</Badge><span className="text-muted-foreground">{row.platform}</span><span className="text-muted-foreground">{row.date}</span><span className="text-muted-foreground">{row.user}</span></div>)}
      </CardContent>
    </Card>
  );
}

function ExportRow({ selected, onSelect, packageItem, metadata, channelName, onPrepare, onPublished, workspaceId }: {
  selected: boolean;
  onSelect: () => void;
  packageItem?: ExportPackage;
  metadata: VideoMetadata;
  channelName: string;
  onPrepare: () => void;
  onPublished: () => void;
  workspaceId: string;
}) {
  const manifest = packageItem ? buildExportPackageManifest(packageItem, metadata) : null;
  const artifact = verifyExportPackage(packageItem, manifest);
  const thumbnail = thumbnailGenerations.find((item) => item.videoProjectId === metadata.videoProjectId)?.selectedImageUrl;
  const qualityScore = getVideoQualityScore(metadata.videoProjectId);
  const preExportChecklist = getPreExportChecklist(metadata.videoProjectId, metadata.platform);
  const hasWarnings = preExportChecklist.some((item) => !item.done);
  const [downloadMessage, setDownloadMessage] = useState("");

  async function downloadPackage() {
    if (!packageItem?.packageUrl) return;
    if (!packageItem.packageUrl.startsWith("supabase://")) {
      window.location.href = packageItem.packageUrl;
      return;
    }
    setDownloadMessage("Gerando signed URL...");
    const response = await fetch("/api/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: packageItem.packageUrl, workspace_id: workspaceId })
    });
    const data = await response.json();
    if (!response.ok) {
      setDownloadMessage(data.error ?? "Falha ao gerar link de download.");
      return;
    }
    setDownloadMessage("Download liberado por URL assinada.");
    window.location.href = data.signed_url;
  }

  return (
    <Card className="overflow-hidden border-primary/10 bg-card/80">
      <CardHeader>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex gap-3">
            <input type="checkbox" checked={selected} onChange={onSelect} className="mt-1 h-4 w-4 accent-primary" />
            <div>
              <div className="flex flex-wrap items-center gap-2"><Badge>{packageItem?.status ?? "draft"}</Badge><Badge>{platformLabel(metadata.platform)}</Badge><span className="text-xs text-muted-foreground">{channelName}</span></div>
              <CardTitle className="mt-3">{metadata.title}</CardTitle>
              <CardDescription>{metadata.description}</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onPrepare} className="gap-2"><Sparkles className="h-4 w-4" />Preparar pacote</Button>
            {artifact.exportReady && packageItem?.packageUrl ? <Button variant="outline" onClick={downloadPackage} className="gap-2"><Download className="h-4 w-4" />Baixar ZIP</Button> : null}
            <Button variant="outline" onClick={onPublished} disabled={!artifact.exportReady} className="gap-2"><Send className="h-4 w-4" />Publicado manualmente</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[220px_1fr_300px]">
        <div className="grid aspect-video place-items-center overflow-hidden rounded-md border border-primary/20 bg-black/70">
          {thumbnail?.startsWith("data:") ? <img src={thumbnail} alt="Thumbnail selecionada" className="h-full w-full object-cover" /> : <div className="text-center text-sm text-muted-foreground"><Search className="mx-auto mb-2 h-6 w-6 text-primary" />Sem thumbnail real<br /><Link className="text-primary" href={`/app/videos/${metadata.videoProjectId}/thumbnails`}>Gerar thumbnail agora</Link></div>}
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <CopyField label="Titulo" value={metadata.title} />
          <CopyField label="Hashtags" value={metadata.hashtags.join(" ")} />
          <CopyField label="Tags" value={metadata.tags.join(", ")} />
          <CopyField label="Comentario fixado" value={metadata.pinnedComment} />
          <div className="md:col-span-2"><CopyField label="Descricao" value={metadata.description} /></div>
        </div>
        <div className="space-y-3">
          <div className={`rounded-md border p-3 text-sm ${artifact.exportReady ? "border-primary/20 bg-primary/5 text-muted-foreground" : "border-amber-400/20 bg-amber-400/10 text-amber-200"}`}>
            <p className="font-semibold text-foreground">Verificacao de artefatos</p>
            <p className="mt-1">{artifact.message}</p>
            {downloadMessage ? <p className="mt-2 text-xs">{downloadMessage}</p> : null}
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3"><p className="text-xs text-muted-foreground">SEO Score</p><p className="font-display text-3xl font-semibold text-primary">{metadata.seoScore}/100</p></div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3"><p className="text-xs text-muted-foreground">Quality Score</p><p className="font-display text-3xl font-semibold text-primary">{qualityScore.overallScore}/100</p>{hasWarnings ? <p className="mt-1 text-xs text-amber-300">Exportacao permitida com avisos.</p> : null}</div>
          {preExportChecklist.map((item) => <div key={item.label} className="flex items-center gap-2 rounded-md border border-white/5 bg-secondary/40 p-2 text-sm">{item.done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Archive className="h-4 w-4 text-amber-400" />}<span>{item.label}</span></div>)}
          {(manifest?.checklist ?? []).map((item) => <div key={item.label} className="flex items-center gap-2 rounded-md border border-white/5 bg-secondary/40 p-2 text-sm">{item.done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Archive className="h-4 w-4 text-muted-foreground" />}<span>{item.label}</span></div>)}
        </div>
      </CardContent>
    </Card>
  );
}

function RealExportPackageRow({ packageItem, workspaceId }: { packageItem: ExportPackage; workspaceId: string }) {
  const [downloadMessage, setDownloadMessage] = useState("");
  async function downloadPackage() {
    if (!packageItem.packageUrl) {
      setDownloadMessage("Pacote sem package_url real.");
      return;
    }
    if (!packageItem.packageUrl.startsWith("supabase://")) {
      window.location.href = packageItem.packageUrl;
      return;
    }
    const response = await fetch("/api/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: packageItem.packageUrl, workspace_id: workspaceId })
    });
    const data = await response.json();
    if (!response.ok) {
      setDownloadMessage(data.error ?? "Falha ao gerar signed URL.");
      return;
    }
    setDownloadMessage("Signed URL gerada.");
    window.location.href = data.signed_url;
  }
  return (
    <div className="grid gap-3 rounded-md border border-white/5 bg-secondary/35 p-3 text-sm lg:grid-cols-[1fr_140px_160px_140px] lg:items-center">
      <div>
        <p className="font-semibold">{packageItem.title}</p>
        <p className="text-xs text-muted-foreground">{packageItem.packageUrl ? packageItem.packageUrl : "Sem package_url"}</p>
        {downloadMessage ? <p className="mt-1 text-xs text-primary">{downloadMessage}</p> : null}
      </div>
      <Badge>{packageItem.status}</Badge>
      <span className="text-muted-foreground">{platformLabel(packageItem.targetPlatform)}</span>
      <Button variant="outline" onClick={downloadPackage} disabled={!packageItem.packageUrl} className="gap-2"><Download className="h-4 w-4" />Download</Button>
    </div>
  );
}

function mapExportPackage(row: Record<string, unknown>): ExportPackage {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id ?? row.workspaceId ?? ""),
    channelId: String(row.channel_id ?? row.channelId ?? ""),
    videoProjectId: String(row.video_project_id ?? row.videoProjectId ?? ""),
    title: String(row.title ?? "Pacote sem titulo"),
    targetPlatform: String(row.target_platform ?? row.targetPlatform ?? "youtube_shorts") as ExportPlatform,
    packageUrl: row.package_url ? String(row.package_url) : row.packageUrl ? String(row.packageUrl) : undefined,
    status: String(row.status ?? "draft") as ExportPackage["status"],
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString())
  };
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{label}</p><Button size="sm" variant="outline" onClick={copy} className="h-8 gap-1"><Clipboard className="h-3 w-3" />{copied ? "Copiado" : "Copiar"}</Button></div><p className="line-clamp-3 text-sm">{value}</p></div>;
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
