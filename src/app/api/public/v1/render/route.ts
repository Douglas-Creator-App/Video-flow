import { NextResponse, type NextRequest } from "next/server";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob } from "@/lib/jobs/job-queue";
import { authenticatePublicApiKey, platformErrorResponse, recordPlatformUsage } from "@/lib/platform/api-keys";

export async function POST(request: NextRequest) {
  try {
    const key = await authenticatePublicApiKey(request, "render.write");
    const body = await request.json();
    const videoProjectId = String(body.video_project_id ?? "");
    if (!videoProjectId) return NextResponse.json({ error: "video_project_id obrigatorio." }, { status: 400 });
    const requiredCredits = body.quality === "preview" ? 1 : Number(body.duration_seconds ?? 60) > 90 ? 10 : 3;
    const usage = await canUseFeature(key.workspaceId, "render_video", requiredCredits);
    if (!usage.allowed) return NextResponse.json({ error: usage.reason, usage }, { status: 402 });

    const job = await enqueueJob({
      workspaceId: key.workspaceId,
      userId: key.id,
      type: "render_video",
      priority: body.quality === "preview" ? 7 : 8,
      payload: { ...body, workspace_id: key.workspaceId, video_project_id: videoProjectId, required_credits: requiredCredits, source: "public_api" }
    });
    await recordPlatformUsage({ workspaceId: key.workspaceId, apiKeyId: key.id, eventType: "public.render_queued", resourceType: "background_job", resourceId: job.id, metadata: { videoProjectId } });
    return NextResponse.json({ status: "queued", job_id: job.id, polling_url: `/api/public/v1/jobs/${job.id}`, usage });
  } catch (error) {
    return platformErrorResponse(error);
  }
}
