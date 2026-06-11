import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth";
import { enqueueJob, getJobs, getQueueHealth, type BackgroundJobStatus, type BackgroundJobType } from "@/lib/jobs/job-queue";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspace_id") ?? undefined;
  const { user } = await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");
  const status = searchParams.get("status") as BackgroundJobStatus | null;
  const type = searchParams.get("type") as BackgroundJobType | null;
  const jobs = await getJobs({ workspaceId, status: status ?? undefined, type: type ?? undefined });
  const health = await getQueueHealth();
  return NextResponse.json({ jobs, health });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user } = await requireAuth();
  if (!body.workspace_id) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const workspace = await requirePermission(String(body.workspace_id), "content.create");
  const job = await enqueueJob({
    workspaceId: workspace.workspaceId ?? "ws_1",
    userId: user.id,
    type: body.type ?? "ai_generation",
    priority: body.priority ? Number(body.priority) : undefined,
    payload: body.payload ?? body
  });
  return NextResponse.json({ status: "queued", job_id: job.id, job, polling_url: `/api/jobs/${job.id}` });
}
