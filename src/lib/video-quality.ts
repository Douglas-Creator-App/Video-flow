import {
  hookAnalyses,
  platformOptimizations,
  retentionAnalyses,
  scenePacingItems,
  scriptImprovements,
  subtitleReadabilityAnalyses,
  thumbnailAnalyses,
  videoMetadataItems,
  videoQualityScores,
  videoRecommendations,
  videoRenders,
  videoVersionComparisons,
  videoVersions
} from "@/lib/mock-data";
import type { ExportPlatform, QualityBulkStatus, VideoQualityScore } from "@/lib/types";

export function getVideoQualityScore(videoProjectId: string): VideoQualityScore {
  return videoQualityScores.find((item) => item.videoProjectId === videoProjectId) ?? {
    id: `quality_${videoProjectId}`,
    workspaceId: "ws_1",
    videoProjectId,
    overallScore: 70,
    hookScore: 68,
    scriptScore: 72,
    visualScore: 70,
    subtitleScore: 74,
    thumbnailScore: 66,
    retentionScore: 69,
    ctaScore: 71,
    recommendations: ["Revise gancho, thumbnail e CTA antes de exportar."],
    createdAt: new Date().toISOString()
  };
}

export function getVideoQualityBundle(videoProjectId: string, platform: ExportPlatform = "youtube_shorts") {
  return {
    score: getVideoQualityScore(videoProjectId),
    recommendations: videoRecommendations.filter((item) => item.videoProjectId === videoProjectId),
    retention: retentionAnalyses.find((item) => item.videoProjectId === videoProjectId),
    hook: hookAnalyses.find((item) => item.videoProjectId === videoProjectId),
    script: scriptImprovements.find((item) => item.videoProjectId === videoProjectId),
    pacing: scenePacingItems,
    thumbnail: thumbnailAnalyses.find((item) => item.videoProjectId === videoProjectId),
    subtitles: subtitleReadabilityAnalyses.find((item) => item.videoProjectId === videoProjectId),
    platform: platformOptimizations.find((item) => item.videoProjectId === videoProjectId && item.platform === platform),
    comparison: videoVersionComparisons.find((item) => item.videoProjectId === videoProjectId)
  };
}

export function classifyBulkQuality(score: number): QualityBulkStatus {
  if (score >= 70) return "aprovado";
  if (score >= 55) return "precisa_ajuste";
  return "critico";
}

export function getPreExportChecklist(videoProjectId: string, platform: ExportPlatform = "youtube_shorts") {
  const score = getVideoQualityScore(videoProjectId);
  const metadata = videoMetadataItems.find((item) => item.videoProjectId === videoProjectId && item.platform === platform);
  const render = videoRenders.find((item) => item.videoProjectId === videoProjectId);
  const version = videoVersions.find((item) => item.videoProjectId === videoProjectId);

  return [
    { label: "Qualidade acima de 70", done: score.overallScore >= 70 },
    { label: "Thumbnail selecionada", done: Boolean(version?.thumbnailUrl) },
    { label: "Titulo gerado", done: Boolean(metadata?.title) },
    { label: "Descricao gerada", done: Boolean(metadata?.description) },
    { label: "Legenda revisada", done: score.subtitleScore >= 70 },
    { label: "Render concluido", done: render?.status === "completed" }
  ];
}

export function getQualityDashboardRows() {
  return videoQualityScores.map((score) => ({
    ...score,
    status: classifyBulkQuality(score.overallScore),
    pendingRecommendations: videoRecommendations.filter((item) => item.videoProjectId === score.videoProjectId && !item.applied && !item.ignored).length
  }));
}

export function estimateQualityAnalysisCredits(mode: "simple" | "ai") {
  return mode === "simple" ? 0 : 6;
}
