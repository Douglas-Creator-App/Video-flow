import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { estimateQualityAnalysisCredits } from "@/lib/video-quality";
import type { ExportPlatform } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const videoProjectId = String(body.video_project_id ?? "");
  const mode = body.mode === "ai" ? "ai" : "simple";
  const platform = (body.platform ?? "youtube_shorts") as ExportPlatform;
  const credits = estimateQualityAnalysisCredits(mode);
  await requireAuth();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  if (!videoProjectId) return NextResponse.json({ status: "failed", error: "video_project_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      status: "failed",
      error: "Analise de qualidade real exige Supabase service role configurado."
    }, { status: 503 });
  }

  const analysis = await analyzeRealVideoQuality(workspaceId, videoProjectId, platform);

  await registerAuditLog({
    action: "create",
    entityType: "media_usage_logs",
    entityId: videoProjectId,
    metadata: { action_type: "quality_analysis", mode, credits, platform, workspace_id: workspaceId, provider_mode: "heuristic_real_data" }
  });

  return NextResponse.json({
    status: "completed",
    action_type: "quality_analysis",
    credits_consumed: mode === "ai" ? credits : 0,
    provider_mode: "heuristic_real_data",
    ...analysis
  });
}

async function analyzeRealVideoQuality(workspaceId: string, videoProjectId: string, platform: ExportPlatform) {
  const admin = createAdminClient();
  const [{ data: project, error: projectError }, { data: scenes, error: scenesError }, { data: render, error: renderError }, { data: metadata, error: metadataError }] = await Promise.all([
    admin.from("video_projects").select("*").eq("id", videoProjectId).eq("workspace_id", workspaceId).maybeSingle(),
    admin.from("video_scenes").select("*").eq("video_project_id", videoProjectId).eq("workspace_id", workspaceId).order("order_index", { ascending: true }),
    admin.from("video_renders").select("*").eq("video_project_id", videoProjectId).eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("video_metadata").select("*").eq("video_project_id", videoProjectId).eq("workspace_id", workspaceId).eq("platform", platform).order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);
  for (const error of [projectError, scenesError, renderError, metadataError]) {
    if (error) throw new Error(`Falha ao carregar dados de qualidade: ${error.message}`);
  }
  if (!project) throw new Error("Video project nao encontrado neste workspace.");

  const sceneRows = scenes ?? [];
  const recommendations: Array<{ type: string; severity: string; message: string; suggestion: string }> = [];
  const sceneCount = sceneRows.length;
  const hasRender = render?.status === "completed" && Boolean(render?.render_url);
  const hasThumbnail = Boolean(project.thumbnail_url || render?.thumbnail_url);
  const hasMetadata = Boolean(metadata?.title && metadata?.description);
  const longScenes = sceneRows.filter((scene) => Number(scene.duration_seconds ?? 0) > 8);
  const emptyTextScenes = sceneRows.filter((scene) => !String(scene.script_text ?? scene.text ?? "").trim());

  if (sceneCount < 3) recommendations.push({ type: "pacing", severity: "high", message: "Poucas cenas para manter ritmo.", suggestion: "Divida o roteiro em pelo menos 3 cenas." });
  if (longScenes.length) recommendations.push({ type: "pacing", severity: "medium", message: `${longScenes.length} cena(s) longas demais.`, suggestion: "Encurte cenas acima de 8 segundos ou adicione movimento." });
  if (emptyTextScenes.length) recommendations.push({ type: "script", severity: "medium", message: "Existem cenas sem texto/roteiro.", suggestion: "Revise as cenas sem fala antes de exportar." });
  if (!hasThumbnail) recommendations.push({ type: "thumbnail", severity: "high", message: "Thumbnail real ausente.", suggestion: "Gere ou selecione uma thumbnail antes da publicacao." });
  if (!hasMetadata) recommendations.push({ type: "metadata", severity: "medium", message: "Titulo/descricao ainda nao persistidos.", suggestion: "Gere metadados da plataforma antes de exportar." });
  if (!hasRender) recommendations.push({ type: "visual", severity: "critical", message: "Render final nao concluido.", suggestion: "Renderize o MP4 antes de validar exportacao." });

  const hookScore = clampScore(sceneCount ? 62 + Math.min(18, sceneCount * 3) : 35);
  const scriptScore = clampScore(75 - emptyTextScenes.length * 10);
  const visualScore = clampScore((hasRender ? 78 : 45) - longScenes.length * 4);
  const subtitleScore = clampScore(sceneRows.some((scene) => scene.subtitle_text || scene.captions) ? 78 : 58);
  const thumbnailScore = hasThumbnail ? 78 : 42;
  const retentionScore = clampScore(72 - longScenes.length * 6 + Math.min(sceneCount * 2, 12));
  const ctaScore = hasMetadata ? 74 : 55;
  const overallScore = clampScore(Math.round((hookScore + scriptScore + visualScore + subtitleScore + thumbnailScore + retentionScore + ctaScore) / 7));
  const recommendationTexts = recommendations.map((item) => item.message);

  const { data: score, error: scoreError } = await admin
    .from("video_quality_scores")
    .insert({
      workspace_id: workspaceId,
      video_project_id: videoProjectId,
      overall_score: overallScore,
      hook_score: hookScore,
      script_score: scriptScore,
      visual_score: visualScore,
      subtitle_score: subtitleScore,
      thumbnail_score: thumbnailScore,
      retention_score: retentionScore,
      cta_score: ctaScore,
      recommendations: recommendationTexts
    })
    .select("*")
    .single();
  if (scoreError) throw new Error(`Falha ao salvar score de qualidade: ${scoreError.message}`);

  if (recommendations.length) {
    const { error } = await admin.from("video_recommendations").insert(recommendations.map((item) => ({
      workspace_id: workspaceId,
      video_project_id: videoProjectId,
      type: item.type,
      severity: item.severity,
      message: item.message,
      suggestion: item.suggestion
    })));
    if (error) throw new Error(`Falha ao salvar recomendacoes: ${error.message}`);
  }

  return {
    score,
    recommendations,
    checklist: [
      { label: "Qualidade acima de 70", done: overallScore >= 70 },
      { label: "Thumbnail selecionada", done: hasThumbnail },
      { label: "Titulo gerado", done: Boolean(metadata?.title) },
      { label: "Descricao gerada", done: Boolean(metadata?.description) },
      { label: "Legenda revisada", done: subtitleScore >= 70 },
      { label: "Render concluido", done: hasRender }
    ],
    diagnostics: {
      scenes: sceneCount,
      long_scenes: longScenes.length,
      empty_text_scenes: emptyTextScenes.length,
      render_status: render?.status ?? "missing",
      metadata_status: hasMetadata ? "ready" : "missing"
    }
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
