import { NextResponse, type NextRequest } from "next/server";
import { getJob } from "@/lib/jobs/job-queue";
import { authenticatePublicApiKey, platformErrorResponse, recordPlatformUsage } from "@/lib/platform/api-keys";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const key = await authenticatePublicApiKey(request, "jobs.read");
    const { id } = await params;
    const record = await getJob(id);
    if (!record || record.job.workspaceId !== key.workspaceId) return NextResponse.json({ error: "Job nao encontrado." }, { status: 404 });
    await recordPlatformUsage({ workspaceId: key.workspaceId, apiKeyId: key.id, eventType: "public.job_retrieved", resourceType: "background_job", resourceId: id });
    return NextResponse.json({ status: record.job.status, ...record });
  } catch (error) {
    return platformErrorResponse(error);
  }
}
