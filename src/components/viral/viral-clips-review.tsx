"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Scissors, SlidersHorizontal, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { sourceVideos, videoTranscripts, viralClipJobs, viralClips, viralMoments } from "@/lib/mock-data";
import type { ReframeMode, ViralClip, ViralSubtitleStyle } from "@/lib/types";

export function ViralClipsReview({ jobId }: { jobId: string }) {
  const job = viralClipJobs.find((item) => item.id === jobId) ?? viralClipJobs[0];
  const source = sourceVideos.find((item) => item.sourceUrl === job.sourceUrl) ?? sourceVideos[0];
  const transcript = videoTranscripts.find((item) => item.sourceVideoId === source.id) ?? videoTranscripts[0];
  const moments = viralMoments.filter((item) => item.viralClipJobId === job.id);
  const [selected, setSelected] = useState<Record<string, boolean>>(Object.fromEntries(moments.map((moment) => [moment.id, moment.status !== "rejected"])));
  const [titles, setTitles] = useState<Record<string, string>>(Object.fromEntries(moments.map((moment) => [moment.id, moment.title])));
  const [subtitleStyle, setSubtitleStyle] = useState<ViralSubtitleStyle>(job.subtitleStyle);
  const [reframeMode, setReframeMode] = useState<ReframeMode>(job.reframeMode);
  const [rendered, setRendered] = useState<ViralClip[]>(viralClips.filter((clip) => clip.viralClipJobId === job.id));
  const [renderMessage, setRenderMessage] = useState("");

  async function renderSelected() {
    const momentIds = Object.entries(selected).filter(([, value]) => value).map(([id]) => id);
    setRenderMessage("Renderizando cortes selecionados...");
    try {
      const response = await fetch(`/api/viral-clips/jobs/${job.id}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moment_ids: momentIds, titles, subtitle_style: subtitleStyle, reframe_mode: reframeMode, output_format: job.outputFormat })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao renderizar cortes.");
      setRendered(data.clips ?? []);
      setRenderMessage(data.warning ?? "Cortes renderizados.");
    } catch (error) {
      setRenderMessage(error instanceof Error ? error.message : "Falha ao renderizar cortes.");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        {moments.map((moment) => {
          const enabled = selected[moment.id];
          return (
            <Card key={moment.id} className={enabled ? "border-primary/20" : "opacity-55"}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge>{moment.status}</Badge>
                    <CardTitle className="mt-3">{moment.title}</CardTitle>
                    <CardDescription>{formatTime(moment.startTime)} - {formatTime(moment.endTime)} - {Math.round(moment.endTime - moment.startTime)}s</CardDescription>
                  </div>
                  <Button variant={enabled ? "outline" : "secondary"} onClick={() => setSelected((current) => ({ ...current, [moment.id]: !enabled }))} className="gap-2">
                    {enabled ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {enabled ? "Rejeitar" : "Aprovar"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <Score label="Viral" value={moment.viralScore} />
                  <Score label="Retencao" value={moment.retentionScore} />
                  <Score label="Clareza" value={moment.clarityScore} />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Inicio"><Input defaultValue={moment.startTime} type="number" /></Field>
                  <Field label="Fim"><Input defaultValue={moment.endTime} type="number" /></Field>
                  <Field label="Titulo"><Input value={titles[moment.id]} onChange={(event) => setTitles((current) => ({ ...current, [moment.id]: event.target.value }))} /></Field>
                </div>
                <div className="rounded-md border border-white/5 bg-secondary/40 p-3">
                  <p className="text-sm font-semibold text-foreground">{moment.hook}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{moment.reason}</p>
                  <p className="mt-3 border-t border-white/5 pt-3 text-sm text-muted-foreground">{moment.transcriptExcerpt}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <aside className="space-y-4">
        <Card className="border-primary/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" />Render</CardTitle>
            <CardDescription>Configure legenda e reframe dos cortes aprovados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Legenda"><SelectField value={subtitleStyle} onChange={(event) => setSubtitleStyle(event.target.value as ViralSubtitleStyle)}>{["tiktok", "popup", "word_by_word", "minimal", "documentary", "black_box"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
            <Field label="Reframe"><SelectField value={reframeMode} onChange={(event) => setReframeMode(event.target.value as ReframeMode)}>{["center_crop", "blurred_background"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
            <Button onClick={renderSelected} className="w-full gap-2"><Scissors className="h-4 w-4" />Renderizar selecionados</Button>
            <Button asChild variant="outline" className="w-full"><Link href="/app/viral-clips/library">Abrir biblioteca</Link></Button>
            {renderMessage ? <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">{renderMessage}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fonte</CardTitle><CardDescription>{source.title}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video rounded-md border border-primary/20 bg-black/70" />
            <p className="text-sm text-muted-foreground">{transcript.segments.length} segmentos transcritos.</p>
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
