"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Film, Loader2, Play, Sparkles, UserRound, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import { aiVideoAssets, aiVideoProviders, projects, talkingCharacterJobs, textToVideoJobs, voices } from "@/lib/mock-data";
import { estimateAiVideoCost, motionPrompts } from "@/lib/ai-video/ai-video-pipeline";
import type { AiVideoPipelineResult, AiVideoProviderType, CameraMotion, VideoAspectRatio } from "@/lib/types";

export function VideoProvidersPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {aiVideoProviders.map((provider) => (
        <Card key={provider.id} className="border-primary/10">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div><Badge>{provider.status}</Badge><CardTitle className="mt-3">{provider.name}</CardTitle><CardDescription>{provider.defaultModel} - max {provider.maxDurationSeconds}s</CardDescription></div>
              {provider.isDefault ? <Badge>default</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Text-to-video: {provider.supportsTextToVideo ? "sim" : "nao"}</p>
            <p>Image-to-video: {provider.supportsImageToVideo ? "sim" : "nao"}</p>
            <p>Talking character: {provider.supportsTalkingCharacter ? "sim" : "nao"}</p>
            <Button variant="outline" className="w-full" disabled>Teste real exige endpoint do provider</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AiVideoStudio() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [projectId, setProjectId] = useState("project_1");
  const [provider, setProvider] = useState<AiVideoProviderType>("mock");
  const [prompt, setPrompt] = useState("Jesus caminhando ate a cruz em uma cena cinematografica");
  const [negativePrompt, setNegativePrompt] = useState("low quality, distorted");
  const [visualStyle, setVisualStyle] = useState("cinematografico");
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("9:16");
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>("slow_zoom");
  const [quality, setQuality] = useState<"draft" | "standard" | "high">("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiVideoPipelineResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const cost = estimateAiVideoCost(provider, durationSeconds);

  async function generate() {
    setLoading(true);
    setErrorMessage("");
    if (!workspaceId) {
      setErrorMessage("Selecione um workspace antes de gerar video IA.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/ai-video/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, type: "text_to_video", project_id: projectId, provider, prompt, negative_prompt: negativePrompt, visual_style: visualStyle, duration_seconds: durationSeconds, aspect_ratio: aspectRatio, camera_motion: cameraMotion, quality })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao gerar video IA.");
      setResult(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao gerar video IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <Card className="border-primary/25 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.98))]">
        <CardHeader><Badge className="w-fit">Text to Video</Badge><CardTitle className="mt-3 text-2xl">Gerar mini video por prompt</CardTitle><CardDescription>Crie cenas, aberturas, encerramentos ou assets para inserir no editor.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Projeto"><SelectField value={projectId} onChange={(e) => setProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</SelectField></Field>
          <Field label="Provider"><SelectField value={provider} onChange={(e) => setProvider(e.target.value as AiVideoProviderType)}>{aiVideoProviders.map((p) => <option key={p.id} value={p.provider}>{p.name}</option>)}</SelectField></Field>
          <Field label="Prompt"><Input value={prompt} onChange={(e) => setPrompt(e.target.value)} /></Field>
          <Field label="Negative prompt"><Input value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} /></Field>
          <Field label="Estilo visual"><Input value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} /></Field>
          <Field label="Duracao"><SelectField value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))}>{[3, 5, 8, 10].map((v) => <option key={v} value={v}>{v}s</option>)}</SelectField></Field>
          <Field label="Proporcao"><SelectField value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}>{["9:16", "16:9", "1:1"].map((v) => <option key={v}>{v}</option>)}</SelectField></Field>
          <Field label="Movimento"><SelectField value={cameraMotion} onChange={(e) => setCameraMotion(e.target.value as CameraMotion)}>{["static", "slow_zoom", "push_in", "pull_out", "pan_left", "pan_right", "epic_orbit", "documentary_handheld"].map((v) => <option key={v}>{v}</option>)}</SelectField></Field>
          <Field label="Qualidade"><SelectField value={quality} onChange={(e) => setQuality(e.target.value as "draft" | "standard" | "high")}><option>draft</option><option>standard</option><option>high</option></SelectField></Field>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm"><p className="text-muted-foreground">Custo estimado</p><p className="text-xl font-semibold text-primary">{cost} creditos</p></div>
          <Button onClick={generate} disabled={loading} className="gap-2 md:col-span-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Gerar video</Button>
          {errorMessage ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive md:col-span-2">{errorMessage}</p> : null}
        </CardContent>
      </Card>
      <ResultCard result={result} />
    </div>
  );
}

export function TalkingScenesStudio() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [speechText, setSpeechText] = useState("A primeira frase decide se o publico fica ou vai embora.");
  const [provider, setProvider] = useState<AiVideoProviderType>("mock");
  const [result, setResult] = useState<AiVideoPipelineResult | null>(null);
  async function generate() {
    if (!workspaceId) return;
    const response = await fetch("/api/ai-video/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspace_id: workspaceId, type: "talking_character", provider, speech_text: speechText }) });
    setResult(await response.json());
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" />Personagem falante</CardTitle><CardDescription>Imagem, fala, voz, estilo e duracao para gerar mini video.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><Field label="Imagem/personagem"><Input defaultValue="/media/mock-thumbnail-4.jpg" /></Field><Field label="Provider"><SelectField value={provider} onChange={(e) => setProvider(e.target.value as AiVideoProviderType)}>{aiVideoProviders.map((p) => <option key={p.id} value={p.provider}>{p.name}</option>)}</SelectField></Field><Field label="Voz"><SelectField>{voices.map((v) => <option key={v.id}>{v.name}</option>)}</SelectField></Field><Field label="Duracao"><SelectField><option>8s</option><option>10s</option></SelectField></Field><Field label="Descricao"><Input defaultValue="Narrador documental com expressao seria" /></Field><Field label="Fala"><Input value={speechText} onChange={(e) => setSpeechText(e.target.value)} /></Field><Button onClick={generate} className="gap-2 md:col-span-2"><Play className="h-4 w-4" />Gerar personagem falando</Button></CardContent></Card>
      <ResultCard result={result} />
    </div>
  );
}

export function AiVideoHistory() {
  const rows = [
    ...textToVideoJobs.map((j) => ({ id: j.id, type: "text-to-video", title: j.prompt, status: j.status, cost: j.cost, provider: j.provider })),
    ...talkingCharacterJobs.map((j) => ({ id: j.id, type: "talking", title: j.characterDescription, status: j.status, cost: j.cost, provider: j.provider }))
  ];
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[...aiVideoAssets, ...rows].map((item) => <Card key={item.id}><CardHeader><Badge className="w-fit">{"source" in item ? item.source : item.type}</Badge><CardTitle className="mt-2">{"title" in item ? item.title : "Video IA"}</CardTitle><CardDescription>{"provider" in item ? item.provider : "mock"} - {"cost" in item ? item.cost : 0} creditos</CardDescription></CardHeader><CardContent><Button variant="outline" className="w-full gap-2" disabled><Download className="h-4 w-4" />Download: storage pendente</Button></CardContent></Card>)}</div>;
}

