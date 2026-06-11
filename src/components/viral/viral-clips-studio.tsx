"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Film, Gauge, Loader2, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import { projects } from "@/lib/mock-data";
import { viralSteps } from "@/lib/viral/viral-clips-pipeline";
import type { ReframeMode, ViralClipDurationMode, ViralClipOutputFormat, ViralClipPipelineResult, ViralCostEstimate, ViralSubtitleStyle } from "@/lib/types";

const outputFormats: Array<{ value: ViralClipOutputFormat; label: string }> = [
  { value: "shorts", label: "Shorts 9:16" },
  { value: "reels", label: "Reels 9:16" },
  { value: "tiktok", label: "TikTok 9:16" },
  { value: "horizontal", label: "Horizontal 16:9" },
  { value: "square", label: "Quadrado 1:1" }
];

const durationModes: Array<{ value: ViralClipDurationMode; label: string }> = [
  { value: "15s", label: "15 segundos" },
  { value: "30s", label: "30 segundos" },
  { value: "45s", label: "45 segundos" },
  { value: "60s", label: "60 segundos" },
  { value: "90s", label: "90 segundos" },
  { value: "auto", label: "Automatico pela IA" },
  { value: "custom", label: "Personalizado" }
];

const subtitleStyles: Array<{ value: ViralSubtitleStyle; label: string }> = [
  { value: "tiktok", label: "TikTok" },
  { value: "popup", label: "Popup" },
  { value: "word_by_word", label: "Palavra por palavra" },
  { value: "minimal", label: "Minimalista" },
  { value: "documentary", label: "Documentario" },
  { value: "black_box", label: "Caixa preta" }
];

const reframeModes: Array<{ value: ReframeMode; label: string }> = [
  { value: "center_crop", label: "Center crop" },
  { value: "blurred_background", label: "Fundo desfocado" }
];

