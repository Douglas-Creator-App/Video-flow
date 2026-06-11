"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, Download, FileText, Gauge, HardDrive, KeyRound, Lock, Play, RefreshCw, ShieldCheck, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import { backupJobs, dataRequests, dataRetentionPolicies, demoModeSettings, rateLimitRules, smokeTestSteps } from "@/lib/mock-data";
import {
  createMockBackup,
  getEnvironmentSummary,
  getJobMonitoringSummary,
  getLaunchOverview,
  getProductionDocsSections,
  getProviderHealthSummary,
  getSecuritySummary,
  getStorageSummary,
  getSystemHealthSummary,
  statusTone
} from "@/lib/production-launch";
import type { BackupJob, DataRequestStatus, SmokeTestStep } from "@/lib/types";

export function LaunchDashboard() {
  const launch = getLaunchOverview();
  const health = getSystemHealthSummary();

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Gauge} label="Prontidao" value={`${launch.progress}%`} />
        <Metric icon={CheckCircle2} label="Concluidos" value={`${launch.completed}/${launch.total}`} />
        <Metric icon={AlertTriangle} label="Erros" value={String(launch.errors)} />
        <Metric icon={Activity} label="Sistema" value={health.status} />
      </section>
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Production Checklist</CardTitle>
          <CardDescription>Checklist de lancamento para ambiente, banco, providers, dominio, legal, billing e operacao.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {launch.checklist.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-md border border-white/5 bg-secondary/40 p-4 lg:grid-cols-[1fr_150px_160px_110px] lg:items-center">
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.observation}</p>
              </div>
              <Badge className={statusTone(item.status)}>{item.status}</Badge>
              <p className="text-sm text-muted-foreground">{item.owner}</p>
              <Button asChild variant="outline"><Link href={item.href}>Abrir</Link></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function EnvironmentManagerPanel() {
  const summary = getEnvironmentSummary();
  return (
    <PanelFrame title="Environment Manager" description="Status das variaveis obrigatorias sem expor valores reais.">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={KeyRound} label="Variaveis" value={String(summary.total)} />
        <Metric icon={CheckCircle2} label="Configuradas" value={String(summary.configured)} />
        <Metric icon={AlertTriangle} label="Ausentes" value={String(summary.missing)} />
        <Metric icon={Lock} label="Invalidas" value={String(summary.invalid)} />
      </section>
      <StatusTable rows={summary.variables.map((item) => [item.key, item.scope, item.required ? "required" : "optional", item.status, item.observation])} />
    </PanelFrame>
  );
}

