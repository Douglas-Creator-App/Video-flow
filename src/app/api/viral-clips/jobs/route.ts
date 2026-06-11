import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob, getJobs } from "@/lib/jobs/job-queue";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { aspectRatioForOutput, estimateViralCost, secondsForClipDuration, titleFromUrl, validateSourceUrl } from "@/lib/viral/viral-clips-pipeline";
import type { ReframeMode, ViralClipDurationMode, ViralClipOutputFormat, ViralSubtitleStyle } from "@/lib/types";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspace_id");
  await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");

  const jobs = await getJobs({ workspaceId, type: "viral_clip" });
  const artifacts = await listArtifacts(workspaceId);
  return NextResponse.json({
    source: isSupabaseAdminConfigured() ? "supabase" : "background_jobs",
    jobs,
    ...artifacts
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });

  const sourceUrl = String(body.source_url ?? "").trim();
  const validation = validateSourceUrl(sourceUrl);
  if (!validation.valid) return NextResponse.json({ status: "failed", error: validation.reason ?? "Fonte invalida." }, { status: 400 });

  const { user } = await requireAuth();
  await requirePermission(workspaceId, "content.create");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "jobs", route: "/api/viral-clips/jobs" });

  const outputFormat = normalizeOutputFormat(body.output_format);
  const clipDurationMode = normalizeDurationMode(body.clip_duration_mode);
  const clipDurationSeconds = secondsForClipDuration(clipDurationMode, Number(body.clip_duration_seconds ?? 30));
  const clipsQuantity = Math.max(1, Math.min(Number(body.clips_quantity ?? 5), 15));
  const costEstimate = estimateViralCost({ durationSeconds: Number(body.duration_seconds ?? 1800), clipsQuantity, renderClips: body.render_now !== false });
  const usage = await canUseFeature(workspaceId, "viral_clips", costEstimate.totalCredits);

  if (body.preview === true) {
    return NextResponse.json({
      cost_estimate: costEstimate,
      clip_duration_seconds: clipDurationSeconds,
      usage,
      status: "preview"
    });
  }

  if (body.rights_confirmed !== true) return NextResponse.json({ status: "failed", error: "Confirme que voce possui direito de uso deste conteudo." }, { status: 400 });
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  try {
    const subtitleStyle = normalizeSubtitleStyle(body.subtitle_style);
    const reframeMode = normalizeReframeMode(body.reframe_mode);
    const viralJob = await createViralClipJob({
      workspaceId,
      userId: user.id,
      projectId: optionalUuid(body.project_id),
      sourceUrl,
      sourceType: validation.sourceType,
      outputFormat,
      clipDurationMode,
      clipDurationSeconds,
      clipsQuantity,
      subtitleStyle,
      removeSilence: body.remove_silence !== false,
      reframeVertical: body.reframe_vertical !== false,
      reframeMode,
      estimatedCost: costEstimate.totalCredits
    });

    const job = await enqueueJob({
      workspaceId,
      userId: user.id,
      type: "viral_clip",
      priority: 6,
      payload: {
        viral_clip_job_id: viralJob?.id,
        source_video_id: viralJob?.source_video_id,
        source_url: sourceUrl,
        source_type: validation.sourceType,
        output_format: outputFormat,
        clip_duration_mode: clipDurationMode,
        clip_duration_seconds: clipDurationSeconds,
        clips_quantity: clipsQuantity,
        subtitle_style: subtitleStyle,
        reframe_mode: reframeMode,
        render_now: body.render_now === true,
        required_credits: costEstimate.totalCredits
      }
    });

    return NextResponse.json({
      status: "queued",
      job_id: job.id,
      viral_clip_job_id: viralJob?.id ?? null,
      source_video_id: viralJob?.source_video_id ?? null,
      provider_mode: "worker",
      usage,
      cost_estimate: costEstimate,
      polling_url: `/api/jobs/${job.id}`,
      review_url: viralJob?.id ? `/app/viral-clips/${viralJob.id}/review` : "/app/queue",
      warning: "Cortes virais enfileirados. Sem transcricao/download/render real configurados, o worker falhara com erro claro."
    });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error instanceof Error ? error.message : "Erro ao criar cortes virais." }, { status: 400 });
  }
}