export function ViralClipsStudio() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "project_1");
  const [sourceUrl, setSourceUrl] = useState("https://www.youtube.com/watch?v=video-flow-demo");
  const [outputFormat, setOutputFormat] = useState<ViralClipOutputFormat>("shorts");
  const [clipDurationMode, setClipDurationMode] = useState<ViralClipDurationMode>("30s");
  const [clipDurationSeconds, setClipDurationSeconds] = useState(30);
  const [clipsQuantity, setClipsQuantity] = useState(5);
  const [subtitleStyle, setSubtitleStyle] = useState<ViralSubtitleStyle>("tiktok");
  const [removeSilence, setRemoveSilence] = useState(true);
  const [reframeVertical, setReframeVertical] = useState(true);
  const [reframeMode, setReframeMode] = useState<ReframeMode>("blurred_background");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [estimate, setEstimate] = useState<ViralCostEstimate | null>(null);
  const [result, setResult] = useState<ViralClipPipelineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function previewCost() {
    setError("");
    if (!workspaceId) {
      setError("Selecione um workspace antes de calcular o custo.");
      return;
    }
    const response = await fetch("/api/viral-clips/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(true, false))
    });
    const data = await response.json();
    setEstimate(data.cost_estimate);
  }

  async function createJob(renderNow = false) {
    setLoading(true);
    setError("");
    setResult(null);
    if (!workspaceId) {
      setError("Selecione um workspace antes de criar o job.");
      setLoading(false);
      return;
    }
    const response = await fetch("/api/viral-clips/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(false, renderNow))
    });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Erro ao criar job.");
    else {
      setResult(data);
      setEstimate(data.costEstimate);
    }
    setLoading(false);
  }

  function payload(preview: boolean, renderNow: boolean) {
    return {
      preview,
      workspace_id: workspaceId,
      project_id: projectId,
      source_url: sourceUrl,
      output_format: outputFormat,
      clip_duration_mode: clipDurationMode,
      clip_duration_seconds: clipDurationSeconds,
      clips_quantity: clipsQuantity,
      subtitle_style: subtitleStyle,
      remove_silence: removeSilence,
      reframe_vertical: reframeVertical,
      reframe_mode: reframeMode,
      rights_confirmed: rightsConfirmed,
      render_now: renderNow
    };
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Stat icon={Scissors} label="Entrada" value="YouTube URL" />
        <Stat icon={Film} label="Saida" value={outputFormats.find((item) => item.value === outputFormat)?.label ?? outputFormat} />
        <Stat icon={Gauge} label="Custo" value={estimate ? `${estimate.totalCredits} creditos` : "calcular"} />
        <Stat icon={ShieldCheck} label="Compliance" value={rightsConfirmed ? "confirmado" : "pendente"} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <Card className="border-primary/25 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.98))]">
          <CardHeader className="border-b border-white/5">
            <Badge className="w-fit">Viral Clips Engine</Badge>
            <CardTitle className="pt-2 text-2xl">Criar cortes virais</CardTitle>
            <CardDescription>Cole uma URL do YouTube, revise custo, gere momentos sugeridos e renderize cortes para Shorts, Reels ou TikTok.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-5 lg:grid-cols-2">
            <Field label="Projeto"><SelectField value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</SelectField></Field>
            <Field label="Link do YouTube"><Input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></Field>
            <Field label="Formato de saida"><SelectField value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as ViralClipOutputFormat)}>{outputFormats.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Field label="Duracao dos cortes"><SelectField value={clipDurationMode} onChange={(event) => setClipDurationMode(event.target.value as ViralClipDurationMode)}>{durationModes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Field label="Duracao personalizada"><Input type="number" value={clipDurationSeconds} onChange={(event) => setClipDurationSeconds(Number(event.target.value))} /></Field>
            <Field label="Quantidade de clipes"><SelectField value={String(clipsQuantity)} onChange={(event) => setClipsQuantity(Number(event.target.value))}>{[1, 3, 5, 10, 15].map((item) => <option key={item} value={item}>{item}</option>)}</SelectField></Field>
            <Field label="Estilo de legenda"><SelectField value={subtitleStyle} onChange={(event) => setSubtitleStyle(event.target.value as ViralSubtitleStyle)}>{subtitleStyles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Field label="Reframe vertical"><SelectField value={reframeMode} onChange={(event) => setReframeMode(event.target.value as ReframeMode)}>{reframeModes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Toggle checked={removeSilence} setChecked={setRemoveSilence} label="Remover silencios" />
            <Toggle checked={reframeVertical} setChecked={setReframeVertical} label="Reformular em vertical quando necessario" />
            <label className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm lg:col-span-2">
              <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
              <span>
                <strong className="block text-foreground">Confirmo que tenho direito de uso deste conteudo.</strong>
                <span className="text-muted-foreground">O usuario deve possuir direito de uso sobre o video enviado ou processado.</span>
              </span>
            </label>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-primary/15">
            <CardHeader>
              <CardTitle>Revisao e custo</CardTitle>
              <CardDescription>Sem marcar direitos de uso, o job nao prossegue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {estimate ? <Cost estimate={estimate} /> : <p className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm text-muted-foreground">Calcule o custo antes de gerar.</p>}
              {error ? <p className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{error}</p> : null}
              <Button onClick={previewCost} variant="outline" className="w-full gap-2"><Gauge className="h-4 w-4" />Calcular custo</Button>
              <Button onClick={() => createJob(false)} disabled={!rightsConfirmed || loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Criar job para revisao
              </Button>
              <Button onClick={() => createJob(true)} disabled={!rightsConfirmed || loading} variant="outline" className="w-full gap-2">
                Gerar e renderizar agora
              </Button>
              <Button asChild variant="outline" className="w-full"><Link href="/app/viral-clips/library">Abrir biblioteca</Link></Button>
            </CardContent>
          </Card>
          <Progress progress={result?.job.progress ?? 0} />
        </aside>
      </section>

      {result ? <ResultPanel result={result} /> : null}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="border-primary/10 bg-card/70">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold">{value}</p></div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function Toggle({ checked, setChecked, label }: { checked: boolean; setChecked: (value: boolean) => void; label: string }) {
  return <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-white/5 bg-secondary/40 px-3 text-sm"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="h-4 w-4 accent-primary" />{label}</label>;
}

function Cost({ estimate }: { estimate: ViralCostEstimate }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
        <span>Processamento</span><strong className="text-right text-foreground">{estimate.processingCost}</strong>
        <span>Transcricao</span><strong className="text-right text-foreground">{estimate.transcriptionCost}</strong>
        <span>Analise IA</span><strong className="text-right text-foreground">{estimate.analysisCost}</strong>
        <span>Render</span><strong className="text-right text-foreground">{estimate.renderCost}</strong>
      </div>
      <p className="mt-3 border-t border-white/10 pt-3 font-semibold text-primary">Total: {estimate.totalCredits} creditos</p>
    </div>
  );
}

function Progress({ progress }: { progress: number }) {
  return (
    <Card>
      <CardHeader><CardTitle>Pipeline</CardTitle><CardDescription>Estrutura pronta para Realtime.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div>
        {viralSteps.map((step) => <div key={step.status} className="flex items-center justify-between rounded-md border border-white/5 bg-secondary/30 px-3 py-2 text-xs"><span>{step.label}</span><span>{step.progress}%</span></div>)}
      </CardContent>
    </Card>
  );
}

function ResultPanel({ result }: { result: ViralClipPipelineResult }) {
  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div><Badge>{result.job.status}</Badge><CardTitle className="mt-3">{result.sourceVideo.title}</CardTitle><CardDescription>{result.moments.length} momentos sugeridos, {result.clips.length} cortes renderizados.</CardDescription></div>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href={`/app/viral-clips/${result.job.id}/review`}>Revisar cortes</Link></Button>
            <Button asChild variant="outline"><Link href="/app/viral-clips/library">Biblioteca</Link></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {result.moments.slice(0, 3).map((moment) => <div key={moment.id} className="rounded-md border border-white/5 bg-secondary/40 p-3"><p className="text-sm font-semibold">{moment.title}</p><p className="mt-1 text-xs text-muted-foreground">{moment.hook}</p><p className="mt-2 text-xs text-primary">Score {moment.viralScore}</p></div>)}
      </CardContent>
    </Card>
  );
}
