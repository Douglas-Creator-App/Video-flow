import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { getFactoryAnalytics } from "@/lib/content-factory";
import { enqueueJob } from "@/lib/jobs/job-queue";

export async function GET() {
  await requireAuth();
  return NextResponse.json({
    status: "ready",
    provider_mode: "internal_mock",
    analytics: getFactoryAnalytics()
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user } = await requireAuth();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "ai.generate");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "jobs", route: "/api/factories/generate" });
  const factoryId = body.factory_id ?? body.factoryId ?? "factory_1";
  const action = body.action ?? "generate";
  const job = await enqueueJob({
    workspaceId,
    userId: user.id,
    type: "factory_generation",
    priority: 5,
    payload: { ...body, factory_id: factoryId, action }
  });

  await registerAuditLog({
    action: action === "regenerate" ? "update" : "create",
    entityType: "background_job",
    entityId: factoryId,
    metadata: {
      jobId: job.id,
      jobType: "factory_generation",
      action,
      provider_mode: "worker",
      publish_blocked: true
    }
  });

  return NextResponse.json({
    status: "queued",
    job_id: job.id,
    polling_url: `/api/jobs/${job.id}`,
    warning: "Factory enfileirada. Nenhum conteudo sera publicado automaticamente."
  });
}
