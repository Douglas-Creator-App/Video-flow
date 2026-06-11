import { channels, thumbnailGenerations, videoMetadataItems, videoProjects } from "@/lib/mock-data";
import { isVerifiedArtifactUrl, verifyExportPackage } from "@/lib/artifact-verification";
import type { ExportPackage, ExportPackageManifest, ExportPlatform, PlatformPreset, VideoMetadata } from "@/lib/types";

export const platformPresets: PlatformPreset[] = [
  { platform: "youtube", label: "YouTube Longo", titleLimit: 100, descriptionMode: "full", requiresThumbnail: true, hashtagMode: "recommended", ctaStyle: "inscricao e comentario" },
  { platform: "youtube_shorts", label: "YouTube Shorts", titleLimit: 60, descriptionMode: "short", requiresThumbnail: false, hashtagMode: "required", ctaStyle: "salvar e comentar" },
  { platform: "tiktok", label: "TikTok", titleLimit: 80, descriptionMode: "caption", requiresThumbnail: false, hashtagMode: "required", ctaStyle: "curto e direto" },
  { platform: "instagram_reels", label: "Instagram Reels", titleLimit: 90, descriptionMode: "caption", requiresThumbnail: false, hashtagMode: "required", ctaStyle: "seguir perfil" },
  { platform: "facebook_reels", label: "Facebook Reels", titleLimit: 90, descriptionMode: "short", requiresThumbnail: false, hashtagMode: "optional", ctaStyle: "comentario simples" }
];

export function platformLabel(platform: ExportPlatform) {
  return platformPresets.find((preset) => preset.platform === platform)?.label ?? platform;
}

export function generateVideoMetadata(videoProjectId: string, platform: ExportPlatform): VideoMetadata {
  const existing = videoMetadataItems.find((item) => item.videoProjectId === videoProjectId && item.platform === platform);
  if (existing) return existing;

  const video = videoProjects.find((item) => item.id === videoProjectId) ?? videoProjects[0];
  const preset = platformPresets.find((item) => item.platform === platform) ?? platformPresets[0];
  const baseTitle = trimToLimit(video.title.replace(/Ã§/g, "c"), preset.titleLimit);
  const hashtags = platform === "facebook_reels" ? ["#conteudo"] : ["#videoflow", "#conteudo", "#criadores", "#shorts"];
  const cta = preset.ctaStyle === "seguir perfil" ? "Siga para mais ideias praticas." : "Salve e use no proximo video.";
  const metadata: VideoMetadata = {
    id: `metadata_${videoProjectId}_${platform}`,
    workspaceId: video.workspaceId,
    videoProjectId,
    platform,
    title: baseTitle,
    titleVariations: [
      baseTitle,
      `Nao publique antes de revisar isso`,
      `O checklist que melhora seus videos`,
      `Como deixar seu video pronto para postar`,
      `Um passo simples antes de publicar`
    ],
    description: preset.descriptionMode === "full"
      ? `${video.title}\n\nChecklist pratico para publicar com mais clareza, melhor retencao e CTA mais forte.\n\n${cta}`
      : `${video.title}. ${cta}`,
    hashtags,
    tags: ["video", "conteudo", "publicacao", "roteiro", "thumbnail"],
    pinnedComment: "Qual parte voce revisa antes de publicar?",
    communityText: `Novo video pronto para publicar: ${video.title}`,
    cta,
    seoScore: 0,
    status: "generated",
    createdAt: new Date().toISOString()
  };
  return { ...metadata, seoScore: calculateSeoScore(metadata, "video") };
}

export function calculateSeoScore(metadata: Omit<VideoMetadata, "seoScore"> | VideoMetadata, keyword = "video") {
  let score = 0;
  const titleLength = metadata.title.length;
  if (titleLength > 20 && titleLength <= 80) score += 20;
  if (metadata.title.toLowerCase().includes(keyword.toLowerCase())) score += 15;
  if (metadata.title.split(" ").length >= 5) score += 15;
  if (/(erro|segredo|rapido|antes|melhor|simples|forte)/i.test(metadata.title)) score += 15;
  if (metadata.hashtags.length >= 3 && metadata.hashtags.length <= 8) score += 15;
  if (metadata.cta.length > 8) score += 20;
  return Math.min(100, score);
}

export function buildExportPackageManifest(pkg: ExportPackage, metadata: VideoMetadata): ExportPackageManifest {
  const video = videoProjects.find((item) => item.id === pkg.videoProjectId) ?? videoProjects[0];
  const channel = channels.find((item) => item.id === pkg.channelId) ?? channels[0];
  const thumbnail = thumbnailGenerations.find((item) => item.videoProjectId === video.id)?.selectedImageUrl ?? video.thumbnailUrl;
  const packageName = `${safePackageName(`${channel.name}-${pkg.createdAt.slice(0, 10)}-${pkg.title}-${platformLabel(pkg.targetPlatform)}`)}.zip`;

  return {
    packageName,
    metadata,
    files: [
      { name: "video-final.mp4", type: "video", url: isVerifiedArtifactUrl(video.renderUrl) ? video.renderUrl : undefined },
      { name: "thumbnail.png", type: "thumbnail", url: thumbnail },
      { name: "titulo.txt", type: "text", content: metadata.title },
      { name: "descricao.txt", type: "text", content: metadata.description },
      { name: "hashtags.txt", type: "text", content: metadata.hashtags.join(" ") },
      { name: "tags.txt", type: "text", content: metadata.tags.join(", ") },
      { name: "comentario-fixado.txt", type: "text", content: metadata.pinnedComment },
      { name: "metadata.json", type: "json", content: JSON.stringify(metadata, null, 2) }
    ],
    checklist: [
      { label: "Video renderizado", done: isVerifiedArtifactUrl(video.renderUrl) },
      { label: "Thumbnail criada", done: Boolean(thumbnail) },
      { label: "Titulo gerado", done: Boolean(metadata.title) },
      { label: "Descricao gerada", done: Boolean(metadata.description) },
      { label: "Hashtags geradas", done: metadata.hashtags.length > 0 },
      { label: "Pacote verificado", done: verifyExportPackage(pkg).packageVerified },
      { label: "Publicado manualmente", done: pkg.status === "marked_as_published" && verifyExportPackage(pkg).exportReady }
    ]
  };
}

export function createExportPackage(input: { workspaceId: string; channelId: string; videoProjectId: string; targetPlatform: ExportPlatform; title?: string }) {
  const video = videoProjects.find((item) => item.id === input.videoProjectId) ?? videoProjects[0];
  const metadata = generateVideoMetadata(input.videoProjectId, input.targetPlatform);
  const pkg: ExportPackage = {
    id: `export_package_${Date.now()}`,
    workspaceId: input.workspaceId,
    channelId: input.channelId,
    videoProjectId: input.videoProjectId,
    title: input.title ?? metadata.title ?? video.title,
    targetPlatform: input.targetPlatform,
    packageUrl: undefined,
    status: "preparing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return { package: pkg, metadata, manifest: buildExportPackageManifest(pkg, metadata) };
}

function trimToLimit(value: string, limit: number) {
  return value.length <= limit ? value : `${value.slice(0, limit - 1).trim()}`;
}

function safePackageName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