export function AiVideoAssetsLibrary() {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{aiVideoAssets.map((asset) => <Card key={asset.id} className="overflow-hidden"><div className="grid aspect-video place-items-center bg-black/70"><Video className="h-8 w-8 text-primary" /></div><CardHeader><Badge className="w-fit">{asset.source}</Badge><CardTitle className="mt-2">{asset.title}</CardTitle><CardDescription>{asset.durationSeconds}s - {asset.provider} - {asset.cost} creditos</CardDescription></CardHeader><CardContent className="grid gap-2"><Button variant="outline" disabled>Inserir: editor real pendente</Button><Button variant="outline" disabled>Duplicar: persistencia pendente</Button></CardContent></Card>)}</div>;
}

function ResultCard({ result }: { result: AiVideoPipelineResult | null }) {
  return <Card className="border-primary/15"><CardHeader><CardTitle>Resultado</CardTitle><CardDescription>Jobs rodam em fila e usam fallback mockado quando nao ha provider real.</CardDescription></CardHeader><CardContent className="space-y-3">{result ? <><div className="grid aspect-video place-items-center rounded-md bg-black/70"><Film className="h-8 w-8 text-primary" /></div><Badge>{result.job.status}</Badge><p className="text-sm text-muted-foreground">{result.asset.title}</p><div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">{result.logs?.join(" | ")}</div><Button asChild className="w-full"><Link href="/app/ai-video/history">Abrir historico</Link></Button></> : <p className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm text-muted-foreground">Nenhum job gerado ainda.</p>}</CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

export { motionPrompts };
