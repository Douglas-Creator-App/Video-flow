"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, Loader2, Scissors, SlidersHorizontal, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import type { ReframeMode, ViralClip, ViralSubtitleStyle } from "@/lib/types";

type ViralMomentRow = {
  id: string;
  status: string;
  title: string;
  hook: string;
  reason: string;
  start_time: number;
  end_time: number;
  viral_score: number;
  retention_score: number;
  clarity_score: number;
  transcript_excerpt?: string | null;
};

type ViralDetail = {
  job: {
    id: string;
    status?: string;
    current_step?: string;
    error_message?: string | null;
    subtitle_style?: ViralSubtitleStyle;
    reframe_mode?: ReframeMode;
    output_format?: string;
    sourceUrl?: string;
    currentStep?: string;
    errorMessage?: string;
  };
  source_video?: { title?: string; source_url?: string } | null;
  transcript?: { segments?: unknown[]; status?: string } | null;
  moments: ViralMomentRow[];
  clips: ViralClip[];
  logs?: string[];
};

export function ViralClipsReview({ jobId }: { jobId: string }) {
  const [detail, setDetail] = useState<ViralDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const moments = detail?.moments ?? [];
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [subtitleStyle, setSubtitleStyle] = useState<ViralSubtitleStyle>("tiktok");
  const [reframeMode, setReframeMode] = useState<ReframeMode>("blurred_background");
  const [rendered, setRendered] = useState<ViralClip[]>([]);
  const [renderMessage, setRenderMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/viral-clips/jobs/${jobId}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Falha ao carregar job.");
        return data as ViralDetail;
      })
      .then((data) => {
        if (!active) return;
        setDetail(data);
        setSelected(Object.fromEntries((data.moments ?? []).map((moment) => [moment.id, moment.status !== "rejected"])));
        setTitles(Object.fromEntries((data.moments ?? []).map((moment) => [moment.id, moment.title])));
        setSubtitleStyle(data.job.subtitle_style ?? "tiktok");
        setReframeMode(data.job.reframe_mode ?? "blurred_background");
        setRendered(data.clips ?? []);
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Falha ao carregar job.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  const sourceTitle = detail?.source_video?.title ?? detail?.job.sourceUrl ?? "Fonte ainda nao processada";
  const logs = useMemo(() => detail?.logs ?? [], [detail]);

  async function renderSelected() {
    const momentIds = Object.entries(selected).filter(([, value]) => value).map(([id]) => id);
    setRenderMessage("Enfileirando render real dos cortes selecionados...");
    try {
      const response = await fetch(`/api/viral-clips/jobs/${jobId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moment_ids: momentIds, titles, subtitle_style: subtitleStyle, reframe_mode: reframeMode, output_format: detail?.job.output_format ?? "shorts" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao renderizar cortes.");
      setRendered(data.clips ?? []);
      setRenderMessage(data.warning ?? "Render real enfileirado.");
    } catch (error) {
      setRenderMessage(error instanceof Error ? error.message : "Falha ao renderizar cortes.");
    }
  }

  if (loading) {
    return <Card><CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando cortes virais...</CardContent></Card>;
  }

  if (loadError || !detail) {
    return <Card className="border-destructive/30"><CardContent className="flex items-center gap-2 p-6 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{loadError || "Job nao encontrado."}</CardContent></Card>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        {moments.length ? moments.map((moment) => {
          const enabled = selected[moment.id];
          return (
            <Card key={moment.id} className={enabled ? "border-primary/20" : "opacity-55"}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge>{moment.status}</Badge>
                    <CardTitle className="mt-3">{moment.title}</CardTitle>
                    <CardDescription>{formatTime(moment.start_time)} - {formatTime(moment.end_time)} - {Math.round(moment.end_time - moment.start_time)}s</CardDescription>
                  </div>
                  <Button variant={enabled ? "outline" : "secondary"} onClick={() => setSelected((current) => ({ ...current, [moment.id]: !enabled }))} className="gap-2">
                    {enabled ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {enabled ? "Rejeitar" : "Aprovar"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <Score label="Viral" value={moment.viral_score} />
                  <Score label="Retencao" value={moment.retention_score} />
                  <Score label="Clareza" value={moment.clarity_score} />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Inicio"><Input defaultValue={moment.start_time} type="number" /></Field>
                  <Field label="Fim"><Input defaultValue={moment.end_time} type="number" /></Field>
                  <Field label="Titulo"><Input value={titles[moment.id] ?? ""} onChange={(event) => setTitles((current) => ({ ...current, [moment.id]: event.target.value }))} /></Field>
                </div>
                <div className="rounded-md border border-white/5 bg-secondary/40 p-3">
                  <p className="text-sm font-semibold text-foreground">{moment.hook}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{moment.reason}</p>
                  <p className="mt-3 border-t border-white/5 pt-3 text-sm text-muted-foreground">{moment.transcript_excerpt ?? "Trecho de transcricao ainda nao disponivel."}</p>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <Card className="border-primary/15">
            <CardHeader>
              <Badge className="w-fit">{detail.job.status ?? "queued"}</Badge>
              <CardTitle>Aguardando momentos reais</CardTitle>
              <CardDescription>{detail.job.error_message ?? detail.job.errorMessage ?? detail.job.current_step ?? detail.job.currentStep ?? "A transcricao e analise ainda nao produziram momentos para revisao."}</CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>

      <aside className="space-y-4">
        <Card className="border-primary/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" />Render</CardTitle>
            <CardDescription>Render real exige momentos, transcricao e arquivo fonte processado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Legenda"><SelectField value={subtitleStyle} onChange={(event) => setSubtitleStyle(event.target.value as ViralSubtitleStyle)}>{["tiktok", "popup", "word_by_word", "minimal", "documentary", "black_box"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
            <Field label="Reframe"><SelectField value={reframeMode} onChange={(event) => setReframeMode(event.target.value as ReframeMode)}>{["center_crop", "blurred_background"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
            <Button onClick={renderSelected} disabled={!moments.length} className="w-full gap-2"><Scissors className="h-4 w-4" />Renderizar selecionados</Button>
            <Button asChild variant="outline" className="w-full"><Link href="/app/viral-clips/library">Abrir biblioteca</Link></Button>
            {renderMessage ? <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">{renderMessage}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fonte</CardTitle><CardDescription>{sourceTitle}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video rounded-md border border-primary/20 bg-black/70" />
            <p className="text-sm text-muted-foreground">{Array.isArray(detail.transcript?.segments) ? detail.transcript.segments.length : 0} segmentos transcritos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {logs.map((log) => <p key={log} className="rounded-md border border-white/5 bg-secondary/40 p-2 text-xs text-muted-foreground">{log}</p>)}
          </CardContent>
        </Card>
        {rendered.length ? (
          <Card>
            <CardHeader><CardTitle>Cortes renderizados</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {rendered.map((clip) => <div key={clip.id} className="flex items-center justify-between rounded-md border border-white/5 bg-secondary/40 p-2 text-sm"><span>{clip.title}</span><Download className="h-4 w-4 text-primary" /></div>)}
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function Score({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold text-primary">{value}</p></div>;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}
