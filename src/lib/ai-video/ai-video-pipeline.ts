import { aiVideoProviders } from "@/lib/mock-data";
import type {
  AiVideoAsset,
  AiVideoJobStatus,
  AiVideoPipelineResult,
  AiVideoProviderType,
  CameraMotion,
  ImageToVideoJob,
  IntroOutroGeneration,
  TalkingCharacterJob,
  TextToVideoJob,
  VideoAspectRatio
} from "@/lib/types";

export const motionPrompts = [
  "Movimento cinematografico suave",
  "Zoom lento dramatico",
  "Camera se aproximando",
  "Camera se afastando",
  "Movimento epico",
  "Movimento documental",
  "Movimento de batalha",
  "Movimento religioso contemplativo",
  "Movimento misterioso",
  "Movimento anime"
];

export function estimateAiVideoCost(provider: AiVideoProviderType, durationSeconds: number) {
  const config = aiVideoProviders.find((item) => item.provider === provider) ?? aiVideoProviders.find((item) => item.provider === "mock");
  return Number(((config?.costPerGeneration ?? 0) + (config?.costPerSecond ?? 0) * durationSeconds).toFixed(2));
}

export async function runTextToVideo(input: {
  workspaceId?: string;
  projectId: string;
  provider: AiVideoProviderType;
  prompt: string;
  negativePrompt?: string;
  visualStyle: string;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  cameraMotion: CameraMotion;
  quality: "draft" | "standard" | "high";
}): Promise<AiVideoPipelineResult> {
  const cost = estimateAiVideoCost(input.provider, input.durationSeconds);
  const id = `text_video_${Date.now()}`;
  const job: TextToVideoJob = {
    id,
    workspaceId: input.workspaceId ?? "ws_1",
    projectId: input.projectId,
    provider: input.provider,
    prompt: input.prompt,
    negativePrompt: input.negativePrompt ?? "",
    visualStyle: input.visualStyle,
    durationSeconds: input.durationSeconds,
    aspectRatio: input.aspectRatio,
    cameraMotion: input.cameraMotion,
    quality: input.quality,
    outputVideoUrl: "/media/mock-render.mp4",
    thumbnailUrl: "/media/mock-thumbnail-2.jpg",
    status: "completed",
    progress: 100,
    cost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return { job, asset: assetFromJob(job, "text_to_video", input.prompt), logs: mockLogs(input.provider) };
}

export async function runImageToVideo(input: {
  workspaceId?: string;
  videoProjectId: string;
  sceneId: string;
  provider: AiVideoProviderType;
  inputImageUrl: string;
  motionPrompt: string;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
}): Promise<AiVideoPipelineResult> {
  const cost = estimateAiVideoCost(input.provider, input.durationSeconds);
  const job: ImageToVideoJob = {
    id: `image_video_${Date.now()}`,
    workspaceId: input.workspaceId ?? "ws_1",
    videoProjectId: input.videoProjectId,
    sceneId: input.sceneId,
    provider: input.provider,
    inputImageUrl: input.inputImageUrl,
    motionPrompt: input.motionPrompt,
    durationSeconds: input.durationSeconds,
    aspectRatio: input.aspectRatio,
    outputVideoUrl: "/media/mock-render.mp4",
    status: "completed",
    progress: 100,
    cost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return { job, asset: assetFromJob(job, "image_to_video", input.motionPrompt), logs: mockLogs(input.provider) };
}

export async function runTalkingCharacter(input: {
  workspaceId?: string;
  projectId: string;
  inputImageUrl: string;
  characterDescription: string;
  speechText: string;
  voiceId: string;
  provider: AiVideoProviderType;
  durationSeconds: number;
}): Promise<AiVideoPipelineResult> {
  const cost = estimateAiVideoCost(input.provider, input.durationSeconds);
  const job: TalkingCharacterJob = {
    id: `talking_${Date.now()}`,
    workspaceId: input.workspaceId ?? "ws_1",
    projectId: input.projectId,
    inputImageUrl: input.inputImageUrl,
    characterDescription: input.characterDescription,
    speechText: input.speechText,
    voiceId: input.voiceId,
    provider: input.provider,
    durationSeconds: input.durationSeconds,
    outputVideoUrl: "/media/mock-render.mp4",
    status: "completed",
    progress: 100,
    cost,
    createdAt: new Date().toISOString()
  };
  return { job, asset: assetFromJob(job, "talking_character", input.characterDescription), logs: mockLogs(input.provider) };
}

export async function runIntroOutro(input: {
  workspaceId?: string;
  videoProjectId: string;
  type: "intro" | "outro";
  provider: AiVideoProviderType;
  prompt: string;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
}): Promise<AiVideoPipelineResult> {
  const cost = estimateAiVideoCost(input.provider, input.durationSeconds);
  const job: IntroOutroGeneration = {
    id: `${input.type}_${Date.now()}`,
    workspaceId: input.workspaceId ?? "ws_1",
    videoProjectId: input.videoProjectId,
    type: input.type,
    provider: input.provider,
    prompt: input.prompt,
    durationSeconds: input.durationSeconds,
    aspectRatio: input.aspectRatio,
    outputVideoUrl: "/media/mock-render.mp4",
    status: "completed" as AiVideoJobStatus,
    cost,
    createdAt: new Date().toISOString()
  };
  return { job, asset: assetFromJob(job, input.type, input.prompt), logs: mockLogs(input.provider) };
}

function assetFromJob(
  job: TextToVideoJob | ImageToVideoJob | TalkingCharacterJob | IntroOutroGeneration,
  source: AiVideoAsset["source"],
  title: string
): AiVideoAsset {
  return {
    id: `ai_video_asset_${Date.now()}`,
    workspaceId: job.workspaceId,
    projectId: "projectId" in job ? job.projectId : undefined,
    videoProjectId: "videoProjectId" in job ? job.videoProjectId : undefined,
    source,
    title: title.slice(0, 72),
    provider: job.provider,
    thumbnailUrl: "thumbnailUrl" in job && job.thumbnailUrl ? job.thumbnailUrl : "/media/mock-thumbnail-2.jpg",
    videoUrl: job.outputVideoUrl ?? "/media/mock-render.mp4",
    durationSeconds: job.durationSeconds,
    aspectRatio: "aspectRatio" in job ? job.aspectRatio : "9:16",
    cost: job.cost,
    createdAt: new Date().toISOString()
  };
}

function mockLogs(provider: AiVideoProviderType) {
  return [
    "Job criado",
    `Provider selecionado: ${provider}`,
    provider === "mock"
      ? "Provider real nao configurado; fallback mockado usado"
      : "Provider de video ainda e placeholder; nenhuma chamada externa foi feita",
    "Processamento demonstrativo executado localmente",
    "Asset salvo apenas em memoria/mock-data",
    "Concluido em modo demo"
  ];
}