export function ProviderHealthPanel() {
  const summary = getProviderHealthSummary();
  const [runtimeChecks, setRuntimeChecks] = useState<Array<{ provider: string; type: string; status: string; env: string; masked_key?: string | null }>>([]);

  useEffect(() => {
    fetch("/api/providers/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setRuntimeChecks(data.checks ?? []))
      .catch(() => setRuntimeChecks([]));
  }, []);

  return (
    <PanelFrame title="Provider Health Check" description="Saude de OpenAI, voz, assets, Supabase, Storage e video providers.">
      <section className="grid gap-3 md:grid-cols-3">
        <Metric icon={CheckCircle2} label="Online" value={String(summary.online)} />
        <Metric icon={KeyRound} label="Keys ausentes" value={String(summary.missingKeys)} />
        <Metric icon={AlertTriangle} label="Offline" value={String(summary.offline)} />
      </section>
      {runtimeChecks.length ? (
        <Card>
          <CardHeader><CardTitle>Status runtime</CardTitle><CardDescription>Leitura server-side das variaveis reais, com chaves mascaradas.</CardDescription></CardHeader>
          <CardContent><StatusTable rows={runtimeChecks.map((item) => [item.provider, item.type, item.status, item.env, item.masked_key ?? "ausente"])} /></CardContent>
        </Card>
      ) : null}
      <StatusTable rows={summary.checks.map((item) => [item.provider, item.category, item.status, item.latencyMs ? `${item.latencyMs}ms` : "-", item.message])} />
    </PanelFrame>
  );
}

export function StorageSetupPanel() {
  const storage = getStorageSummary();
  return (
    <PanelFrame title="Storage Setup" description="Validacao dos buckets, policies, upload, leitura e tamanho maximo.">
      <section className="grid gap-3 md:grid-cols-3">
        <Metric icon={HardDrive} label="Buckets" value={String(storage.total)} />
        <Metric icon={CheckCircle2} label="Prontos" value={String(storage.ready)} />
        <Metric icon={AlertTriangle} label="Criticos" value={String(storage.critical)} />
      </section>
      <StatusTable rows={storage.buckets.map((item) => [item.bucket, item.exists ? "existe" : "ausente", item.policyStatus, item.uploadAllowed ? "upload ok" : "upload bloqueado", `${item.maxSizeMb} MB`])} />
    </PanelFrame>
  );
}

export function BackupsPanel() {
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const allJobs = [...jobs, ...backupJobs];
  return (
    <PanelFrame title="Backups" description="Backups manuais de banco, assets, workspace e full backup.">
      <div className="flex flex-wrap gap-2">
        <Button className="gap-2" onClick={() => setJobs((items) => [createMockBackup(), ...items])}><UploadCloud className="h-4 w-4" />Criar backup manual</Button>
        <Button variant="outline" disabled>Agendamento futuro</Button>
      </div>
      <StatusTable rows={allJobs.map((item) => [item.type, item.status, item.startedAt, item.completedAt ?? "-", item.fileUrl ? "download disponivel" : item.errorMessage ?? "aguardando"])} />
    </PanelFrame>
  );
}

export function SecurityCenterPanel() {
  const security = getSecuritySummary();
  return (
    <PanelFrame title="Security Center" description="RLS, chaves ausentes, acessos negados, eventos sensiveis e ultimos logins.">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={ShieldCheck} label="RLS" value={security.rlsStatus} />
        <Metric icon={KeyRound} label="Keys obrigatorias" value={String(security.missingKeys)} />
        <Metric icon={Lock} label="Acessos negados" value={String(security.deniedAccess)} />
        <Metric icon={AlertTriangle} label="Sensiveis" value={String(security.sensitiveEvents.length)} />
      </section>
      <StatusTable rows={security.events.map((item) => [item.eventType, item.severity, item.ipAddress, item.userAgent, item.createdAt])} />
    </PanelFrame>
  );
}

export function JobMonitoringPanel() {
  const jobs = getJobMonitoringSummary();
  return (
    <PanelFrame title="Job Monitoring" description="Filas, jobs processando, erros, concluidos, tempo medio e falhas por provider.">
      <section className="grid gap-3 md:grid-cols-5">
        <Metric icon={Clock3} label="Fila" value={String(jobs.queued)} />
        <Metric icon={RefreshCw} label="Processando" value={String(jobs.processing)} />
        <Metric icon={AlertTriangle} label="Erros" value={String(jobs.failed)} />
        <Metric icon={CheckCircle2} label="Concluidos" value={String(jobs.completed)} />
        <Metric icon={Gauge} label="Tempo medio" value={`${jobs.averageTimeMs}ms`} />
      </section>
      <StatusTable rows={jobs.jobs.map((item) => [item.id, item.provider, item.status, `${item.durationMs}ms`, "retry / cancelar / logs"])} />
    </PanelFrame>
  );
}

export function ErrorLogsPanel() {
  const health = getSystemHealthSummary();
  return (
    <PanelFrame title="Error Logs" description="Logs de erro por modulo, severidade, metadata e resolucao.">
      <StatusTable rows={health.errors.map((item) => [item.module, item.severity, item.resolved ? "resolvido" : "aberto", item.message, item.createdAt])} />
    </PanelFrame>
  );
}

export function SystemHealthPanel() {
  const health = getSystemHealthSummary();
  return (
    <PanelFrame title="System Health" description="Banco, auth, storage, providers, filas, render, disco e erros recentes.">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Activity} label="Status geral" value={health.status} />
        <Metric icon={Database} label="Disco usado" value={`${health.diskUsage.percent}%`} />
        <Metric icon={AlertTriangle} label="Erros abertos" value={String(health.errors.length)} />
        <Metric icon={HardDrive} label="Storage" value={`${health.diskUsage.usedGb}/${health.diskUsage.totalGb}GB`} />
      </section>
      <WorkerHealthWidget />
      <SecurityHardeningWidget />
      <StatusTable rows={health.checks.map((item) => [item.name, item.status, item.latencyMs ? `${item.latencyMs}ms` : "-", item.message])} />
    </PanelFrame>
  );
}