async function listArtifacts(workspaceId: string) {
  if (!isSupabaseAdminConfigured()) return { source_videos: [], transcripts: [], moments: [], clips: [], viral_jobs: [] };
  const admin = createAdminClient();
  const [sourceVideos, transcripts, moments, clips, viralJobs] = await Promise.all([
    admin.from("source_videos").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
    admin.from("video_transcripts").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
    admin.from("viral_moments").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100),
    admin.from("viral_clips").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100),
    admin.from("viral_clip_jobs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50)
  ]);
  for (const result of [sourceVideos, transcripts, moments, clips, viralJobs]) {
    if (result.error) throw new Error(`Falha ao listar Viral Clips: ${result.error.message}`);
  }
  return {
    source_videos: sourceVideos.data ?? [],
    transcripts: transcripts.data ?? [],
    moments: moments.data ?? [],
    clips: clips.data ?? [],
    viral_jobs: viralJobs.data ?? []
  };
}

async function createViralClipJob(input: {
  workspaceId: string;
  userId: string;
  projectId: string | null;
  sourceUrl: string;
  sourceType: string;
  outputFormat: ViralClipOutputFormat;
  clipDurationMode: ViralClipDurationMode;
  clipDurationSeconds: number;
  clipsQuantity: number;
  subtitleStyle: ViralSubtitleStyle;
  removeSilence: boolean;
  reframeVertical: boolean;
  reframeMode: ReframeMode;
  estimatedCost: number;
}) {
  if (!isSupabaseAdminConfigured()) return null;
  const admin = createAdminClient();
  const { data: sourceVideo, error: sourceError } = await admin
    .from("source_videos")
    .insert({
      workspace_id: input.workspaceId,
      project_id: input.projectId,
      source_url: input.sourceUrl,
      source_type: input.sourceType,
      title: titleFromUrl(input.sourceUrl),
      duration_seconds: 0,
      status: "queued"
    })
    .select("id")
    .single();
  if (sourceError) throw new Error(`Falha ao registrar video fonte: ${sourceError.message}`);

  const { data: viralJob, error: jobError } = await admin
    .from("viral_clip_jobs")
    .insert({
      workspace_id: input.workspaceId,
      project_id: input.projectId,
      user_id: input.userId,
      source_url: input.sourceUrl,
      source_type: input.sourceType,
      output_format: input.outputFormat,
      aspect_ratio: aspectRatioForOutput(input.outputFormat),
      clip_duration_mode: input.clipDurationMode,
      clip_duration_seconds: input.clipDurationSeconds,
      clips_quantity: input.clipsQuantity,
      subtitle_style: input.subtitleStyle,
      remove_silence: input.removeSilence,
      reframe_vertical: input.reframeVertical,
      reframe_mode: input.reframeMode,
      rights_confirmed: true,
      status: "queued",
      progress: 0,
      current_step: "Enfileirado para transcricao real",
      estimated_cost: input.estimatedCost
    })
    .select("id")
    .single();
  if (jobError) throw new Error(`Falha ao registrar job de cortes: ${jobError.message}`);
  return { id: String(viralJob.id), source_video_id: String(sourceVideo.id) };
}

function normalizeOutputFormat(value: unknown): ViralClipOutputFormat {
  const allowed: ViralClipOutputFormat[] = ["shorts", "reels", "tiktok", "horizontal", "square"];
  return allowed.includes(value as ViralClipOutputFormat) ? value as ViralClipOutputFormat : "shorts";
}

function normalizeDurationMode(value: unknown): ViralClipDurationMode {
  const allowed: ViralClipDurationMode[] = ["15s", "30s", "45s", "60s", "90s", "auto", "custom"];
  return allowed.includes(value as ViralClipDurationMode) ? value as ViralClipDurationMode : "30s";
}

function normalizeSubtitleStyle(value: unknown): ViralSubtitleStyle {
  const allowed: ViralSubtitleStyle[] = ["tiktok", "popup", "word_by_word", "minimal", "documentary", "black_box"];
  return allowed.includes(value as ViralSubtitleStyle) ? value as ViralSubtitleStyle : "tiktok";
}

function normalizeReframeMode(value: unknown): ReframeMode {
  const allowed: ReframeMode[] = ["center_crop", "blurred_background", "smart_crop_placeholder", "split_screen_placeholder", "original_fit_blur"];
  return allowed.includes(value as ReframeMode) ? value as ReframeMode : "blurred_background";
}

function optionalUuid(value: unknown) {
  const text = String(value ?? "");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text) ? text : null;
}
