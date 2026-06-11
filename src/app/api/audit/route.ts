import { NextResponse, type NextRequest } from "next/server";
import { persistAuditLog } from "@/lib/audit-server";
import { requireAuth, requireWorkspace } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user } = await requireAuth();
  const workspaceId = body.workspaceId ?? body.workspace_id ?? null;
  if (workspaceId) await requireWorkspace(String(workspaceId));

  await persistAuditLog({
    action: body.action,
    workspaceId,
    actorId: user.id,
    entityType: body.entityType ?? body.entity_type ?? null,
    entityId: body.entityId ?? body.entity_id ?? null,
    metadata: body.metadata ?? {},
    ipAddress: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null,
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({ status: "ok" });
}
