"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Download, Gauge, ListChecks, Play, ShieldAlert, Sparkles, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCreditReconciliation, getPhase22Retest, getSmokeGargles, getSmokeTestSummary, getUrgentImprovements, smokeModuleValidations, smokeTestIssues, smokeTestVideoResults } from "@/lib/smoke-test-lab";
import type { SmokeTestVideoResult } from "@/lib/types";

const channels = ["Todos", "Historias Biblicas", "Estoicismo com Anime", "Curiosidades Historicas"];

export function SmokeTestLabPanel() {
  const summary = getSmokeTestSummary();
  const retest = getPhase22Retest();
  const credits = getCreditReconciliation();
  const [channel, setChannel] = useState("Todos");
  const videos = useMemo(() => channel === "Todos" ? smokeTestVideoResults : smokeTestVideoResults.filter((video) => video.channel === channel), [channel]);

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-primary/20 bg-secondary/40 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-primary">Fase 21</p>
            <h1 className="font-display text-3xl font-bold">Smoke Test Real com 30 Videos</h1>
            <p className="mt-2 max-w-4xl text-muted-foreground">
              Relatorio operacional dos 30 videos planejados. O teste nao mascara simulacoes: resultados `hybrid` e `mocked` nao sao tratados como producao real validada.
            </p>
          </div>
          <Badge className="w-fit border-amber-400/20 bg-amber-400/10 text-amber-300">Sem MP4/ZIP real comprovado</Badge>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Metric icon={Video} label="Planejados" value={String(summary.planned)} />
        <Metric icon={Sparkles} label="Gerados" value={String(summary.generated)} />
        <Metric icon={Play} label="Renderizados" value={String(summary.rendered)} />
        <Metric icon={Download} label="Exportados" value={String(summary.exported)} />
        <Metric icon={Gauge} label="Sucesso" value={`${summary.successRate}%`} />
        <Metric icon={AlertTriangle} label="Falha" value={`${summary.failureRate}%`} />
        <Metric icon={Clock3} label="Tempo medio" value={`${summary.averageTimeSeconds}s`} />
        <Metric icon={ListChecks} label="Prontidao real" value={`${summary.realReadiness}%`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Reteste Fase 22</CardTitle>
            <CardDescription>3 videos curtos, 1 longo, exportacao, creditos, editor e render depois das correcoes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {retest.tests.map((item) => (
              <div key={item.id} className="grid gap-2 rounded-md border border-white/5 bg-background/40 p-3 md:grid-cols-[210px_120px_1fr] md:items-center">
                <p className="font-semibold">{item.label}</p>
                <Badge className={tone(item.status)}>{item.status}</Badge>
                <p className="text-sm text-muted-foreground">{item.result}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader><CardTitle>Prontidao atualizada</CardTitle><CardDescription>Resultado apos corrigir falsos positivos de render/export.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Metric icon={Gauge} label="Prontidao Fase 22" value={`${retest.readiness}%`} />
            <Mini label="Creditos estimados" value={String(credits.totalEstimated)} />
            <Mini label="Creditos debitaveis agora" value={String(credits.totalLogged)} />
            <p className="rounded-md border border-white/5 bg-background/40 p-3 text-sm text-muted-foreground">{credits.observation}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Relatorio dos 30 videos</CardTitle>
                <CardDescription>Canal, titulo, formato, duracao, status, creditos, erros, qualidade, render e pacote.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {channels.map((item) => <Button key={item} variant={channel === item ? "default" : "outline"} onClick={() => setChannel(item)}>{item}</Button>)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos.map((video) => <VideoRow key={video.id} video={video} />)}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Resultado por canal</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {summary.byChannel.map((row) => (
                <div key={row.channel} className="rounded-md border border-white/5 bg-secondary/40 p-3">
                  <p className="font-semibold">{row.channel}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <Mini label="Export" value={`${row.exported}/${row.planned}`} />
                    <Mini label="Qualidade" value={`${row.averageQuality}%`} />
                    <Mini label="Creditos" value={String(row.credits)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Bugs por severidade</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {summary.issuesBySeverity.map((row) => <Mini key={row.severity} label={row.severity.toUpperCase()} value={String(row.count)} />)}
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <IssuePanel />
        <ModulePanel />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ListPanel title="Principais gargalos" items={getSmokeGargles()} />
        <ListPanel title="Melhorias urgentes" items={getUrgentImprovements()} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ListPanel title="Bugs corrigidos na Fase 22" items={retest.fixedBugs} />
        <ListPanel title="Bugs restantes" items={retest.remainingBugs} />
        <ListPanel title="Modulos aprovados" items={retest.approvedModules} />
        <ListPanel title="Modulos ainda frageis" items={retest.fragileModules} />
      </section>
    </div>
  );
}

function VideoRow({ video }: { video: SmokeTestVideoResult }) {
  return (
    <div className="rounded-md border border-white/5 bg-secondary/40 p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_120px_110px_110px_110px] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{video.channel}</Badge>
            <Badge className={tone(video.executionMode)}>{video.executionMode}</Badge>
            <Badge className={tone(video.status)}>{video.status}</Badge>
          </div>
          <p className="mt-2 font-semibold">{video.title}</p>
          <p className="text-sm text-muted-foreground">{video.aspectRatio} - {video.durationSeconds}s - {video.format}</p>
        </div>
        <Score label="Qualidade" value={video.qualityScore} />
        <Score label="Thumb" value={video.thumbnailScore} />
        <Score label="Retencao" value={video.retentionScore} />
        <Score label="Legenda" value={video.subtitleScore} />
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <Mini label="Tempo" value={`${video.generationTimeSeconds}s`} />
        <Mini label="Creditos" value={String(video.creditsConsumed)} />
        <Mini label="Render" value={video.renderUrl ?? "sem MP4 real"} />
        <Mini label="Pacote" value={video.exportPackageUrl ?? "sem ZIP"} />
      </div>
      {video.errorsFound.length ? (
        <div className="mt-3 rounded-md border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
          {video.errorsFound.join(" | ")}
        </div>
      ) : null}
    </div>
  );
}

function IssuePanel() {
  return (
    <Card>
      <CardHeader><CardTitle>Lista de bugs</CardTitle><CardDescription>Problemas classificados sem mascarar mock.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {smokeTestIssues.map((issue) => (
          <div key={issue.id} className="rounded-md border border-white/5 bg-secondary/40 p-4">
            <div className="flex flex-wrap items-center gap-2"><Badge className={tone(issue.severity)}>{issue.severity}</Badge><Badge>{issue.module}</Badge></div>
            <p className="mt-2 font-semibold">{issue.title}</p>
            <p className="text-sm text-muted-foreground">{issue.description}</p>
            <p className="mt-2 text-sm text-primary">{issue.recommendation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModulePanel() {
  return (
    <Card>
      <CardHeader><CardTitle>Modulos validados</CardTitle><CardDescription>Aprovado, parcial, mockado ou reprovado.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {smokeModuleValidations.map((item) => (
          <div key={item.module} className="grid gap-2 rounded-md border border-white/5 bg-secondary/40 p-3 md:grid-cols-[170px_110px_1fr] md:items-center">
            <p className="font-semibold">{item.module}</p>
            <Badge className={tone(item.status)}>{item.status}</Badge>
            <p className="text-sm text-muted-foreground">{item.observation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" />{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => <p key={item} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm text-muted-foreground">{item}</p>)}
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-white/5 bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold">{value}</p></div>;
}

function Score({ label, value }: { label: string; value: number }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-lg font-semibold">{value}%</p><div className="mt-1 h-1.5 rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(value, 100)}%` }} /></div></div>;
}

function tone(status: string) {
  if (["approved", "ready_manual_publish", "exported", "rendered", "hybrid", "low", "passed"].includes(status)) return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (["failed", "blocked", "critical", "rejected"].includes(status)) return "border-red-400/20 bg-red-400/10 text-red-300";
  if (["mocked", "partial", "high", "medium", "needs_review"].includes(status)) return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return "border-white/10 bg-secondary/40 text-muted-foreground";
}
