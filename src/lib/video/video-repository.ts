import { randomUUID } from "node:crypto";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { buildWorkspaceStoragePath, isSupabaseStorageConfigured, parseStorageUrl, uploadMediaFile } from "@/lib/storage/media-storage";
import type {
  ExportPackage,
  ExportPackageStatus,
  ExportPlatform,
  MediaAsset,
  SubtitleSegment,
  VideoAspectRatio,
  VideoFormat,
  VideoMetadata,
  VideoProject,
  VideoScene,
  VideoStatus
} from "@/lib/types";

export type VideoProjectBundle = {
  project: VideoProject;
  scenes: VideoScene[];
  subtitles: SubtitleSegment[];
  mediaAssets: MediaAsset[];
};

type DbVideoProject = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  content_id: string | null;
  title: string;
  format: VideoFormat;
  aspect_ratio: VideoAspectRatio;
  duration_target: number;
  narration_audio_url: string | null;
  background_music_url: string | null;
  subtitle_enabled: boolean;
  subtitle_style: string;
  visual_style: string | null;
  status: VideoStatus;
  render_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

type DbVideoScene = {
  id: string;
  workspace_id: string;
  video_project_id: string;
  order_index: number;
  script_text: string;
  narration_start: number | null;
  narration_end: number | null;
  media_asset_id: string | null;
  image_prompt: string | null;
  video_prompt: string | null;
  duration_seconds: number;
  motion_type: VideoScene["motionType"];
  transition_type: VideoScene["transitionType"];
  zoom_enabled: boolean;
  organic_motion_enabled: boolean;
  status: VideoScene["status"];
};

type DbSubtitle = {
  id: string;
  workspace_id: string;
  video_project_id: string;
  start_time: number;
  end_time: number;
  text: string;
  style: SubtitleSegment["style"];
  position: SubtitleSegment["position"];
};

type DbMediaAsset = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  content_id: string | null;
  type: MediaAsset["type"];
  source: MediaAsset["source"];
  file_url: string;
  thumbnail_url: string | null;
  title: string;
  description: string | null;
  tags: string[];
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  created_by: string | null;
  created_at: string;
};

export function isRealVideoRepositoryConfigured() {
  return isSupabaseAdminConfigured();
}

export async function persistVideoProjectBundle(input: {
  project: VideoProject;
  scenes: VideoScene[];
  subtitles: SubtitleSegment[];
  sceneImages: Array<{ sceneId: string; url: string; prompt: string }>;
  userId?: string;
}) {
  if (!isRealVideoRepositoryConfigured()) {
    return { skipped: true, reason: "Supabase admin nao configurado." };
  }

  const admin = createAdminClient();
  const project = { ...input.project };
  const scenes = input.scenes.map((scene) => ({ ...scene }));
  const mediaAssets: MediaAsset[] = [];

  if (project.narrationAudioUrl) {
    const audioUrl = await materializeMediaUrl({
      workspaceId: project.workspaceId,
      fileId: `${project.id}-narration`,
      url: project.narrationAudioUrl,
      bucket: "audio",
      resourceType: "tts",
      fallbackExtension: "mp3"
    });
    project.narrationAudioUrl = audioUrl;
    mediaAssets.push({
      id: randomUUID(),
      workspaceId: project.workspaceId,
      projectId: project.projectId,
      type: "audio",
      source: "ai_generated",
      fileUrl: audioUrl,
      title: `${project.title} - narracao`,
      description: "Narracao gerada para o Magic Mode.",
      tags: ["magic", "tts"],
      createdBy: input.userId ?? "",
      createdAt: new Date().toISOString()
    });
  }

  for (const scene of scenes) {
    const generated = input.sceneImages.find((item) => item.sceneId === scene.id);
    if (!generated?.url) continue;
    const imageUrl = await materializeMediaUrl({
      workspaceId: project.workspaceId,
      fileId: scene.id,
      url: generated.url,
      bucket: "images",
      resourceType: "generated",
      fallbackExtension: "png"
    });
    const asset: MediaAsset = {
      id: scene.mediaAssetId || randomUUID(),
      workspaceId: project.workspaceId,
      projectId: project.projectId,
      type: "image",
      source: "ai_generated",
      fileUrl: imageUrl,
      thumbnailUrl: imageUrl,
      title: `${project.title} - cena ${scene.orderIndex}`,
      description: generated.prompt,
      tags: ["magic", "scene"],
      createdBy: input.userId ?? "",
      createdAt: new Date().toISOString()
    };
    scene.mediaAssetId = asset.id;
    mediaAssets.push(asset);
    if (scene.orderIndex === 1 && project.thumbnailUrl === generated.url) {
      project.thumbnailUrl = await materializeMediaUrl({
        workspaceId: project.workspaceId,
        fileId: `${project.id}-thumbnail`,
        url: generated.url,
        bucket: "thumbnails",
        resourceType: "projects",
        fallbackExtension: "png"
      });
    }
  }

  const { error: projectError } = await admin.from("video_projects").upsert(toDbProject(project), { onConflict: "id" });
  if (projectError) throw new Error(`Falha ao persistir video_project: ${projectError.message}`);

  if (mediaAssets.length) {
    const { error } = await admin.from("media_assets").upsert(mediaAssets.map(toDbMediaAsset), { onConflict: "id" });
    if (error) throw new Error(`Falha ao persistir media_assets: ${error.message}`);
  }

  if (scenes.length) {
    const { error } = await admin.from("video_scenes").upsert(scenes.map(toDbScene), { onConflict: "id" });
    if (error) throw new Error(`Falha ao persistir video_scenes: ${error.message}`);
  }

  if (input.subtitles.length) {
    const { error } = await admin.from("subtitle_segments").upsert(input.subtitles.map(toDbSubtitle), { onConflict: "id" });
    if (error) throw new Error(`Falha ao persistir subtitle_segments: ${error.message}`);
  }

  return { skipped: false, project, scenes, mediaAssets };
}

