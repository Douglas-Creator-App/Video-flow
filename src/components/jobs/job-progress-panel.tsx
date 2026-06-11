"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import type { BackgroundJob, BackgroundJobLog, BackgroundJobStatus, BackgroundJobType } from "@/lib/jobs/job-queue";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

type JobsResponse = {
  jobs: BackgroundJob[];
  health: {
    workerActive: boolean;
    pending: number;
    running: number;
    failed: number;
    stuck: number;
    backend?: string;
    heartbeats: Array<{ workerId: string; status: string; lastSeenAt: string }>;
  };
};

export function JobQueueDashboard() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id;
  const [data, setData] = useState<JobsResponse>({ jobs: [], health: { workerActive: false, pending: 0, running: 0, failed: 0, stuck: 0, heartbeats: [] } });
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    if (!workspaceId) return;
    const params = new URLSearchParams();
    params.set("workspace_id", workspaceId);
    if (status !== "all") params.set("status", status);
    if (type !== "all") params.set("type", type);
    const response = await fetch(`/api/jobs?${params.toString()}`, { cache: "no-store" });
    const json = await response.json();
    setData(json);
    if (!selectedId && json.jobs?.[0]?.id) setSelectedId(json.jobs[0].id);
  }

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(interval);
  }, [status, type, workspaceId]);

  useEffect(() => {
    setSelectedId("");
  }, [workspaceId]);

  async function processNext() {
    setMessage("Processando proximo job...");
    const response = await fetch("/api/jobs/process-next", { method: "POST" });
    const json = await response.json();
    setMessage(json.message ?? `${json.status}: ${json.job_id ?? "sem job"}`);
    await load();
  }

  const selected = data.jobs.find((job) => job.id === selectedId) ?? data.jobs[0];
  const metrics = [
    ["Pendentes", data.health.pending],
    ["Rodando", data.health.running],
    ["Falhos", data.health.failed],
    ["Travados", data.health.stuck]
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-primary/20 bg-card/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{data.health.workerActive ? "worker ativo" : "worker inativo"}</Badge>
              <Badge>{data.health.backend ?? "local_dev"}</Badge>
              <span className="text-sm text-muted-foreground">Use `npm run worker` para processamento continuo.</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{message || "Fila real de background com polling, retry, cancelamento, logs e lock por job."}</p>
          </div>
          <Button onClick={processNext} className="gap-2"><Play className="h-4 w-4" />Processar proximo job</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {metrics.map(([label, value]) => <Metric key={label} label={String(label)} value={String(value)} />)}
      </div>

      <Card>
        <CardHeader>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px] lg:items-end">
            <div>
              <CardTitle>Fila de background</CardTitle>
              <CardDescription>Jobs de Magic Mode, IA, voz, imagens, render, export, cortes, video IA, factories e backups.</CardDescription>
            </div>
            <SelectField value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Todos os status</option>
              {["queued", "running", "completed", "failed", "cancelled", "retrying"].map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectField>
            <SelectField value={type} onChange={(event) => setType(event.target.value)}>
              <option value="all">Todos os tipos</option>
              {jobTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectField>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <div className="space-y-3">
            {data.jobs.length ? data.jobs.map((job) => (
              <button key={job.id} onClick={() => setSelectedId(job.id)} className={`w-full rounded-md border p-3 text-left transition ${selected?.id === job.id ? "border-primary/50 bg-primary/10" : "border-white/5 bg-secondary/35 hover:border-primary/25"}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusIcon status={job.status} />
                      <p className="font-semibold">{job.type}</p>
                      <Badge>{job.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{job.currentStep} - tentativa {job.attempts}/{job.maxAttempts}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString("pt-BR")}</p>
                </div>
                <Progress value={job.progress} />
              </button>
            )) : <EmptyQueue />}
          </div>
          {selected ? <JobProgressPanel jobId={selected.id} initialJob={selected} onChanged={load} /> : <EmptyQueue />}
        </CardContent>
      </Card>
    </div>
  );
}

export function JobProgressPanel({ jobId, initialJob, onChanged }: { jobId: string; initialJob?: BackgroundJob; onChanged?: () => void }) {
  const [job, setJob] = useState<BackgroundJob | undefined>(initialJob);
  const [logs, setLogs] = useState<BackgroundJobLog[]>([]);
  const canCancel = job ? ["queued", "retrying", "running"].includes(job.status) : false;
  const canRetry = job ? ["failed", "cancelled"].includes(job.status) : false;

  async function load() {
    const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
    const json = await response.json();
    if (response.ok) {
      setJob(json.job);
      setLogs(json.logs ?? []);
    }
  }

  useEffect(() => {
    setJob(initialJob);
    void load();
  }, [jobId, initialJob?.updatedAt]);

  async function action(kind: "retry" | "cancel") {
    await fetch(`/api/jobs/${jobId}/${kind}`, { method: "POST" });
    await load();
    onChanged?.();
  }

  if (!job) return null;

  return (
    <Card className="border-primary/15 bg-card/75">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge>{job.status}</Badge>
            <CardTitle className="mt-2 text-lg">{job.type}</CardTitle>
            <CardDescription>{job.id}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => action("retry")} disabled={!canRetry} className="gap-2"><RotateCcw className="h-4 w-4" />Retry</Button>
            <Button size="sm" variant="outline" onClick={() => action("cancel")} disabled={!canCancel} className="gap-2"><XCircle className="h-4 w-4" />Cancelar</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={job.progress} />
        <div className="grid gap-2 text-sm">
          <Row label="Etapa" value={job.currentStep} />
          <Row label="Prioridade" value={String(job.priority)} />
          <Row label="Tentativas" value={`${job.attempts}/${job.maxAttempts}`} />
          <Row label="Lock" value={job.lockedBy ? `${job.lockedBy} ate ${job.lockExpiredAt}` : "livre"} />
          {job.errorMessage ? <Row label="Erro" value={job.errorMessage} danger /> : null}
        </div>
        <PipelineExecutionView job={job} logs={logs} />
        <div className="space-y-2">
          <p className="text-sm font-semibold">Logs</p>
          <div className="max-h-64 space-y-2 overflow-auto rounded-md border border-white/5 bg-secondary/30 p-2">
            {logs.length ? logs.slice(-12).map((log) => (
              <div key={log.id} className="rounded border border-white/5 bg-background/50 p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <Badge>{log.level}</Badge>
                  <span className="text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString("pt-BR")}</span>
                </div>
                <p className="mt-1 text-sm">{log.message}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">Sem logs ainda.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineExecutionView({ job, logs }: { job: BackgroundJob; logs: BackgroundJobLog[] }) {
  const result = (job.result ?? {}) as Record<string, unknown>;
  const steps = pipelineSteps(job, logs, result);
  const artifacts = [
    ["Video Project", String(result.video_project_id ?? nested(result, "videoProject", "id") ?? nested(result, "job", "videoProjectId") ?? "")],
    ["MP4", String(result.render_url ?? nested(result, "package", "videoUrl") ?? "")],
    ["Thumbnail", String(result.thumbnail_url ?? result.thumbnailUrl ?? "")],
    ["ZIP", String(result.package_url ?? nested(result, "package", "packageUrl") ?? "")]
  ].filter(([, value]) => value);

  return (
    <div className="rounded-md border border-primary/15 bg-primary/5 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Pipeline Execution</p>
        <Badge>{job.progress}%</Badge>
      </div>
      <div className="grid gap-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center justify-between gap-3 rounded border border-white/5 bg-background/45 px-2 py-1.5 text-xs">
            <span>{step.label}</span>
            <Badge>{step.status}</Badge>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Artefatos</p>
        {artifacts.length ? artifacts.map(([label, value]) => (
          <p key={label} className="truncate rounded border border-white/5 bg-background/45 px-2 py-1 text-xs"><span className="text-muted-foreground">{label}: </span>{value}</p>
        )) : <p className="rounded border border-white/5 bg-background/45 px-2 py-1 text-xs text-muted-foreground">Artefatos aparecem aqui quando o worker concluir etapas reais.</p>}
      </div>
    </div>
  );
}

function pipelineSteps(job: BackgroundJob, logs: BackgroundJobLog[], result: Record<string, unknown>) {
  const logText = logs.map((log) => `${log.message} ${JSON.stringify(log.metadata ?? {})}`).join(" ").toLowerCase();
  const has = (value: string) => logText.includes(value) || JSON.stringify(result).toLowerCase().includes(value);
  const completed = job.status === "completed";
  const failed = job.status === "failed";
  return [
    { label: "Magic", status: job.type === "magic_video" ? statusFor(completed, failed, job.progress >= 15) : has("magic") ? "done" : "waiting" },
    { label: "Projeto", status: has("videoprojectid") || has("video_project") || has("persistido") ? "done" : "waiting" },
    { label: "TTS", status: has("tts") || has("narracao") ? "done" : "waiting" },
    { label: "Imagens", status: has("image") || has("imagem") || has("imagens") ? "done" : "waiting" },
    { label: "Render", status: job.type === "render_video" ? statusFor(completed, failed, job.progress >= 35) : has("render_url") || has("mp4") ? "done" : "waiting" },
    { label: "Export ZIP", status: job.type === "export_package" ? statusFor(completed, failed, job.progress >= 45) : has("zip") || has("packageurl") ? "done" : "waiting" }
  ];
}

function statusFor(completed: boolean, failed: boolean, started: boolean) {
  if (completed) return "done";
  if (failed) return "failed";
  return started ? "running" : "waiting";
}

function nested(source: Record<string, unknown>, key: string, child: string) {
  const value = source[key];
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[child];
}

const jobTypes: BackgroundJobType[] = ["magic_video", "ai_generation", "tts_generation", "image_generation", "render_video", "export_package", "viral_clip", "text_to_video", "image_to_video", "talking_character", "backup", "factory_generation"];

function StatusIcon({ status }: { status: BackgroundJobStatus }) {
  const className = "h-4 w-4";
  if (status === "completed") return <CheckCircle2 className={`${className} text-emerald-400`} />;
  if (status === "failed" || status === "cancelled") return <AlertTriangle className={`${className} text-red-400`} />;
  if (status === "running") return <Loader2 className={`${className} animate-spin text-primary`} />;
  return <Clock3 className={`${className} text-muted-foreground`} />;
}

function Progress({ value }: { value: number }) {
  return <div className="mt-3 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-semibold">{value}</p></CardContent></Card>;
}

function Row({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div className="flex items-start justify-between gap-3 rounded-md border border-white/5 bg-secondary/30 p-2"><span className="text-muted-foreground">{label}</span><span className={`max-w-[260px] text-right ${danger ? "text-red-300" : "text-foreground"}`}>{value}</span></div>;
}

function EmptyQueue() {
  return <div className="rounded-md border border-dashed border-white/10 bg-secondary/20 p-8 text-center text-sm text-muted-foreground">Nenhum job encontrado para os filtros atuais.</div>;
}
