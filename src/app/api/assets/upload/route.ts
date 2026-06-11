import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission } from "@/lib/auth";
import { detectDuplicateAsset } from "@/lib/assets";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "audio/mpeg", "audio/wav"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const { user } = await requireAuth();
  await requirePermission(workspaceId, "library.manage");
  const mimeType = body.mime_type ?? "image/jpeg";
  if (!allowedTypes.includes(mimeType)) {
    return NextResponse.json({ status: "failed", error: "Tipo de arquivo nao permitido." }, { status: 400 });
  }

  const duplicate = detectDuplicateAsset({ fileUrl: body.file_url, hash: body.hash, title: body.title });
  if (duplicate) {
    await registerAuditLog({
      action: "create",
      entityType: "asset",
      entityId: duplicate.id,
      metadata: { event: "asset_upload_duplicate_detected", mime_type: mimeType }
    });
    return NextResponse.json({ status: "duplicate", asset: duplicate, warning: "Asset duplicado detectado por URL/hash/nome." });
  }

  const response = {
    status: "ready",
    provider_mode: "demo",
    warning: "Upload validado em modo demonstracao; Supabase Storage real ainda deve gravar o arquivo.",
    asset: {
      id: `asset_upload_${Date.now()}`,
      workspaceId,
      type: body.type ?? "image",
      source: "upload",
      title: body.title ?? "Upload manual",
      description: body.description ?? "",
      tags: body.tags ?? [],
      fileUrl: body.file_url ?? "/media/mock-thumbnail-1.jpg",
      thumbnailUrl: body.thumbnail_url ?? body.file_url ?? "/media/mock-thumbnail-1.jpg",
      mimeType,
      favorite: false,
      usageCount: 0,
      qualityScore: 72,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    }
  };

  await registerAuditLog({
    action: "create",
    entityType: "asset",
    entityId: response.asset.id,
    metadata: { event: "asset_uploaded", mime_type: mimeType, provider_mode: response.provider_mode }
  });

  return NextResponse.json(response);
}
