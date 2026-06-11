import { NextResponse, type NextRequest } from "next/server";
import { sourceVideos, videoTranscripts, viralClipJobs, viralClips, viralMoments } from "@/lib/mock-data";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { estimateViralCost, runViralClipsPipeline, secondsForClipDuration } from "@/lib/viral/viral-clips-pipeline";

export async function GET() {
  await requireAuth();
  return NextResponse.json({
    jobs: viralClipJobs,
    source_videos: sourceVideos,
    transcripts: videoTranscripts,
    moments: viralMoments,
    clips: viralClips
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const { user } = await requireAuth();
  await requirePermission(workspaceId, "content.create");
  const clipDurationSeconds = secondsForClipDuration(body.clip_duration_mode ?? "30s", body.clip_duration_seconds);
  const clipsQuantity = Number(body.clips_quantity ?? 5);
  await requireRateLimit({ workspaceId, userId: user.id, feature: "jobs", route: "/api/viral-clips/jobs" });
  const usage = await canUseFeature(workspaceId, "viral_clips");

  if (body.preview === true) {
    return NextResponse.json({
      cost_estimate: estimateViralCost({ durationSeconds: 1840, clipsQuantity }),
      clip_duration_seconds: clipDurationSeconds,
      usage,
      status: "preview"
    });
  }

  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  try {
    const result = await runViralClipsPipeline({
      workspaceId,
      projectId: body.project_id ?? "project_1",
      userId: user.id,
      sourceUrl: body.source_url ?? "",
      outputFormat: body.output_format ?? "shorts",
      clipDurationMode: body.clip_duration_mode ?? "30s",
      clipDurationSeconds,
      clipsQuantity,
      subtitleStyle: body.subtitle_style ?? "tiktok",
      removeSilence: body.remove_silence ?? true,
      reframeVertical: body.reframe_vertical ?? true,
      reframeMode: body.reframe_mode ?? "blurred_background",
      rightsConfirmed: body.rights_confirmed ?? false,
      renderNow: body.render_now ?? false
    });
    return NextResponse.json({ ...result, usage });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error instanceof Error ? error.message : "Erro ao criar cortes virais." }, { status: 400 });
  }
}

