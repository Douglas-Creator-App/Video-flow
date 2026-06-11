import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob } from "@/lib/jobs/job-queue";
import type { ExportPlatform } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const platform = (body.target_platform ?? "youtube_shorts") as ExportPlatform;
  const ids = body.video_project_ids as string[] | undefined;
  const requiredCredits = ids?.length ? ids.length : 1;
  const { user } = await requireAuth();
  await requirePermission(workspaceId, "export_video");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "export_package", route: "/api/export/package" });
  const usage = await canUseFeature(workspaceId, "export_package", requiredCredits);
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  const job = await enqueueJob({
    workspaceId,
    userId: user.id,
    type: "export_package",
    priority: ids?.length ? 8 : 6,
    payload: { ...body, target_platform: platform, video_project_ids: ids, required_credits: requiredCredits }
  });

  await registerAuditLog({
    action: "create",
    entityType: "background_job",
    entityId: body.video_project_id,
    metadata: { jobId: job.id, jobType: "export_package", platform, status: job.status, credits_reserved: requiredCredits }
  });

  return NextResponse.json({
    status: "queued",
    job_id: job.id,
    target_platform: platform,
    worker_required: true,
    polling_url: `/api/jobs/${job.id}`,
    usage,
    artifact_verified: false,
    warning: "Export ZIP enfileirado. Execute npm run worker ou processe manualmente em /app/queue."
  });
}

