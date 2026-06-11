"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Gauge, ListChecks, Pause, Play, RotateCcw, ShieldCheck, Sparkles, Wand2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  contentFactories,
  factoryAlerts,
  factoryQueueJobs,
  factoryTemplates,
  getAdminFactoryInsights,
  getFactoryAnalytics,
  getFactoryDashboard,
  getProductionLimitDecision,
  reviewQueueItems,
  runFactoryGeneration
} from "@/lib/content-factory";
import type { FactoryReviewStatus } from "@/lib/types";

type GenerationResult = NonNullable<ReturnType<typeof runFactoryGeneration>>;

export function FactoriesDashboard() {
  const analytics = getFactoryAnalytics();
  const [result, setResult] = useState<GenerationResult | null>(null);

  async function generate(factoryId: string) {
    const response = await fetch("/api/factories/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ factory_id: factoryId, action: "generate" })
    });
    const data = await response.json();
    setResult(data.result);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Wand2} label="Factories ativas" value={`${analytics.activeFactories}/${analytics.totalFactories}`} />
        <Metric icon={Activity} label="Jobs" value={String(analytics.totalJobs)} />
        <Metric icon={ShieldCheck} label="Quality media" value={`${analytics.averageQuality}%`} />
        <Metric icon={Gauge} label="Sucesso" value={`${analytics.successRate}%`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Content Factories</CardTitle>
            <CardDescription>Automacoes multi-canal com limites, quality gate e revisao antes de render/publicacao.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {contentFactories.map((factory) => (
              <FactoryCard key={factory.id} factoryId={factory.id} onGenerate={() => generate(factory.id)} />
            ))}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Factory Templates</CardTitle><CardDescription>Presets para canais dark, religiosos, historia, luxo e curiosidades.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {factoryTemplates.map((template) => (
                <div key={template.id} className="rounded-md border border-white/5 bg-secondary/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{template.name}</p>
                    <Badge>{template.defaultFrequency}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <AlertsPanel />
        </aside>
      </section>

      {result && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Execucao simulada</CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-2">
              {result.pipeline.map((item) => (
                <div key={item.step} className="flex items-center justify-between rounded-md border border-white/5 bg-background/40 p-3 text-sm">
                  <span>{item.step}</span>
                  <Badge>{item.status}</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-md border border-white/5 bg-background/40 p-4">
              <Score value={result.estimatedQuality} label="Quality Score" />
              <p className="text-sm text-muted-foreground">Quality gate: {result.qualityGate.passed ? "aprovado" : "enviado para revisao"} acima de {result.qualityGate.threshold}.</p>
              <p className="text-sm text-muted-foreground">Publicacao automatica: bloqueada.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function FactoryDetail({ factoryId }: { factoryId: string }) {
  const dashboard = getFactoryDashboard(factoryId);

  if (!dashboard) {
    return <Empty title="Factory nao encontrada" description="A automacao solicitada nao existe nos dados atuais." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-primary/20 bg-secondary/40 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{dashboard.factory.status}</Badge>
              <Badge>{dashboard.factory.defaultFormat}</Badge>
              <Badge>{dashboard.factory.productionFrequency}</Badge>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold">{dashboard.factory.name}</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{dashboard.factory.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2"><Play className="h-4 w-4" />Rodar agora</Button>
            <Button variant="outline" className="gap-2"><Pause className="h-4 w-4" />Pausar</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Sparkles} label="Ideias usadas" value={String(dashboard.metrics.ideasUsed)} />
        <Metric icon={Activity} label="Videos gerados" value={String(dashboard.metrics.videosGenerated)} />
        <Metric icon={CheckCircle2} label="Renderizados" value={String(dashboard.metrics.videosRendered)} />
        <Metric icon={ShieldCheck} label="Quality media" value={`${dashboard.metrics.averageQuality}%`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Fila da factory</CardTitle><CardDescription>Estado real de cada job mockado.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.queue.map((job) => <JobRow key={job.id} job={job} />)}
          </CardContent>
        </Card>
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Quality Gate</CardTitle><CardDescription>Controle antes de render/export.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Score value={dashboard.factory.qualityGateThreshold} label="Threshold minimo" />
              <Mini label="Review obrigatorio" value={dashboard.factory.requireReview ? "Sim" : "Nao"} />
              <Mini label="Decisao" value={dashboard.productionDecision.message} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Resource Manager</CardTitle><CardDescription>Prioridade de fontes antes de usar geracao paga.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {dashboard.resourcePlan.map((resource) => (
                <div key={resource.resource} className="rounded-md border border-white/5 bg-secondary/40 p-3">
                  <div className="flex items-center justify-between"><span className="font-semibold">{resource.priority}. {resource.resource}</span><Badge>{resource.mode}</Badge></div>
                  <p className="mt-1 text-xs text-muted-foreground">{resource.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Regras</CardTitle></CardHeader>
          <CardContent className="space-y-2">{dashboard.rules.map((rule) => <Mini key={rule.id} label={rule.ruleType} value={rule.value} />)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Agendamento</CardTitle></CardHeader>
          <CardContent className="space-y-2">{dashboard.schedules.map((schedule) => <Mini key={schedule.id} label={schedule.frequency} value={`${schedule.runTime} - ${schedule.enabled ? "ativo" : "pausado"}`} />)}</CardContent>
        </Card>
      </section>
    </div>
  );
}

export function FactoryQueuesDashboard() {
  const groups = ["queued", "generating", "review", "rendering", "completed", "failed"];
  const [regenerated, setRegenerated] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Clock3} label="Na fila" value={String(factoryQueueJobs.filter((job) => ["queued", "generating", "rendering"].includes(job.status)).length)} />
        <Metric icon={ListChecks} label="Em review" value={String(factoryQueueJobs.filter((job) => job.status === "review").length)} />
        <Metric icon={CheckCircle2} label="Concluidos" value={String(factoryQueueJobs.filter((job) => job.status === "completed").length)} />
        <Metric icon={AlertTriangle} label="Falhas" value={String(factoryQueueJobs.filter((job) => job.status === "failed").length)} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <Card key={group}>
            <CardHeader><CardTitle>{group}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {factoryQueueJobs.filter((job) => job.status === group).map((job) => (
                <div key={job.id} className="rounded-md border border-white/5 bg-secondary/40 p-4">
                  <JobRow job={job} compact />
                  {job.status === "failed" && (
                    <Button className="mt-3 gap-2" variant="outline" onClick={() => setRegenerated((items) => [...items, job.id])}>
                      <RotateCcw className="h-4 w-4" />{regenerated.includes(job.id) ? "Reenviado" : "Regenerar"}
                    </Button>
                  )}
                </div>
              ))}
              {!factoryQueueJobs.some((job) => job.status === group) && <p className="text-sm text-muted-foreground">Nenhum job neste estado.</p>}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export function FactoryAnalyticsDashboard() {
  const analytics = getFactoryAnalytics();
  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Activity} label="Producao total" value={String(analytics.totalJobs)} />
        <Metric icon={Gauge} label="Taxa de sucesso" value={`${analytics.successRate}%`} />
        <Metric icon={AlertTriangle} label="Taxa de falha" value={`${analytics.failureRate}%`} />
        <Metric icon={Sparkles} label="Creditos" value={analytics.creditsConsumed.toLocaleString("pt-BR")} />
      </section>
      <Card>
        <CardHeader><CardTitle>Producao por factory</CardTitle><CardDescription>Videos, renderizacoes, falhas, score e custo operacional.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {analytics.byFactory.map((row) => (
            <div key={row.factory.id} className="grid gap-3 rounded-md border border-white/5 bg-secondary/40 p-4 md:grid-cols-[1fr_120px_120px_120px_120px] md:items-center">
              <div>
                <p className="font-semibold">{row.factory.name}</p>
                <p className="text-sm text-muted-foreground">{row.factory.productionFrequency}</p>
              </div>
              <Mini label="Gerados" value={String(row.generated)} />
              <Mini label="Render" value={String(row.rendered)} />
              <Mini label="Falhas" value={String(row.failed)} />
              <Score value={row.averageQuality} label="Score" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ReviewQueueDashboard() {
  const [statuses, setStatuses] = useState<Record<string, FactoryReviewStatus>>({});
  const items = reviewQueueItems.map((item) => ({ ...item, status: statuses[item.id] ?? item.status }));

  function update(id: string, status: FactoryReviewStatus) {
    setStatuses((current) => ({ ...current, [id]: status }));
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={ListChecks} label="Pendentes" value={String(items.filter((item) => item.status === "pending").length)} />
        <Metric icon={CheckCircle2} label="Aprovados" value={String(items.filter((item) => item.status === "approved").length)} />
        <Metric icon={XCircle} label="Rejeitados" value={String(items.filter((item) => item.status === "rejected").length)} />
        <Metric icon={RotateCcw} label="Reenviados" value={String(items.filter((item) => item.status === "resent").length)} />
      </section>
      <Card>
        <CardHeader><CardTitle>Review Queue</CardTitle><CardDescription>Aprovacao humana antes de renderizar ou seguir o pipeline.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => {
            const factory = contentFactories.find((factoryItem) => factoryItem.id === item.factoryId);
            return (
              <div key={item.id} className="rounded-md border border-white/5 bg-secondary/40 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2"><Badge>{item.status}</Badge><Badge>{factory?.name ?? "Factory"}</Badge></div>
                    <p className="mt-2 font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <Score value={item.qualityScore} label="Score" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="gap-2" onClick={() => update(item.id, "approved")}><CheckCircle2 className="h-4 w-4" />Aprovar</Button>
                  <Button variant="outline" onClick={() => update(item.id, "edited")}>Editar</Button>
                  <Button variant="outline" className="gap-2" onClick={() => update(item.id, "resent")}><RotateCcw className="h-4 w-4" />Reenviar</Button>
                  <Button variant="destructive" className="gap-2" onClick={() => update(item.id, "rejected")}><XCircle className="h-4 w-4" />Rejeitar</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminFactoryPanel() {
  const insights = getAdminFactoryInsights();
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Content Factory Admin</CardTitle>
        <CardDescription>Uso operacional das factories, templates, filas, alertas e reviews pendentes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <Mini label="Factories" value={`${insights.activeFactories}/${insights.totalFactories} ativas`} />
        <Mini label="Jobs" value={String(insights.totalJobs)} />
        <Mini label="Templates" value={String(insights.templates)} />
        <Mini label="Schedules" value={String(insights.schedules)} />
        <Mini label="Series" value={String(insights.series)} />
        <Mini label="Reviews" value={String(insights.pendingReviews)} />
        <Mini label="Alertas" value={String(insights.alerts)} />
        <Mini label="Quality" value={`${insights.averageQuality}%`} />
      </CardContent>
    </Card>
  );
}

function FactoryCard({ factoryId, onGenerate }: { factoryId: string; onGenerate: () => void }) {
  const dashboard = getFactoryDashboard(factoryId);
  if (!dashboard) return null;
  const decision = getProductionLimitDecision(dashboard.factory);

  return (
    <div className="rounded-md border border-white/5 bg-secondary/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2"><Badge>{dashboard.factory.status}</Badge><Badge>{dashboard.factory.language}</Badge></div>
          <Link href={`/app/factories/${dashboard.factory.id}`} className="mt-2 block font-display text-lg font-semibold hover:text-primary">{dashboard.factory.name}</Link>
          <p className="mt-1 text-sm text-muted-foreground">{dashboard.factory.description}</p>
        </div>
        <Score value={dashboard.metrics.averageQuality || dashboard.factory.qualityGateThreshold} label="Score" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Mini label="Gerados" value={String(dashboard.metrics.videosGenerated)} />
        <Mini label="Reviews" value={String(dashboard.metrics.pendingReviews)} />
        <Mini label="Creditos" value={String(dashboard.metrics.creditsConsumed)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button className="gap-2" disabled={decision.status === "blocked" || decision.status === "paused"} onClick={onGenerate}><Play className="h-4 w-4" />Rodar</Button>
        <Button asChild variant="outline"><Link href={`/app/factories/${dashboard.factory.id}`}>Detalhes</Link></Button>
        <Badge>{decision.status}</Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{decision.message}</p>
    </div>
  );
}

function AlertsPanel() {
  return (
    <Card>
      <CardHeader><CardTitle>Alertas</CardTitle><CardDescription>Limites, falhas, creditos e revisoes.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {factoryAlerts.map((alert) => (
          <div key={alert.id} className="rounded-md border border-white/5 bg-secondary/40 p-3">
            <div className="flex items-center justify-between gap-2"><p className="font-semibold">{alert.title}</p><Badge>{alert.severity}</Badge></div>
            <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function JobRow({ job, compact = false }: { job: (typeof factoryQueueJobs)[number]; compact?: boolean }) {
  const factory = contentFactories.find((item) => item.id === job.factoryId);
  return (
    <div className={compact ? "space-y-2" : "rounded-md border border-white/5 bg-secondary/40 p-4"}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2"><Badge>{job.status}</Badge><Badge>{factory?.name ?? "Factory"}</Badge></div>
          <p className="mt-2 font-semibold">{job.title}</p>
          <p className="text-sm text-muted-foreground">{job.currentStep} - {job.estimatedTime}</p>
        </div>
        <div className="min-w-32"><Score value={job.qualityScore || job.progress} label={job.qualityScore ? "Quality" : "Progresso"} /></div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${job.progress}%` }} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-white/5 bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold">{value}</p></div>;
}

function Score({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-28 rounded-md border border-white/5 bg-background/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-semibold">{value}%</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(value, 100)}%` }} /></div>
    </div>
  );
}

function Empty({ title, description }: { title: string; description: string }) {
  return <Card><CardContent className="p-8"><p className="font-semibold">{title}</p><p className="text-sm text-muted-foreground">{description}</p></CardContent></Card>;
}
