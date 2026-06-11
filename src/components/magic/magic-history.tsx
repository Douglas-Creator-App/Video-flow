"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Film, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { magicVideoJobs, projects } from "@/lib/mock-data";

export function MagicHistory() {
  const completed = magicVideoJobs.filter((job) => job.status === "ready_for_editor").length;
  const failed = magicVideoJobs.filter((job) => job.status === "failed").length;
  const credits = magicVideoJobs.reduce((total, job) => total + job.costCredits, 0).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Jobs concluidos" value={String(completed)} />
        <SummaryCard label="Jobs com erro" value={String(failed)} />
        <SummaryCard label="Creditos estimados" value={credits} />
      </div>
      {magicVideoJobs.map((job) => {
        const project = projects.find((item) => item.id === job.projectId);
        const ready = job.status === "ready_for_editor";
        return (
          <Card key={job.id} className="border-primary/10 bg-card/75 transition hover:border-primary/25">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{job.status}</Badge>
                    <span className="text-xs text-muted-foreground">{job.createdAt}</span>
                  </div>
                  <CardTitle className="mt-3">{job.theme}</CardTitle>
                  <CardDescription>{project?.name ?? "Projeto"} - {job.format} - {job.durationTarget}s - {job.costCredits} creditos</CardDescription>
                </div>
                <StatusIcon ready={ready} failed={job.status === "failed"} />
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
                {ready && job.videoProjectId ? <Button asChild><Link href={`/app/videos/${job.videoProjectId}/editor`}>Abrir editor</Link></Button> : null}
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

function StatusIcon({ ready, failed }: { ready: boolean; failed: boolean }) {
  if (ready) return <CheckCircle2 className="h-6 w-6 text-primary" />;
  if (failed) return <AlertTriangle className="h-6 w-6 text-destructive" />;
  return <Clock className="h-6 w-6 text-muted-foreground" />;
}
