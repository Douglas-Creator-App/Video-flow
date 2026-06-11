"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Copy, Download, Film, Loader2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

type ClipRow = {
  id: string;
  viral_clip_job_id: string;
  source_video_id: string;
  title: string;
  duration_seconds: number;
  aspect_ratio: string;
  subtitle_style: string;
  reframe_mode: string;
  start_time: number;
  end_time: number;
  render_url?: string | null;
  status: string;
};

type SourceVideoRow = {
  id: string;
  title: string;
};

export function ViralClipsLibrary() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [clips, setClips] = useState<ClipRow[]>([]);
  const [sources, setSources] = useState<SourceVideoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/viral-clips/jobs?workspace_id=${encodeURIComponent(workspaceId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Falha ao carregar biblioteca.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setClips(data.clips ?? []);
        setSources(data.source_videos ?? []);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Falha ao carregar biblioteca.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);

  const completed = clips.filter((clip) => clip.status === "completed").length;
  const totalDuration = useMemo(() => clips.reduce((total, clip) => total + Number(clip.duration_seconds ?? 0), 0), [clips]);

  if (!workspaceId) {
    return <StateCard icon={AlertTriangle} title="Workspace obrigatorio" description="Selecione um workspace para carregar a biblioteca real de cortes." />;
  }

  if (loading) {
    return <StateCard icon={Loader2} title="Carregando biblioteca" description="Consultando cortes persistidos no workspace atual." spin />;
  }

  if (error) {
    return <StateCard icon={AlertTriangle} title="Falha ao carregar" description={error} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Cortes gerados" value={String(clips.length)} />
        <Metric label="Concluidos" value={String(completed)} />
        <Metric label="Duracao total" value={`${Math.round(totalDuration)}s`} />
      </div>
      {clips.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clips.map((clip) => {
            const source = sources.find((item) => item.id === clip.source_video_id);
            return (
              <Card key={clip.id} className="overflow-hidden border-primary/10 bg-card/75 transition hover:border-primary/25">
                <div className="grid aspect-video place-items-center border-b border-white/5 bg-black/70">
                  <Film className="h-8 w-8 text-primary" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{clip.title}</CardTitle>
                      <CardDescription>{source?.title ?? "Fonte"} - {clip.duration_seconds}s - {clip.aspect_ratio}</CardDescription>
                    </div>
                    <Badge>{clip.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Legenda: {clip.subtitle_style}</span>
                    <span>Reframe: {clip.reframe_mode}</span>
                    <span>Inicio: {clip.start_time}s</span>
                    <span>Fim: {clip.end_time}s</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild={Boolean(clip.render_url)} variant="outline" className="gap-2" disabled={!clip.render_url}>
                      {clip.render_url ? <a href={clip.render_url} download><Download className="h-4 w-4" />Download</a> : <span><Download className="h-4 w-4" />Storage pendente</span>}
                    </Button>
                    <Button variant="outline" className="gap-2" disabled><Pencil className="h-4 w-4" />Editor pendente</Button>
                    <Button variant="outline" className="gap-2" disabled><Copy className="h-4 w-4" />Duplicar pendente</Button>
                    <Button variant="destructive" className="gap-2" disabled><Trash2 className="h-4 w-4" />Excluir pendente</Button>
                  </div>
                  <Button asChild className="w-full"><Link href={`/app/viral-clips/${clip.viral_clip_job_id}/review`}>Abrir revisao</Link></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <StateCard icon={Film} title="Nenhum corte real ainda" description="Os cortes aparecem aqui somente depois que o worker gerar artefatos reais. Nao ha arquivos demonstrativos nesta biblioteca." />
      )}
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

function StateCard({ icon: Icon, title, description, spin = false }: { icon: React.ElementType; title: string; description: string; spin?: boolean }) {
  return (
    <Card className="border-primary/10">
      <CardContent className="flex items-center gap-3 p-6">
        <Icon className={`h-5 w-5 text-primary ${spin ? "animate-spin" : ""}`} />
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
