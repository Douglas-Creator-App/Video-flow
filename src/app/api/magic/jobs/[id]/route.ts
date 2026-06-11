import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireWorkspace } from "@/lib/auth";
import { getJob } from "@/lib/jobs/job-queue";
import { magicSteps } from "@/lib/magic/magic-pipeline";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth();
  const record = await getJob(id);
  if (!record || record.job.type !== "magic_video") {
    return NextResponse.json({ status: "not_found", error: "Magic Job nao encontrado." }, { status: 404 });
  }
  await requireWorkspace(record.job.workspaceId);

  return NextResponse.json({
    status: record.job.status,
    job: {
      id: record.job.id,
      workspaceId: record.job.workspaceId,
      userId: record.job.userId,
      status: record.job.status,
      progress: record.job.progress,
      currentStep: record.job.currentStep,
      theme: String(record.job.payload.theme ?? "Magic Video"),
      projectId: String(record.job.payload.project_id ?? ""),
      format: String(record.job.payload.format ?? "reels"),
      aspectRatio: String(readNested(record.job.result, ["videoProject", "aspectRatio"]) ?? ""),
      durationTarget: Number(record.job.payload.duration_seconds ?? 0),
      costCredits: Number(record.job.payload.required_credits ?? 0),
      videoProjectId: resolveVideoProjectId(record.job.result),
      errorMessage: record.job.errorMessage,
      createdAt: record.job.createdAt,
      updatedAt: record.job.updatedAt
    },
    rawJob: record.job,
    logs: record.logs,
    steps: magicSteps
  });
}

function resolveVideoProjectId(result?: Record<string, unknown>) {
  const direct = result?.videoProjectId ?? result?.video_project_id;
  if (direct) return String(direct);
  const nested = readNested(result, ["videoProject", "id"]);
  return nested ? String(nested) : undefined;
}

function readNested(source: unknown, path: string[]) {
  let current = source;
  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}
