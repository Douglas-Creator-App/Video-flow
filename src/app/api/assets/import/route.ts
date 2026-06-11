import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission } from "@/lib/auth";
import { importExternalAsset } from "@/lib/assets";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  if (!body.result) return NextResponse.json({ status: "failed", error: "Resultado externo ausente." }, { status: 400 });
  await requireAuth();
  await requirePermission(workspaceId, "import_external_asset");
  const response = importExternalAsset(body.result, workspaceId);
  await registerAuditLog({
    action: "create",
    entityType: "asset",
    entityId: response.asset?.id,
    metadata: { event: "asset_imported", provider: body.result.provider, duplicate: response.status === "duplicate" }
  });
  return NextResponse.json(response);
}
