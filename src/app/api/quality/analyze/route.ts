import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission } from "@/lib/auth";
import { estimateQualityAnalysisCredits, getVideoQualityBundle } from "@/lib/video-quality";
import type { ExportPlatform } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const videoProjectId = body.video_project_id ?? "video_1";
  const mode = body.mode === "ai" ? "ai" : "simple";
  const platform = (body.platform ?? "youtube_shorts") as ExportPlatform;
  const credits = estimateQualityAnalysisCredits(mode);
  await requireAuth();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");

  await registerAuditLog({
    action: "create",
    entityType: "media_usage_logs",
    entityId: videoProjectId,
    metadata: { action_type: "quality_analysis", mode, credits, platform, workspace_id: workspaceId }
  });

  return NextResponse.json({
    status: "completed",
    action_type: "quality_analysis",
    credits_consumed: credits,
    provider_mode: mode === "ai" ? "ai_demo" : "free_simple",
    ...getVideoQualityBundle(videoProjectId, platform)
  });
}