export async function getVideoProjectBundle(videoProjectId: string): Promise<VideoProjectBundle | null> {
  if (!isRealVideoRepositoryConfigured()) return null;
  const admin = createAdminClient();
  const [projectResult, scenesResult, subtitlesResult, assetsResult] = await Promise.all([
    admin.from("video_projects").select("*").eq("id", videoProjectId).maybeSingle(),
    admin.from("video_scenes").select("*").eq("video_project_id", videoProjectId).order("order_index", { ascending: true }),
    admin.from("subtitle_segments").select("*").eq("video_project_id", videoProjectId).order("start_time", { ascending: true }),
    admin.from("media_assets").select("*").eq("id", "__none__")
  ]);
  if (projectResult.error) throw new Error(`Falha ao carregar video_project: ${projectResult.error.message}`);
  if (!projectResult.data) return null;
  if (scenesResult.error) throw new Error(`Falha ao carregar video_scenes: ${scenesResult.error.message}`);
  if (subtitlesResult.error) throw new Error(`Falha ao carregar subtitle_segments: ${subtitlesResult.error.message}`);

  const scenes = ((scenesResult.data ?? []) as DbVideoScene[]).map(mapScene);
  const assetIds = scenes.map((scene) => scene.mediaAssetId).filter(Boolean) as string[];
  let mediaAssets: MediaAsset[] = [];
  if (assetIds.length) {
    const { data, error } = await admin.from("media_assets").select("*").in("id", assetIds);
    if (error) throw new Error(`Falha ao carregar media_assets: ${error.message}`);
    mediaAssets = ((data ?? []) as DbMediaAsset[]).map(mapMediaAsset);
  } else if (assetsResult.error) {
    throw new Error(`Falha ao preparar media_assets: ${assetsResult.error.message}`);
  }

  return {
    project: mapProject(projectResult.data as DbVideoProject),
    scenes,
    subtitles: ((subtitlesResult.data ?? []) as DbSubtitle[]).map(mapSubtitle),
    mediaAssets
  };
}

export async function saveVideoRender(input: {
  workspaceId: string;
  videoProjectId: string;
  renderUrl: string;
  thumbnailUrl?: string;
  status: "completed" | "failed";
  durationSeconds?: number | null;
  fileSize?: number;
  logs?: string[];
  errorMessage?: string;
}) {
  if (!isRealVideoRepositoryConfigured()) return { skipped: true };
  const admin = createAdminClient();
  const { data, error } = await admin.from("video_renders").insert({
    workspace_id: input.workspaceId,
    video_project_id: input.videoProjectId,
    render_url: input.renderUrl,
    status: input.status,
    duration_seconds: input.durationSeconds ?? null,
    file_size: input.fileSize ?? 0,
    logs: input.logs ?? [],
    error_message: input.errorMessage ?? null
  }).select("*").single();
  if (error) throw new Error(`Falha ao persistir video_render: ${error.message}`);
  if (input.status === "completed") {
    const { error: updateError } = await admin.from("video_projects").update({
      render_url: input.renderUrl,
      thumbnail_url: input.thumbnailUrl ?? null,
      status: "completed",
      updated_at: new Date().toISOString()
    }).eq("id", input.videoProjectId);
    if (updateError) throw new Error(`Falha ao atualizar video_project render_url: ${updateError.message}`);
  }
  return data;
}

