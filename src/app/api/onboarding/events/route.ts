import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requireWorkspace } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user } = await requireAuth();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const workspace = await requireWorkspace(workspaceId);
  await registerAuditLog({
    action: "create",
    entityType: "onboarding_event",
    metadata: {
      event_name: body.event_name ?? "onboarding_started",
      step: body.step ?? "objective",
      workspace_id: workspace.workspaceId ?? workspaceId,
      user_id: user.id
    }
  });

  return NextResponse.json({
    status: "recorded",
    provider_mode: "demo",
    event_name: body.event_name ?? "onboarding_started",
    step: body.step ?? "objective"
  });
}
