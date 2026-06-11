"use client";

import Link from "next/link";
import { AlertTriangle, BarChart3, CheckCircle2, Gauge, Lightbulb, ListChecks, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { channels, premiumTemplates, videoProjects, videoRecommendations } from "@/lib/mock-data";
import { estimateQualityAnalysisCredits, getPreExportChecklist, getQualityDashboardRows, getVideoQualityBundle } from "@/lib/video-quality";
import type { ExportPlatform, VideoRecommendation } from "@/lib/types";

export function QualityPanel({ videoProjectId, platform = "youtube_shorts" }: { videoProjectId: string; platform?: ExportPlatform }) {
  const bundle = getVideoQualityBundle(videoProjectId, platform);
  const checklist = getPreExportChecklist(videoProjectId, platform);

  return (
    <section className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" />Qualidade</CardTitle>
              <CardDescription>Score, retencao, gancho, roteiro, cenas, thumbnail, legendas e metadados antes de exportar.</CardDescription>
            </div>
            <Badge className="w-fit">{bundle.score.overallScore}/100</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-5">
            <Score label="Gancho" value={bundle.score.hookScore} />
            <Score label="Roteiro" value={bundle.score.scriptScore} />
            <Score label="Visual" value={bundle.score.visualScore} />
            <Score label="Legenda" value={bundle.score.subtitleScore} />
            <Score label="Retencao" value={bundle.score.retentionScore} />
          </div>
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {bundle.recommendations.map((item) => <RecommendationCard key={item.id} item={item} />)}
            </div>
            <Card className="bg-card/70">
              <CardHeader><CardTitle className="text-base">Pre-export check</CardTitle><CardDescription>Exportacao continua permitida mesmo com alertas.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {checklist.map((item) => <div key={item.label} className="flex items-center gap-2 rounded-md border border-white/5 bg-secondary/40 p-2 text-sm">{item.done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}{item.label}</div>)}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <AnalyzerCard title="Retention Analyzer" description="Primeiros 3s, 10s, mudanca de cena, texto e CTA." rows={bundle.retention?.recommendations ?? []} />
        <AnalyzerCard title={`Hook Analyzer: ${bundle.hook?.strength ?? "medio"}`} description="Sugestoes de ganchos melhores." rows={bundle.hook?.improvedVersions ?? []} />
        <AnalyzerCard title="Thumbnail Analyzer" description="Contraste, clareza, emocao e curiosidade." rows={bundle.thumbnail?.suggestions ?? []} />
      </div>

      <Card>
        <CardHeader><CardTitle>Melhorar roteiro</CardTitle><CardDescription>A IA sugere versoes. Nada e substituido automaticamente.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {bundle.script ? Object.entries(bundle.script).filter(([key]) => key !== "videoProjectId").map(([key, value]) => <div key={key} className="rounded-md border border-white/5 bg-secondary/40 p-3"><p className="text-xs uppercase text-primary">{key}</p><p className="mt-2 text-sm text-muted-foreground">{value}</p><Button size="sm" variant="outline" className="mt-3 w-full">Aplicar versao</Button></div>) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Scene Pacing</CardTitle><CardDescription>Duracao, texto, midia, movimento e risco de ficar parado.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {bundle.pacing.map((scene) => <div key={scene.sceneId} className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex items-center justify-between"><p className="font-semibold">Cena {scene.orderIndex}</p><Badge>{scene.risk}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{scene.durationSeconds}s - {scene.textLength} chars - {scene.motionType}</p><p className="mt-2 text-sm text-primary">{scene.suggestion}</p></div>)}
        </CardContent>
      </Card>

      {bundle.comparison ? (
        <Card>
          <CardHeader><CardTitle>Comparacao de versoes</CardTitle><CardDescription>{bundle.comparison.versionA} vs {bundle.comparison.versionB}</CardDescription></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Score label={bundle.comparison.versionA} value={bundle.comparison.scoreA} />
            <Score label={bundle.comparison.versionB} value={bundle.comparison.scoreB} />
            <div className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm text-muted-foreground">{bundle.comparison.improvements.join(" | ")}</div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function QualityDashboard() {
  const rows = getQualityDashboardRows();
  const average = Math.round(rows.reduce((sum, item) => sum + item.overallScore, 0) / rows.length);
  const pending = videoRecommendations.filter((item) => !item.applied && !item.ignored).length;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Gauge} label="Score medio" value={`${average}/100`} />
        <Metric icon={AlertTriangle} label="Pendentes" value={String(pending)} />
        <Metric icon={CheckCircle2} label="Aprovados" value={String(rows.filter((item) => item.status === "aprovado").length)} />
        <Metric icon={Sparkles} label="Custo IA" value={`${estimateQualityAnalysisCredits("ai")} creditos`} />
      </section>

      <Card>
        <CardHeader><CardTitle>Dashboard de qualidade</CardTitle><CardDescription>Melhores scores, scores baixos, medias por canal/template e recomendacoes pendentes.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => {
            const video = videoProjects.find((item) => item.id === row.videoProjectId);
            return <div key={row.id} className="grid gap-3 rounded-md border border-white/5 bg-secondary/40 p-4 md:grid-cols-[1fr_120px_140px_160px] md:items-center"><div><p className="font-semibold">{video?.title ?? row.videoProjectId}</p><p className="text-sm text-muted-foreground">{row.recommendations.join(" | ")}</p></div><Badge>{row.status}</Badge><Score label="Score" value={row.overallScore} /><Button asChild variant="outline"><Link href={`/app/videos/${row.videoProjectId}/editor`}>Abrir editor</Link></Button></div>;
          })}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Media por canal</CardTitle></CardHeader><CardContent className="space-y-2">{channels.map((channel, index) => <Score key={channel.id} label={channel.name} value={72 + index * 6} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Media por template</CardTitle></CardHeader><CardContent className="space-y-2">{premiumTemplates.slice(0, 5).map((template, index) => <Score key={template.id} label={template.name} value={68 + index * 5} />)}</CardContent></Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Bulk Quality Check</CardTitle><CardDescription>Analise varios videos em lote antes de exportar.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">{rows.map((row) => <div key={`bulk-${row.id}`} className="rounded-md border border-white/5 bg-secondary/40 p-4"><Badge>{row.status}</Badge><p className="mt-3 font-semibold">{videoProjects.find((item) => item.id === row.videoProjectId)?.title}</p><p className="mt-1 text-sm text-muted-foreground">{row.overallScore}/100 - {row.pendingRecommendations} pendentes</p></div>)}</CardContent>
      </Card>
    </div>
  );
}

function RecommendationCard({ item }: { item: VideoRecommendation }) {
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex items-start justify-between gap-3"><div><Badge>{item.severity}</Badge><p className="mt-2 font-semibold">{item.message}</p><p className="mt-1 text-sm text-muted-foreground">{item.suggestion}</p></div><div className="flex shrink-0 gap-2"><Button size="sm" variant="outline"><Wand2 className="h-3 w-3" />Aplicar</Button><Button size="sm" variant="ghost">Ignorar</Button></div></div></div>;
}

function AnalyzerCard({ title, description, rows }: { title: string; description: string; rows: string[] }) {
  return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-2">{rows.slice(0, 5).map((row) => <div key={row} className="rounded-md border border-white/5 bg-secondary/40 p-2 text-sm text-muted-foreground"><Lightbulb className="mr-2 inline h-3 w-3 text-primary" />{row}</div>)}</CardContent></Card>;
}

function Score({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border border-white/5 bg-background/40 p-3"><div className="mb-2 flex justify-between gap-2 text-sm"><span className="truncate">{label}</span><span>{value}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div></div>;
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}