export async function getLatestVideoRender(videoProjectId: string) {
  if (!isRealVideoRepositoryConfigured()) return null;
  const { data, error } = await createAdminClient()
    .from("video_renders")
    .select("*")
    .eq("video_project_id", videoProjectId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar video_render: ${error.message}`);
  return data as { render_url?: string | null; file_size?: number | null; duration_seconds?: number | null; logs?: string[] | null } | null;
}

export async function getOrCreateVideoMetadata(videoProjectId: string, platform: ExportPlatform, factory: () => Promise<VideoMetadata>) {
  if (!isRealVideoRepositoryConfigured()) return factory();
  const admin = createAdminClient();
  const { data: existing, error } = await admin
    .from("video_metadata")
    .select("*")
    .eq("video_project_id", videoProjectId)
    .eq("platform", platform)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar video_metadata: ${error.message}`);
  if (existing) return mapMetadata(existing as Record<string, unknown>);
  const metadata = await factory();
  const { data, error: insertError } = await admin.from("video_metadata").insert({
    workspace_id: metadata.workspaceId,
    video_project_id: metadata.videoProjectId,
    platform: metadata.platform,
    title: metadata.title,
    title_variations: metadata.titleVariations,
    description: metadata.description,
    hashtags: metadata.hashtags,
    tags: metadata.tags,
    pinned_comment: metadata.pinnedComment,
    cta: metadata.cta,
    status: metadata.status
  }).select("*").single();
  if (insertError) throw new Error(`Falha ao persistir video_metadata: ${insertError.message}`);
  return mapMetadata(data as Record<string, unknown>);
}

export async function saveExportPackage(pkg: ExportPackage) {
  if (!isRealVideoRepositoryConfigured()) return { skipped: true };
  const { data, error } = await createAdminClient().from("export_packages").insert({
    workspace_id: pkg.workspaceId,
    channel_id: isUuid(pkg.channelId) ? pkg.channelId : null,
    video_project_id: pkg.videoProjectId,
    title: pkg.title,
    target_platform: pkg.targetPlatform,
    package_url: pkg.packageUrl ?? null,
    status: pkg.status
  }).select("*").single();
  if (error) throw new Error(`Falha ao persistir export_package: ${error.message}`);
  return data;
}

async function materializeMediaUrl(input: {
  workspaceId: string;
  fileId: string;
  url: string;
  bucket: "audio" | "images" | "thumbnails";
  resourceType: "tts" | "generated" | "projects";
  fallbackExtension: string;
}) {
  if (parseStorageUrl(input.url)) return input.url;
  if (!input.url.startsWith("data:")) {
    if (input.url.includes("/mock-")) throw new Error(`Artefato mockado nao pode ser persistido como real: ${input.url}`);
    return input.url;
  }
  if (!isSupabaseStorageConfigured()) throw new Error("Supabase Storage nao configurado para materializar artefato real.");
  const parsed = parseDataUrl(input.url);
  const extension = extensionFromMime(parsed.contentType) ?? input.fallbackExtension;
  const object = await uploadMediaFile({
    bucket: input.bucket,
    objectPath: buildWorkspaceStoragePath({ workspaceId: input.workspaceId, resourceType: input.resourceType, fileId: input.fileId, extension }),
    data: parsed.data,
    contentType: parsed.contentType
  });
  return object.url;
}

function parseDataUrl(value: string) {
  const match = value.match(/^data:([^;,]+)(;base64)?,(.*)$/);
  if (!match) throw new Error("Data URL invalida.");
  return {
    contentType: match[1],
    data: match[2] ? Buffer.from(match[3], "base64") : Buffer.from(decodeURIComponent(match[3]), "utf8")
  };
}

function extensionFromMime(mime: string) {
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("svg")) return "svg";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("wav")) return "wav";
  return null;
}

function toDbProject(project: VideoProject) {
  return {
    id: project.id,
    workspace_id: project.workspaceId,
    project_id: isUuid(project.projectId) ? project.projectId : null,
    content_id: isUuid(project.contentId) ? project.contentId : null,
    title: project.title,
    format: project.format,
    aspect_ratio: project.aspectRatio,
    duration_target: project.durationTarget,
    narration_audio_url: project.narrationAudioUrl ?? null,
    background_music_url: project.backgroundMusicUrl ?? null,
    subtitle_enabled: project.subtitleEnabled,
    subtitle_style: project.subtitleStyle,
    visual_style: project.visualStyle,
    status: project.status,
    render_url: project.renderUrl ?? null,
    thumbnail_url: project.thumbnailUrl ?? null,
    created_at: project.createdAt,
    updated_at: project.updatedAt
  };
}

