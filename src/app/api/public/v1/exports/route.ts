import { NextResponse, type NextRequest } from "next/server";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob } from "@/lib/jobs/job-queue";
import { authenticatePublicApiKey, platformErrorResponse, recordPlatformUsage } from "@/lib/platform/api-keys";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExportPlatform } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const key = await authenticatePublicApiKey(request, "exports.write");
    const body = await request.json();
    const ids = Array.isArray(body.video_project_ids) ? body.video_project_ids.map(String) : undefined;
    const videoProjectId = String(body.video_project_id ?? ids?.[0] ?? "");
    if (!videoProjectId && !ids?.length) return NextResponse.json({ error: "video_project_id obrigatorio." }, { status: 400 });
    const projectIds = ids?.length ? ids : [videoProjectId];
    const owned = await assertVideoProjectsOwnership(key.workspaceId, projectIds);
    if (!owned) return NextResponse.json({ error: "Um ou mais video_project_ids nao pertencem ao workspace da API key." }, { status: 404 });
    const requiredCredits = ids?.length ? ids.length : 1;
    const usage = await canUseFeature(key.workspaceId, "export_package", requiredCredits);
    if (!usage.allowed) return NextResponse.json({ error: usage.reason, usage }, { status: 402 });
    const platform = (body.target_platform ?? "youtube_shorts") as ExportPlatform;
    const job = await enqueueJob({
      workspaceId: key.workspaceId,
      userId: key.id,
      type: "export_package",
      priority: ids?.length ? 8 : 6,
      payload: { ...body, workspace_id: key.workspaceId, video_project_id: videoProjectId, video_project_ids: ids, target_platform: platform, required_credits: requiredCredits, source: "public_api" }
    });
    await recordPlatformUsage({ workspaceId: key.workspaceId, apiKeyId: key.id, eventType: "public.export_queued", resourceType: "background_job", resourceId: job.id, metadata: { videoProjectId, platform } });
    return NextResponse.json({ status: "queued", job_id: job.id, polling_url: `/api/public/v1/jobs/${job.id}`, usage });
  } catch (error) {
    return platformErrorResponse(error);
  }
}

async function assertVideoProjectsOwnership(workspaceId: string, videoProjectIds: string[]) {
  const uniqueIds = [...new Set(videoProjectIds.filter(Boolean))];
  if (!uniqueIds.length) return false;
  const { data, error } = await createAdminClient()
    .from("video_projects")
    .select("id")
    .eq("workspace_id", workspaceId)
    .in("id", uniqueIds);
  if (error) throw new Error(`Falha ao validar video_project_ids: ${error.message}`);
  return (data ?? []).length === uniqueIds.length;
}
