"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Heart, ImagePlus, Library, Lock, Mic, Play, Plus, Sparkles, Trash2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import {
  advancedSubtitleStyles,
  audioSettings,
  assetLibraryItems,
  imageAnimations,
  mediaAssets,
  musicTracks,
  subtitleSegments,
  videoEffects,
  videoProjects,
  videoRenders,
  videoScenes as initialScenes,
  visualStylePresets
} from "@/lib/mock-data";
import type { MotionType, TransitionType, VideoScene } from "@/lib/types";
import { TooltipHint } from "@/components/onboarding/onboarding-wizard";
import { QualityPanel } from "@/components/quality/video-quality-panels";
import { JobProgressPanel } from "@/components/jobs/job-progress-panel";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import { useVideoRenders } from "@/lib/workspace/hooks";

export function VideoEditor({ videoId }: { videoId: string }) {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const video = videoProjects.find((item) => item.id === videoId) ?? videoProjects[0];
  const rendersQuery = useVideoRenders(workspaceId);
  const latestRealRender = ((rendersQuery.data?.renders ?? []) as Array<Record<string, unknown>>).find((render) => String(render.video_project_id) === video.id);
  const [scenes, setScenes] = useState<VideoScene[]>(initialScenes.filter((scene) => scene.videoProjectId === video.id));
  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0]?.id ?? "");
  const [renderUrl, setRenderUrl] = useState(video.renderUrl ?? "");
  const [renderStatus, setRenderStatus] = useState<string>(video.status);
  const [previewStatus, setPreviewStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [renderJobId, setRenderJobId] = useState("");
  const [lockedSceneIds, setLockedSceneIds] = useState<string[]>([]);
  const [favoriteSceneIds, setFavoriteSceneIds] = useState<string[]>([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0];
  const currentAudio = audioSettings.find((item) => item.videoProjectId === video.id);

  useEffect(() => {
    const realRenderUrl = latestRealRender?.render_url ? String(latestRealRender.render_url) : "";
    if (!realRenderUrl) return;
    setRenderUrl(realRenderUrl);
    setRenderStatus(String(latestRealRender?.status ?? "completed"));
  }, [latestRealRender?.render_url, latestRealRender?.status]);

  function updateScene(id: string, patch: Partial<VideoScene>) {
    setScenes((items) => items.map((scene) => (scene.id === id ? { ...scene, ...patch } : scene)));
  }

  function addScene() {
    const scene: VideoScene = {
      id: `scene_${Date.now()}`,
      workspaceId,
      videoProjectId: video.id,
      orderIndex: scenes.length + 1,
      scriptText: "Nova cena",
      narrationStart: 0,
      narrationEnd: 5,
      imagePrompt: "nova cena vertical premium",
      durationSeconds: 5,
      motionType: "zoom_in",
      transitionType: "fade",
      zoomEnabled: true,
      organicMotionEnabled: false,
      status: "queued"
    };
    setScenes((items) => [...items, scene]);
    setSelectedSceneId(scene.id);
  }

  function duplicateScene(scene: VideoScene) {
    setScenes((items) => [...items, { ...scene, id: `scene_${Date.now()}`, orderIndex: items.length + 1 }]);
  }

  function moveScene(id: string, direction: -1 | 1) {
    const index = scenes.findIndex((scene) => scene.id === id);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    const copy = [...scenes];
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
    setScenes(copy.map((scene, itemIndex) => ({ ...scene, orderIndex: itemIndex + 1 })));
  }

  function applyOrganicMotion() {
    setScenes((items) => items.map((scene) => ({ ...scene, motionType: "organic_motion", organicMotionEnabled: true })));
  }

  async function generateSceneImage() {
    if (!selectedScene) return;
    setStatusMessage("Gerando variacao de imagem...");
    try {
      const result = await fetch("/api/media/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, prompt: selectedScene.imagePrompt, style: video.visualStyle, aspect_ratio: video.aspectRatio, quantity: 1 })
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? "Falha ao gerar imagem.");
      updateScene(selectedScene.id, { mediaAssetId: data.image_url ? "generated_asset" : selectedScene.mediaAssetId, status: "completed" });
      setStatusMessage(data.warning ?? "Imagem gerada e anexada a cena.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Falha ao gerar imagem.");
    }
  }

  async function generateSceneVideo(type: "image_to_video" | "text_to_video" | "intro" | "outro" = "image_to_video") {
    if (!selectedScene) return;
    setStatusMessage("Gerando asset de video IA em modo demonstracao...");
    try {
      const result = await fetch("/api/ai-video/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          workspace_id: workspaceId,
          video_project_id: video.id,
          scene_id: selectedScene.id,
          project_id: video.projectId,
          provider: "mock",
          input_image_url: "/media/mock-scene-1.jpg",
          motion_prompt: "Movimento cinematografico suave",
          prompt: selectedScene.imagePrompt,
          duration_seconds: Math.min(10, selectedScene.durationSeconds),
          aspect_ratio: video.aspectRatio,
          camera_motion: "slow_zoom"
        })
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? "Falha ao gerar video IA.");
      if (data.asset?.videoUrl) updateScene(selectedScene.id, { videoPrompt: data.asset.videoUrl, status: "completed" });
      setStatusMessage(data.logs?.join(" | ") ?? "Asset de video IA criado.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Falha ao gerar video IA.");
    }
  }

  async function renderVideo(preview = false) {
    if (preview) setPreviewStatus("processing");
    else setRenderStatus("rendering");
    setStatusMessage(preview ? "Gerando preview..." : "Renderizando video...");
    try {
      const result = await fetch("/api/render/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, video_project_id: video.id, quality: preview ? "preview" : "final", duration_seconds: video.durationTarget })
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? "Falha no render.");
      setRenderLogs(data.logs ?? []);
      setStatusMessage(data.job_id ? `${data.warning ?? "Render enfileirado."} Job: ${data.job_id}` : data.warning ?? "Render concluido.");
      if (preview) setPreviewStatus(data.status);
      else {
        setRenderStatus(data.job_id ? "rendering" : data.artifact_verified ? "completed" : data.status === "blocked" ? "ready_to_render" : "failed");
        setRenderUrl(data.artifact_verified ? data.render_url : "");
        setRenderJobId(data.job_id ?? "");
      }
    } catch (error) {
      if (preview) setPreviewStatus("failed");
      else setRenderStatus("failed");
      setStatusMessage(error instanceof Error ? error.message : "Falha no render.");
    }
  }

  function toggleSceneFlag(id: string, flag: "lock" | "favorite") {
    const setter = flag === "lock" ? setLockedSceneIds : setFavoriteSceneIds;
    setter((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  }

  function insertAsset(assetId: string) {
    if (!selectedScene) return;
    const asset = assetLibraryItems.find((item) => item.id === assetId);
    updateScene(selectedScene.id, {
      mediaAssetId: assetId,
      imagePrompt: asset?.description ?? selectedScene.imagePrompt,
      status: "completed"
    });
    setStatusMessage(`Asset inserido na cena: ${asset?.title ?? assetId}. Uso registrado em modo demonstracao.`);
    setAssetPickerOpen(false);
  }

  return (
    <div className="space-y-6">
      <TooltipHint title="Voce pode trocar imagens e cenas" description="Use a Biblioteca para inserir assets, ajuste prompts, mova cenas na timeline e renderize quando o preview estiver pronto." />
      <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">
        <p className="font-semibold text-foreground">Modo demonstracao ativo</p>
        <p className="mt-1">Preview pode usar assets mockados. Render final e download so sao liberados quando houver MP4 real verificado no storage.</p>
      </div>
      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{video.title}</CardTitle>
                <CardDescription>{video.visualStyle} · {video.subtitleStyle} · {video.aspectRatio}</CardDescription>
              </div>
              <Badge>{renderStatus}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderUrl ? <video src={renderUrl} controls className="max-h-[520px] w-full rounded-lg border border-primary/20 bg-black object-contain" /> : null}
            <div className="grid min-h-[360px] place-items-center rounded-lg border border-primary/20 bg-black/60">
              <div className="text-center">
                <Play className="mx-auto mb-4 h-12 w-12 text-primary" />
                <p className="font-display text-2xl">Preview do vídeo</p>
                <p className="text-sm text-muted-foreground">{selectedScene?.scriptText}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="gap-2" onClick={addScene}><Plus className="h-4 w-4" />Adicionar cena</Button>
              <Button variant="outline" className="gap-2" onClick={applyOrganicMotion}><Sparkles className="h-4 w-4" />Aplicar movimento em todas</Button>
              <Button variant="outline" onClick={() => generateSceneVideo("intro")}>Gerar abertura</Button>
              <Button variant="outline" onClick={() => generateSceneVideo("outro")}>Gerar encerramento</Button>
              <Button variant="outline" onClick={() => renderVideo(true)}>Gerar preview rápido ({previewStatus})</Button>
              <Button variant="outline" asChild><Link href={`/app/videos/${video.id}/thumbnails`}>Gerar thumbnail</Link></Button>
              <Button variant="outline" className="gap-2" onClick={() => setAssetPickerOpen(true)}><Library className="h-4 w-4" />Biblioteca</Button>
              <Button className="gap-2" onClick={() => renderVideo(false)}><Video className="h-4 w-4" />Renderizar</Button>
              {renderUrl ? <Button variant="outline" asChild><a href={renderUrl} download>Download final</a></Button> : <Button variant="outline" disabled>Download final bloqueado</Button>}
            </div>
            {statusMessage ? (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Detalhes do job</p>
                <p className="mt-1">{statusMessage}</p>
                {renderLogs.length ? <p className="mt-2 text-xs">{renderLogs.join(" | ")}</p> : null}
              </div>
            ) : null}
            {renderJobId ? <JobProgressPanel jobId={renderJobId} /> : null}
          </CardContent>
        </Card>

        <PropertiesPanel scene={selectedScene} updateScene={updateScene} generateSceneImage={generateSceneImage} generateSceneVideo={generateSceneVideo} />
      </section>

      {assetPickerOpen ? <AssetPicker onClose={() => setAssetPickerOpen(false)} onInsert={insertAsset} /> : null}

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Timeline visual</h2>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {scenes.map((scene) => (
            <Card key={scene.id} className={scene.id === selectedSceneId ? "border-primary/40" : undefined}>
              <CardContent className="space-y-3 p-4">
                <button className="w-full text-left" onClick={() => setSelectedSceneId(scene.id)}>
                  <div className="mb-3 grid h-28 place-items-center rounded-md bg-primary/10 text-primary">Cena {scene.orderIndex}</div>
                  <p className="line-clamp-2 text-sm font-medium">{scene.scriptText}</p>
                </button>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" onClick={() => moveScene(scene.id, -1)}>↑</Button>
                  <Button size="sm" variant="outline" onClick={() => moveScene(scene.id, 1)}>↓</Button>
                  <Button size="icon" variant="ghost" aria-label="Duplicar" onClick={() => duplicateScene(scene)}><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant={lockedSceneIds.includes(scene.id) ? "default" : "ghost"} aria-label="Bloquear" onClick={() => toggleSceneFlag(scene.id, "lock")}><Lock className="h-4 w-4" /></Button>
                  <Button size="icon" variant={favoriteSceneIds.includes(scene.id) ? "default" : "ghost"} aria-label="Favoritar" onClick={() => toggleSceneFlag(scene.id, "favorite")}><Heart className="h-4 w-4" /></Button>
                  <Button size="icon" variant="destructive" aria-label="Remover" onClick={() => setScenes((items) => items.filter((item) => item.id !== scene.id))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <MediaPanel />
        <SubtitlePanel />
        <AudioPanel currentAudio={currentAudio} />
        <EffectsPanel renderRows={((rendersQuery.data?.renders ?? []) as Array<Record<string, unknown>>).filter((render) => String(render.video_project_id) === video.id)} />
      </section>

      <QualityPanel videoProjectId={video.id} />
    </div>
  );
}

function PropertiesPanel({ scene, updateScene, generateSceneImage, generateSceneVideo }: { scene?: VideoScene; updateScene: (id: string, patch: Partial<VideoScene>) => void; generateSceneImage: () => void; generateSceneVideo: (type?: "image_to_video" | "text_to_video" | "intro" | "outro") => void }) {
  if (!scene) return null;
  return (
    <Card>
      <CardHeader><CardTitle>Painel de propriedades</CardTitle><CardDescription>Cena #{scene.orderIndex}</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Field label="Texto da cena"><Input value={scene.scriptText} onChange={(event) => updateScene(scene.id, { scriptText: event.target.value })} /></Field>
        <Field label="Prompt visual"><Input value={scene.imagePrompt} onChange={(event) => updateScene(scene.id, { imagePrompt: event.target.value })} /></Field>
        <Field label="Preset visual"><SelectField>{visualStylePresets.map((preset) => <option key={preset.id}>{preset.name}</option>)}</SelectField></Field>
        <Field label="Movimento"><SelectField value={scene.motionType} onChange={(event) => updateScene(scene.id, { motionType: event.target.value as MotionType })}>{["none", "zoom_in", "zoom_out", "pan_left", "pan_right", "pan_up", "pan_down", "organic_motion", "random_subtle"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
        <Field label="Transição"><SelectField value={scene.transitionType} onChange={(event) => updateScene(scene.id, { transitionType: event.target.value as TransitionType })}>{["none", "fade", "slide", "zoom", "cinematic"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
        <Field label="Duração"><Input type="number" value={scene.durationSeconds} onChange={(event) => updateScene(scene.id, { durationSeconds: Number(event.target.value) })} /></Field>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2" onClick={generateSceneImage}><ImagePlus className="h-4 w-4" />Gerar variação</Button>
          <Button variant="outline" disabled>Biblioteca: storage pendente</Button>
          <Button variant="outline" disabled>Upload: storage pendente</Button>
          <Button variant="outline" onClick={() => generateSceneVideo("image_to_video")}>Animar imagem</Button>
          <Button variant="outline" onClick={() => generateSceneVideo("text_to_video")}>Gerar cena em vídeo</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MediaPanel() {
  return <Panel title="Mídia" description="Troca de imagens e variações">{mediaAssets.map((asset) => <Badge key={asset.id}>{asset.title}</Badge>)}</Panel>;
}

function AssetPicker({ onClose, onInsert }: { onClose: () => void; onInsert: (assetId: string) => void }) {
  return (
    <Card className="border-primary/25 bg-card/95 shadow-[0_24px_80px_rgb(0_0_0/.45)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div><CardTitle>Biblioteca de assets</CardTitle><CardDescription>Pesquise e insira imagens ou videos na cena atual.</CardDescription></div>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {assetLibraryItems.filter((asset) => asset.type === "image" || asset.type === "video" || asset.type === "thumbnail").slice(0, 6).map((asset) => (
          <div key={asset.id} className="rounded-md border border-white/5 bg-secondary/40 p-3">
            <div className="grid aspect-video place-items-center overflow-hidden rounded-md bg-black/70">
              {asset.thumbnailUrl ? <img src={asset.thumbnailUrl} alt={asset.title} className="h-full w-full object-cover" /> : <Library className="h-6 w-6 text-primary" />}
            </div>
            <p className="mt-3 text-sm font-semibold">{asset.title}</p>
            <p className="text-xs text-muted-foreground">Quality {asset.qualityScore}/100 - usado em {asset.usageCount} videos</p>
            <Button className="mt-3 w-full" size="sm" onClick={() => onInsert(asset.id)}>Inserir na cena</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SubtitlePanel() {
  return <Panel title="Legendas" description="Estilos avançados">{advancedSubtitleStyles.map((style) => <Badge key={style.id}>{style.name}</Badge>)}{subtitleSegments.slice(0, 3).map((segment) => <p key={segment.id} className="text-sm text-muted-foreground">{segment.text}</p>)}</Panel>;
}

function AudioPanel({ currentAudio }: { currentAudio?: { narrationVolume: number; musicVolume: number; fadeInSeconds: number; fadeOutSeconds: number; loopMusic: boolean } }) {
  return <Panel title="Áudio" description="Volumes, fades e música">{currentAudio ? <><p className="text-sm">Narração: {currentAudio.narrationVolume}%</p><p className="text-sm">Música: {currentAudio.musicVolume}%</p><p className="text-sm">Fade: {currentAudio.fadeInSeconds}s / {currentAudio.fadeOutSeconds}s</p></> : null}{musicTracks.map((track) => <Badge key={track.id}>{track.title}</Badge>)}</Panel>;
}

function EffectsPanel({ renderRows }: { renderRows: Array<Record<string, unknown>> }) {
  const rows = renderRows.length ? renderRows : videoRenders;
  return <Panel title="Efeitos" description={renderRows.length ? "Cena, video inteiro e renders reais" : "Cena ou video inteiro - dados demonstrativos"}>{videoEffects.map((effect) => <Badge key={effect.id}>{effect.effectType} {effect.intensity}%</Badge>)}{imageAnimations.map((animation) => <Badge key={animation.id}>Animação {animation.status}</Badge>)}{rows.map((render) => <p key={String(render.id)} className="text-sm text-muted-foreground">{Array.isArray(render.logs) ? render.logs.join(" · ") : String(render.status ?? "render")}</p>)}</Panel>;
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{children}</CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
