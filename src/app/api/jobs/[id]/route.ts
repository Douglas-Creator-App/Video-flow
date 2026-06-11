import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireWorkspace } from "@/lib/auth";
import { getJob } from "@/lib/jobs/job-queue";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth();
  const record = await getJob(id);
  if (!record) return NextResponse.json({ status: "not_found", error: "Job nao encontrado." }, { status: 404 });
  await requireWorkspace(record.job.workspaceId);
  return NextResponse.json({ status: record.job.status, ...record });
}
