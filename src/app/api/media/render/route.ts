import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob } from "@/lib/jobs/job-queue";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const videoProjectId = body.video_project_id ?? "video_1";
  const preview = body.preview === true;
  const requiredCredits = preview ? 1 : Number(body.duration_seconds ?? 60) > 90 ? 10 : 3;
  const { user } = await requireAuth();
  await requirePermission(workspaceId, "content.create");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "render_video", route: "/api/media/render" });
  const usage = await canUseFeature(workspaceId, "render_video", requiredCredits);
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  const job = await enqueueJob({
    workspaceId,
    userId: user.id,
    type: "render_video",
    priority: preview ? 7 : 8,
    payload: { ...body, video_project_id: videoProjectId, quality: preview ? "preview" : "final", required_credits: requiredCredits }
  });

  return NextResponse.json({
    video_project_id: videoProjectId,
    job_id: job.id,
    status: "queued",
    provider: "ffmpeg",
    provider_mode: "worker",
    is_demo: false,
    artifact_verified: false,
    artifact_status: "pending_worker",
    warning: "Render enfileirado. Execute npm run worker para gerar o MP4.",
    duration_seconds: Number(body.duration_seconds ?? 30),
    storage_status: "pending_worker",
    cost_estimate: requiredCredits,
    usage,
    watermark_applied: usage.watermarkEnabled,
    logs: ["Job render_video criado", `job_id=${job.id}`],
    actions: {
      retry: true,
      cancel: true
    }
  });
}

