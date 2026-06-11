import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission } from "@/lib/auth";
import { autoMatchVisual, searchAssets, searchExternalAssets } from "@/lib/assets";
import type { AssetOrientation, AssetProvider, AssetSourceType, AssetType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  await requireAuth();
  const query = params.get("q") ?? "";
  const provider = (params.get("provider") ?? "library") as AssetProvider | "library";
  const type = (params.get("type") ?? "all") as AssetType | "all";
  const orientation = (params.get("orientation") ?? "all") as AssetOrientation | "all";

  if (provider !== "library") {
    const workspaceId = String(params.get("workspace_id") ?? "");
    if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
    await requirePermission(workspaceId, "library.manage");
    const result = await searchExternalAssets({
      workspaceId,
      provider,
      query,
      type: type === "video" ? "video" : "image",
      orientation: orientation === "all" ? undefined : orientation
    });
    return NextResponse.json({ ...result, source: provider });
  }

  return NextResponse.json({
    providerMode: "local",
    results: searchAssets({
      query,
      type,
      source: (params.get("source") ?? "all") as AssetSourceType | "all",
      favorite: params.get("favorite") === "true",
      orientation
    })
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  await requireAuth();
  const matches = autoMatchVisual(body.scene_text ?? "");
  await registerAuditLog({
    action: "create",
    entityType: "asset_usage",
    metadata: { event: "asset_auto_match", scene_text: body.scene_text, matches: matches.length }
  });
  return NextResponse.json({
    matches,
    status: "completed"
  });
}
