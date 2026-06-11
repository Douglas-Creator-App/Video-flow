"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Film, PauseCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MagicJobDetail = {
  status: string;
  job: {
    id: string;
    status: string;
    progress: number;
    currentStep: string;
    theme: string;
    format: string;
    aspectRatio: string;
    durationTarget: number;
    costCredits: number;
    videoProjectId?: string;
    errorMessage?: string;
  };
  logs: Array<{ id: string; level: string; message: string; createdAt: string }>;
  steps: Array<{ status: string; label: string; progress: number }>;
};

export function MagicJobProgress({ jobId }: { jobId: string }) {
  const [detail, setDetail] = useState<MagicJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const response = await fetch(`/api/magic/jobs/${jobId}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Falha ao carregar Magic Job.");
      setDetail(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar Magic Job.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (!detail || ["queued", "running", "retrying"].includes(detail.job.status)) void load();
    }, 3000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, detail?.job.status]);

  if (loading && !detail) {
    return <StateCard title="Carregando Magic Job" description="Buscando fila, progresso e logs reais." />;
  }

  if (error && !detail) {
    return <StateCard title="Magic Job indisponivel" description={error} tone="critical" />;
  }

  if (!detail) {
    return <StateCard title="Magic Job nao encontrado" description="Este ID nao existe na fila real ou voce nao tem permissao para acessa-lo." tone="critical" />;
  }

  const job = detail.job;
  const ready = job.status === "completed" && job.videoProjectId;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.98))]">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge>{job.status}</Badge>
              <CardTitle className="mt-3 text-2xl">{job.theme}</CardTitle>
              <CardDescription>{job.currentStep} - {job.progress}% concluido</CardDescription>
            </div>
            <Button variant="outline" className="gap-2" disabled><PauseCircle className="h-4 w-4" />Cancelar pela fila</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Pipeline Magic Mode</span>
              <span>{job.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-gold-light transition-all" style={{ width: `${job.progress}%` }} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Status" value={ready ? "Editor pronto" : job.status} />
            <Metric label="Custo" value={`${job.costCredits} creditos`} />
            <Metric label="Formato" value={`${job.format}${job.aspectRatio ? ` - ${job.aspectRatio}` : ""}`} />
          </div>
          <div className="grid gap-2">
            {detail.steps.map((step) => {
              const done = job.progress >= step.progress;
              return (
                <div key={step.status} className={`flex items-center justify-between rounded-md border p-3 text-sm ${done ? "border-primary/20 bg-primary/10" : "border-white/5 bg-secondary/40"}`}>
                  <span className="flex items-center gap-2">
                    {done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.progress}%</span>
                </div>
              );
            })}
          </div>
          {job.errorMessage ? (
            <div className="flex gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{job.errorMessage}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card className="border-primary/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Film className="h-4 w-4 text-primary" />Resultado</CardTitle>
            <CardDescription>Quando concluir, o video fica pronto para abrir no editor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ready ? (
              <>
                <Button asChild className="w-full"><Link href={`/app/videos/${job.videoProjectId}/editor`}>Abrir no editor</Link></Button>
                <Button asChild variant="outline" className="w-full"><Link href={`/app/videos/${job.videoProjectId}/thumbnails`}>Abrir thumbnails</Link></Button>
              </>
            ) : (
              <Button variant="outline" className="w-full" disabled>Aguardando conclusao real</Button>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={load}><RefreshCw className="h-4 w-4" />Atualizar</Button>
            <Button asChild variant="outline" className="w-full"><Link href="/app/magic">Gerar outro video</Link></Button>
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-card/75">
          <CardHeader>
            <CardTitle>Logs</CardTitle>
            <CardDescription>Eventos reais do worker e da fila.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.logs.length ? detail.logs.map((log) => (
              <p key={log.id} className="rounded-md border border-white/5 bg-secondary/40 p-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{log.level}</span> - {log.message}
              </p>
            )) : <p className="rounded-md border border-white/5 bg-secondary/40 p-2 text-sm text-muted-foreground">Nenhum log registrado ainda.</p>}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function StateCard({ title, description, tone = "neutral" }: { title: string; description: string; tone?: "neutral" | "critical" }) {
  return <Card className={tone === "critical" ? "border-destructive/30" : "border-primary/10"}><CardContent className="p-4"><p className="font-semibold">{title}</p><p className="text-sm text-muted-foreground">{description}</p></CardContent></Card>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-secondary/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
