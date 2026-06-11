import { mkdir, readFile, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { isVerifiedArtifactUrl } from "@/lib/artifact-verification";
import { generateText } from "@/lib/providers/openai-text";
import { platformLabel, platformPresets } from "@/lib/export-center";
import { writeZipFile } from "@/lib/export/zip-writer";
import { extractFrameThumbnail } from "@/lib/media/ffmpeg";
import { getLatestRenderArtifact } from "@/lib/media/render-artifacts";
import { buildWorkspaceStoragePath, downloadMediaFile, isSupabaseStorageConfigured, parseStorageUrl, uploadMediaFile } from "@/lib/storage/media-storage";
import { getOrCreateVideoMetadata, getVideoProjectBundle, saveExportPackage } from "@/lib/video/video-repository";
import type { ExportPackage, ExportPlatform, VideoMetadata } from "@/lib/types";

export async function createRealExportPackage(videoProjectId: string, targetPlatform: ExportPlatform) {
  const logs = ["Export solicitado", `Plataforma: ${targetPlatform}`];
  if (!videoProjectId) return failed("video_project_id obrigatorio para export real.", logs);
  const payload = await buildPackagePayload(videoProjectId, targetPlatform, logs);
  if (payload.status === "failed") return payload;

  const outputDir = path.join(process.cwd(), "public", "exports");
  await mkdir(outputDir, { recursive: true });
  const packageName = `${safeName(`${payload.video.title}-${targetPlatform}-${Date.now()}`)}.zip`;
  const outputPath = path.join(outputDir, packageName);

  logs.push("Criando ZIP real");
  await writeZipFile(outputPath, payload.entries);

  const file = await stat(outputPath);
  let packageUrl = `/exports/${packageName}`;
  let warning = "ZIP criado em public/exports. Em producao, enviar para Supabase Storage bucket exports.";
  if (isSupabaseStorageConfigured()) {
    const object = await uploadMediaFile({ bucket: "exports", objectPath: buildWorkspaceStoragePath({ workspaceId: payload.video.workspaceId, resourceType: "packages", fileId: `${payload.video.id}-${targetPlatform}-${Date.now()}`, extension: "zip" }), filePath: outputPath, contentType: "application/zip" });
    packageUrl = object.url;
    warning = "ZIP enviado para Supabase Storage privado. Use signed URL para download.";
  }
  const pkg: ExportPackage = {
    id: randomUUID(),
    workspaceId: payload.video.workspaceId,
    channelId: "",
    videoProjectId: payload.video.id,
    title: payload.metadata.title,
    targetPlatform,
    packageUrl,
    status: "ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  logs.push(`ZIP pronto: ${pkg.packageUrl}`);
  await saveExportPackage(pkg);
  return { status: "ready" as const, package: pkg, metadata: payload.metadata, logs, fileSize: file.size, warning };
}

export async function createBulkExportPackage(videoProjectIds: string[], targetPlatform: ExportPlatform) {
  const outputDir = path.join(process.cwd(), "public", "exports");
  await mkdir(outputDir, { recursive: true });
  const entries: Array<{ name: string; data: Buffer }> = [];
  const logs: string[] = ["Export em lote solicitado", `Plataforma: ${targetPlatform}`];

  for (const [index, id] of videoProjectIds.entries()) {
    const itemLogs: string[] = [];
    const payload = await buildPackagePayload(id, targetPlatform, itemLogs);
    logs.push(...itemLogs.map((item) => `video-${index + 1}: ${item}`));
    if (payload.status === "failed") return { ...payload, logs };
    const folder = `video-${index + 1}`;
    entries.push(...payload.entries.map((entry) => ({ name: `${folder}/${entry.name}`, data: entry.data })));
  }

  const packageName = `bulk-${targetPlatform}-${Date.now()}.zip`;
  const outputPath = path.join(outputDir, packageName);
  await writeZipFile(outputPath, entries);
  const file = await stat(outputPath);
  let packageUrl = `/exports/${packageName}`;
  if (isSupabaseStorageConfigured()) {
    const firstBundle = videoProjectIds[0] ? await getVideoProjectBundle(videoProjectIds[0]) : null;
    const workspaceId = firstBundle?.project.workspaceId;
    if (!workspaceId) return { status: "failed" as const, error: "Workspace do lote nao encontrado.", logs };
    const object = await uploadMediaFile({ bucket: "exports", objectPath: buildWorkspaceStoragePath({ workspaceId, resourceType: "bulk", fileId: `${targetPlatform}-${Date.now()}`, extension: "zip" }), filePath: outputPath, contentType: "application/zip" });
    packageUrl = object.url;
  }
  return { status: "ready" as const, packageUrl, logs: logs.concat("ZIP em lote pronto"), fileSize: file.size };
}

async function buildPackagePayload(videoProjectId: string, targetPlatform: ExportPlatform, logs: string[]) {
  const bundle = await getVideoProjectBundle(videoProjectId);
  if (!bundle) return failed("Video nao encontrado no Supabase real.", logs);
  const video = bundle.project;
  const renderArtifact = await getLatestRenderArtifact(videoProjectId);
  const renderUrl = video.renderUrl && isVerifiedArtifactUrl(video.renderUrl) ? video.renderUrl : renderArtifact?.renderUrl;
  if (!renderUrl || !isVerifiedArtifactUrl(renderUrl)) return failed("Video ainda nao renderizado ou render_url ausente.", logs);

  const storageRender = parseStorageUrl(renderUrl);
  const videoPath = storageRender ? null : publicPathFromUrl(renderUrl);
  if (!storageRender && (!videoPath || !existsSync(videoPath))) return failed("Arquivo MP4 nao encontrado no storage/local public.", logs);

  const thumbnailUrl = video.thumbnailUrl ?? renderArtifact?.thumbnailUrl;
  const storageThumbnail = thumbnailUrl ? parseStorageUrl(thumbnailUrl) : null;
  const thumbnailPath = await resolveThumbnailPath(thumbnailUrl, videoPath, video.id, logs);
  if (!storageThumbnail && (!thumbnailPath || !existsSync(thumbnailPath))) return failed("Thumbnail ausente no storage/local public.", logs);

  const metadata = await getOrGenerateMetadata(videoProjectId, targetPlatform);
  const preset = platformPresets.find((item) => item.platform === targetPlatform) ?? platformPresets[0];
  if (preset.requiresThumbnail && !thumbnailPath) return failed("Thumbnail obrigatoria para esta plataforma.", logs);

  logs.push("Lendo MP4 e thumbnail");
  const videoBytes = storageRender ? await downloadMediaFile(renderUrl) : await readFile(videoPath!);
  const thumbBytes = storageThumbnail ? await downloadMediaFile(thumbnailUrl!) : await readFile(thumbnailPath!);
  const entries = [
    { name: "video.mp4", data: videoBytes },
    { name: "thumbnail.png", data: thumbBytes },
    { name: "title.txt", data: Buffer.from(metadata.title, "utf8") },
    { name: "description.txt", data: Buffer.from(metadata.description, "utf8") },
    { name: "hashtags.txt", data: Buffer.from(metadata.hashtags.join(" "), "utf8") },
    { name: "tags.txt", data: Buffer.from(metadata.tags.join(", "), "utf8") },
    { name: "pinned_comment.txt", data: Buffer.from(metadata.pinnedComment, "utf8") },
    { name: "metadata.json", data: Buffer.from(JSON.stringify({ ...metadata, platformLabel: platformLabel(targetPlatform) }, null, 2), "utf8") }
  ];
  return { status: "ready" as const, video, metadata, entries };
}

async function getOrGenerateMetadata(videoProjectId: string, platform: ExportPlatform): Promise<VideoMetadata> {
  return getOrCreateVideoMetadata(videoProjectId, platform, async () => createGeneratedMetadata(videoProjectId, platform));
}

async function createGeneratedMetadata(videoProjectId: string, platform: ExportPlatform): Promise<VideoMetadata> {
  const bundle = await getVideoProjectBundle(videoProjectId);
  if (!bundle) throw new Error("Video real obrigatorio para gerar metadados de export.");
  const base = buildBaseMetadata(bundle.project, platform);
  const ai = await generateText({
    systemPrompt: "Voce gera metadados para publicacao manual de videos. Responda em JSON valido.",
    userPrompt: `Crie titulo, 5 titulos alternativos, descricao, hashtags, tags, comentario fixado e CTA para plataforma ${platform}. Tema: ${base.title}`,
    maxTokens: 700,
    temperature: 0.6
  });
  if (ai.providerMode !== "real") {
    throw new Error(ai.warning ?? "OpenAI Text real indisponivel para gerar metadados de export.");
  }
  try {
    const parsed = JSON.parse(ai.text);
    return { ...base, title: parsed.title ?? base.title, titleVariations: parsed.titleVariations ?? base.titleVariations, description: parsed.description ?? base.description, hashtags: parsed.hashtags ?? base.hashtags, tags: parsed.tags ?? base.tags, pinnedComment: parsed.pinnedComment ?? base.pinnedComment, cta: parsed.cta ?? base.cta };
  } catch {
    return base;
  }
}

function buildBaseMetadata(video: { id: string; workspaceId: string; title: string }, platform: ExportPlatform): VideoMetadata {
  const preset = platformPresets.find((item) => item.platform === platform) ?? platformPresets[0];
  const title = video.title.length <= preset.titleLimit ? video.title : video.title.slice(0, preset.titleLimit - 1).trim();
  const hashtags = platform === "facebook_reels" ? ["#conteudo"] : ["#videoflow", "#conteudo", "#criadores", "#shorts"];
  const cta = preset.ctaStyle === "seguir perfil" ? "Siga para mais ideias praticas." : "Salve e use no proximo video.";
  return {
    id: `metadata_${video.id}_${platform}`,
    workspaceId: video.workspaceId,
    videoProjectId: video.id,
    platform,
    title,
    titleVariations: [title, "Nao publique antes de revisar isso", "O checklist que melhora seus videos", "Como deixar seu video pronto para postar", "Um passo simples antes de publicar"],
    description: preset.descriptionMode === "full" ? `${video.title}\n\nChecklist pratico para publicar com mais clareza, melhor retencao e CTA mais forte.\n\n${cta}` : `${video.title}. ${cta}`,
    hashtags,
    tags: ["video", "conteudo", "publicacao", "roteiro", "thumbnail"],
    pinnedComment: "Qual parte voce revisa antes de publicar?",
    communityText: `Novo video pronto para publicar: ${video.title}`,
    cta,
    seoScore: 0,
    status: "generated",
    createdAt: new Date().toISOString()
  };
}

function publicPathFromUrl(url?: string) {
  if (!url || /^https?:\/\//.test(url) || url.startsWith("data:")) return null;
  return path.join(process.cwd(), "public", url.replace(/^\//, ""));
}

async function resolveThumbnailPath(thumbnailUrl: string | undefined, videoPath: string | null, videoProjectId: string, logs: string[]) {
  if (thumbnailUrl && parseStorageUrl(thumbnailUrl)) return null;
  const thumbnailPath = publicPathFromUrl(thumbnailUrl);
  if (thumbnailPath && existsSync(thumbnailPath)) return thumbnailPath;
  if (!videoPath) return null;
  logs.push("Thumbnail ausente, tentando extrair frame do MP4");
  const outputDir = path.join(process.cwd(), "public", "thumbnails");
  await mkdir(outputDir, { recursive: true });
  const framePath = path.join(outputDir, `${videoProjectId}-frame-${Date.now()}.png`);
  await extractFrameThumbnail(videoPath, framePath);
  return framePath;
}

function failed(error: string, logs: string[]) {
  return { status: "failed" as const, error, logs };
}

function safeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
