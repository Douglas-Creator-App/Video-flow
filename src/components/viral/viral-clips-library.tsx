"use client";

import Link from "next/link";
import { Copy, Download, Film, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sourceVideos, viralClips } from "@/lib/mock-data";

export function ViralClipsLibrary() {
  const completed = viralClips.filter((clip) => clip.status === "completed").length;
  const totalDuration = viralClips.reduce((total, clip) => total + clip.durationSeconds, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Cortes gerados" value={String(viralClips.length)} />
        <Metric label="Concluidos" value={String(completed)} />
        <Metric label="Duracao total" value={`${totalDuration}s`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {viralClips.map((clip) => {
          const source = sourceVideos.find((item) => item.id === clip.sourceVideoId);
          return (
            <Card key={clip.id} className="overflow-hidden border-primary/10 bg-card/75 transition hover:border-primary/25">
              <div className="grid aspect-video place-items-center border-b border-white/5 bg-black/70">
                <Film className="h-8 w-8 text-primary" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{clip.title}</CardTitle>
                    <CardDescription>{source?.title ?? "Fonte"} - {clip.durationSeconds}s - {clip.aspectRatio}</CardDescription>
                  </div>
                  <Badge>{clip.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Legenda: {clip.subtitleStyle}</span>
                  <span>Reframe: {clip.reframeMode}</span>
                  <span>Inicio: {clip.startTime}s</span>
                  <span>Fim: {clip.endTime}s</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2" disabled><Download className="h-4 w-4" />Storage pendente</Button>
                  <Button variant="outline" className="gap-2" disabled><Pencil className="h-4 w-4" />Editor pendente</Button>
                  <Button variant="outline" className="gap-2" disabled><Copy className="h-4 w-4" />Persistencia pendente</Button>
                  <Button variant="destructive" className="gap-2" disabled><Trash2 className="h-4 w-4" />Excluir pendente</Button>
                </div>
                <Button asChild className="w-full"><Link href={`/app/viral-clips/${clip.viralClipJobId}/review`}>Abrir revisao</Link></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-primary/10 bg-secondary/40">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
