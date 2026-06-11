"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

type MagicJobRow = {
  id: string;
  status: string;
  progress: number;
  currentStep: string;
  theme: string;
  projectId: string;
  format: string;
  aspectRatio: string;
  durationTarget: number;
  costCredits: number;
  videoProjectId?: string;
  errorMessage?: string;
  createdAt: string;
};

export function MagicHistory() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [jobs, setJobs] = useState<MagicJobRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!workspaceId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/magic/jobs?workspace_id=${encodeURIComponent(workspaceId)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Falha ao carregar Magic Jobs.");
      setJobs(payload.jobs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar Magic Jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const totals = useMemo(() => ({
    completed: jobs.filter((job) => job.status === "completed").length,
    failed: jobs.filter((job) => job.status === "failed").length,
    credits: jobs.reduce((total, job) => total + job.costCredits, 0).toFixed(1)
  }), [jobs]);

  if (!workspaceId) {
    return <StateCard title="Nenhum workspace selecionado" description="Selecione um workspace para listar Magic Jobs reais." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Jobs concluidos" value={String(totals.completed)} />
        <SummaryCard label="Jobs com erro" value={String(totals.failed)} />
        <SummaryCard label="Creditos estimados" value={totals.credits} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/15 bg-card/70 p-3">
        <div>
          <p className="text-sm font-semibold">Historico real do Magic</p>
          <p className="text-xs text-muted-foreground">Fonte: background_jobs filtrado por workspace e type magic_video.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={load} disabled={loading}><RotateCcw className="h-4 w-4" />Atualizar</Button>
      </div>

      {error ? <StateCard title="Erro ao carregar" description={error} tone="critical" /> : null}
      {loading && !jobs.length ? <StateCard title="Carregando" description="Buscando jobs reais do workspace." /> : null}
      {!loading && !error && !jobs.length ? <StateCard title="Sem Magic Jobs" description="Gere o primeiro video pelo Magic Mode para preencher este historico." /> : null}

      {jobs.map((job) => {
        const ready = job.status === "completed" && job.videoProjectId;
        return (
          <Card key={job.id} className="border-primary/10 bg-card/75 transition hover:border-primary/25">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{job.status}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(job.createdAt)}</span>
                  </div>
                  <CardTitle className="mt-3">{job.theme}</CardTitle>
                  <CardDescription>{job.format} - {job.durationTarget}s - {job.costCredits} creditos</CardDescription>
                </div>
                <StatusIcon ready={Boolean(ready)} failed={job.status === "failed"} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${job.progress}%` }} />
                </div>
                <p className="text-sm text-muted-foreground">{job.currentStep}{job.errorMessage ? ` - ${job.errorMessage}` : ""}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline"><Link href={`/app/magic/${job.id}`}>Acompanhar</Link></Button>
                {ready ? <Button asChild><Link href={`/app/videos/${job.videoProjectId}/editor`}>Abrir editor</Link></Button> : null}
                <Button asChild variant="outline" className="gap-2"><Link href="/app/magic"><RotateCcw className="h-4 w-4" />Reusar</Link></Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-primary/10 bg-secondary/40">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function StateCard({ title, description, tone = "neutral" }: { title: string; description: string; tone?: "neutral" | "critical" }) {
  return (
    <Card className={tone === "critical" ? "border-destructive/30" : "border-primary/10"}>
      <CardContent className="p-4">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ ready, failed }: { ready: boolean; failed: boolean }) {
  if (ready) return <CheckCircle2 className="h-6 w-6 text-primary" />;
  if (failed) return <AlertTriangle className="h-6 w-6 text-destructive" />;
  return <Clock className="h-6 w-6 text-muted-foreground" />;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
