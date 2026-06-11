import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob } from "@/lib/jobs/job-queue";
import type { RenderQuality } from "@/lib/render/ffmpeg-renderer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const videoProjectId = String(body.video_project_id ?? "");
  if (!videoProjectId) return NextResponse.json({ status: "failed", error: "video_project_id obrigatorio." }, { status: 400 });
  const quality = (body.quality ?? (body.preview ? "preview" : "final")) as RenderQuality;
  const requiredCredits = quality === "preview" ? 1 : Number(body.duration_seconds ?? 60) > 90 ? 10 : 3;
  const { user } = await requireAuth();
  await requirePermission(workspaceId, "content.create");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "render_video", route: "/api/render/video" });
  const usage = await canUseFeature(workspaceId, "render_video", requiredCredits);

  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  const job = await enqueueJob({
    workspaceId,
    userId: user.id,
    type: "render_video",
    priority: quality === "preview" ? 7 : 8,
    payload: { ...body, video_project_id: videoProjectId, quality, required_credits: requiredCredits }
  });

  await registerAuditLog({
    action: "create",
    entityType: "background_job",
    entityId: videoProjectId,
    metadata: {
      jobId: job.id,
      jobType: "render_video",
      quality,
      status: job.status,
      credits_reserved: requiredCredits
    }
  });

  return NextResponse.json({
    video_project_id: videoProjectId,
    job_id: job.id,
    status: "queued",
    provider: "ffmpeg",
    provider_mode: "worker",
    artifact_verified: false,
    artifact_status: "pending_worker",
    storage_status: "pending_worker",
    cost_estimate: requiredCredits,
    usage,
    worker_required: true,
    polling_url: `/api/jobs/${job.id}`,
    warning: "Render enfileirado. Execute npm run worker ou use Processar proximo job em /app/queue."
  });
}

