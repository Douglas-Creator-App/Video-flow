import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requireWorkspace } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user } = await requireAuth();
  const workspace = await requireWorkspace(String(body.workspace_id ?? "ws_1"));
  await registerAuditLog({
    action: "create",
    entityType: "onboarding_event",
    metadata: {
      event_name: body.event_name ?? "onboarding_started",
      step: body.step ?? "objective",
      workspace_id: workspace.workspaceId ?? "ws_1",
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
