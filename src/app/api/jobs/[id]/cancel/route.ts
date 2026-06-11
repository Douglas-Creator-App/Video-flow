import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireWorkspace } from "@/lib/auth";
import { cancelJob, getJob } from "@/lib/jobs/job-queue";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth();
  const record = await getJob(id);
  if (!record) return NextResponse.json({ status: "not_found", error: "Job nao encontrado." }, { status: 404 });
  await requireWorkspace(record.job.workspaceId);
  const job = await cancelJob(id);
  if (!job) return NextResponse.json({ status: "not_found", error: "Job nao encontrado." }, { status: 404 });
  return NextResponse.json({ status: job.status, job });
}