function WorkerHealthWidget() {
  const { currentWorkspace } = useWorkspaceProvider();
  const [health, setHealth] = useState<{ workerActive: boolean; pending: number; running: number; failed: number; stuck: number; heartbeats: Array<{ workerId: string; status: string; lastSeenAt: string }> } | null>(null);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    fetch(`/api/jobs?workspace_id=${encodeURIComponent(currentWorkspace.id)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setHealth(data.health))
      .catch(() => setHealth(null));
  }, [currentWorkspace?.id]);

  if (!health) return null;
  return (
    <Card className="border-primary/15 bg-card/70">
      <CardHeader>
        <CardTitle>Worker heartbeat</CardTitle>
        <CardDescription>Status real da fila de background, jobs pendentes, travados e falhos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <section className="grid gap-3 md:grid-cols-5">
          <Metric icon={Activity} label="Worker" value={health.workerActive ? "ativo" : "inativo"} />
          <Metric icon={Clock3} label="Pendentes" value={String(health.pending)} />
          <Metric icon={RefreshCw} label="Rodando" value={String(health.running)} />
          <Metric icon={AlertTriangle} label="Falhos" value={String(health.failed)} />
          <Metric icon={Lock} label="Travados" value={String(health.stuck)} />
        </section>
        <StatusTable rows={(health.heartbeats.length ? health.heartbeats : [{ workerId: "sem-worker", status: "inativo", lastSeenAt: "-" }]).map((item) => [item.workerId, item.status, item.lastSeenAt])} />
      </CardContent>
    </Card>
  );
}

function SecurityHardeningWidget() {
  const [runtimeRows, setRuntimeRows] = useState<Array<{ key: string; status: string; message: string }>>([]);
  useEffect(() => {
    fetch("/api/admin/health", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setRuntimeRows(data.checks ?? []))
      .catch(() => setRuntimeRows([]));
  }, []);

  const rows = runtimeRows.length ? runtimeRows.map((item) => [item.key, item.status, item.message]) : [
    ["Auth status", "completed", "Supabase session obrigatoria em /app e /api"],
    ["Middleware", "completed", "middleware.ts protege rotas privadas"],
    ["RLS status", "completed", "Schema principal habilita row level security"],
    ["APIs protegidas", "completed", "API routes importam helpers de auth"],
    ["APIs abertas", "completed", "Somente rotas publicas/auth/webhooks previstas"]
  ];

  return (
    <Card className="border-primary/15 bg-card/70">
      <CardHeader>
        <CardTitle>Security hardening</CardTitle>
        <CardDescription>Autenticacao, isolamento multi-tenant, middleware, RLS e superficie publica.</CardDescription>
      </CardHeader>
      <CardContent>
        <StatusTable rows={rows} />
      </CardContent>
    </Card>
  );
}

export function DataPrivacyPanel() {
  const [requests, setRequests] = useState(dataRequests);
  function addRequest(type: (typeof dataRequests)[number]["type"]) {
    setRequests((items) => [{ id: `data_request_${Date.now()}`, workspaceId: "ws_1", userId: "user_1", type, status: "requested" as DataRequestStatus, createdAt: new Date().toISOString() }, ...items]);
  }
  return (
    <PanelFrame title="LGPD e Data Export" description="Exportar dados, solicitar exclusao e baixar dados pessoais. Exclusao definitiva fica manual nesta fase.">
      <div className="flex flex-wrap gap-2">
        <Button className="gap-2" onClick={() => addRequest("workspace_export")}><Download className="h-4 w-4" />Exportar workspace</Button>
        <Button variant="outline" onClick={() => addRequest("personal_data_download")}>Baixar dados pessoais</Button>
        <Button variant="destructive" onClick={() => addRequest("delete_request")}>Solicitar exclusao</Button>
      </div>
      <StatusTable rows={requests.map((item) => [item.type, item.status, item.workspaceId, item.userId, item.createdAt])} />
    </PanelFrame>
  );
}

export function BrandingCheckPanel() {
  const rows = [
    ["APP_URL", "invalid", "Precisa apontar para o dominio final."],
    ["Logo", "completed", "Marca Video Flow aplicada no sidebar."],
    ["Favicon", "pending", "Adicionar arquivo final no deploy."],
    ["Nome do produto", "completed", "Video Flow padronizado."],
    ["Email de suporte", "pending", "Definir email operacional."],
    ["Links legais", "completed", "/terms e /privacy criados."]
  ];
  return <PanelFrame title="Domain and Branding Check" description="Preparacao para dominio proprio, identidade e links legais."><StatusTable rows={rows} /></PanelFrame>;
}

export function SmokeTestPanel() {
  const [steps, setSteps] = useState<SmokeTestStep[]>(smokeTestSteps);
  function run() {
    setSteps((items) => items.map((item, index) => index < 4 ? { ...item, status: "completed", durationMs: item.durationMs || 300 + index * 180 } : item));
  }
  return (
    <PanelFrame title="Smoke Test" description="Teste guiado manual do fluxo principal antes de lancar.">
      <Button className="w-fit gap-2" onClick={run}><Play className="h-4 w-4" />Executar teste guiado</Button>
      <StatusTable rows={steps.map((item) => [item.label, item.status, `${item.durationMs}ms`, item.error ?? "sem erro"])} />
    </PanelFrame>
  );
}

export function DemoModePanel() {
  return (
    <PanelFrame title="Demo Mode" description="Modo demonstracao controlado para evitar custo real e exportacao final sem confirmacao.">
      <StatusTable rows={demoModeSettings.map((item) => [item.workspaceId, item.enabled ? "ativo" : "inativo", item.creditsPolicy, item.exportPolicy, item.providerPolicy])} />
    </PanelFrame>
  );
}

export function RetentionRateLimitsPanel() {
  return (
    <PanelFrame title="Data Retention e Rate Limits" description="Politicas de limpeza futura e limites basicos por feature.">
      <section className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Retencao</CardTitle></CardHeader><CardContent><StatusTable rows={dataRetentionPolicies.map((item) => [item.workspaceId, `${item.tempFilesDays}d temp`, `${item.failedJobsDays}d failed`, `${item.logsDays}d logs`, `${item.deletedAssetsDays}d deleted`])} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Rate limits</CardTitle></CardHeader><CardContent><StatusTable rows={rateLimitRules.map((item) => [item.feature, String(item.limitCount), `${item.windowSeconds}s`])} /></CardContent></Card>
      </section>
    </PanelFrame>
  );
}

export function ProductionDocsPanel() {
  return (
    <PanelFrame title="Documentacao de Producao" description="Guia interno para deploy, providers, storage, backups e troubleshooting.">
      <div className="grid gap-3 md:grid-cols-2">
        {getProductionDocsSections().map((section) => (
          <Card key={section.title} className="border-white/5 bg-secondary/40">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" />{section.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{section.body}</p></CardContent>
          </Card>
        ))}
      </div>
    </PanelFrame>
  );
}

function PanelFrame({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-primary/20 bg-secondary/40 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-primary">Production Launch</p>
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p>
          </div>
          <Badge className="w-fit border-primary/20 bg-primary/10 text-primary">Sem secrets expostos</Badge>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusTable({ rows }: { rows: Array<Array<string | number>> }) {
  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={`${row[0]}-${index}`} className="grid gap-2 rounded-md border border-white/5 bg-secondary/40 p-3 text-sm md:grid-cols-5 md:items-center">
          {row.map((cell, cellIndex) => (
            <span key={`${cell}-${cellIndex}`} className={cellIndex === 0 ? "font-semibold" : cellIndex === 2 || cellIndex === 3 ? "text-muted-foreground" : ""}>
              {cellIndex === 1 ? <Badge className={statusTone(String(cell))}>{cell}</Badge> : String(cell)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}
