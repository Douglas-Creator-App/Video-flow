import { NextResponse, type NextRequest } from "next/server";
import { getJobs, type BackgroundJobStatus, type BackgroundJobType } from "@/lib/jobs/job-queue";
import { authenticatePublicApiKey, platformErrorResponse, recordPlatformUsage } from "@/lib/platform/api-keys";

export async function GET(request: NextRequest) {
  try {
    const key = await authenticatePublicApiKey(request, "jobs.read");
    const { searchParams } = new URL(request.url);
    const jobs = await getJobs({
      workspaceId: key.workspaceId,
      status: (searchParams.get("status") as BackgroundJobStatus | null) ?? undefined,
      type: (searchParams.get("type") as BackgroundJobType | null) ?? undefined
    });
    await recordPlatformUsage({ workspaceId: key.workspaceId, apiKeyId: key.id, eventType: "public.jobs_listed", resourceType: "background_job" });
    return NextResponse.json({ jobs });
  } catch (error) {
    return platformErrorResponse(error);
  }
}