function toDbScene(scene: VideoScene) {
  return {
    id: scene.id,
    workspace_id: scene.workspaceId,
    video_project_id: scene.videoProjectId,
    order_index: scene.orderIndex,
    script_text: scene.scriptText,
    narration_start: scene.narrationStart,
    narration_end: scene.narrationEnd,
    media_asset_id: isUuid(scene.mediaAssetId) ? scene.mediaAssetId : null,
    image_prompt: scene.imagePrompt,
    video_prompt: scene.videoPrompt ?? null,
    duration_seconds: scene.durationSeconds,
    motion_type: scene.motionType,
    transition_type: scene.transitionType,
    zoom_enabled: scene.zoomEnabled,
    organic_motion_enabled: scene.organicMotionEnabled,
    status: scene.status
  };
}

function toDbSubtitle(subtitle: SubtitleSegment) {
  return {
    id: subtitle.id,
    workspace_id: subtitle.workspaceId,
    video_project_id: subtitle.videoProjectId,
    start_time: subtitle.startTime,
    end_time: subtitle.endTime,
    text: subtitle.text,
    style: subtitle.style,
    position: subtitle.position
  };
}

function toDbMediaAsset(asset: MediaAsset) {
  return {
    id: asset.id,
    workspace_id: asset.workspaceId,
    project_id: isUuid(asset.projectId) ? asset.projectId : null,
    content_id: isUuid(asset.contentId) ? asset.contentId : null,
    type: asset.type,
    source: asset.source,
    file_url: asset.fileUrl,
    thumbnail_url: asset.thumbnailUrl ?? null,
    title: asset.title,
    description: asset.description,
    tags: asset.tags,
    duration_seconds: asset.durationSeconds ?? null,
    width: asset.width ?? null,
    height: asset.height ?? null,
    size_bytes: asset.sizeBytes ?? null,
    created_by: isUuid(asset.createdBy) ? asset.createdBy : null,
    created_at: asset.createdAt
  };
}

function mapProject(row: DbVideoProject): VideoProject {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.project_id ?? "",
    contentId: row.content_id ?? undefined,
    title: row.title,
    format: row.format,
    aspectRatio: row.aspect_ratio,
    durationTarget: Number(row.duration_target),
    narrationAudioUrl: row.narration_audio_url ?? undefined,
    backgroundMusicUrl: row.background_music_url ?? undefined,
    subtitleEnabled: row.subtitle_enabled,
    subtitleStyle: row.subtitle_style as VideoProject["subtitleStyle"],
    visualStyle: row.visual_style ?? "",
    status: row.status,
    renderUrl: row.render_url ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapScene(row: DbVideoScene): VideoScene {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    videoProjectId: row.video_project_id,
    orderIndex: Number(row.order_index),
    scriptText: row.script_text,
    narrationStart: Number(row.narration_start ?? 0),
    narrationEnd: Number(row.narration_end ?? 0),
    mediaAssetId: row.media_asset_id ?? undefined,
    imagePrompt: row.image_prompt ?? "",
    videoPrompt: row.video_prompt ?? undefined,
    durationSeconds: Number(row.duration_seconds),
    motionType: row.motion_type,
    transitionType: row.transition_type,
    zoomEnabled: row.zoom_enabled,
    organicMotionEnabled: row.organic_motion_enabled,
    status: row.status
  };
}

function mapSubtitle(row: DbSubtitle): SubtitleSegment {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    videoProjectId: row.video_project_id,
    startTime: Number(row.start_time),
    endTime: Number(row.end_time),
    text: row.text,
    style: row.style,
    position: row.position
  };
}

function mapMediaAsset(row: DbMediaAsset): MediaAsset {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.project_id ?? undefined,
    contentId: row.content_id ?? undefined,
    type: row.type,
    source: row.source,
    fileUrl: row.file_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    title: row.title,
    description: row.description ?? "",
    tags: row.tags ?? [],
    durationSeconds: row.duration_seconds ? Number(row.duration_seconds) : undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at
  };
}

function mapMetadata(row: Record<string, unknown>): VideoMetadata {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    videoProjectId: String(row.video_project_id),
    platform: String(row.platform) as ExportPlatform,
    title: String(row.title),
    titleVariations: Array.isArray(row.title_variations) ? row.title_variations.map(String) : [],
    description: String(row.description ?? ""),
    hashtags: Array.isArray(row.hashtags) ? row.hashtags.map(String) : [],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    pinnedComment: String(row.pinned_comment ?? ""),
    communityText: "",
    cta: String(row.cta ?? ""),
    seoScore: 0,
    status: String(row.status ?? "generated") as VideoMetadata["status"],
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
