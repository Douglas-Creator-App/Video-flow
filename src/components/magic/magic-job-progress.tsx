"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Film, PauseCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { magicVideoJobs } from "@/lib/mock-data";
import { magicSteps } from "@/lib/magic/magic-pipeline";

export function MagicJobProgress({ jobId }: { jobId: string }) {
  const job = magicVideoJobs.find((item) => item.id === jobId) ?? magicVideoJobs[0];
  const logs = [
    "Workspace validado",
    "Rate limit checado",
    "Creditos estimados calculados",
    job.status === "ready_for_editor" ? "Projeto criado e pronto para editor" : job.errorMessage ?? "Aguardando processamento"
  ];
  const ready = job.status === "ready_for_editor" && job.videoProjectId;

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
            <Button variant="outline" className="gap-2" disabled><PauseCircle className="h-4 w-4" />Cancelamento exige fila real</Button>
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
            <Metric label="Tempo estimado" value={ready ? "Finalizado" : "2 min"} />
            <Metric label="Custo" value={`${job.costCredits} creditos`} />
            <Metric label="Formato" value={`${job.format} - ${job.aspectRatio}`} />
          </div>
          <div className="grid gap-2">
            {magicSteps.map((step) => {
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
              <Button variant="outline" className="w-full" disabled>Aguardando conclusao</Button>
            )}
            <Button asChild variant="outline" className="w-full"><Link href="/app/magic">Gerar outro video</Link></Button>
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-card/75">
          <CardHeader>
            <CardTitle>Logs</CardTitle>
            <CardDescription>Eventos do pipeline e auditoria operacional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.map((log) => <p key={log} className="rounded-md border border-white/5 bg-secondary/40 p-2 text-sm text-muted-foreground">{log}</p>)}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-secondary/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
