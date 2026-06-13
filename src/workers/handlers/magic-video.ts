import { estimateMagicCost, secondsFromDuration } from "@/lib/magic/magic-pipeline";
import { runMagicVideoPipeline } from "@/lib/magic/magic-pipeline.server";
import { logMediaUsage, logProviderUsage } from "@/lib/billing/credit-ledger";
import { persistVideoProjectBundle } from "@/lib/video/video-repository";
import type { MagicAdvancedSettings, MagicDurationTarget, MagicVisualStyle } from "@/lib/types";
import type { JobHandler } from "@/workers/handlers/types";

export const magicVideoHandler: JobHandler = async (job, context) => {
  const durationTarget = (job.payload.duration_target ?? "60s") as MagicDurationTarget;
  const advancedSettings = normalizeAdvancedSettings(job.payload.advanced_settings as Partial<MagicAdvancedSettings> | undefined);
  const durationSeconds = secondsFromDuration(durationTarget, advancedSettings.customDurationSeconds);
  const sceneCount = advancedSettings.sceneCount || Math.max(5, Math.round(durationSeconds / 8));
  const costEstimate = estimateMagicCost({
    durationSeconds,
    sceneCount,
    subtitleEnabled: job.payload.subtitle_enabled !== false,
    musicEnabled: job.payload.music_enabled !== false,
    autoThumbnail: job.payload.auto_thumbnail !== false
  });
  await context.update(15, "Criando roteiro e estrutura");
  if (await context.shouldCancel()) throw new Error("Job cancelado antes do Magic Mode.");
  await context.update(45, "Gerando cenas e assets");
  const result = await runMagicVideoPipeline({
    workspaceId: job.workspaceId,
    projectId: String(job.payload.project_id ?? "project_1"),
    userId: job.userId,
    theme: String(job.payload.theme ?? "Novo video Video Flow"),
    format: String(job.payload.format ?? "reels") as never,
    durationTarget,
    narrativeType: String(job.payload.narrative_type ?? "educacional") as never,
    voiceId: String(job.payload.voice_id ?? "alloy"),
    visualStyle: String(job.payload.visual_style ?? "cinematografico") as MagicVisualStyle,
    visualSource: String(job.payload.visual_source ?? "mixed") as never,
    subtitleEnabled: job.payload.subtitle_enabled !== false,
    musicEnabled: job.payload.music_enabled !== false,
    autoThumbnail: job.payload.auto_thumbnail !== false,
    advancedSettings
  });
  await context.update(72, "Persistindo projeto, cenas e assets");
  const persisted = await persistVideoProjectBundle({
    project: result.videoProject,
    scenes: result.videoScenes,
    subtitles: result.subtitles,
    sceneImages: result.videoScenes.map((scene) => {
      const plan = result.scenes.find((item) => item.order === scene.orderIndex);
      return { sceneId: scene.id, url: plan?.generatedImageUrl ?? "", prompt: scene.imagePrompt };
    }),
    userId: job.userId
  });
  if (persisted.skipped) throw new Error("Supabase real nao configurado para persistir o Magic Mode.");
  await logMediaUsage({ workspaceId: job.workspaceId, userId: job.userId, provider: "openai_tts", actionType: "tts_generation", units: result.script.length, cost: costEstimate.voiceCost, referenceId: job.id });
  await logMediaUsage({ workspaceId: job.workspaceId, userId: job.userId, provider: "openai_images", actionType: "image_generation", units: result.videoScenes.length, cost: costEstimate.imageCost, referenceId: job.id });
  if (result.thumbnailUrl) await logMediaUsage({ workspaceId: job.workspaceId, userId: job.userId, provider: "openai_images", actionType: "thumbnail_generation", units: 1, cost: costEstimate.thumbnailCost, referenceId: job.id });
  await logProviderUsage({ workspaceId: job.workspaceId, userId: job.userId, jobId: job.id, provider: "openai", taskType: "magic_video", inputUnits: result.script.length, outputUnits: result.videoScenes.length, costEstimate: costEstimate.totalCredits, creditsCharged: Number(job.payload.required_credits ?? costEstimate.totalCredits), status: "completed", metadata: { videoProjectId: result.videoProject.id } });
  await context.log("Magic Mode persistido no Supabase", { videoProjectId: result.videoProject.id, scenes: result.videoScenes.length, costEstimate: costEstimate.totalCredits, status: result.job.status });
  return { ...result, cost_estimate: costEstimate };
};

function normalizeAdvancedSettings(settings: Partial<MagicAdvancedSettings> | undefined): MagicAdvancedSettings {
  return {
    scriptInstructions: settings?.scriptInstructions ?? "",
    imageInstructions: settings?.imageInstructions ?? "",
    forbiddenWords: settings?.forbiddenWords ?? "",
    targetAudience: settings?.targetAudience ?? "",
    language: settings?.language ?? "pt-BR",
    narrationTone: settings?.narrationTone ?? "confiante",
    cta: settings?.cta ?? "",
    sceneCount: Number(settings?.sceneCount ?? 8),
    customDurationSeconds: settings?.customDurationSeconds ? Number(settings.customDurationSeconds) : undefined,
    customScript: settings?.customScript ?? "",
    useZoom: settings?.useZoom ?? true,
    useOrganicMotion: settings?.useOrganicMotion ?? true,
    autoThumbnail: settings?.autoThumbnail ?? true,
    autoMusic: settings?.autoMusic ?? true,
    autoSubtitles: settings?.autoSubtitles ?? true
  };
}
